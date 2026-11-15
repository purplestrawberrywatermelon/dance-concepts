/* 04 Poster - off-grid collage, video bleeding off the edge, vertical type. */
DP.register({
  id: '04',
  fonts: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap',
  genMs: 1500,
  revealMs: 2600,
  turn: { out: 620, 'in': 1100 },

  setup: function (DP) {
    var d = DP.data;
    return '<h1 class="vert vert-pick">Choose your <em class="grad">dance.</em></h1>' +
      '<p class="brand"><span class="brand-dot"></span>NeurIPS 2026 / Multimodal AI Studio</p>' +

      DP.each(d.dances, function (x) {
        return '<button class="piece" data-act="dance" data-id="' + x.id + '">' + DP.danceSlot(x) +
          '<span class="piece__title"><i>' + x.no + '</i>' + x.title + '</span></button>';
      }) +

      '<figure class="ex">' + DP.exampleSlot() + '<figcaption>Example result</figcaption></figure>' +

      '<section class="opts">' +
        '<button class="back" data-act="back">&larr; Dances</button>' +
        '<p class="eyebrow">Hair</p>' +
        '<div class="swatches">' + DP.each(d.hairs, function (h) {
          return '<button class="sw" data-act="hair" data-id="' + h.id + '">' + DP.hairSlot(h) + '<b>' + h.title + '</b></button>';
        }) + '</div>' +
        '<p class="eyebrow">Outfit</p>' +
        '<div class="swatches swatches--2">' + DP.each(d.outfits, function (o) {
          return '<button class="sw" data-act="outfit" data-id="' + o.id + '">' + DP.outfitSlot(o) + '<b>' + o.title + '</b></button>';
        }) + '</div>' +
      '</section>' +

      '<div class="sign">' +
        '<input class="bigfield" data-bind="name" maxlength="14" placeholder="Your name" autocomplete="off" spellcheck="false" aria-label="Your name">' +
        '<button class="btn btn-primary" data-act="create">Make it &rarr;</button>' +
      '</div>';
  },

  result: function (DP) {
    var s = DP.sel();
    return '<div class="shot">' + DP.resultSlot() + '</div>' +
      '<h1 class="vname"><span>' + DP.t('name') + '</span></h1>' +
      '<p class="gen">Generating</p>' +
      '<section class="rcol">' +
        '<p class="eyebrow rv" style="--d:0"><span class="brand-dot"></span>Debut no. ' + s.entry + '</p>' +
        '<ul class="facts rv" style="--d:1">' +
          '<li><small>Dance</small>' + DP.t('dance.title') + '</li>' +
          '<li><small>Hair</small>' + DP.t('hair.title') + '</li>' +
          '<li><small>Outfit</small>' + DP.t('outfit.title') + '</li>' +
        '</ul>' +
        '<div class="actions rv" style="--d:2">' +
          '<button class="btn btn-primary" data-act="goto" data-screen="gallery">Gallery</button>' +
          '<button class="btn btn-ghost" data-act="restart">Start over</button>' +
        '</div>' +
        '<div class="keep rv" style="--d:3">' + DP.qr() + '<p>Scan<br>and keep<br>your video.<small>' + DP.t('url') + '</small></p></div>' +
      '</section>';
  },

  gallery: function (DP) {
    return '<h1 class="vert vert-gallery"><em class="grad">Gallery</em></h1>' +
      '<div class="pager"><b>' + DP.t('page2') + '</b><i>/ ' + DP.t('pages2') + '</i>' +
        '<span><button data-act="page" data-dir="-1" aria-label="Previous page">&larr;</button>' +
        '<button data-act="page" data-dir="1" aria-label="Next page">&rarr;</button></span></div>' +
      '<div class="grid" data-grid></div>';
  },

  tile: function (e, i, DP) {
    return '<span class="g-media">' + DP.entrySlot(e) + '</span>' +
      '<span class="g-name"><b>' + DP.esc(e.name) + '</b><i>' + e.entry + '</i></span>';
  }
});
