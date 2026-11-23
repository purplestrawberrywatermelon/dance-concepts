/*
  Participants store. One row per participant, keyed by the 5-digit ID.

    DP_STORE.create({ name, dance, hair, outfit })  ->  Promise<{ id }>
    DP_STORE.get(id)                                ->  Promise<row | null>
    DP_STORE.watch(cb, n)                           ->  unsubscribe()
                                                        cb(rows) with the newest n rows, now and on
                                                        every change; each row has id and createdAt (ms)

  Two back ends with the same API:
    firebase  shared/firebase-config.js is filled in (or ?emu=localhost for the
              Firebase Emulator Suite). Rows live in Firestore at participants/{id}.
    local     nothing configured. Rows live in this browser's localStorage, so the
              screens can be tried without Firebase. IDs are then only unique
              within this one browser.

  Row fields: name, dance, hair, outfit, status ("created"), createdAt, updatedAt.
  Other stations (photo and voice, generation) add their own fields to the same
  row, found by its ID.
*/
(function () {
  'use strict';

  var cfg = window.DP_FIREBASE || {};
  var emu = new URLSearchParams(location.search).get('emu') || cfg.emulator || '';
  var live = !!((cfg.apiKey && cfg.projectId) || emu);
  var SDK = 'https://www.gstatic.com/firebasejs/10.14.1/';
  var TIMEOUT = 20000;

  function randomId() {
    var span = 90000, n;
    try {
      var buf = new Uint32Array(1), max = Math.floor(4294967296 / span) * span;
      do { crypto.getRandomValues(buf); } while (buf[0] >= max);   /* no modulo bias */
      n = buf[0] % span;
    } catch (e) { n = Math.floor(Math.random() * span); }
    return String(10000 + n);
  }

  function validId(v) { return /^[1-9]\d{4}$/.test(v || '') ? String(v) : ''; }

  function withTimeout(promise, label) {
    return new Promise(function (resolve, reject) {
      var t = setTimeout(function () { reject(new Error(label + ' timed out')); }, TIMEOUT);
      promise.then(function (v) { clearTimeout(t); resolve(v); }, function (e) { clearTimeout(t); reject(e); });
    });
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = function () { reject(new Error('load ' + src)); };
      document.head.appendChild(s);
    });
  }

  function cleanSel(sel) {
    return {
      name: String(sel.name || '').trim().slice(0, 14),
      dance: sel.dance || '', hair: sel.hair || '', outfit: sel.outfit || ''
    };
  }

  /* A row as the screens use it: id added, createdAt as milliseconds. */
  function withId(id, d) {
    var t = d.createdAt;
    d.createdAt = t && t.toMillis ? t.toMillis() : Number(t) || 0;
    d.id = id;
    return d;
  }

  /* ---------- Firebase ---------- */
  var connecting = null;
  function connect() {
    if (!live) return Promise.resolve(null);
    if (connecting) return connecting;
    connecting = Promise.resolve().then(function () {
      if (window.firebase && firebase.firestore) return;
      return loadScript(SDK + 'firebase-app-compat.js')
        .then(function () { return loadScript(SDK + 'firebase-auth-compat.js'); })
        .then(function () { return loadScript(SDK + 'firebase-firestore-compat.js'); });
    }).then(function () {
      var c = cfg.apiKey ? cfg : { apiKey: 'demo', projectId: 'demo-dance' };
      if (!firebase.apps.length) firebase.initializeApp(c);
      var db = firebase.firestore(), au = firebase.auth();
      if (emu) { db.useEmulator(emu, 8080); au.useEmulator('http://' + emu + ':9099'); }
      return au.signInAnonymously().then(function () { return { db: db }; });
    });
    connecting.catch(function () { connecting = null; });   /* a failed connect can be retried */
    return connecting;
  }

  var fb = {
    create: function (sel) {
      var data = cleanSel(sel);
      return connect().then(function (c) {
        var now = firebase.firestore.FieldValue.serverTimestamp;
        function attempt(left) {
          var id = randomId(), ref = c.db.collection('participants').doc(id);
          return c.db.runTransaction(function (tx) {
            return tx.get(ref).then(function (snap) {
              if (snap.exists) throw new Error('taken');      /* someone already has this ID: pick another */
              tx.set(ref, {
                name: data.name, dance: data.dance, hair: data.hair, outfit: data.outfit,
                status: 'created', createdAt: now(), updatedAt: now()
              });
            });
          }).then(function () { return { id: id }; }, function (e) {
            if (e && e.message === 'taken' && left > 0) return attempt(left - 1);
            throw e;
          });
        }
        return attempt(30);
      });
    },
    get: function (id) {
      return connect().then(function (c) {
        return c.db.collection('participants').doc(id).get();
      }).then(function (snap) { return snap.exists ? snap.data() : null; });
    },
    watch: function (cb, n) {
      var off = function () {}, dead = false;
      connect().then(function (c) {
        if (dead) return;
        off = c.db.collection('participants').orderBy('createdAt', 'desc').limit(n)
          .onSnapshot(function (snap) {
            var rows = [];
            snap.forEach(function (d) { rows.push(withId(d.id, d.data({ serverTimestamps: 'estimate' }))); });
            cb(rows);
          }, function (e) { cb(null, e); });
      }).catch(function (e) { if (!dead) cb(null, e); });
      return function () { dead = true; off(); };
    }
  };

  /* ---------- local stand-in ---------- */
  var LKEY = 'dp-participants';
  function lread() { try { return JSON.parse(localStorage.getItem(LKEY) || '{}') || {}; } catch (e) { return {}; } }

  var local = {
    create: function (sel) {
      var all = lread(), id, i, d = cleanSel(sel);
      for (i = 0; i < 1000; i++) { id = randomId(); if (!all[id]) break; }
      all[id] = { name: d.name, dance: d.dance, hair: d.hair, outfit: d.outfit,
        status: 'created', createdAt: Date.now(), updatedAt: Date.now() };
      try { localStorage.setItem(LKEY, JSON.stringify(all)); } catch (e) { /* ignore */ }
      return Promise.resolve({ id: id });
    },
    get: function (id) { return Promise.resolve(lread()[id] || null); },
    watch: function (cb, n) {
      var last = '';
      function tick() {
        var all = lread(), key = JSON.stringify(all);
        if (key === last) return;
        last = key;
        var rows = Object.keys(all).map(function (id) { return withId(id, Object.assign({}, all[id])); });
        rows.sort(function (a, b) { return b.createdAt - a.createdAt; });
        cb(rows.slice(0, n));
      }
      tick();
      var t = setInterval(tick, 2000);
      return function () { clearInterval(t); };
    }
  };

  var be = live ? fb : local;

  window.DP_STORE = {
    mode: live ? 'firebase' : 'local',
    validId: validId,
    connect: connect,
    create: function (sel) { return withTimeout(be.create(sel), 'create'); },
    get: function (id) { return withTimeout(be.get(id), 'get'); },
    watch: function (cb, n) { return be.watch(cb, n || 300); }
  };
})();
