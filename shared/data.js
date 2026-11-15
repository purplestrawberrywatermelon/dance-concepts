/*
  Shared sample data for every concept. All 12 concepts read the same object,
  so the designs can be compared on identical content.

  MEDIA IS INTENTIONALLY EMPTY.
  Every `src` below is ''. While it is empty the screen renders a labelled
  placeholder slot at the size and ratio the concept intends. Put a relative
  path in `src` and the same slot becomes a <video> / <img> - no concept code
  has to change.

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
    { id: 'd1', no: '01', title: 'Neon Pulse',  short: 'Pulse',  mood: 'Sharp, high energy', bpm: 128, len: '0:18', src: 'ref/dance1/input_video.mp4', example: 'ref/dance1/output3.mp4' },
    { id: 'd2', no: '02', title: 'Velvet Step', short: 'Velvet', mood: 'Smooth and groovy',  bpm: 102, len: '0:21', src: 'ref/dance2/input_video.mp4', example: 'ref/dance2/output3.mp4' },
    { id: 'd3', no: '03', title: 'Sky Bounce',  short: 'Bounce', mood: 'Bright and playful', bpm: 116, len: '0:16', src: '', example: '' }
  ],

  hairs: [
    { id: 'h1', no: '01', title: 'Soft Wave', short: 'Wave', src: 'ref/dance1/hair.png' },
    { id: 'h2', no: '02', title: 'Sleek Bob', short: 'Bob',  src: 'ref/dance2/hair.png' },
    { id: 'h3', no: '03', title: 'Wind Cut',  short: 'Wind', src: '' }
  ],

  outfits: [
    { id: 'o1', no: '01', title: 'Stage Black',  short: 'Black', src: 'ref/dance1/clothes.png' },
    { id: 'o2', no: '02', title: 'Street Denim', short: 'Denim', src: 'ref/dance2/clothes.png' }
  ],

  /* The participant shown on the personal result screen when nothing was
     chosen in the setup screen first. */
  participant: { name: 'Junho', entry: 142, dance: 'd2', hair: 'h1', outfit: 'o1', src: 'ref/dance2/output3.mp4' },

  /* Newest first. 22 entries = 2 gallery pages (16 + 6). */
  gallery: [
    { entry: 142, name: 'Junho',   dance: 'd2', hair: 'h1', outfit: 'o1', ago: 'just now', src: '' },
    { entry: 141, name: 'Maya',    dance: 'd1', hair: 'h2', outfit: 'o2', ago: '2 min',  src: '' },
    { entry: 140, name: 'Arjun',   dance: 'd3', hair: 'h3', outfit: 'o1', ago: '4 min',  src: '' },
    { entry: 139, name: 'Sofia',   dance: 'd2', hair: 'h1', outfit: 'o2', ago: '7 min',  src: '' },
    { entry: 138, name: 'Kenji',   dance: 'd1', hair: 'h3', outfit: 'o1', ago: '9 min',  src: '' },
    { entry: 137, name: 'Amara',   dance: 'd3', hair: 'h2', outfit: 'o2', ago: '12 min', src: '' },
    { entry: 136, name: 'Lucas',   dance: 'd1', hair: 'h1', outfit: 'o1', ago: '15 min', src: '' },
    { entry: 135, name: 'Yuna',    dance: 'd2', hair: 'h2', outfit: 'o1', ago: '18 min', src: '' },
    { entry: 134, name: 'Omar',    dance: 'd3', hair: 'h1', outfit: 'o2', ago: '21 min', src: '' },
    { entry: 133, name: 'Elena',   dance: 'd1', hair: 'h3', outfit: 'o2', ago: '24 min', src: '' },
    { entry: 132, name: 'Wei',     dance: 'd2', hair: 'h3', outfit: 'o1', ago: '28 min', src: '' },
    { entry: 131, name: 'Priya',   dance: 'd3', hair: 'h2', outfit: 'o1', ago: '31 min', src: '' },
    { entry: 130, name: 'Noah',    dance: 'd2', hair: 'h1', outfit: 'o2', ago: '35 min', src: '' },
    { entry: 129, name: 'Chaehee', dance: 'd1', hair: 'h2', outfit: 'o1', ago: '38 min', src: '' },
    { entry: 128, name: 'Mateo',   dance: 'd3', hair: 'h3', outfit: 'o2', ago: '42 min', src: '' },
    { entry: 127, name: 'Ingrid',  dance: 'd1', hair: 'h1', outfit: 'o2', ago: '45 min', src: '' },
    { entry: 126, name: 'Tariq',   dance: 'd2', hair: 'h2', outfit: 'o2', ago: '49 min', src: '' },
    { entry: 125, name: 'Hana',    dance: 'd3', hair: 'h1', outfit: 'o1', ago: '52 min', src: '' },
    { entry: 124, name: 'Diego',   dance: 'd1', hair: 'h3', outfit: 'o1', ago: '56 min', src: '' },
    { entry: 123, name: 'Zoe',     dance: 'd2', hair: 'h3', outfit: 'o2', ago: '1 hr',   src: '' },
    { entry: 122, name: 'Jinwoo',  dance: 'd3', hair: 'h2', outfit: 'o1', ago: '1 hr',   src: '' },
    { entry: 121, name: 'Leila',   dance: 'd1', hair: 'h1', outfit: 'o1', ago: '1 hr',   src: '' }
  ],

  /* Concept index used by the review shell. */
  groups: [
    { id: 'A', name: 'Matches the existing website', note: 'Colours, typefaces, spacing and buttons taken from become-virtual-idol.github.io' },
    { id: 'B', name: 'Lively event',                 note: 'Higher energy, faster feedback, bolder reveals' },
    { id: 'C', name: 'Calm',                         note: 'More whitespace, slower motion, quieter type' }
  ],
  concepts: [
    { id: '01', group: 'A', name: 'Extended',          line: 'The website hero carried over: big headline on the left, tilted video cards on the right.' },
    { id: '02', group: 'A', name: 'Research Exhibit',  line: 'Figure panels and spec tables that read like a demo poster, input to output.' },
    { id: '03', group: 'A', name: 'Editorial',         line: 'Full-height video strips, a single line of type, and a named index instead of captions.' },
    { id: '04', group: 'A', name: 'Poster',            line: 'Off-grid collage with video bleeding off the edge and type running vertically.' },
    { id: '05', group: 'B', name: 'Music Video',       line: 'One dance at a time, full screen, with a lower-third bar and hard cuts.' },
    { id: '06', group: 'B', name: 'Stage',             line: 'Drapes, footlights and a marquee: the result arrives as a curtain call.' },
    { id: '07', group: 'B', name: 'Festival',          line: 'Screen-filling words as buttons, flat colour blocks, the name slammed in letter by letter.' },
    { id: '08', group: 'B', name: 'Rhythm Game',       line: 'Lanes and number keys, instant hit feedback, a countdown into CLEAR.' },
    { id: '09', group: 'C', name: 'Museum',            line: 'Framed works on a white wall with placards; the lights come up on the result.' },
    { id: '10', group: 'C', name: 'Portrait Exhibit',  line: 'One tall portrait in focus, annotated like a study, titled with the participant name.' },
    { id: '11', group: 'C', name: 'Cinema',            line: 'Film strip, letterbox and a slate; a leader countdown fades into the title card.' },
    { id: '12', group: 'C', name: 'Creative Studio',   line: 'Soft arches and round swatches on a warm board, everything eases into place.' }
  ]
};
