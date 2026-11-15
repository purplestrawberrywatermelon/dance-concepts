/* 01 Extended - the existing website hero, carried over to the booth. */
DP.register({
  id: '01',
  fonts: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&display=swap',
  genMs: 1600,
  revealMs: 2400,
  turn: { out: 560, 'in': 1500 },

  brand: function () {
    return '<header class="brand"><span class="brand-dot"></span>NeurIPS 2026 / Multimodal AI Studio</header>';
  },

  setup: function (DP) {
    var d = DP.data;
    return this.brand() +
      '<ol class="steps"><li data-s="pick">01 Dance</li><li data-s="style">02 Style</li><li data-s="name">03 Name</li></ol>' +

      '<section class="copy">' +
        '<p class="eyebrow">Step ' + DP.t('stepno') + ' of 3</p>' +
        '<h1 class="title">' +
          '<span class="t-pick">Choose<br><em class="grad">your dance.</em></span>' +
          '<span class="t-style">Style <em class="grad">your idol.</em></span>' +
        '</h1>' +
        '<p class="lede">Pick one of three performances. We put you in it, dancing.</p>' +

        '<div class="opts">' +
          '<p class="opt-label">Hair</p>' +
          '<div class="chips">' + DP.each(d.hairs, function (h) {
            return '<button class="chip" data-act="hair" data-id="' + h.id + '">' + DP.hairSlot(h, 'chip__img') + '<span>' + h.title + '</span></button>';
          }) + '</div>' +
          '<p class="opt-label">Outfit</p>' +
          '<div class="chips">' + DP.each(d.outfits, function (o) {
            return '<button class="chip" data-act="outfit" data-id="' + o.id + '">' + DP.outfitSlot(o, 'chip__img') + '<span>' + o.title + '</span></button>';
          }) + '</div>' +
          '<div class="namebox">' +
            '<p class="opt-label">Your name</p>' +
            '<div class="namerow">' +
              '<input class="field" data-bind="name" maxlength="14" placeholder="Type your name" autocomplete="off" spellcheck="false" aria-label="Your name">' +
              '<button class="btn btn-primary" data-act="create">Create my video</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<button class="btn btn-ghost back" data-act="back">&larr; Change dance</button>' +
      '</section>' +

      '<section class="cards">' + DP.each(d.dances, function (x) {
        return '<button class="card" data-act="dance" data-id="' + x.id + '">' +
          '<span class="card__media">' + DP.danceSlot(x) + '</span>' +
          '<span class="card__cap"><b>' + x.title + '</b><i>' + x.mood + '</i></span></button>';
      }) +
        '<div class="card example">' +
          '<span class="card__media">' + DP.exampleSlot() + '</span>' +
          '<span class="card__cap"><b>Example result</b><i>How you could look in ' + DP.t('dance.title') + '</i></span>' +
        '</div>' +
      '</section>';
  },

  result: function (DP) {
    var s = DP.sel();
    return this.brand() +
      '<div class="gen"><span class="orbit orbit-a"></span><span class="orbit orbit-b"></span><p class="eyebrow">Generating your video</p></div>' +

      '<section class="rcopy">' +
        '<p class="eyebrow rv" style="--d:0">Your virtual idol debut</p>' +
        '<h1 class="name rv" style="--d:1"><em class="grad">' + DP.t('name') + '</em></h1>' +
        '<ul class="meta rv" style="--d:2">' +
          '<li><small>Dance</small>' + DP.t('dance.title') + '</li>' +
          '<li><small>Hair</small>' + DP.t('hair.title') + '</li>' +
          '<li><small>Outfit</small>' + DP.t('outfit.title') + '</li>' +
        '</ul>' +
        '<div class="actions rv" style="--d:3">' +
          '<button class="btn btn-primary" data-act="goto" data-screen="gallery">See the gallery</button>' +
          '<button class="btn btn-ghost" data-act="restart">Start over</button>' +
        '</div>' +
      '</section>' +

      '<section class="hero"><span class="orbit orbit-a"></span>' +
        '<div class="hero-card">' + DP.resultSlot() +
          '<div class="hero-foot"><span>Entry ' + s.entry + '</span><b>REC &#9679;</b></div>' +
        '</div>' +
      '</section>' +

      '<aside class="qrbox rv" style="--d:4">' + DP.qr() +
        '<h3>Scan to keep your video</h3><p>' + DP.t('url') + '</p></aside>';
  },

  gallery: function (DP) {
    return this.brand() +
      '<header class="ghead">' +
        '<div><p class="eyebrow">Live gallery</p><h2>Tonight&rsquo;s <em class="grad">virtual idols.</em></h2></div>' +
        '<div class="pager">' +
          '<span class="pager__count">' + DP.t('total') + ' debuts</span>' +
          '<button class="pager__btn" data-act="page" data-dir="-1" aria-label="Previous page">&larr;</button>' +
          '<b>' + DP.t('page2') + ' / ' + DP.t('pages2') + '</b>' +
          '<button class="pager__btn" data-act="page" data-dir="1" aria-label="Next page">&rarr;</button>' +
        '</div>' +
      '</header>' +
      '<div class="grid" data-grid></div>';
  },

  tile: function (e, i, DP) {
    return '<span class="g-media">' + DP.entrySlot(e) + '</span>' +
      '<span class="g-cap"><i>' + (e.latest ? 'Just now' : 'No. ' + e.entry) + '</i><b>' + DP.esc(e.name) + '</b><span>' + e.dance.title + '</span></span>';
  }
});
