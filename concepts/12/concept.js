/* 12 Creative Studio - soft arches, round swatches, a quiet board. */
DP.register({
  id: '12',
  fonts: 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,560;1,9..144,500&family=Outfit:wght@400;500;600&display=swap',
  genMs: 1100,
  revealMs: 2600,
  nameDelay: 480,
  turn: { out: 700, 'in': 1100 },

  setup: function (DP) {
    var d = DP.data;
    return '<i class="blob b1"></i><i class="blob b2"></i><i class="blob b3"></i>' +
      '<p class="hello"><span class="h-pick">Pick a dance to try.</span><span class="h-rest">Now the finishing touches.</span></p>' +
      DP.each(d.dances, function (x) {
        return '<button class="arch" data-act="dance" data-id="' + x.id + '">' +
          '<span class="arch__win">' + DP.danceSlot(x) + '</span>' +
          '<span class="arch__cap"><b>' + x.title + '</b><i>' + x.bpm + ' BPM</i></span></button>';
      }) +
      '<figure class="round">' + DP.exampleSlot() + '<figcaption>Example result</figcaption></figure>' +
      '<aside class="panel">' +
        '<div class="block"><p class="k">Hair</p><div class="circles">' + DP.each(d.hairs, function (h) {
          return '<button class="circ" data-act="hair" data-id="' + h.id + '">' + DP.hairSlot(h) + '<b>' + h.short + '</b></button>';
        }) + '</div></div>' +
        '<div class="block"><p class="k">Outfit</p><div class="seg">' + DP.each(d.outfits, function (o) {
          return '<button data-act="outfit" data-id="' + o.id + '">' + o.short + '</button>';
        }) + '</div></div>' +
        '<label class="field">Your name<input data-bind="name" maxlength="14" placeholder="Type it here" autocomplete="off" spellcheck="false" aria-label="Your name"></label>' +
        '<button class="make" data-act="create">Make my video</button>' +
      '</aside>' +
      '<button class="back" data-act="back">&larr; Dances</button>';
  },

  result: function (DP) {
    var s = DP.sel();
    return '<i class="blob b2"></i>' +
      '<figure class="hero">' + DP.resultSlot() + '</figure>' +
      '<section class="note">' +
        '<p class="k">Studio take ' + s.entry + '</p>' +
        '<h1>Nice moves, <em>' + DP.t('name') + '</em>.</h1>' +
        '<ul class="chips"><li>' + DP.t('dance.title') + '</li><li>' + DP.t('hair.title') + '</li><li>' + DP.t('outfit.title') + '</li></ul>' +
        '<div class="qrcard">' + DP.qr() + '<p>Keep this one<small>' + DP.t('url') + '</small></p></div>' +
        '<nav><button class="make" data-act="goto" data-screen="gallery">See the wall</button>' +
        '<button class="text" data-act="restart">Start over</button></nav>' +
      '</section>';
  },

  gallery: function (DP) {
    return '<div class="mosaic" data-grid></div>' +
      '<aside class="side"><p class="k">Studio wall</p><h1>Tonight,<br>softly.</h1>' +
        '<p class="count"><b>' + DP.t('total') + '</b> videos so far</p>' +
        '<div class="pager"><button data-act="page" data-dir="-1" aria-label="Previous page">&larr;</button>' +
        '<b>Page ' + DP.t('page') + ' of ' + DP.t('pages') + '</b>' +
        '<button data-act="page" data-dir="1" aria-label="Next page">&rarr;</button></div></aside>';
  },

  tile: function (e, i, DP) {
    return '<span class="sq">' + DP.entrySlot(e) + '</span><span class="chip">' + DP.esc(e.name) + '</span>';
  },

  empty: function () {
    return '<span class="sq is-blank"></span>';
  }
});
