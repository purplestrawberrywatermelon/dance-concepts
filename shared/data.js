/*
  Sample data for the concept 03 screen.

  Empty `src` renders a labelled placeholder. A relative path becomes a
  <video> or <img> in the same slot. Gallery tiles reuse the dance1 and
  dance2 result clips until each entry has its own video.

  Media for each dance lives together under ref/dance1 and ref/dance2.
*/
window.DP_DATA = {
  event: {
    name: 'Multimodal AI Studio',
    title: 'Create Your Virtual Idol',
    venue: 'NeurIPS 2026',
    linkBase: 'become-virtual-idol.github.io/r/'
  },

  dances: [
    { id: 'd1', no: '01', title: 'Stop stop it - Got7',  short: 'Stop it',  mood: 'Groovy and Energetic', bpm: 113, len: '0:13', src: 'ref/dance1/input_video.mp4', example: 'ref/dance1/output3.mp4' },
    { id: 'd2', no: '02', title: 'REDRED - CORTIS', short: 'RED', mood: 'Bold and Edgy',  bpm: 121, len: '0:21', src: 'ref/dance2/input_video.mp4', example: 'ref/dance2/output3.mp4' },
    { id: 'd3', no: '03', title: 'You’re under arrest - ILLIT',  short: 'Arrest', mood: 'Futuristic and Playful', bpm: 73, len: '0:13', src: 'ref/dance3/video.mp4', example: 'ref/dance3/video.mp4' }
  ],

  hairs: [
    { id: 'h1', no: '01', title: 'Soft Wave', short: 'Wave', src: 'ref/dance1/hair.png' },
    { id: 'h2', no: '02', title: 'Sleek Bob', short: 'Bob',  src: 'ref/dance2/hair.png' }
  ],

  outfits: [
    { id: 'o1', no: '01', title: 'Stage Black',  short: 'Black', src: 'ref/dance1/clothes.png' },
    { id: 'o2', no: '02', title: 'Street Denim', short: 'Denim', src: 'ref/dance2/clothes.png' }
  ],

  /* The participant shown on the personal result screen when nothing was
     chosen in the setup screen first. */
  participant: { name: 'Junho', entry: 142, dance: 'd2', hair: 'h1', outfit: 'o1', src: 'ref/dance2/output3.mp4' },

  /* Newest first. 22 entries = 2 gallery pages of 12. Clips are the existing
     dance1 / dance2 results, repeated so every tile has a video. */
  gallery: [
    { entry: 142, name: 'Junho',   dance: 'd2', hair: 'h1', outfit: 'o1', ago: 'just now', src: 'ref/dance2/output1.mp4' },
    { entry: 141, name: 'Maya',    dance: 'd1', hair: 'h2', outfit: 'o2', ago: '2 min',  src: 'ref/dance1/output1.mp4' },
    { entry: 140, name: 'Arjun',   dance: 'd3', hair: 'h1', outfit: 'o1', ago: '4 min',  src: 'ref/dance1/output2.mp4' },
    { entry: 139, name: 'Sofia',   dance: 'd2', hair: 'h1', outfit: 'o2', ago: '7 min',  src: 'ref/dance2/output2.mp4' },
    { entry: 138, name: 'Kenji',   dance: 'd1', hair: 'h2', outfit: 'o1', ago: '9 min',  src: 'ref/dance1/output2.mp4' },
    { entry: 137, name: 'Amara',   dance: 'd3', hair: 'h2', outfit: 'o2', ago: '12 min', src: 'ref/dance2/output3.mp4' },
    { entry: 136, name: 'Lucas',   dance: 'd1', hair: 'h1', outfit: 'o1', ago: '15 min', src: 'ref/dance1/output3.mp4' },
    { entry: 135, name: 'Yuna',    dance: 'd2', hair: 'h2', outfit: 'o1', ago: '18 min', src: 'ref/dance2/output3.mp4' },
    { entry: 134, name: 'Omar',    dance: 'd3', hair: 'h1', outfit: 'o2', ago: '21 min', src: 'ref/dance1/output3.mp4' },
    { entry: 133, name: 'Elena',   dance: 'd1', hair: 'h1', outfit: 'o2', ago: '24 min', src: 'ref/dance1/output1.mp4' },
    { entry: 132, name: 'Wei',     dance: 'd2', hair: 'h2', outfit: 'o1', ago: '28 min', src: 'ref/dance2/output1.mp4' },
    { entry: 131, name: 'Priya',   dance: 'd3', hair: 'h2', outfit: 'o1', ago: '31 min', src: 'ref/dance2/output1.mp4' },
    { entry: 130, name: 'Noah',    dance: 'd2', hair: 'h1', outfit: 'o2', ago: '35 min', src: 'ref/dance2/output2.mp4' },
    { entry: 129, name: 'Chaehee', dance: 'd1', hair: 'h2', outfit: 'o1', ago: '38 min', src: 'ref/dance1/output2.mp4' },
    { entry: 128, name: 'Mateo',   dance: 'd3', hair: 'h1', outfit: 'o2', ago: '42 min', src: 'ref/dance1/output1.mp4' },
    { entry: 127, name: 'Ingrid',  dance: 'd1', hair: 'h1', outfit: 'o2', ago: '45 min', src: 'ref/dance1/output3.mp4' },
    { entry: 126, name: 'Tariq',   dance: 'd2', hair: 'h2', outfit: 'o2', ago: '49 min', src: 'ref/dance2/output3.mp4' },
    { entry: 125, name: 'Hana',    dance: 'd3', hair: 'h1', outfit: 'o1', ago: '52 min', src: 'ref/dance2/output2.mp4' },
    { entry: 124, name: 'Diego',   dance: 'd1', hair: 'h2', outfit: 'o1', ago: '56 min', src: 'ref/dance1/output1.mp4' },
    { entry: 123, name: 'Zoe',     dance: 'd2', hair: 'h1', outfit: 'o2', ago: '1 hr',   src: 'ref/dance2/output1.mp4' },
    { entry: 122, name: 'Jinwoo',  dance: 'd3', hair: 'h2', outfit: 'o1', ago: '1 hr',   src: 'ref/dance1/output3.mp4' },
    { entry: 121, name: 'Leila',   dance: 'd1', hair: 'h1', outfit: 'o1', ago: '1 hr',   src: 'ref/dance1/output2.mp4' }
  ]
};

/* Load test: open the gallery with &n=100 and it has 100 entries (the same clips and names, repeated).
   Each extra entry gets its own address (?v=N after the file name), so the browser downloads every
   tile for real instead of reusing one cached file, like a gallery of different videos would. */
(function () {
  var n = parseInt(new URLSearchParams(location.search).get('n'), 10);
  var g = window.DP_DATA.gallery;
  if (!(n > g.length)) return;
  n = Math.min(n, 500);
  var base = g.slice(), i, b, mins;
  for (i = g.length; i < n; i++) {
    b = base[i % base.length];
    mins = 56 + (i - 18) * 3;
    g.push({
      entry: 142 - i, name: b.name, dance: b.dance, hair: b.hair, outfit: b.outfit,
      ago: mins < 60 ? mins + ' min' : Math.floor(mins / 60) + ' hr', src: b.src + '?v=' + i
    });
  }
})();
