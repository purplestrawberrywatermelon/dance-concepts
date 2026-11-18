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
