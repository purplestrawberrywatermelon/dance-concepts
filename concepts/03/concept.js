/* 03 Editorial - big video, very little copy. Main screen carries BPM / length like 05;
   the gallery is the 05-style full-bleed video wall, 4 x 3 = 12 per page. */
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

      /* after a dance is chosen (05-style): example result full screen, options in a tray */
      '<div class="exbg">' + DP.exampleSlot() + '</div>' +
      '<div class="head"><p class="head__tag">Example result</p><h2 class="head__title">' + DP.t('dance.title') + '</h2>' +
        '<p class="head__meta">' + DP.t('dance.bpm') + ' BPM &middot; ' + DP.t('dance.len') + '</p></div>' +
      '<figure class="pip">' + DP.sourceSlot() + '<figcaption>Original</figcaption></figure>' +
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
     Browsers only allow sound after the first touch / click on the page, so
     audioOn flips on the first pointerdown. After that:
       mouse   - hovering a dance strip plays that dance with sound
       touch   - there is no hover, so a tap selects the dance and the example
                 result plays with sound on the style screen
     The small "Original" picture and the gallery stay silent. */
  audioOn: false,
  lastDance: null,
  inStyle: false,

  play: function (v, withSound) {
    if (!v) return;
    try {
      v.muted = !withSound;
      if (withSound) v.volume = 1;
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () { v.muted = true; v.play().catch(function () {}); });
    } catch (e) { /* ignore */ }
  },

  hear: function (root, vid) {
    var self = this;
    root.querySelectorAll('.strip video').forEach(function (v) { if (v !== vid) v.muted = true; });
    if (vid) self.play(vid, self.audioOn);
  },

  init: function (root, DP) {
    if (DP.params.s !== 'setup') return;
    var self = this;
    this.lastDance = null;
    this.inStyle = false;
    root.addEventListener('pointerdown', function () { self.audioOn = true; }, true);
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
  },

  update: function (root, DP) {
    if (DP.params.s !== 'setup') return;
    var d = DP.state.dance;
    /* The example / original slots are drawn before a dance exists, so fill
       them again when the chosen dance changes. */
    if (d !== this.lastDance) {
      this.lastDance = d;
      var ex = root.querySelector('.exbg');
      var pip = root.querySelector('.pip');
      var fig = root.querySelector('.example');
      if (ex) ex.innerHTML = DP.exampleSlot();
      if (pip) pip.innerHTML = DP.sourceSlot() + '<figcaption>Original</figcaption>';
      if (fig) fig.innerHTML = DP.exampleSlot() + '<figcaption>Example result</figcaption>';
      this.inStyle = false;
    }
    var styling = DP.state.step !== 'pick' && !!d;
    var exv = root.querySelector('.exbg video, .example video');
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
      '<div class="wall__pager"><button data-act="page" data-dir="-1" aria-label="Previous page">&larr;</button>' +
      '<b>' + DP.t('page2') + ' / ' + DP.t('pages2') + '</b>' +
      '<button data-act="page" data-dir="1" aria-label="Next page">&rarr;</button></div>';
  },

  /* Full-bleed video tile; the name and dance sit in a lower-third. */
  tile: function (e, i, DP) {
    return DP.entrySlot(e) +
      '<span class="g-lt">' + (e.latest ? '<i>New</i>' : '') + '<b>' + DP.esc(e.name) + '</b><em>' + e.dance.title + '</em></span>';
  },

  empty: function () {
    return '';
  }
});
