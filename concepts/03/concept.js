/* 03 Editorial - big video, very little copy. Main screen carries BPM / length;
   the gallery is a full-bleed video wall, 12 per page, 4x3 or 3x4. */
DP.register({
  id: '03',
  fonts: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap',
  genMs: 1500,
  revealMs: 3600,
  turn: { out: 520, 'in': 950 },
  perPage: 12,
  cols: 4,

  setup: function (DP) {
    var d = DP.data;
    return '<div class="strips">' + DP.each(d.dances, function (x) {
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
      '</section>';
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
  mine: null,

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
    if (DP.params.s !== 'gallery') return;
    if (!this.mine) this.mine = this.readMine();
    this.counts = this.counts || {};
    this.applyLayout(root);
    if (!this.galleryBound) {
      this.galleryBound = true;
      this.bindGallery(root);
    }
    this.bootFirebase(root);
  },

  update: function (root, DP) {
    if (DP.params.s === 'gallery') {
      this.applyLayout(root);
      this.paintHearts(root);
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
    return '<div class="frame">' + DP.resultSlot() + '</div>' +
      '<p class="gen">One moment</p>' +
      '<section class="col">' +
        '<h1 class="name rv" style="--d:0">' + DP.t('name') + '</h1>' +
        '<dl class="facts rv" style="--d:1">' +
          '<div><dt>Dance</dt><dd>' + DP.t('dance.title') + '</dd></div>' +
          '<div><dt>Hair</dt><dd>' + DP.t('hair.title') + '</dd></div>' +
          '<div><dt>Outfit</dt><dd>' + DP.t('outfit.title') + '</dd></div>' +
        '</dl>' +
        '<div class="links rv" style="--d:2">' +
          '<button class="link" data-act="goto" data-screen="gallery">Gallery &rarr;</button>' +
          '<button class="link" data-act="restart">Start over</button>' +
        '</div>' +
        '<div class="keep rv" style="--d:3">' + DP.qr() + '<p>Scan to keep it.<small>' + DP.t('url') + '</small></p></div>' +
      '</section>';
  },

  gallery: function (DP) {
    return '<div class="wall" data-grid></div>' +
      '<p class="wall__brand"><span class="brand-dot"></span>The debut wall &mdash; ' + DP.t('total') + ' videos</p>' +
      '<div class="wall__pager">' +
        '<span class="wall__layouts">' +
          '<button type="button" data-layout="4x3" aria-pressed="true">4×3</button>' +
          '<button type="button" data-layout="3x4" aria-pressed="false">3×4</button>' +
        '</span>' +
        '<button data-act="page" data-dir="-1" aria-label="Previous page">&larr;</button>' +
        '<b>' + DP.t('page2') + ' / ' + DP.t('pages2') + '</b>' +
        '<button data-act="page" data-dir="1" aria-label="Next page">&rarr;</button></div>';
  },

  /* Full-bleed video tile; the name sits in a lower-third, the heart at the bottom right. */
  tile: function (e, i, DP) {
    return DP.entrySlot(e) +
      '<span class="g-lt">' + (e.latest ? '<i>New</i>' : '') + '<b>' + DP.esc(e.name) + '</b><em>' + e.dance.title + '</em></span>' +
      '<button type="button" class="heart" data-entry="' + e.entry + '" aria-label="Like ' + DP.esc(e.name) + '" aria-pressed="false">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12.1 20.3s-6.4-4.1-8.9-7.8C1.3 9.7 1.8 6.5 4.3 5.1c2.1-1.2 4.4-.6 6.5 1.8l1.2 1.4 1.2-1.4c2.1-2.4 4.4-3 6.5-1.8 2.5 1.4 3 4.6 1.1 7.4-2.5 3.7-8.7 7.8-8.7 7.8z"/></svg>' +
        '<b>0</b></button>';
  },

  empty: function () {
    return '';
  },

  /* ---------- gallery layout ---------- */
  applyLayout: function (root) {
    var layout = '4x3';
    try {
      if (sessionStorage.getItem('dp-gallery-layout') === '3x4') layout = '3x4';
    } catch (e) { /* ignore */ }
    root.dataset.layout = layout;
    root.querySelectorAll('.wall__layouts [data-layout]').forEach(function (btn) {
      var on = btn.dataset.layout === layout;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  },

  bindGallery: function (root) {
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
      var layout = ev.target.closest && ev.target.closest('.wall__layouts [data-layout]');
      if (layout) {
        try { sessionStorage.setItem('dp-gallery-layout', layout.dataset.layout); } catch (e) { /* ignore */ }
        self.applyLayout(root);
        return;
      }
      var heart = ev.target.closest && ev.target.closest('.heart');
      if (heart) self.vote(root, heart);
    });
  },

  /* ---------- votes ----------
     Counts live in Firestore votes/{entry}. This browser remembers its own
     hearts in localStorage so a second tap removes the vote.
     Paste the Firebase web config before counts will save. Rules to put in
     the Firebase console are in shared/firebase-config.js. */
  readMine: function () {
    try {
      var v = JSON.parse(localStorage.getItem('dp-votes') || '{}');
      return v && typeof v === 'object' ? v : {};
    } catch (e) { return {}; }
  },

  writeMine: function () {
    try { localStorage.setItem('dp-votes', JSON.stringify(this.mine || {})); } catch (e) { /* ignore */ }
  },

  paintHearts: function (root) {
    var self = this;
    var mine = this.mine || {};
    root.querySelectorAll('.heart').forEach(function (btn) {
      var id = btn.dataset.entry;
      var on = !!mine[id];
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      var n = self.counts && self.counts[id];
      var label = btn.querySelector('b');
      if (label && n != null) label.textContent = String(n);
    });
  },

  watchVotes: function (root) {
    var self = this;
    if (!this.db) return;
    var ids = [];
    root.querySelectorAll('.heart').forEach(function (btn) { ids.push(btn.dataset.entry); });
    var key = ids.join(',');
    if (key === this.watchKey) return;
    this.watchKey = key;
    (this.unsubs || []).forEach(function (fn) { fn(); });
    this.unsubs = [];
    ids.forEach(function (id) {
      self.unsubs.push(self.db.collection('votes').doc(id).onSnapshot(function (snap) {
        self.counts[id] = snap.exists ? (Number(snap.data().count) || 0) : 0;
        self.paintHearts(root);
      }));
    });
  },

  vote: function (root, btn) {
    var self = this;
    if (!this.db || btn.dataset.busy) return;
    if (!window.firebase || !firebase.auth().currentUser) return;
    var id = btn.dataset.entry;
    var had = !!this.mine[id];
    if (had) delete this.mine[id]; else this.mine[id] = 1;
    this.writeMine();
    this.paintHearts(root);
    btn.dataset.busy = '1';
    var delta = had ? -1 : 1;
    var ref = this.db.collection('votes').doc(id);
    this.db.runTransaction(function (tx) {
      return tx.get(ref).then(function (snap) {
        if (!snap.exists) {
          if (delta > 0) tx.set(ref, { count: 1 });
          return;
        }
        var count = Number(snap.data().count) || 0;
        var next = count + delta;
        if (next < 0) return;
        tx.update(ref, { count: next });
      });
    }).catch(function () {
      if (had) self.mine[id] = 1; else delete self.mine[id];
      self.writeMine();
      self.paintHearts(root);
    }).then(function () { delete btn.dataset.busy; });
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
    if (this.fbStarted) return;
    var cfg = window.DP_FIREBASE;
    if (!cfg || !cfg.apiKey || !cfg.projectId) return;
    this.fbStarted = true;
    var self = this;
    var base = 'https://www.gstatic.com/firebasejs/10.14.1/';
    this.loadScript(base + 'firebase-app-compat.js').then(function () {
      return self.loadScript(base + 'firebase-auth-compat.js');
    }).then(function () {
      return self.loadScript(base + 'firebase-firestore-compat.js');
    }).then(function () {
      if (!firebase.apps.length) firebase.initializeApp(cfg);
      self.db = firebase.firestore();
      self.watchVotes(root);
      return firebase.auth().signInAnonymously();
    }).catch(function () { /* hearts stay visible; counts are not stored */ });
  }
});
