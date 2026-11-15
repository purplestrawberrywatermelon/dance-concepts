/* 11 Cinema - a film strip, a letterboxed frame, a slate. */
DP.register({
  id: '11',
  fonts: 'https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&family=Fraunces:ital,opsz,wght@0,9..144,560;1,9..144,500&display=swap',
  genMs: 1100,
  revealMs: 4000,
  nameDelay: 400,
  turn: { out: 800, 'in': 900 },

  setup: function (DP) {
    var d = DP.data;
    return '<div class="bar bar-top"><b>Reel 01</b><span class="for-pick">Choose a dance</span><span class="for-rest">Style this take</span><i>24 fps</i></div>' +
      '<div class="strip">' + DP.each(d.dances, function (x) {
        return '<button class="cell" data-act="dance" data-id="' + x.id + '">' +
          '<span class="frm">' + DP.danceSlot(x) + '</span>' +
          '<span class="edge">' + x.no + ' &middot; ' + x.title + ' &middot; ' + x.bpm + ' BPM</span></button>';
      }) + '</div>' +
      '<figure class="wide">' + DP.exampleSlot() + '<figcaption>Example result &mdash; ' + DP.t('dance.title') + '</figcaption></figure>' +
      '<section class="sheet"><p class="lbl">Hair</p><div class="contacts">' + DP.each(d.hairs, function (h) {
        return '<button class="contact" data-act="hair" data-id="' + h.id + '"><span class="frm">' + DP.hairSlot(h) + '</span><b>' + h.no + ' ' + h.short + '</b></button>';
      }) + '</div><p class="lbl">Outfit</p><div class="contacts">' + DP.each(d.outfits, function (o) {
        return '<button class="contact" data-act="outfit" data-id="' + o.id + '"><span class="frm">' + DP.outfitSlot(o) + '</span><b>' + o.no + ' ' + o.short + '</b></button>';
      }) + '</div></section>' +
      '<form class="slate" onsubmit="return false"><p>Scene 12 &middot; Take 1</p><label>Talent</label>' +
        '<input data-bind="name" maxlength="14" placeholder="NAME" autocomplete="off" spellcheck="false" aria-label="Your name">' +
        '<button data-act="create">Roll camera</button></form>' +
      '<button class="back" data-act="back">&larr; Reels</button>' +
      '<div class="bar bar-bot"><span>Multimodal AI Studio &mdash; NeurIPS 2026</span></div>';
  },

  result: function (DP) {
    var s = DP.sel();
    return '<div class="bar bar-top"><b>Picture</b><span>Entry ' + s.entry + '</span><i>24 fps</i></div>' +
      '<div class="leader"><b>3</b><b>2</b><b>1</b></div>' +
      '<div class="card"><p>Multimodal AI Studio presents</p><h1>' + DP.t('name') + '</h1><p>' + DP.t('dance.title') + '</p></div>' +
      '<figure class="screen">' + DP.resultSlot() + '</figure>' +
      '<div class="credits"><b>' + DP.t('name') + '</b><span>' + DP.t('dance.title') + '</span>' +
        '<span>' + DP.t('hair.title') + '</span><span>' + DP.t('outfit.title') + '</span></div>' +
      '<aside class="stub">' + DP.qr() + '<p>Admit one</p><small>' + DP.t('url') + '</small>' +
        '<nav><button data-act="goto" data-screen="gallery">The programme</button><button data-act="restart">New reel</button></nav></aside>' +
      '<div class="bar bar-bot"></div>';
  },

  gallery: function (DP) {
    return '<div class="bar bar-top"><b>Programme</b><span>' + DP.t('total') + ' pictures</span>' +
        '<span class="pager"><button data-act="page" data-dir="-1" aria-label="Previous page">&larr;</button> ' +
        'Reel ' + DP.t('page2') + ' / ' + DP.t('pages2') +
        ' <button data-act="page" data-dir="1" aria-label="Next page">&rarr;</button></span></div>' +
      '<div class="gate" data-grid></div>' +
      '<div class="bar bar-bot"><span>Edge print reads top to bottom, newest first.</span></div>';
  },

  tile: function (e, i, DP) {
    return '<span class="edge">' + e.no + ' ' + DP.esc(e.name).toUpperCase() + '</span>' +
      '<span class="frm">' + DP.entrySlot(e) + '</span>';
  },

  empty: function () {
    return '<span class="edge">--------</span><span class="frm is-blank"></span>';
  }
});
