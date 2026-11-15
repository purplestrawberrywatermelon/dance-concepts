/* 09 Museum - framed works on a white wall, placards, lights coming up. */
DP.register({
  id: '09',
  fonts: 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500;1,600&family=Inter:wght@400;500;600&display=swap',
  genMs: 1200,
  revealMs: 3400,
  nameDelay: 600,
  turn: { out: 900, 'in': 1400 },

  setup: function (DP) {
    var d = DP.data;
    return '<header class="top"><p class="ey">Gallery wall</p>' +
        '<h1><span class="h-pick">Three works.</span><span class="h-rest">Style the sitter.</span></h1></header>' +
      DP.each(d.dances, function (x) {
        return '<button class="work" data-act="dance" data-id="' + x.id + '">' +
          '<span class="frame"><span class="mat">' + DP.danceSlot(x) + '</span></span>' +
          '<span class="card"><i>No. ' + x.no + '</i><b>' + x.title + '</b><em>' + x.mood + '</em></span></button>';
      }) +
      '<figure class="study"><span class="frame"><span class="mat">' + DP.exampleSlot() + '</span></span>' +
        '<figcaption class="card"><i>Example</i><b>The finished portrait</b><em>You, dancing ' + DP.t('dance.title') + '</em></figcaption></figure>' +
      '<aside class="swatches">' +
        '<div class="grp"><p class="ey">Hair</p><div class="row">' + DP.each(d.hairs, function (h) {
          return '<button class="sw" data-act="hair" data-id="' + h.id + '"><span class="sq">' + DP.hairSlot(h) + '</span><b>' + h.title + '</b></button>';
        }) + '</div></div>' +
        '<div class="grp"><p class="ey">Wardrobe</p><div class="row">' + DP.each(d.outfits, function (o) {
          return '<button class="sw" data-act="outfit" data-id="' + o.id + '"><span class="sq sq-wide">' + DP.outfitSlot(o) + '</span><b>' + o.title + '</b></button>';
        }) + '</div></div>' +
        '<div class="plate"><label class="sitter">Sitter<input data-bind="name" maxlength="14" placeholder="Your name" autocomplete="off" spellcheck="false" aria-label="Your name"></label>' +
        '<button class="create" data-act="create">Create</button></div>' +
      '</aside>' +
      '<button class="back" data-act="back">Another work</button>' +
      '<i class="floor"></i>';
  },

  result: function (DP) {
    var s = DP.sel();
    return '<div class="lights"></div><i class="floor"></i>' +
      '<figure class="hang rv"><span class="frame"><span class="mat">' + DP.resultSlot() + '</span></span></figure>' +
      '<aside class="placard rv">' +
        '<p class="ey">On view tonight &middot; No. ' + s.entry + '</p>' +
        '<h1>' + DP.t('name') + '</h1>' +
        '<dl><div><dt>Dance</dt><dd>' + DP.t('dance.title') + '</dd></div>' +
        '<div><dt>Hair</dt><dd>' + DP.t('hair.title') + '</dd></div>' +
        '<div><dt>Wardrobe</dt><dd>' + DP.t('outfit.title') + '</dd></div></dl>' +
        '<div class="take">' + DP.qr() + '<p>Take it home<small>' + DP.t('url') + '</small></p></div>' +
        '<nav><button data-act="goto" data-screen="gallery">The salon</button><button data-act="restart">Start again</button></nav>' +
      '</aside>';
  },

  gallery: function (DP) {
    return '<header class="ghead"><p class="ey">Salon hang</p><h1>This evening</h1>' +
        '<div class="pager"><button data-act="page" data-dir="-1" aria-label="Previous page">&larr;</button>' +
        '<b>Wall ' + DP.t('page') + ' of ' + DP.t('pages') + '</b>' +
        '<button data-act="page" data-dir="1" aria-label="Next page">&rarr;</button></div></header>' +
      '<i class="floor"></i><div class="salon" data-grid></div>';
  },

  tile: function (e, i, DP) {
    return '<span class="frame"><span class="mat">' + DP.entrySlot(e) + '</span></span>' +
      '<span class="card"><b>' + DP.esc(e.name) + '</b><i>' + e.dance.title + '</i></span>';
  },

  empty: function () {
    return '<span class="frame is-blank"></span>';
  }
});
