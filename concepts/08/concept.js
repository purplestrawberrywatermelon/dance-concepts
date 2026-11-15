/* 08 Rhythm Game - lanes, key caps, a loadout that fills in as you hit. */
DP.register({
  id: '08',
  fonts: 'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@500;600;700&display=swap',
  genMs: 1300,
  revealMs: 3200,
  nameDelay: 260,
  turn: { out: 520, 'in': 700 },

  setup: function (DP) {
    var d = DP.data;
    var n = 0;
    function note(kind, label, x, slot) {
      n += 1;
      return '<button class="note note-' + kind + '" data-act="' + kind + '" data-id="' + x.id + '" data-key="' + n + '">' +
        '<i class="note__grp">' + label + '</i>' + slot + '<b>' + x.title + '</b><kbd>' + n + '</kbd></button>';
    }
    return '<header class="hud">' +
        '<p class="hud__title"><span class="t-pick">Track select</span><span class="t-style">Style select</span><span class="t-name">Name entry</span></p>' +
        '<ol class="segs"><li>Track</li><li>Style</li><li>Name</li></ol>' +
        '<button class="hud__back" data-act="back">&#9664; Tracks</button>' +
      '</header>' +

      '<section class="v-pick">' + DP.each(d.dances, function (x, i) {
        return '<button class="lane" data-act="dance" data-id="' + x.id + '">' +
          '<span class="lane__card">' + DP.danceSlot(x) + '</span>' +
          '<span class="lane__title">' + x.title + '</span>' +
          '<span class="lane__meta"><b>' + x.bpm + '</b> BPM &nbsp;/&nbsp; ' + x.len + '</span>' +
          '<span class="lane__hit">Locked in</span>' +
          '<kbd>' + (i + 1) + '</kbd></button>';
      }) + '<i class="hitline"></i></section>' +

      '<section class="v-style">' +
        '<figure class="pv">' + DP.exampleSlot() + '<figcaption>Preview &mdash; example result</figcaption></figure>' +
        '<figure class="trk">' + DP.sourceSlot() + '<figcaption>Track</figcaption></figure>' +
        '<div class="notes">' +
          DP.each(d.hairs, function (h) { return note('hair', 'Hair', h, DP.hairSlot(h)); }) +
          DP.each(d.outfits, function (o) { return note('outfit', 'Outfit', o, DP.outfitSlot(o)); }) +
        '</div><i class="hitline"></i>' +
      '</section>' +

      '<aside class="loadout">' +
        '<h2>Loadout</h2>' +
        '<div class="row row-dance"><small>Track</small><b>' + DP.t('dance.title', 'Press 1 2 3') + '</b></div>' +
        '<div class="row row-hair"><small>Hair</small><b>' + DP.t('hair.title', 'Empty') + '</b></div>' +
        '<div class="row row-outfit"><small>Outfit</small><b>' + DP.t('outfit.title', 'Empty') + '</b></div>' +
        '<label class="row row-name"><small>Player name</small>' +
          '<input data-bind="name" maxlength="14" placeholder="Enter name" autocomplete="off" spellcheck="false"></label>' +
        '<button class="start" data-act="create">Start &#9654;</button>' +
      '</aside>';
  },

  key: function (ev, root, DP) {
    if (DP.params.s !== 'setup') return;
    if (ev.target && ev.target.tagName === 'INPUT') return;
    var k = Number(ev.key);
    if (!k) return;
    var d = DP.data;
    if (DP.state.step === 'pick') {
      if (d.dances[k - 1]) DP.choose('dance', d.dances[k - 1].id);
    } else if (k <= d.hairs.length) {
      DP.choose('hair', d.hairs[k - 1].id);
    } else if (d.outfits[k - d.hairs.length - 1]) {
      DP.choose('outfit', d.outfits[k - d.hairs.length - 1].id);
    }
  },

  result: function (DP) {
    var s = DP.sel();
    return '<header class="hud"><p class="hud__title"><span>Result</span></p>' +
        '<ol class="segs is-full"><li>Track</li><li>Style</li><li>Name</li></ol>' +
        '<p class="hud__no">Entry ' + s.entry + '</p></header>' +
      '<i class="rlane rlane-l"></i><i class="rlane rlane-r"></i>' +
      '<div class="screen">' + DP.resultSlot() + '</div>' +
      '<b class="clear">Clear!</b>' +
      '<section class="strip">' +
        '<div class="cell cell-name"><small>Player</small><h1 class="tagname">' + DP.t('name') + '</h1></div>' +
        '<div class="cell row is-set" style="--d:0"><small>Track</small><b>' + DP.t('dance.title') + '</b></div>' +
        '<div class="cell row is-set" style="--d:1"><small>Hair</small><b>' + DP.t('hair.title') + '</b></div>' +
        '<div class="cell row is-set" style="--d:2"><small>Outfit</small><b>' + DP.t('outfit.title') + '</b></div>' +
        '<div class="cell cell-qr">' + DP.qr() + '<p>Scan to save<br>your video</p></div>' +
        '<div class="cell cell-btn"><button class="start" data-act="goto" data-screen="gallery">Gallery &#9654;</button>' +
        '<button class="retry" data-act="restart">Retry</button></div>' +
      '</section>' +
      '<div class="count"><b>3</b><b>2</b><b>1</b></div>' +
      '<div class="loading"><p>Now loading</p><div class="bar"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>';
  },

  gallery: function (DP) {
    var g = DP.data.gallery[0];
    return '<i class="lanebg"></i><i class="lanebg"></i><i class="lanebg"></i><i class="lanebg"></i>' +
      '<div class="board" data-grid></div>' +
      '<aside class="side side-l"><h1>Gallery</h1>' +
        '<div class="stat"><small>Entries</small><b>' + DP.t('total') + '</b></div>' +
        '<div class="stat"><small>Latest</small><b class="stat__name">' + DP.esc(g.name) + '</b><i>#' + g.entry + ' &middot; ' + g.ago + '</i></div></aside>' +
      '<aside class="side side-r"><small>Page</small><p class="pg"><b>' + DP.t('page2') + '</b><i>/ ' + DP.t('pages2') + '</i></p>' +
        '<div class="pgnav"><button data-act="page" data-dir="-1" aria-label="Previous page">&#9664;</button>' +
        '<button data-act="page" data-dir="1" aria-label="Next page">&#9654;</button></div></aside>';
  },

  tile: function (e, i, DP) {
    return DP.entrySlot(e) + '<span class="g-tag"><i>#' + e.entry + '</i><b>' + DP.esc(e.name) + '</b></span>';
  }
});
