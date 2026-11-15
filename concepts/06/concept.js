/* 06 Stage - drapes, footlights, a marquee. The result is a curtain call. */
DP.register({
  id: '06',
  fonts: 'https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,500;0,6..96,700;1,6..96,500;1,6..96,700&family=Jost:wght@400;500;600&display=swap',
  genMs: 1700,
  revealMs: 3600,
  turn: { out: 900, 'in': 1100 },

  setup: function (DP) {
    var d = DP.data;
    return '<div class="floor"></div>' +
      '<h1 class="call"><span class="call-pick">Pick your number</span><span class="call-style">Dress the part</span></h1>' +

      DP.each(d.dances, function (x) {
        return '<button class="act" data-act="dance" data-id="' + x.id + '"><span class="pool"></span>' +
          '<span class="act__frame">' + DP.danceSlot(x) + '</span>' +
          '<span class="sign"><b>' + x.title + '</b><i>' + x.mood + '</i></span></button>';
      }) +

      '<figure class="preview"><span class="pool"></span><span class="act__frame">' + DP.exampleSlot() + '</span>' +
        '<figcaption class="sign"><b>Example result</b><i>You, in ' + DP.t('dance.title') + '</i></figcaption></figure>' +

      '<section class="wardrobe">' +
        '<div class="rail"><p class="rail__label">Hair</p>' + DP.each(d.hairs, function (h) {
          return '<button class="hanger" data-act="hair" data-id="' + h.id + '">' + DP.hairSlot(h) + '<b>' + h.title + '</b></button>';
        }) + '</div>' +
        '<div class="rail"><p class="rail__label">Wardrobe</p>' + DP.each(d.outfits, function (o) {
          return '<button class="hanger" data-act="outfit" data-id="' + o.id + '">' + DP.outfitSlot(o) + '<b>' + o.title + '</b></button>';
        }) + '</div>' +
      '</section>' +

      '<div class="marquee marquee-name"><div class="marquee__in">' +
        '<input class="lights" data-bind="name" maxlength="14" placeholder="Your name in lights" autocomplete="off" spellcheck="false" aria-label="Your name">' +
        '<button class="gold" data-act="create">Raise the curtain</button>' +
      '</div></div>' +
      '<button class="backlink" data-act="back">&larr; Another number</button>' +

      '<div class="drape drape-l"></div><div class="drape drape-r"></div><div class="valance"></div><div class="footlights"></div>';
  },

  result: function (DP) {
    var s = DP.sel();
    return '<div class="floor"></div>' +
      '<div class="marquee marquee-top"><div class="marquee__in"><h1 class="star">' + DP.t('name') + '</h1></div></div>' +
      '<figure class="spot"><span class="pool"></span><span class="act__frame">' + DP.resultSlot() + '</span></figure>' +
      '<section class="playbill rv" style="--d:0">' +
        '<p class="small">Tonight&rsquo;s programme &middot; No. ' + s.entry + '</p>' +
        '<dl><div><dt>Number</dt><dd>' + DP.t('dance.title') + '</dd></div>' +
        '<div><dt>Hair</dt><dd>' + DP.t('hair.title') + '</dd></div>' +
        '<div><dt>Wardrobe</dt><dd>' + DP.t('outfit.title') + '</dd></div></dl>' +
        '<div class="actions"><button class="gold" data-act="goto" data-screen="gallery">See the gallery</button>' +
        '<button class="plain" data-act="restart">Start over</button></div>' +
      '</section>' +
      '<aside class="ticket rv" style="--d:1">' + DP.qr() +
        '<p class="ticket__line">Admit one</p><p>Scan to take your video home.</p><small>' + DP.t('url') + '</small></aside>' +
      '<div class="beam"></div>' +
      '<div class="drape drape-l"></div><div class="drape drape-r"></div><div class="valance"></div><div class="footlights"></div>' +
      '<p class="hush">The show is about to begin</p>';
  },

  gallery: function (DP) {
    return '<div class="floor"></div>' +
      '<div class="house" data-grid></div>' +
      '<div class="drape drape-l"></div><div class="drape drape-r"></div><div class="valance"></div>' +
      '<header class="bill"><p class="small">Now showing</p><h1>Tonight&rsquo;s debuts</h1>' +
        '<div class="pager"><button data-act="page" data-dir="-1" aria-label="Previous page">&larr;</button>' +
        '<b>Act ' + DP.t('page') + ' of ' + DP.t('pages') + '</b>' +
        '<button data-act="page" data-dir="1" aria-label="Next page">&rarr;</button></div></header>';
  },

  tile: function (e, i, DP) {
    return '<span class="g-media">' + DP.entrySlot(e) + '</span><span class="plate">' + DP.esc(e.name) + '</span>';
  }
});
