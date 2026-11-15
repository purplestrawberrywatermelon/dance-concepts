/* 03 Editorial - big video, very little copy, names set as an index. */
DP.register({
  id: '03',
  fonts: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap',
  genMs: 1500,
  revealMs: 3600,
  turn: { out: 520, 'in': 950 },

  setup: function (DP) {
    var d = DP.data;
    return '<div class="strips">' + DP.each(d.dances, function (x) {
        return '<button class="strip" data-act="dance" data-id="' + x.id + '">' + DP.danceSlot(x) +
          '<span class="strip__cap"><i>' + x.no + '</i><b>' + x.title + '</b><em>' + x.mood + '</em></span></button>';
      }) +
      '<section class="side"><div class="side__in">' +
        '<button class="link back" data-act="back">&larr; All dances</button>' +
        '<div class="lists">' +
          '<p class="eyebrow">Hair</p>' +
          '<div class="list">' + DP.each(d.hairs, function (h) {
            return '<button class="item" data-act="hair" data-id="' + h.id + '">' + DP.hairSlot(h, 'item__img') + '<b>' + h.title + '</b></button>';
          }) + '</div>' +
          '<p class="eyebrow">Outfit</p>' +
          '<div class="list">' + DP.each(d.outfits, function (o) {
            return '<button class="item" data-act="outfit" data-id="' + o.id + '">' + DP.outfitSlot(o, 'item__img') + '<b>' + o.title + '</b></button>';
          }) + '</div>' +
        '</div>' +
        '<figure class="example">' + DP.exampleSlot() + '<figcaption>Example result</figcaption></figure>' +
        '<div class="signoff">' +
          '<input class="bigfield" data-bind="name" maxlength="14" placeholder="Your name" autocomplete="off" spellcheck="false" aria-label="Your name">' +
          '<button class="btn btn-primary" data-act="create">Create &rarr;</button>' +
        '</div>' +
      '</div></section></div>' +
      '<p class="topline"><span class="brand-dot"></span><span class="tl-pick">Choose a dance</span><span class="tl-style">' + DP.t('dance.title') + '</span></p>';
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
    return '<header class="ghead"><p class="eyebrow"><span class="brand-dot"></span>The debut wall</p>' +
      '<div class="pager"><button class="link" data-act="page" data-dir="-1">&larr;</button>' +
      '<b>' + DP.t('page2') + ' / ' + DP.t('pages2') + '</b>' +
      '<button class="link" data-act="page" data-dir="1">&rarr;</button></div></header>' +
      '<div class="wall" data-grid></div>';
  },

  /* Each tile is an index line (left) plus a plate (right). The tile itself is
     display: contents so both sit in one shared grid. */
  tile: function (e, i, DP) {
    return '<span class="line"><i>' + e.no + '</i><b>' + DP.esc(e.name) + '</b><em>' + e.dance.title + '</em></span>' +
      '<span class="plate">' + DP.entrySlot(e) + '<i>' + e.no + '</i></span>';
  },

  empty: function () {
    return '<span class="line line--none"></span><span class="plate plate--none"></span>';
  }
});
