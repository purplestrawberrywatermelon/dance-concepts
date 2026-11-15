/* 10 Portrait Exhibit - one tall frame in focus, the rest annotated around it. */
DP.register({
  id: '10',
  fonts: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;1,9..144,500;1,9..144,600&family=Outfit:wght@400;500&display=swap',
  genMs: 900,
  revealMs: 3400,
  nameDelay: 500,
  turn: { out: 700, 'in': 1200 },
  idx: 1,

  setup: function (DP) {
    var d = DP.data;
    return '<section class="pickview">' +
        '<h1 class="mast">One<br>portrait.</h1>' +
        DP.each(d.dances, function (x, i) {
          return '<button class="pf" data-i="' + i + '" data-id="' + x.id + '">' +
            '<span class="pf__frame">' + DP.danceSlot(x) + '</span>' +
            '<span class="pf__cap"><b>' + x.title + '</b><i>' + x.mood + '</i></span></button>';
        }) +
        '<p class="hint">Tap a portrait to bring it forward, then tap again.</p></section>' +

      '<section class="styleview">' +
        '<aside class="ann ann-l"><p class="k">Hair</p>' + DP.each(d.hairs, function (h) {
          return '<button class="opt" data-act="hair" data-id="' + h.id + '"><span class="dot">' + DP.hairSlot(h) + '</span><b>' + h.title + '</b></button>';
        }) + '</aside>' +
        '<figure class="study"><span class="study__frame">' + DP.exampleSlot() + '</span>' +
          '<span class="inset">' + DP.sourceSlot() + '<i>Source</i></span></figure>' +
        '<aside class="ann ann-r"><p class="k">Outfit</p>' + DP.each(d.outfits, function (o) {
          return '<button class="opt" data-act="outfit" data-id="' + o.id + '"><span class="dot">' + DP.outfitSlot(o) + '</span><b>' + o.title + '</b></button>';
        }) + '</aside>' +
        '<h2 class="of">Portrait of <input data-bind="name" maxlength="14" placeholder="____" autocomplete="off" spellcheck="false" aria-label="Your name"></h2>' +
        '<button class="hang" data-act="create">Hang the portrait</button>' +
        '<button class="back" data-act="back">&larr; All portraits</button>' +
      '</section>';
  },

  show: function (root) {
    var idx = this.idx;
    root.dataset.idx = String(idx);
    root.querySelectorAll('.pf').forEach(function (el) {
      var on = Number(el.dataset.i) === idx;
      el.classList.toggle('is-focus', on);
      if (on) el.setAttribute('data-act', 'dance');
      else el.removeAttribute('data-act');
    });
  },

  update: function (root, DP) {
    if (DP.params.s !== 'setup') return;
    this.show(root);
  },

  init: function (root, DP) {
    if (DP.params.s !== 'setup') return;
    var self = this;
    root.querySelectorAll('.pf').forEach(function (b) {
      b.addEventListener('click', function (ev) {
        if (Number(b.dataset.i) === self.idx) return;
        ev.stopPropagation();
        self.idx = Number(b.dataset.i);
        self.show(root);
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
    return '<figure class="portrait"><span class="study__frame">' + DP.resultSlot() + '</span></figure>' +
      '<h1 class="pname">' + DP.letters(s.name) + '</h1>' +
      '<ul class="facts">' +
        '<li style="--d:0"><i></i><small>Dance</small><b>' + DP.t('dance.title') + '</b></li>' +
        '<li style="--d:1"><i></i><small>Hair</small><b>' + DP.t('hair.title') + '</b></li>' +
        '<li style="--d:2"><i></i><small>Outfit</small><b>' + DP.t('outfit.title') + '</b></li>' +
      '</ul>' +
      '<aside class="keep"><p>No. ' + s.entry + '</p>' + DP.qr() + '<small>Keep the portrait</small><em>' + DP.t('url') + '</em>' +
        '<nav><button data-act="goto" data-screen="gallery">All portraits</button><button data-act="restart">Again</button></nav></aside>';
  },

  gallery: function (DP) {
    return '<header class="ghead"><p>Portraits</p><h1>The sitting</h1>' +
        '<div class="pager"><button data-act="page" data-dir="-1" aria-label="Previous page">&larr;</button>' +
        '<b>' + DP.t('page') + ' / ' + DP.t('pages') + '</b>' +
        '<button data-act="page" data-dir="1" aria-label="Next page">&rarr;</button></div></header>' +
      '<div class="list" data-grid></div>';
  },

  tile: function (e, i, DP) {
    return '<span class="who"><b>' + DP.esc(e.name) + '</b><i>' + e.dance.title + '</i></span>' +
      '<span class="sliver">' + DP.entrySlot(e) + '</span>';
  },

  empty: function () {
    return '<span class="who"></span><span class="sliver is-blank"></span>';
  }
});
