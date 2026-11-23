/*
  Shared runtime for every concept screen (loaded by screen.html).

  A concept only describes how things look. It registers:
    DP.register({
      id, fonts, genMs, revealMs, turn: { out, in },
      setup(DP)   -> html      first screen: 3 dances -> style -> name
      result(DP)  -> html      personal result
      gallery(DP) -> html      must contain one [data-grid] element
      tile(entry, i, DP) -> html   inner markup of one gallery tile
      perPage, cols             optional, gallery tiles per page (default 16) and columns (default 4)
      empty(i)    -> html      optional, inner markup of an unused tile
      init(root, DP)           optional hook after render
    })

  This file owns the behaviour, driven by attributes in the concept markup:
    data-act="dance|hair|outfit" data-id   choose an option
    data-act="back|restart|create|replay|page|goto"
    data-bind="name"                       the participant name input
    data-text="dance.title|hair.title|outfit.title|name|page|pages|..."
  and reflects state on #stage for CSS:
    data-step="pick|style|name"  data-ready  data-named
    data-phase="gen|reveal|done"
    data-turn="out|in"  data-dir="next|prev"

  URL: index.html                         selection, then ?s=thanks
       index.html?s=gallery               vote on other videos
       index.html?s=mine                  result station: search by ID or name, then
                                          that person's video and download QR
                                          (&id=12345 opens directly, &demo=1 uses the
                                          example clip when the row has no videoUrl,
                                          &idle=N seconds before returning to search)
       These three screens are not linked. screen.html?c=03&s=... is the same.
       &step=pick|style|name  &state=gen|reveal|done  &page=2
       &dance=d2&hair=h1&outfit=o1&name=Junho
       &static=1 (freeze all motion)  &quiet=1 (skip the intro only)  &auto=1
*/
(function () {
  'use strict';

  /* Old review links looked like index.html#/c/05/setup. The hash is not a
     route anymore, so drop it and leave the query string (?s=gallery) intact. */
  if (location.hash) {
    history.replaceState(null, '', location.pathname + location.search);
  }

  var D = window.DP_DATA;
  var q = new URLSearchParams(location.search);
  var DP = (window.DP = { data: D });
  var root = document.getElementById('stage');
  var html = document.documentElement;
  var embedded = window.parent !== window;
  var PER_PAGE = 16;   /* overridden per concept: perPage */
  var COLS = 4;        /* overridden per concept: cols */

  var P = {
    c: (q.get('c') || '03').replace(/[^0-9]/g, '').padStart(2, '0'),
    s: ['setup', 'thanks', 'result', 'gallery', 'mine'].indexOf(q.get('s')) >= 0 ? q.get('s') : 'setup',
    isStatic: q.get('static') === '1',
    quiet: q.get('quiet') === '1' || q.get('static') === '1',
    auto: q.get('auto') === '1'
  };
  DP.params = P;

  /* ?entry=141 on the result screen shows that gallery video instead of the new one. */
  var viewEntry = null;
  (function () {
    var id = parseInt(q.get('entry') || '', 10);
    if (!id) return;
    for (var i = 0; i < D.gallery.length; i++) if (D.gallery[i].entry === id) viewEntry = D.gallery[i];
  })();

  var S = { step: 'pick', dance: null, hair: null, outfit: null, name: '', id: '', phase: 'done', page: 0 };
  var concept = null;
  var timers = [];

  /* ---------- small helpers ---------- */
  function byId(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function each(list, fn) {
    var out = '';
    for (var i = 0; i < list.length; i++) out += fn(list[i], i);
    return out;
  }
  function pad(n, len) { return String(n).padStart(len || 2, '0'); }
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }
  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  DP.esc = esc;
  DP.each = each;
  DP.pad = pad;
  DP.byId = byId;

  /* The 5-digit participant ID is issued by shared/store.js (Firestore, or a
     local stand-in). This screen only shows it and carries it in the URL. */
  function validId(v) { return window.DP_STORE ? DP_STORE.validId(v) : (/^[1-9]\d{4}$/.test(v || '') ? String(v) : ''); }

  /* ---------- selection ---------- */
  function sel() {
    var p = D.participant;
    return {
      dance: byId(D.dances, S.dance),
      hair: byId(D.hairs, S.hair),
      outfit: byId(D.outfits, S.outfit),
      name: S.name,
      id: S.id,
      entry: viewEntry ? viewEntry.entry : p.entry,
      url: D.event.linkBase + (viewEntry ? viewEntry.entry : p.entry)
    };
  }
  DP.sel = sel;
  DP.state = S;

  function lookup(key) {
    var s = sel();
    var pages = Math.ceil(D.gallery.length / PER_PAGE);
    switch (key) {
      case 'name': return s.name;
      case 'id': return s.id;
      case 'entry': return s.entry;
      case 'url': return s.url;
      case 'page': return S.page + 1;
      case 'page2': return pad(S.page + 1);
      case 'pages': return pages;
      case 'pages2': return pad(pages);
      case 'total': return D.gallery.length;
      case 'stepno': return { pick: '1', style: '2', name: '3' }[S.step];
    }
    var parts = key.split('.');
    var obj = s[parts[0]];
    return obj && obj[parts[1]] != null ? obj[parts[1]] : '';
  }

  /* A bound text node: stays in sync with the current selection. */
  DP.t = function (key, empty) {
    var v = lookup(key);
    return '<span data-text="' + key + '"' + (empty ? ' data-empty="' + esc(empty) + '"' : '') + '>' +
      esc(v === '' || v == null ? (empty || '') : v) + '</span>';
  };

  /* Per-letter spans, for reveals that animate a word letter by letter. */
  DP.letters = function (text) {
    return each(String(text).split(''), function (ch, i) {
      return '<span class="ch" style="--i:' + i + '">' + (ch === ' ' ? '&nbsp;' : esc(ch)) + '</span>';
    });
  };

  /* ---------- media slots ----------
     Empty src  -> labelled placeholder at the size the concept gives it.
     Filled src -> the same box holds a <video> or <img>. */
  DP.slot = function (o) {
    var kind = o.kind || 'video';
    var media = '';
    if (o.src) {
      media = kind === 'image'
        ? '<img src="' + esc(o.src) + '" alt="" loading="lazy">'
        : '<video src="' + esc(o.src) + '" muted loop playsinline preload="metadata"' + (P.isStatic ? '' : ' autoplay') + '></video>';
    }
    return '<span class="slot slot--' + kind + (o.src ? ' has-media' : '') + (o.cls ? ' ' + o.cls : '') +
      '" style="--tone:' + (o.tone || 0) + '">' + media +
      '<span class="slot__tag"><b>' + o.label + '</b>' + (o.sub ? '<i>' + o.sub + '</i>' : '') + '</span></span>';
  };
  DP.danceSlot = function (d, cls) {
    return DP.slot({ label: 'Dance video', sub: esc(d.title), src: d.src, cls: cls, tone: Number(d.no) - 1 });
  };
  DP.exampleSlot = function (cls) {
    var d = sel().dance;
    return DP.slot({ label: 'Example result', sub: DP.t('dance.title'), src: d ? d.example : '', cls: cls, tone: 1 });
  };
  DP.resultSlot = function (cls) {
    return DP.slot({ label: 'Result video', sub: DP.t('name'), src: viewEntry ? viewEntry.src : D.participant.src, cls: cls, tone: 1 });
  };
  DP.sourceSlot = function (cls) {
    var d = sel().dance;
    return DP.slot({ label: 'Dance video', sub: DP.t('dance.title'), src: d ? d.src : '', cls: cls, tone: 0 });
  };
  DP.hairSlot = function (h, cls) {
    return DP.slot({ kind: 'image', label: 'Hair ' + h.no, src: h.src, cls: cls, tone: Number(h.no) });
  };
  DP.outfitSlot = function (o, cls) {
    return DP.slot({ kind: 'image', label: 'Outfit ' + o.no, src: o.src, cls: cls, tone: Number(o.no) + 1 });
  };
  DP.entrySlot = function (e, cls) {
    return DP.slot({ label: 'Result', sub: esc(e.name), src: e.src, cls: cls, tone: e.entry % 5 });
  };

  /* ---------- QR area ----------
     A sample pattern with real finder / timing marks so the area reads as a
     QR code at the right size. It is not scannable. */
  DP.qr = function (seed) {
    var n = 25, h = 2166136261, i, x, y, d = '';
    seed = String(seed || sel().url);
    for (i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
    function rnd() { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; }
    function finder(lx, ly) {
      if (lx < 0 || ly < 0 || lx > 6 || ly > 6) return false;
      return lx === 0 || lx === 6 || ly === 0 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4);
    }
    for (y = 0; y < n; y++) {
      for (x = 0; x < n; x++) {
        var on;
        if (x < 8 && y < 8) on = finder(x, y);
        else if (x >= n - 8 && y < 8) on = finder(x - (n - 7), y);
        else if (x < 8 && y >= n - 8) on = finder(x, y - (n - 7));
        else if (x === 6 || y === 6) on = (x + y) % 2 === 0;
        else on = rnd() < 0.5;
        if (on) d += 'M' + x + ' ' + y + 'h1v1h-1z';
      }
    }
    return '<span class="qr" role="img" aria-label="QR code area (sample pattern)">' +
      '<svg viewBox="-2 -2 29 29" shape-rendering="crispEdges">' +
      '<rect class="qr__bg" x="-2" y="-2" width="29" height="29"/><path class="qr__fg" d="' + d + '"/></svg></span>';
  };

  /* ---------- state -> DOM ---------- */
  function setAttr(name, on, value) {
    if (on) root.setAttribute(name, value == null ? '' : value);
    else root.removeAttribute(name);
  }

  function apply() {
    root.dataset.screen = P.s;
    if (P.s === 'setup') root.dataset.step = S.step;
    setAttr('data-dance', !!S.dance, S.dance);
    setAttr('data-hair', !!S.hair, S.hair);
    setAttr('data-outfit', !!S.outfit, S.outfit);
    setAttr('data-ready', !!(S.hair && S.outfit));
    setAttr('data-named', !!S.name.trim());
    /* Lets a concept scale a big name so long names still fit. */
    root.style.setProperty('--name-len', Math.max(4, S.name.trim().length));
    if (P.s === 'result') root.dataset.phase = S.phase;
    if (P.s === 'gallery') root.dataset.page = S.page + 1;

    root.querySelectorAll('[data-act="dance"],[data-act="hair"],[data-act="outfit"]').forEach(function (el) {
      var on = S[el.dataset.act] === el.dataset.id;
      el.classList.toggle('is-on', on);
      el.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    root.querySelectorAll('[data-text]').forEach(function (el) {
      var v = lookup(el.dataset.text);
      var text = v === '' || v == null ? (el.dataset.empty || '') : String(v);
      if (el.textContent !== text) el.textContent = text;
    });
    root.querySelectorAll('[data-bind="name"]').forEach(function (el) {
      if (el !== document.activeElement && el.value !== S.name) el.value = S.name;
    });
    root.querySelectorAll('[data-act="create"]').forEach(function (el) {
      el.disabled = !S.name.trim();
    });
    if (concept && concept.update) concept.update(root, DP);
    report();
  }
  DP.apply = apply;

  function report() {
    if (!embedded) return;
    window.parent.postMessage({
      type: 'dp:state', c: P.c, s: P.s, step: S.step, phase: S.phase,
      page: S.page + 1, pages: Math.ceil(D.gallery.length / PER_PAGE),
      sel: { dance: S.dance, hair: S.hair, outfit: S.outfit, name: S.name }
    }, '*');
  }

  function focusName() {
    if (P.quiet && !document.hasFocus()) return;
    var el = root.querySelector('[data-bind="name"]');
    if (el) try { el.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
  }

  /* ---------- setup flow ---------- */
  function setStep(step) {
    var p = D.participant;
    if (step === 'pick') {
      S.step = 'pick';
    } else if (step === 'style') {
      if (!S.dance) S.dance = p.dance;
      S.step = 'style';
    } else if (step === 'name') {
      if (!S.dance) S.dance = p.dance;
      if (!S.hair) S.hair = p.hair;
      if (!S.outfit) S.outfit = p.outfit;
      S.step = 'name';
    }
    apply();
    if (S.step === 'name') later(focusName, P.isStatic ? 0 : 450);
  }
  DP.setStep = setStep;

  function restart() {
    clearTimers();
    S.step = 'pick'; S.dance = null; S.hair = null; S.outfit = null; S.name = '';
    render();
  }

  function choose(kind, id) {
    S[kind] = id;
    if (kind === 'dance' && S.step === 'pick') S.step = 'style';
    apply();
    if (kind !== 'dance' && S.step === 'style' && S.hair && S.outfit) {
      later(function () { if (S.step === 'style') setStep('name'); }, concept.nameDelay == null ? 520 : concept.nameDelay);
    }
  }
  DP.choose = choose;

  function go(screen, extra) {
    var selNow = { dance: S.dance, hair: S.hair, outfit: S.outfit, name: S.name.trim() };
    if (embedded) {
      window.parent.postMessage({ type: 'dp:go', c: P.c, screen: screen, sel: selNow, id: extra && extra.id, state: extra && extra.state }, '*');
      return;
    }
    var n = new URLSearchParams();
    n.set('c', P.c); n.set('s', screen);
    if (screen === 'gallery' && S.page > 0) n.set('page', S.page + 1);
    if (screen === 'result' || screen === 'thanks') {
      Object.keys(selNow).forEach(function (k) { if (selNow[k]) n.set(k, selNow[k]); });
      if (screen === 'result' && extra && extra.state) n.set('state', extra.state);
    }
    if (screen === 'thanks') { var tid = validId(extra && extra.id) || validId(S.id); if (tid) n.set('id', tid); }
    location.search = n.toString();
  }
  DP.go = go;

  /* Open the result page of one gallery video. The current gallery page is
     passed along so "Gallery" brings the visitor back to the same place. */
  DP.openEntry = function (id) {
    var e = null;
    for (var i = 0; i < D.gallery.length; i++) if (String(D.gallery[i].entry) === String(id)) e = D.gallery[i];
    if (!e) return;
    if (embedded) {
      window.parent.postMessage({ type: 'dp:go', c: P.c, screen: 'result',
        sel: { dance: e.dance, hair: e.hair, outfit: e.outfit, name: e.name }, state: 'done' }, '*');
      return;
    }
    var n = new URLSearchParams();
    n.set('c', P.c); n.set('s', 'result'); n.set('entry', e.entry); n.set('state', 'done');
    if (S.page > 0) n.set('page', S.page + 1);
    location.search = n.toString();
  };

  /* ---------- result reveal ---------- */
  function setPhase(ph) { S.phase = ph; apply(); }

  function playReveal() {
    clearTimers();
    if (P.isStatic) { setPhase('done'); return; }
    setPhase('gen');
    later(function () {
      setPhase('reveal');
      later(function () { setPhase('done'); }, concept.revealMs || 2000);
    }, concept.genMs || 1500);
  }
  DP.replay = playReveal;

  /* ---------- gallery ---------- */
  var turning = false;

  /* 'new' = newest first (data order). 'liked' = most liked first, ties keep
     newest first. Likes come from concept.likes(entry). */
  var sortMode = 'new';
  try { if (sessionStorage.getItem('dp-gallery-sort') === 'liked') sortMode = 'liked'; } catch (e) { /* ignore */ }

  function ordered() {
    if (sortMode !== 'liked' || !concept || !concept.likes) return D.gallery;
    var rank = {};
    D.gallery.forEach(function (e, i) { rank[e.entry] = i; });
    return D.gallery.slice().sort(function (a, b) {
      return (concept.likes(b.entry) - concept.likes(a.entry)) || (rank[a.entry] - rank[b.entry]);
    });
  }

  DP.getSort = function () { return sortMode; };
  DP.setSort = function (mode, keepPage) {
    sortMode = mode === 'liked' ? 'liked' : 'new';
    try { sessionStorage.setItem('dp-gallery-sort', sortMode); } catch (e) { /* ignore */ }
    if (P.s !== 'gallery') return;
    if (!keepPage) S.page = 0;
    fillGrid();
    apply();
  };

  function tilesHTML(page) {
    var items = ordered().slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
    var out = '';
    for (var i = 0; i < PER_PAGE; i++) {
      var e = items[i];
      var cls = 'tile' + (e ? '' : ' is-empty') + (e && e === D.gallery[0] ? ' is-latest' : '');
      var inner = '';
      if (e) {
        inner = concept.tile({
          entry: e.entry, name: e.name, ago: e.ago, src: e.src,
          no: pad(page * PER_PAGE + i + 1),
          dance: byId(D.dances, e.dance), hair: byId(D.hairs, e.hair), outfit: byId(D.outfits, e.outfit),
          latest: e === D.gallery[0]
        }, i, DP);
      } else if (concept.empty) {
        inner = concept.empty(i, DP);
      }
      out += '<div class="' + cls + '"' + (e ? ' data-entry="' + e.entry + '"' : '') + ' style="--i:' + i + ';--r:' + Math.floor(i / COLS) + ';--c:' + (i % COLS) + '">' + inner + '</div>';
    }
    return out;
  }

  function fillGrid() {
    var grid = root.querySelector('[data-grid]');
    if (grid) grid.innerHTML = tilesHTML(S.page);
  }

  function turn(dir) {
    var pages = Math.ceil(D.gallery.length / PER_PAGE);
    if (turning || pages < 2) return;
    var next = (S.page + dir + pages) % pages;
    var t = concept.turn || { out: 400, 'in': 600 };
    if (P.isStatic) { S.page = next; fillGrid(); apply(); return; }
    turning = true;
    root.dataset.dir = dir > 0 ? 'next' : 'prev';
    root.dataset.turn = 'out';
    later(function () {
      S.page = next;
      fillGrid();
      apply();
      root.dataset.turn = 'in';
      later(function () { delete root.dataset.turn; turning = false; }, t['in']);
    }, t.out);
  }
  DP.turn = turn;

  function setPage(n) {
    var pages = Math.ceil(D.gallery.length / PER_PAGE);
    n = Math.max(0, Math.min(pages - 1, n));
    if (n === S.page) return;
    turn(n > S.page ? 1 : -1);
  }

  /* ---------- render ---------- */
  function render() {
    clearTimers();
    turning = false;
    delete root.dataset.turn;
    root.innerHTML = concept[P.s](DP);
    if (P.s === 'gallery') fillGrid();
    apply();
    if (concept.init) concept.init(root, DP);
    if (P.s === 'setup' && S.step === 'name') later(focusName, 300);
    if (P.s === 'result') {
      var st = q.get('state');
      if (P.quiet || st === 'done') setPhase('done');
      else if (st === 'gen') setPhase('gen');
      else playReveal();
    }
    if (P.s === 'gallery' && !P.quiet) {
      root.dataset.dir = 'next';
      root.dataset.turn = 'in';
      later(function () { delete root.dataset.turn; }, (concept.turn || { 'in': 600 })['in']);
    }
  }
  DP.render = render;

  /* Create = issue the ID and save the row, then show the thank-you screen. */
  var creating = false;
  function createRow(btn) {
    if (!S.name.trim() || !S.dance || !S.hair || !S.outfit || creating) return;
    creating = true;
    var html0 = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Creating\u2026'; }
    DP_STORE.create({ name: S.name, dance: S.dance, hair: S.hair, outfit: S.outfit }).then(function (r) {
      creating = false;
      go('thanks', { id: r.id });
    }).catch(function () {
      creating = false;
      if (btn) { btn.disabled = false; btn.textContent = 'No connection. Tap to try again'; }
      later(function () { if (btn && !creating) btn.innerHTML = html0; }, 4000);
    });
  }

  function act(name, el) {
    var ds = el ? el.dataset : {};
    switch (name) {
      case 'dance': case 'hair': case 'outfit': choose(name, ds.id); break;
      case 'back': setStep(S.step === 'name' ? 'style' : 'pick'); break;
      case 'restart': if (P.s === 'setup') restart(); else go('setup'); break;
      case 'create': createRow(el || root.querySelector('[data-act="create"]')); break;
      case 'replay': playReveal(); break;
      case 'page': turn(Number(ds.dir) || 1); break;
      case 'goto': go(ds.screen); break;
    }
  }

  root.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-act]');
    if (!el || !root.contains(el) || el.disabled) return;
    act(el.dataset.act, el);
  });
  root.addEventListener('input', function (ev) {
    if (!ev.target.matches('[data-bind="name"]')) return;
    S.name = ev.target.value.replace(/^\s+/, '').slice(0, 14);
    apply();
  });
  document.addEventListener('keydown', function (ev) {
    var inField = ev.target.matches && ev.target.matches('input');
    if (inField) {
      if (ev.key === 'Enter') act('create');
      return;
    }
    if (P.s === 'gallery' && ev.key === 'ArrowRight') turn(1);
    if (P.s === 'gallery' && ev.key === 'ArrowLeft') turn(-1);
    if (P.s === 'result' && (ev.key === 'r' || ev.key === 'R')) playReveal();
    if (concept && concept.key) concept.key(ev, root, DP);
  });

  /* Commands from the review shell. */
  window.addEventListener('message', function (ev) {
    var m = ev.data;
    if (!m || m.type !== 'dp:cmd' || !concept) return;
    if (m.cmd === 'replay' && P.s === 'result') playReveal();
    if (m.cmd === 'step' && P.s === 'setup') {
      if (m.value === 'pick') restart(); else setStep(m.value);
    }
    if (m.cmd === 'restart' && P.s === 'setup') restart();
    if (m.cmd === 'page' && P.s === 'gallery') turn(m.value);
    if (m.cmd === 'setpage' && P.s === 'gallery') setPage(m.value - 1);
  });

  /* ---------- boot ---------- */
  function fit() {
    html.style.setProperty('--fit', Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
  }
  window.addEventListener('resize', fit);
  fit();
  if (P.isStatic) html.setAttribute('data-static', '');

  function initState() {
    var p = D.participant;
    var pick = function (list, key, fallback) {
      var v = q.get(key);
      return v && byId(list, v) ? v : fallback;
    };
    if (P.s === 'setup') {
      S.dance = pick(D.dances, 'dance', null);
      S.hair = pick(D.hairs, 'hair', null);
      S.outfit = pick(D.outfits, 'outfit', null);
      S.name = (q.get('name') || '').slice(0, 14);
      var step = q.get('step');
      if (step === 'style') { S.step = 'style'; if (!S.dance) S.dance = p.dance; }
      else if (step === 'name') {
        S.step = 'name';
        if (!S.dance) S.dance = p.dance;
        if (!S.hair) S.hair = p.hair;
        if (!S.outfit) S.outfit = p.outfit;
        if (!S.name && q.get('name') == null) S.name = p.name;
      } else if (S.dance) { S.step = 'style'; }
    } else {
      var base = viewEntry || p;
      S.dance = pick(D.dances, 'dance', base.dance);
      S.hair = pick(D.hairs, 'hair', base.hair);
      S.outfit = pick(D.outfits, 'outfit', base.outfit);
      S.name = (q.get('name') || base.name).slice(0, 14);
      S.id = validId(q.get('id'));
      var pages = Math.ceil(D.gallery.length / PER_PAGE);
      S.page = Math.max(0, Math.min(pages - 1, (parseInt(q.get('page') || '1', 10) || 1) - 1));
    }
  }

  DP.register = function (def) {
    concept = def;
    PER_PAGE = def.perPage || 16;
    COLS = def.cols || 4;
    initState();
    html.setAttribute('data-concept', P.c);
    var pending = 1;
    var started = false;
    function start() {
      if (started) return;
      started = true;
      render();
      html.classList.add('is-ready');
      if (P.s === 'gallery' && P.auto) setInterval(function () { turn(1); }, def.autoMs || 9000);
    }
    function done() { if (--pending <= 0) start(); }
    if (def.fonts) {
      var pre = document.createElement('link');
      pre.rel = 'preconnect'; pre.href = 'https://fonts.gstatic.com'; pre.crossOrigin = '';
      document.head.appendChild(pre);
      var f = document.createElement('link');
      f.rel = 'stylesheet'; f.href = def.fonts;
      document.head.appendChild(f);
    }
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'concepts/' + P.c + '/concept.css';
    css.onload = done; css.onerror = done;
    document.head.appendChild(css);
    setTimeout(start, 1500);
  };

  document.title = (D.event && D.event.title ? D.event.title : 'AI Dance Experience') + ' — ' + P.s;
  var js = document.createElement('script');
  js.src = 'concepts/' + P.c + '/concept.js';
  js.onerror = function () {
    root.innerHTML = '<p style="font:24px system-ui;padding:80px;color:#888">Concept ' + esc(P.c) + ' is not available.</p>';
    html.classList.add('is-ready');
  };
  document.body.appendChild(js);
})();
