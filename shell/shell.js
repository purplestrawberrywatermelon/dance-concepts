/* Review shell: concept index, single-concept viewer, per-screen comparison. */
(function () {
  'use strict';

  var D = window.DP_DATA;
  var app = document.getElementById('app');
  var SCREENS = [
    { id: 'setup', name: 'Setup' },
    { id: 'result', name: 'Personal result' },
    { id: 'gallery', name: 'Venue gallery' }
  ];
  var STEPS = [
    { id: 'pick', name: '1 Dance' },
    { id: 'style', name: '2 Style' },
    { id: 'name', name: '3 Name' }
  ];
  var session = { sel: {}, grey: false, compareStep: 'pick', auto: false, nextState: null };
  var current = null;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function concept(id) {
    for (var i = 0; i < D.concepts.length; i++) if (D.concepts[i].id === id) return D.concepts[i];
    return null;
  }
  function screenOk(s) {
    return SCREENS.some(function (x) { return x.id === s; }) ? s : null;
  }
  function screenName(s) {
    return SCREENS.filter(function (x) { return x.id === s; })[0].name;
  }
  function src(c, s, extra) {
    var p = new URLSearchParams();
    p.set('c', c);
    p.set('s', s);
    Object.keys(extra || {}).forEach(function (k) {
      if (extra[k] != null && extra[k] !== '') p.set(k, extra[k]);
    });
    return 'screen.html?' + p.toString();
  }
  function route() {
    var p = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (p[0] === 'c' && concept(p[1])) return { view: 'concept', c: p[1], s: screenOk(p[2]) || 'setup' };
    if (p[0] === 'compare') return { view: 'compare', s: screenOk(p[1]) || 'setup' };
    return { view: 'home' };
  }
  function frames() {
    return Array.prototype.slice.call(app.querySelectorAll('iframe'));
  }
  function send(cmd, value) {
    frames().forEach(function (f) {
      if (f.contentWindow) f.contentWindow.postMessage({ type: 'dp:cmd', cmd: cmd, value: value }, '*');
    });
  }

  /* ---------- shared header ---------- */
  function header(r) {
    var tabs = SCREENS.map(function (s) {
      var on = r.view === 'compare' && r.s === s.id;
      return '<a class="pill' + (on ? ' is-on' : '') + '" href="#/compare/' + s.id + '">' + s.name + '</a>';
    }).join('');
    return '<header class="top">' +
      '<a class="top__title" href="#/"><b>AI Dance Experience</b><span>Design directions &middot; 12 concepts &times; 3 screens</span></a>' +
      '<nav class="top__nav">' +
      '<a class="pill' + (r.view === 'home' ? ' is-on' : '') + '" href="#/">All concepts</a>' +
      '<span class="top__label">Compare</span>' + tabs +
      '</nav></header>';
  }

  /* ---------- home ---------- */
  function home(r) {
    var groups = D.groups.map(function (g) {
      var cards = D.concepts.filter(function (c) { return c.group === g.id; }).map(function (c) {
        return '<article class="card">' +
          '<a class="card__thumb" href="#/c/' + c.id + '/setup" aria-label="Open concept ' + c.id + ' ' + esc(c.name) + '">' +
          '<iframe src="' + src(c.id, 'result', { 'static': 1 }) + '" loading="lazy" tabindex="-1" title="' + esc(c.name) + ' thumbnail"></iframe></a>' +
          '<div class="card__body"><h3><span>' + c.id + '</span>' + esc(c.name) + '</h3>' +
          '<p>' + esc(c.line) + '</p>' +
          '<div class="card__links">' + SCREENS.map(function (s) {
            return '<a href="#/c/' + c.id + '/' + s.id + '">' + s.name + '</a>';
          }).join('') + '</div></div></article>';
      }).join('');
      return '<section class="group"><div class="group__head"><h2><span>' + g.id + '</span>' + esc(g.name) + '</h2><p>' + esc(g.note) + '</p></div>' +
        '<div class="cards">' + cards + '</div></section>';
    }).join('');

    return header(r) + '<main class="home">' +
      '<p class="note">Every concept uses the same sample participant, dances and gallery entries. ' +
      'Video and image areas are empty placeholder slots for now, drawn at the size each design intends. ' +
      'Event screens are designed for 1920 &times; 1080.</p>' + groups + '</main>';
  }

  /* ---------- single concept ---------- */
  function viewer(r) {
    var c = concept(r.c);
    var idx = D.concepts.indexOf(c);
    var prev = D.concepts[(idx + D.concepts.length - 1) % D.concepts.length];
    var next = D.concepts[(idx + 1) % D.concepts.length];
    var extra = {};
    if (r.s === 'result') {
      extra = { dance: session.sel.dance, hair: session.sel.hair, outfit: session.sel.outfit, name: session.sel.name };
    }
    if (r.s === 'gallery' && session.auto) extra.auto = 1;
    var tabs = SCREENS.map(function (s) {
      return '<a class="tab' + (s.id === r.s ? ' is-on' : '') + '" href="#/c/' + c.id + '/' + s.id + '">' + s.name + '</a>';
    }).join('');

    var tools = '';
    if (r.s === 'setup') {
      tools = '<span class="tools__label">Jump to step</span>' + STEPS.map(function (s) {
        return '<button class="btn" data-cmd="step" data-value="' + s.id + '" data-step-btn="' + s.id + '">' + s.name + '</button>';
      }).join('');
    } else if (r.s === 'result') {
      tools = '<button class="btn btn--strong" data-cmd="replay">Replay reveal</button>' +
        '<span class="tools__hint">Generating &rarr; reveal &rarr; result</span>';
    } else {
      tools = '<button class="btn" data-cmd="page" data-value="-1">&lsaquo; Previous page</button>' +
        '<span class="tools__count" data-page-count>1 / 2</span>' +
        '<button class="btn" data-cmd="page" data-value="1">Next page &rsaquo;</button>' +
        '<button class="btn' + (session.auto ? ' is-on' : '') + '" data-toggle="auto">Auto-rotate</button>';
    }

    var full = src(c.id, r.s, extra);
    return '<div class="viewer">' +
      '<header class="bar">' +
      '<a class="bar__back" href="#/">&larr; All concepts</a>' +
      '<div class="bar__concept">' +
      '<a class="step" href="#/c/' + prev.id + '/' + r.s + '" aria-label="Previous concept">&lsaquo; ' + prev.id + '</a>' +
      '<div class="bar__name"><b><span>' + c.id + '</span>' + esc(c.name) + '</b><i>' + esc(c.line) + '</i></div>' +
      '<a class="step" href="#/c/' + next.id + '/' + r.s + '" aria-label="Next concept">' + next.id + ' &rsaquo;</a>' +
      '</div>' +
      '<nav class="tabs">' + tabs + '</nav>' +
      '</header>' +
      '<div class="tools">' + tools +
      '<span class="tools__spacer"></span>' +
      '<a class="btn" href="#/compare/' + r.s + '">Compare all 12</a>' +
      '<button class="btn" data-copy="' + esc('#/c/' + c.id + '/' + r.s) + '">Copy link</button>' +
      '<a class="btn" href="' + esc(full) + '" target="_blank" rel="noopener">Full screen &nearr;</a>' +
      '</div>' +
      '<div class="viewer__stage"><iframe id="main" src="' + esc(src(c.id, r.s, Object.assign({}, extra, r.s === 'result' && session.nextState ? { state: session.nextState } : {}))) + '" title="' + esc(c.name + ' - ' + screenName(r.s)) + '" allow="autoplay"></iframe></div>' +
      '</div>';
  }

  /* ---------- comparison ---------- */
  function compare(r) {
    var extra = { quiet: 1 };
    if (r.s === 'setup') extra.step = session.compareStep;
    var cells = D.concepts.map(function (c) {
      return '<a class="cell" href="#/c/' + c.id + '/' + r.s + '">' +
        '<span class="cell__frame"><iframe src="' + esc(src(c.id, r.s, extra)) + '" loading="lazy" tabindex="-1" title="' + esc(c.name) + '"></iframe></span>' +
        '<span class="cell__label"><b>' + c.id + '</b>' + esc(c.name) + '<i>' + c.group + '</i></span></a>';
    }).join('');

    var tools = '';
    if (r.s === 'setup') {
      tools = '<span class="tools__label">Step</span>' + STEPS.map(function (s) {
        return '<button class="btn' + (s.id === session.compareStep ? ' is-on' : '') + '" data-compare-step="' + s.id + '">' + s.name + '</button>';
      }).join('');
    } else if (r.s === 'result') {
      tools = '<button class="btn btn--strong" data-cmd="replay">Replay all reveals</button>';
    } else {
      tools = '<button class="btn" data-cmd="page" data-value="-1">&lsaquo; Previous page</button>' +
        '<button class="btn" data-cmd="page" data-value="1">Next page &rsaquo;</button>';
    }

    return header(r) + '<main class="compare' + (session.grey ? ' is-grey' : '') + '">' +
      '<div class="tools tools--compare"><h1>' + screenName(r.s) + ' <span>across all 12 concepts</span></h1>' +
      '<span class="tools__spacer"></span>' + tools +
      '<button class="btn' + (session.grey ? ' is-on' : '') + '" data-toggle="grey">Greyscale</button></div>' +
      '<div class="cells">' + cells + '</div></main>';
  }

  /* ---------- render + events ---------- */
  function render() {
    var r = route();
    current = r;
    document.body.dataset.view = r.view;
    app.innerHTML = r.view === 'concept' ? viewer(r) : r.view === 'compare' ? compare(r) : home(r);
    session.nextState = null;
    window.scrollTo(0, 0);
    var c = r.view === 'concept' ? concept(r.c) : null;
    document.title = (c ? c.id + ' ' + c.name + ' - ' + screenName(r.s) : r.view === 'compare' ? 'Compare - ' + screenName(r.s) : 'All concepts') + ' | AI Dance Experience';
  }

  app.addEventListener('click', function (ev) {
    var el = ev.target.closest('button');
    if (!el) return;
    if (el.dataset.cmd) {
      var v = el.dataset.value;
      send(el.dataset.cmd, v != null && !isNaN(Number(v)) && v !== '' ? Number(v) : v);
    } else if (el.dataset.toggle === 'grey') {
      session.grey = !session.grey;
      el.classList.toggle('is-on', session.grey);
      app.querySelector('.compare').classList.toggle('is-grey', session.grey);
    } else if (el.dataset.toggle === 'auto') {
      session.auto = !session.auto;
      render();
    } else if (el.dataset.compareStep) {
      session.compareStep = el.dataset.compareStep;
      app.querySelectorAll('[data-compare-step]').forEach(function (b) {
        b.classList.toggle('is-on', b.dataset.compareStep === session.compareStep);
      });
      send('step', session.compareStep);
    } else if (el.dataset.copy) {
      var url = location.href.split('#')[0] + el.dataset.copy;
      var done = function () {
        el.textContent = 'Copied';
        setTimeout(function () { el.textContent = 'Copy link'; }, 1200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () { window.prompt('Copy this link', url); });
      else window.prompt('Copy this link', url);
    }
  });

  window.addEventListener('message', function (ev) {
    var m = ev.data;
    if (!m || !current || current.view !== 'concept') return;
    var main = document.getElementById('main');
    if (!main || ev.source !== main.contentWindow) return;
    if (m.type === 'dp:state') {
      if (m.s === 'setup') {
        session.sel = m.sel || {};
        app.querySelectorAll('[data-step-btn]').forEach(function (b) {
          b.classList.toggle('is-on', b.dataset.stepBtn === m.step);
        });
      }
      if (m.s === 'gallery') {
        var pc = app.querySelector('[data-page-count]');
        if (pc) pc.textContent = m.page + ' / ' + m.pages;
      }
    }
    if (m.type === 'dp:go') {
      if (m.sel && m.screen === 'result') session.sel = m.sel;
      if (m.screen === 'setup') session.sel = {};
      session.nextState = m.state || null;
      var target = '#/c/' + current.c + '/' + m.screen;
      if (location.hash === target) render(); else location.hash = target;
    }
  });

  window.addEventListener('hashchange', render);
  render();
})();
