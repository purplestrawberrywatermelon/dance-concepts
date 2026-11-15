/* 05 Music Video - one dance at a time, full screen, lower thirds, hard cuts. */
DP.register({
  id: '05',
  fonts: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Barlow:wght@400;500;600&display=swap',
  genMs: 1300,
  revealMs: 3300,
  nameDelay: 300,
  turn: { out: 560, 'in': 520 },
  idx: 0,

  setup: function (DP) {
    var d = DP.data;
    return '<div class="reel"><div class="track">' + DP.each(d.dances, function (x, i) {
        return '<div class="slide" data-i="' + i + '" data-id="' + x.id + '">' + DP.danceSlot(x) +
          '<div class="lt"><p class="lt__count">' + x.no + ' / 03</p><h2 class="lt__title">' + x.title + '</h2>' +
          '<p class="lt__meta">' + x.bpm + ' BPM &middot; ' + x.len + ' &middot; ' + x.mood + '</p></div>' +
          '<button class="pickbtn" data-act="dance" data-id="' + x.id + '">Select this dance</button></div>';
      }) + '</div></div>' +

      '<footer class="deck">' +
        '<p class="deck__brand">Multimodal AI Studio &mdash; NeurIPS 2026</p>' +
        '<div class="ticks">' + DP.each(d.dances, function (x, i) { return '<i data-i="' + i + '"></i>'; }) + '</div>' +
        '<div class="deck__nav"><button data-go="-1" aria-label="Previous dance">&larr; Prev</button><button data-go="1" aria-label="Next dance">Next &rarr;</button></div>' +
      '</footer>' +

      /* after a dance is chosen: example result full screen, options in a tray */
      '<div class="exbg">' + DP.exampleSlot() + '</div>' +
      '<div class="head"><p class="head__tag">Example result</p><h2 class="head__title">' + DP.t('dance.title') + '</h2></div>' +
      '<figure class="pip">' + DP.sourceSlot() + '<figcaption>Original</figcaption></figure>' +
      '<button class="backbtn" data-act="back">&larr; Dances</button>' +
      '<section class="tray">' +
        '<div class="grp"><p class="lbl">Hair</p><div class="thumbs">' + DP.each(d.hairs, function (h) {
          return '<button class="th" data-act="hair" data-id="' + h.id + '">' + DP.hairSlot(h) + '<b>' + h.title + '</b></button>';
        }) + '</div></div>' +
        '<div class="grp"><p class="lbl">Outfit</p><div class="thumbs">' + DP.each(d.outfits, function (o) {
          return '<button class="th" data-act="outfit" data-id="' + o.id + '">' + DP.outfitSlot(o) + '<b>' + o.title + '</b></button>';
        }) + '</div></div>' +
        '<div class="grp grp-name"><p class="lbl">Your name</p>' +
          '<input class="namein" data-bind="name" maxlength="14" placeholder="Type it" autocomplete="off" spellcheck="false" aria-label="Your name">' +
          '<button class="roll" data-act="create">Roll it &#9654;</button></div>' +
      '</section>';
  },

  show: function (root) {
    var idx = this.idx;
    root.style.setProperty('--idx', idx);
    root.querySelectorAll('.slide, .ticks i').forEach(function (el) {
      el.classList.toggle('is-cur', Number(el.dataset.i) === idx);
    });
  },

  update: function (root, DP) {
    if (DP.params.s !== 'setup') return;
    var list = DP.data.dances;
    for (var i = 0; i < list.length; i++) if (list[i].id === DP.state.dance) this.idx = i;
    this.show(root);
  },

  init: function (root, DP) {
    if (DP.params.s !== 'setup') return;
    var self = this;
    var n = DP.data.dances.length;
    root.querySelectorAll('[data-go]').forEach(function (b) {
      b.addEventListener('click', function () {
        self.idx = (self.idx + Number(b.dataset.go) + n) % n;
        self.show(root);
      });
    });
    root.querySelectorAll('.slide').forEach(function (s) {
      s.addEventListener('click', function (ev) {
        if (ev.target.closest('[data-act]') || DP.state.step !== 'pick') return;
        var i = Number(s.dataset.i);
        if (i === self.idx) DP.choose('dance', s.dataset.id);
        else { self.idx = i; self.show(root); }
      });
    });
    this.show(root);
  },

  key: function (ev, root, DP) {
    if (DP.params.s !== 'setup' || DP.state.step !== 'pick') return;
    var n = DP.data.dances.length;
    if (ev.key === 'ArrowRight') { this.idx = (this.idx + 1) % n; this.show(root); }
    if (ev.key === 'ArrowLeft') { this.idx = (this.idx + n - 1) % n; this.show(root); }
    if (ev.key === 'Enter') DP.choose('dance', DP.data.dances[this.idx].id);
  },

  result: function (DP) {
    var s = DP.sel();
    return '<div class="full">' + DP.resultSlot() + '</div>' +
      '<div class="standby"><i></i>Rendering</div>' +
      '<div class="lower">' +
        '<p class="lower__tag">Entry ' + s.entry + ' &mdash; Official dance video</p>' +
        '<h1 class="lower__name">' + DP.t('name') + '</h1>' +
        '<p class="lower__bar"><b>' + DP.t('dance.title') + '</b>' + DP.t('hair.title') + ' &middot; ' + DP.t('outfit.title') + '</p>' +
      '</div>' +
      '<aside class="bug"><p>Scan to keep</p>' + DP.qr() + '<small>' + DP.t('url') + '</small></aside>' +
      '<nav class="corner"><button data-act="goto" data-screen="gallery">Gallery</button><button data-act="restart">New take</button></nav>' +
      '<div class="cut cut-1"><b>Take ' + s.entry + '</b></div>' +
      '<div class="cut cut-2"><b>' + DP.t('dance.title') + '</b></div>' +
      '<div class="cut cut-3"><b>' + DP.t('name') + '</b></div>' +
      '<div class="cut cut-4"><p>Multimodal AI Studio presents</p><b>' + DP.t('name') + '</b><p>Official dance video</p></div>';
  },

  gallery: function (DP) {
    return '<div class="wall" data-grid></div>' +
      '<p class="wall__brand">Live wall &mdash; ' + DP.t('total') + ' videos</p>' +
      '<div class="wall__pager"><button data-act="page" data-dir="-1" aria-label="Previous page">&larr;</button>' +
      '<b>' + DP.t('page') + ' / ' + DP.t('pages') + '</b>' +
      '<button data-act="page" data-dir="1" aria-label="Next page">&rarr;</button></div>' +
      '<div class="flash"></div>';
  },

  tile: function (e, i, DP) {
    return DP.entrySlot(e) + '<span class="g-lt">' + (e.latest ? '<i>New</i>' : '') + '<b>' + DP.esc(e.name) + '</b><em>' + e.dance.title + '</em></span>';
  }
});
