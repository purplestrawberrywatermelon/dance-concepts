/* 02 Research Exhibit - figure panels and spec tables, input to output. */
DP.register({
  id: '02',
  fonts: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap',
  genMs: 1700,
  revealMs: 3000,
  turn: { out: 800, 'in': 1100 },

  strip: function (fig, right) {
    return '<header class="strip"><div class="brand"><span class="brand-dot"></span>NeurIPS 2026 / Multimodal AI Studio</div>' +
      '<p class="fig">' + fig + '</p>' + (right || '') + '</header>';
  },

  setup: function (DP) {
    var d = DP.data;
    var letters = ['a', 'b', 'c'];
    return this.strip('Fig. 1 &mdash; Participant setup',
      '<ol class="steps"><li data-s="pick">1 Motion</li><li data-s="style">2 Style</li><li data-s="name">3 Name</li></ol>') +

      /* view 1: three boards */
      '<section class="v-pick">' +
        '<div class="lead"><h1>Select a motion input</h1><p>Three reference performances. One of them becomes yours.</p></div>' +
        '<div class="boards">' + DP.each(d.dances, function (x, i) {
          return '<button class="board" data-act="dance" data-id="' + x.id + '">' +
            '<span class="board__head"><i>(' + letters[i] + ')</i><b>' + x.title + '</b></span>' +
            '<span class="board__media">' + DP.danceSlot(x) + '</span>' +
            '<span class="spec"><span class="spec__row"><i>Tempo</i><b>' + x.bpm + ' BPM</b></span>' +
            '<span class="spec__row"><i>Length</i><b>' + x.len + '</b></span>' +
            '<span class="spec__row"><i>Feel</i><b>' + x.mood + '</b></span></span>' +
            '<span class="board__cta">Use this motion</span></button>';
        }) + '</div>' +
      '</section>' +

      /* view 2: A + B -> C */
      '<section class="v-style">' +
        '<div class="col col-a">' +
          '<p class="col__label"><i>A</i>Motion input</p>' +
          '<div class="col__media">' + DP.sourceSlot() + '</div>' +
          '<div class="rows">' + DP.each(d.dances, function (x) {
            return '<button class="row row--text" data-act="dance" data-id="' + x.id + '"><b>' + x.title + '</b><em>' + x.bpm + ' BPM</em><span class="radio"></span></button>';
          }) + '</div>' +
        '</div>' +
        '<span class="join join-1">+</span>' +
        '<div class="col col-b">' +
          '<p class="col__label"><i>B</i>Style conditioning</p>' +
          '<p class="sub">Hair</p>' +
          '<div class="rows">' + DP.each(d.hairs, function (h) {
            return '<button class="row" data-act="hair" data-id="' + h.id + '">' + DP.hairSlot(h, 'row__img') + '<b>' + h.title + '</b><span class="radio"></span></button>';
          }) + '</div>' +
          '<p class="sub">Outfit</p>' +
          '<div class="rows">' + DP.each(d.outfits, function (o) {
            return '<button class="row" data-act="outfit" data-id="' + o.id + '">' + DP.outfitSlot(o, 'row__img') + '<b>' + o.title + '</b><span class="radio"></span></button>';
          }) + '</div>' +
        '</div>' +
        '<span class="join join-2">&rarr;</span>' +
        '<div class="col col-c">' +
          '<p class="col__label"><i>C</i>Example output</p>' +
          '<div class="col__media">' + DP.exampleSlot() + '</div>' +
          '<div class="form">' +
            '<p class="sub">Participant name</p>' +
            '<div class="form__row">' +
              '<input class="field" data-bind="name" maxlength="14" placeholder="Type your name" autocomplete="off" spellcheck="false" aria-label="Your name">' +
              '<button class="btn btn-primary" data-act="create">Generate</button>' +
            '</div>' +
          '</div>' +
          '<p class="hint">Choose one hair and one outfit to continue.</p>' +
        '</div>' +
      '</section>';
  },

  result: function (DP) {
    var s = DP.sel();
    return this.strip('Fig. 2 &mdash; Generated result') +
      '<section class="ins">' +
        '<p class="col__label"><i>A</i>Inputs</p>' +
        DP.sourceSlot('in-video') + '<p class="cap"><small>Motion</small>' + DP.t('dance.title') + '</p>' +
        '<div class="pair">' +
          '<div>' + DP.hairSlot(s.hair, 'in-img') + '<p class="cap"><small>Hair</small>' + DP.t('hair.title') + '</p></div>' +
          '<div>' + DP.outfitSlot(s.outfit, 'in-img') + '<p class="cap"><small>Outfit</small>' + DP.t('outfit.title') + '</p></div>' +
        '</div>' +
      '</section>' +
      '<span class="join join-r">&rarr;</span>' +
      '<section class="out">' +
        '<p class="col__label"><i>B</i>Output</p>' +
        '<div class="figure">' +
          '<div class="layer layer-src">' + DP.sourceSlot() + '<span class="tag tag-l">Input motion</span></div>' +
          '<div class="layer layer-out">' + DP.resultSlot() + '<span class="tag tag-r">Output</span></div>' +
          '<span class="wipe-line"></span>' +
          '<p class="gen"><span>Generating</span><i></i></p>' +
        '</div>' +
      '</section>' +
      '<aside class="scan rv" style="--d:1">' + DP.qr() +
        '<p><b>Fig. 2b</b>Scan to open and keep your video.<small>' + DP.t('url') + '</small></p></aside>' +
      '<footer class="sheet rv" style="--d:0">' +
        '<div><p class="eyebrow">Participant &middot; Entry ' + s.entry + '</p><h1 class="name">' + DP.t('name') + '</h1></div>' +
        '<div class="actions">' +
          '<button class="btn btn-primary" data-act="goto" data-screen="gallery">All results</button>' +
          '<button class="btn btn-ghost" data-act="restart">New participant</button>' +
        '</div>' +
      '</footer>';
  },

  gallery: function (DP) {
    return this.strip('Fig. 3 &mdash; All results &middot; n = ' + DP.t('total'),
      '<div class="pager"><button data-act="page" data-dir="-1" aria-label="Previous page">&larr;</button>' +
      '<b>Page ' + DP.t('page') + ' of ' + DP.t('pages') + '</b>' +
      '<button data-act="page" data-dir="1" aria-label="Next page">&rarr;</button></div>') +
      '<div class="grid" data-grid></div>';
  },

  tile: function (e, i, DP) {
    return '<span class="g-media">' + DP.entrySlot(e) +
      '<span class="g-name"><i>' + e.entry + '</i>' + DP.esc(e.name) + '</span></span>' +
      '<span class="g-side">' + e.dance.title + '</span>';
  },

  empty: function () {
    return '<span class="g-none">&mdash;</span>';
  }
});
