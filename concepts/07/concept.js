/* 07 Festival - screen-filling words as buttons, flat colour blocks. */
DP.register({
  id: '07',
  fonts: 'https://fonts.googleapis.com/css2?family=Anton&family=Archivo:wght@500;700;800&display=swap',
  genMs: 1300,
  revealMs: 2500,
  nameDelay: 350,
  turn: { out: 640, 'in': 900 },

  setup: function (DP) {
    var d = DP.data;
    return '<div class="rows">' + DP.each(d.dances, function (x) {
        return '<button class="rowb" data-act="dance" data-id="' + x.id + '">' +
          '<span class="rowb__win">' + DP.danceSlot(x) + '</span>' +
          '<span class="rowb__word">' + x.short + '</span>' +
          '<span class="rowb__meta"><i>' + x.no + '</i>' + x.title + ' &mdash; ' + x.bpm + ' BPM</span></button>';
      }) +
      '<section class="panel">' +
        '<div class="opt opt-hair"><p class="vlabel">Hair</p>' + DP.each(d.hairs, function (h) {
          return '<button class="word" data-act="hair" data-id="' + h.id + '">' + DP.hairSlot(h) + '<span class="word__t"><i>' + h.title + '</i><b>' + h.short + '</b></span></button>';
        }) + '</div>' +
        '<div class="opt opt-outfit"><p class="vlabel">Outfit</p>' + DP.each(d.outfits, function (o) {
          return '<button class="word" data-act="outfit" data-id="' + o.id + '">' + DP.outfitSlot(o) + '<span class="word__t"><i>' + o.title + '</i><b>' + o.short + '</b></span></button>';
        }) + '</div>' +
        '<div class="namebar">' +
          '<input class="shout" data-bind="name" maxlength="14" placeholder="Your name" autocomplete="off" spellcheck="false" aria-label="Your name">' +
          '<button class="go" data-act="create">Go</button>' +
        '</div>' +
        '<figure class="ex">' + DP.exampleSlot() + '<figcaption>Example result</figcaption></figure>' +
      '</section></div>' +
      '<button class="backx" data-act="back">&larr; Back</button>';
  },

  result: function (DP) {
    var s = DP.sel();
    return '<div class="vid">' + DP.resultSlot() + '</div>' +
      '<h1 class="bigname">' + DP.letters(s.name) + '</h1>' +
      '<section class="words">' +
        '<p class="k">Dance</p><p class="w w1">' + DP.t('dance.title') + '</p>' +
        '<p class="k">Hair + outfit</p><p class="w w2">' + DP.t('hair.title') + '<br>' + DP.t('outfit.title') + '</p>' +
        '<div class="acts"><button data-act="goto" data-screen="gallery">Gallery &rarr;</button><button data-act="restart">Again</button></div>' +
      '</section>' +
      '<aside class="scan">' + DP.qr() + '<b>Scan</b><p>to keep<br>your video<small>No. ' + s.entry + '</small></p></aside>' +
      '<div class="gen"><b>Hold on</b><i></i></div>';
  },

  gallery: function (DP) {
    return '<aside class="rail"><p class="rail__v">Gallery</p>' +
        '<b class="rail__n">' + DP.t('page') + '</b><i class="rail__of">of ' + DP.t('pages') + '</i>' +
        '<span class="rail__nav"><button data-act="page" data-dir="-1" aria-label="Previous page">&larr;</button>' +
        '<button data-act="page" data-dir="1" aria-label="Next page">&rarr;</button></span></aside>' +
      '<div class="grid" data-grid></div>';
  },

  tile: function (e, i, DP) {
    var color = ['red', 'ink', 'cobalt', 'paper'][(i + Math.floor(i / 4)) % 4];
    return '<span class="g-media">' + DP.entrySlot(e) + (e.latest ? '<i class="stamp">New</i>' : '') + '</span>' +
      '<span class="g-name is-' + color + '" style="--len:' + Math.max(4, e.name.length) + '"><b>' + DP.esc(e.name) + '</b></span>';
  }
});
