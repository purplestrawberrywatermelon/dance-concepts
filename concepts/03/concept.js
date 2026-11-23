/* 03 Editorial - big video, very little copy. Main screen carries BPM / length;
   the gallery is a full-bleed video wall, 12 per page, 4 rows by 3 columns.
   Setup, gallery, and the personal video are separate screens with no links
   between them. */
DP.register({
  id: '03',
  fonts: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap',
  genMs: 1500,
  revealMs: 3600,
  turn: { out: 520, 'in': 950 },
  perPage: 12,
  cols: 3,

  heartSvg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.1 20.3s-6.4-4.1-8.9-7.8C1.3 9.7 1.8 6.5 4.3 5.1c2.1-1.2 4.4-.6 6.5 1.8l1.2 1.4 1.2-1.4c2.1-2.4 4.4-3 6.5-1.8 2.5 1.4 3 4.6 1.1 7.4-2.5 3.7-8.7 7.8-8.7 7.8z"/></svg>',

  voteIdleMs: 60000,

  setup: function (DP) {
    var d = DP.data;
    return '<div class="body">' + '<div class="strips">' + DP.each(d.dances, function (x) {
        return '<button class="strip" data-act="dance" data-id="' + x.id + '">' + DP.danceSlot(x) +
          '<span class="strip__cap"><i>' + x.no + ' / ' + DP.pad(d.dances.length) + '</i><b>' + x.title + '</b>' +
          '<em class="strip__meta"><span>' + x.bpm + ' BPM</span><span>' + x.len + '</span><span>' + x.mood + '</span></em></span></button>';
      }) + '</div>' +
      '<p class="topline"><span class="brand-dot"></span>Choose a dance</p>' +

      /* after a dance is chosen: that dance fills the screen, options sit in a tray */
      '<div class="exbg"></div>' +
      '<div class="head"><h2 class="head__title">' + DP.t('dance.title') + '</h2>' +
        '<p class="head__meta">' + DP.t('dance.bpm') + ' BPM &middot; ' + DP.t('dance.len') + '</p></div>' +
      '<button class="link backbtn" data-act="back">&larr; All dances</button>' +
      '<section class="tray">' +
        '<div class="grp"><p class="lbl">Hair</p><div class="thumbs">' + DP.each(d.hairs, function (h) {
          return '<button class="th" data-act="hair" data-id="' + h.id + '">' + DP.hairSlot(h) + '<b>' + h.title + '</b></button>';
        }) + '</div></div>' +
        '<div class="grp"><p class="lbl">Outfit</p><div class="thumbs">' + DP.each(d.outfits, function (o) {
          return '<button class="th" data-act="outfit" data-id="' + o.id + '">' + DP.outfitSlot(o) + '<b>' + o.title + '</b></button>';
        }) + '</div></div>' +
        '<div class="grp grp-name"><p class="lbl">Your name</p>' +
          '<input class="namein" data-bind="name" maxlength="14" placeholder="Your name" autocomplete="off" spellcheck="false" aria-label="Your name">' +
          '<button class="roll" data-act="create">Create &rarr;</button></div>' +
      '</section></div>';
  },

  /* ---------- sound ----------
     Pick step: hovering a dance strip plays that dance out loud and mutes the others.
     A browser may block sound until the first click; pressing a strip unlocks it
     in that same press, before the dance is selected.
     Style / name plays the chosen dance. Gallery hover plays that tile only. */
  audioOn: false,
  lastDance: null,
  inStyle: false,
  hotTile: null,
  counts: null,

  play: function (v, withSound) {
    if (!v) return;
    var token = (v._snd = (v._snd || 0) + 1);
    try {
      v.muted = !withSound;
      if (withSound) v.volume = 1;
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () {
        if (v._snd !== token) return;
        v.muted = true;
        v.play().catch(function () {});
      });
    } catch (e) { /* ignore */ }
  },

  hear: function (root, vid) {
    root.querySelectorAll('.strip video').forEach(function (v) { if (v !== vid) v.muted = true; });
    if (vid) this.play(vid, true);
  },

  hearTile: function (root, tile) {
    root.querySelectorAll('.tile video').forEach(function (v) { v.muted = true; });
    if (!tile) return;
    var vid = tile.querySelector('video');
    if (vid) this.play(vid, this.audioOn);
  },

  init: function (root, DP) {
    var self = this;
    if (DP.params.s === 'setup') {
      root.addEventListener('pointerdown', function (ev) {
        self.audioOn = true;
        if (DP.state.step !== 'pick') return;
        var strip = ev.target.closest && ev.target.closest('.strip');
        if (strip) self.hear(root, strip.querySelector('video'));
      }, true);
      root.querySelectorAll('.strip').forEach(function (el) {
        el.addEventListener('pointerenter', function (ev) {
          if (ev.pointerType !== 'mouse' || DP.state.step !== 'pick') return;
          self.hear(root, el.querySelector('video'));
        });
        el.addEventListener('pointerleave', function (ev) {
          if (ev.pointerType !== 'mouse') return;
          self.hear(root, null);
        });
      });
      return;
    }
    if (!this.counts) this.counts = this.readCounts();
    if (DP.params.s === 'result') {
      this.paintHearts(root);
      this.bootFirebase(root);
      this.resultSound(root);
      return;
    }
    if (DP.params.s === 'mine') {
      this.resultSound(root);
      this.paintQr(root);
      return;
    }
    if (DP.params.s !== 'gallery') return;
    this.endVote(root, true);
    this.applyLayout(root);
    this.paintHearts(root);
    this.paintVote(root);
    if (!this.galleryBound) {
      this.galleryBound = true;
      this.bindGallery(root, DP);
    }
    this.bootFirebase(root);
  },

  update: function (root, DP) {
    if (DP.params.s === 'result') {
      this.paintHearts(root);
      if (this.db) this.watchVotes(root);
      return;
    }
    if (DP.params.s === 'gallery') {
      this.applyLayout(root);
      this.paintHearts(root);
      this.paintVote(root);
      if (this.db) this.watchVotes(root);
      if (!this.hotTile || !root.contains(this.hotTile)) {
        this.hotTile = null;
        root.querySelectorAll('.tile video').forEach(function (v) { v.muted = true; });
      }
      return;
    }
    if (DP.params.s !== 'setup') return;
    var d = DP.state.dance;
    /* Slots are drawn before a dance exists, so fill the chosen dance when it changes. */
    if (d !== this.lastDance) {
      this.lastDance = d;
      var ex = root.querySelector('.exbg');
      if (ex) ex.innerHTML = DP.sourceSlot();
      this.inStyle = false;
    }
    var styling = DP.state.step !== 'pick' && !!d;
    var exv = root.querySelector('.exbg video');
    if (styling) {
      root.querySelectorAll('.strip video').forEach(function (v) { v.muted = true; });
      if (exv && !this.inStyle) { exv.currentTime = 0; this.play(exv, this.audioOn); }
    } else if (exv) {
      exv.muted = true;
    }
    this.inStyle = styling;
  },

  result: function (DP) {
    return '<div class="body"><div class="frame">' + DP.resultSlot() + '</div>' +
      '<button type="button" class="unmute" data-unmute>&#9835; Tap for sound</button>' +
      '<p class="gen">One moment</p>' +
      '<section class="col">' +
        '<h1 class="name rv" style="--d:0">' + DP.t('name') + '</h1>' +
        '<dl class="facts rv" style="--d:1">' +
          '<div><dt>Dance</dt><dd>' + DP.t('dance.title') + '</dd></div>' +
          '<div><dt>Hair</dt><dd>' + DP.t('hair.title') + '</dd></div>' +
          '<div><dt>Outfit</dt><dd>' + DP.t('outfit.title') + '</dd></div>' +
        '</dl>' +
        '<p class="likes rv" style="--d:2"><span class="heart heart--static" data-entry="' + DP.sel().entry + '">' +
          this.heartSvg + '<b>0</b></span><small>likes</small></p>' +
      '</section></div>';
  },

  /* The other monitor. One person's finished video and a QR that opens that
     file. Nothing here leads to setup or the gallery. */
  mine: function (DP) {
    return '<div class="body"><div class="frame">' + DP.resultSlot() + '</div>' +
      '<button type="button" class="unmute" data-unmute>&#9835; Tap for sound</button>' +
      '<section class="col">' +
        '<h1 class="name">' + DP.t('name') + '</h1>' +
        '<dl class="facts">' +
          '<div><dt>Dance</dt><dd>' + DP.t('dance.title') + '</dd></div>' +
          '<div><dt>Hair</dt><dd>' + DP.t('hair.title') + '</dd></div>' +
          '<div><dt>Outfit</dt><dd>' + DP.t('outfit.title') + '</dd></div>' +
        '</dl>' +
        '<div class="keep"><span class="qr" data-qr role="img" aria-label="QR code to download this video"></span>' +
          '<p>Scan to download your video.</p></div>' +
      '</section></div>';
  },

  /* Shown after "Create" on the selection monitor. The generated video is
     shown on a different screen, so this one only asks them to wait. */
  thanks: function (DP) {
    return '<div class="body">' +
      '<section class="thx">' +
        '<p class="thx__tag"><span class="brand-dot"></span>Submitted</p>' +
        '<h1 class="thx__h">Thank you</h1>' +
        '<p class="thx__name">' + DP.t('name') + '</p>' +
        '<div class="thx__id"><span class="thx__idl">Your ID</span><span class="thx__idn">' + DP.t('id', '\u2013 \u2013 \u2013 \u2013 \u2013') + '</span></div>' +
        '<p class="thx__p">Remember this ID.<br>You will need it at the other stations.</p>' +
        '<dl class="facts">' +
          '<div><dt>Dance</dt><dd>' + DP.t('dance.title') + '</dd></div>' +
          '<div><dt>Hair</dt><dd>' + DP.t('hair.title') + '</dd></div>' +
          '<div><dt>Outfit</dt><dd>' + DP.t('outfit.title') + '</dd></div>' +
        '</dl>' +
        '<button type="button" class="thx__home" data-act="restart">Next person</button>' +
      '</section>' +
      '<div class="thx__frame">' + DP.sourceSlot() + '</div>' +
    '</div>';
  },

  gallery: function (DP) {
    return '<nav class="nav">' +
      '<button type="button" class="nav__reset" data-reset-votes>Reset votes</button>' +
      '</nav><div class="body"><div class="wall" data-grid></div>' +
      '<p class="wall__brand"><span class="brand-dot"></span>The debut wall &mdash; ' + DP.t('total') + ' videos</p>' +
      '<div class="wall__pager">' +
        '<span class="wall__layouts wall__sort">' +
          '<button type="button" data-sort="new" aria-pressed="true">Newest</button>' +
          '<button type="button" data-sort="liked" aria-pressed="false">Most liked</button>' +
        '</span>' +
        '<button data-act="page" data-dir="-1" aria-label="Previous page">&larr;</button>' +
        '<b>' + DP.t('page2') + ' / ' + DP.t('pages2') + '</b>' +
        '<button data-act="page" data-dir="1" aria-label="Next page">&rarr;</button></div>' +
      '<div class="vote">' +
        '<button type="button" class="vote__start" data-vote-act="start">' + this.heartSvg + 'Vote for your favorite idol</button>' +
        '<div class="vote__bar" role="group" aria-label="Voting">' +
          '<p class="vote__hint">Tap the videos you like<small><b class="vote__n">0</b> selected</small></p>' +
          '<button type="button" class="vote__cancel" data-vote-act="cancel">Cancel</button>' +
          '<button type="button" class="vote__ok" data-vote-act="confirm" disabled>Confirm</button>' +
        '</div>' +
        '<p class="vote__thanks" role="status">Thanks! Your votes are in.</p>' +
      '</div></div>';
  },

  /* Full-bleed video tile; the name sits in a lower-third, the heart at the bottom right. */
  tile: function (e, i, DP) {
    return DP.entrySlot(e) +
      '<span class="g-lt">' + (e.latest ? '<i>New</i>' : '') + '<b>' + DP.esc(e.name) + '</b><em>' + e.dance.title + '</em></span>' +
      '<span class="heart" data-entry="' + e.entry + '" aria-label="Likes">' + this.heartSvg + '<b>0</b></span>' +
      '<span class="pick" aria-hidden="true"></span>';
  },

  likes: function (id) {
    if (!this.counts) this.counts = this.readCounts();
    return Number(this.counts[id]) || 0;
  },

  empty: function () {
    return '';
  },

  /* ---------- result sound ----------
     The result video plays with sound. A browser may refuse that on a fresh
     page; the video then plays muted and a "Tap for sound" button appears.
     Any tap on the page turns the sound on. */
  resultSound: function (root) {
    var v = root.querySelector('.frame video');
    if (!v) return;
    var sync = function () {
      if (v.muted || v.paused) root.dataset.silent = '1';
      else delete root.dataset.silent;
    };
    ['playing', 'pause', 'volumechange'].forEach(function (ev) { v.addEventListener(ev, sync); });
    this.play(v, true);
    setTimeout(sync, 500);
    root.addEventListener('pointerdown', function () {
      if (!root.dataset.silent) return;
      v.muted = false;
      v.volume = 1;
      v.play().catch(function () {});
    }, true);
  },

  /* ---------- gallery layout ----------
     The wall is fixed at 4 rows by 3 columns. */
  applyLayout: function (root) {
    var mode = window.DP ? DP.getSort() : 'new';
    root.querySelectorAll('.wall__sort [data-sort]').forEach(function (btn) {
      var on = btn.dataset.sort === mode;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  },

  bindGallery: function (root, DP) {
    var self = this;
    root.addEventListener('pointerdown', function () {
      self.audioOn = true;
      if (root.dataset.screen === 'gallery' && self.hotTile) self.hearTile(root, self.hotTile);
    }, true);
    root.addEventListener('pointerover', function (ev) {
      if (root.dataset.screen !== 'gallery' || ev.pointerType !== 'mouse') return;
      var tile = ev.target.closest && ev.target.closest('.tile');
      if (!tile || tile === self.hotTile) return;
      self.hotTile = tile;
      self.hearTile(root, tile);
    });
    root.addEventListener('pointerout', function (ev) {
      if (root.dataset.screen !== 'gallery') return;
      var tile = ev.target.closest && ev.target.closest('.tile');
      if (!tile || self.hotTile !== tile) return;
      var to = ev.relatedTarget;
      if (to && tile.contains(to)) return;
      self.hotTile = null;
      self.hearTile(root, null);
    });
    root.addEventListener('click', function (ev) {
      if (root.dataset.screen !== 'gallery') return;
      var rst = ev.target.closest && ev.target.closest('[data-reset-votes]');
      if (rst) { self.resetVotes(root, rst); return; }
      var sortBtn = ev.target.closest && ev.target.closest('.wall__sort [data-sort]');
      if (sortBtn) { DP.setSort(sortBtn.dataset.sort); return; }
      var vb = ev.target.closest && ev.target.closest('[data-vote-act]');
      if (vb) { self.voteAction(root, vb.dataset.voteAct); return; }
      var tile = ev.target.closest && ev.target.closest('.tile[data-entry]');
      if (!tile || !self.voting) return;
      self.togglePick(root, tile.dataset.entry);
    });
    root.addEventListener('pointerdown', function () { if (self.voting) self.armIdle(root); }, true);
  },

  /* ---------- votes ----------
     Browsing does not open a video. Vote mode ("Vote for your favorite idol")
     is the only time a tap does anything: it picks or un-picks videos, and
     Confirm adds one vote to each picked video. The screen is shared, so
     nothing is remembered per person: a video is picked once per Confirm. Without Firebase the totals stay in this
     browser. With a config in shared/firebase-config.js the same Confirm also
     adds 1 per video in Firestore. */
  readCounts: function () {
    try {
      var v = JSON.parse(localStorage.getItem('dp-vote-counts') || '{}');
      return v && typeof v === 'object' ? v : {};
    } catch (e) { return {}; }
  },

  writeCounts: function () {
    try { localStorage.setItem('dp-vote-counts', JSON.stringify(this.counts || {})); } catch (e) { /* ignore */ }
  },

  paintHearts: function (root) {
    var self = this;
    root.querySelectorAll('.heart').forEach(function (btn) {
      var id = btn.dataset.entry;
      var n = self.counts && self.counts[id];
      var count = Number(n) || 0;
      var on = count > 0;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      var label = btn.querySelector('b');
      if (label) label.textContent = String(count);
    });
  },

  /* One listener on the whole votes collection: every video's total stays
     current, which "Most liked" needs, not only the ones on this page. */
  watchVotes: function (root) {
    var self = this;
    if (!this.db || this.watching) return;
    this.watching = true;
    this.db.collection('votes').onSnapshot(function (snap) {
      snap.forEach(function (doc) { self.counts[doc.id] = Number(doc.data().count) || 0; });
      self.writeCounts();
      self.paintHearts(root);
    }, function () { self.watching = false; });
  },

  /* Staff tool for test runs. Press twice within 4 seconds. Clears the totals
     kept in this browser. Totals stored in Firebase are cleared in the Firebase
     console (the rules only let a client move a count by 1). */
  resetVotes: function (root, btn) {
    var self = this;
    var label = 'Reset votes';
    var cfg = window.DP_FIREBASE;
    clearTimeout(this.resetTimer);
    if (cfg && cfg.apiKey && cfg.projectId) {
      btn.textContent = 'Votes are in Firebase: delete the votes collection there';
      this.resetTimer = setTimeout(function () { btn.textContent = label; }, 5000);
      return;
    }
    if (!btn.hasAttribute('data-armed')) {
      btn.setAttribute('data-armed', '');
      btn.textContent = 'Tap again to reset';
      this.resetTimer = setTimeout(function () {
        btn.removeAttribute('data-armed');
        btn.textContent = label;
      }, 4000);
      return;
    }
    btn.removeAttribute('data-armed');
    this.counts = {};
    this.picks = {};
    try { localStorage.removeItem('dp-vote-counts'); } catch (e) { /* ignore */ }
    this.paintHearts(root);
    this.paintVote(root);
    if (window.DP) DP.setSort(DP.getSort(), true);
    btn.textContent = 'Votes reset';
    this.resetTimer = setTimeout(function () { btn.textContent = label; }, 1800);
  },

  voting: false,
  picks: {},
  idleTimer: null,
  thanksTimer: null,

  voteAction: function (root, what) {
    if (what === 'start') {
      this.voting = true;
      this.picks = {};
      this.armIdle(root);
      this.paintVote(root);
    } else if (what === 'cancel') {
      this.endVote(root);
    } else if (what === 'confirm') {
      this.confirmVotes(root);
    }
  },

  endVote: function (root, quiet) {
    this.voting = false;
    this.picks = {};
    clearTimeout(this.idleTimer);
    if (!quiet) this.paintVote(root);
    else root.dataset.vote = 'off';
  },

  /* A forgotten vote screen falls back to browsing after a minute. */
  armIdle: function (root) {
    var self = this;
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(function () { self.endVote(root); }, this.voteIdleMs);
  },

  togglePick: function (root, id) {
    if (this.picks[id]) delete this.picks[id];
    else this.picks[id] = true;
    this.paintVote(root);
  },

  paintVote: function (root) {
    var self = this;
    var n = Object.keys(this.picks).length;
    root.dataset.vote = this.voting ? 'on' : 'off';
    root.querySelectorAll('.tile[data-entry]').forEach(function (t) {
      var id = t.dataset.entry;
      t.classList.toggle('is-picked', !!self.picks[id]);
    });
    var out = root.querySelector('.vote__n');
    if (out) out.textContent = String(n);
    var ok = root.querySelector('.vote__ok');
    if (ok) ok.disabled = n === 0;
  },

  confirmVotes: function (root) {
    var self = this;
    var ids = Object.keys(this.picks);
    if (!ids.length) return;
    if (!this.counts) this.counts = this.readCounts();
    ids.forEach(function (id) {
      self.counts[id] = (Number(self.counts[id]) || 0) + 1;
    });
    this.writeCounts();
    this.pushRemote(ids);
    this.endVote(root);
    if (window.DP && DP.getSort() === 'liked') DP.setSort('liked', true);
    root.dataset.thanks = '1';
    clearTimeout(this.thanksTimer);
    this.thanksTimer = setTimeout(function () { delete root.dataset.thanks; }, 3200);
  },

  /* One transaction per video; a failed one is taken back locally. */
  pushRemote: function (ids) {
    var self = this;
    var remote = this.db && window.firebase && firebase.auth && firebase.auth().currentUser;
    if (!remote) return;
    ids.forEach(function (id) {
      var ref = self.db.collection('votes').doc(id);
      self.db.runTransaction(function (tx) {
        return tx.get(ref).then(function (snap) {
          if (!snap.exists) { tx.set(ref, { count: 1 }); return; }
          tx.update(ref, { count: (Number(snap.data().count) || 0) + 1 });
        });
      }).catch(function () {
        self.counts[id] = Math.max(0, (Number(self.counts[id]) || 1) - 1);
        self.writeCounts();
      });
    });
  },

  /* Draws a scannable QR for this screen's video file. Loaded only here. */
  paintQr: function (root) {
    var vid = root.querySelector('.frame video');
    var src = vid && vid.getAttribute('src');
    var box = root.querySelector('[data-qr]');
    if (!box || !src) return;
    var url = new URL(src, location.href).href;
    var draw = function () {
      if (typeof qrcode !== 'function') return;
      var qr = qrcode(0, 'M');
      qr.addData(url);
      qr.make();
      box.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
    };
    if (typeof qrcode === 'function') { draw(); return; }
    var s = document.createElement('script');
    s.src = 'shared/qrcode.js';
    s.onload = draw;
    document.head.appendChild(s);
  },

  loadScript: function (src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = function () { resolve(); };
      s.onerror = function () { reject(new Error(src)); };
      document.head.appendChild(s);
    });
  },

  bootFirebase: function (root) {
    if (this.fbStarted || DP_STORE.mode !== 'firebase') return;
    this.fbStarted = true;
    var self = this;
    /* shared/store.js loads the SDK once, signs in anonymously and hands back the database. */
    DP_STORE.connect().then(function (c) {
      self.db = c.db;
      self.watchVotes(root);
    }).catch(function () { /* hearts stay visible; counts are not stored */ });
  }
});
