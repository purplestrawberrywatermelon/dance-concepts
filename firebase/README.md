# Firebase setup

The selection screen talks to Firebase through `shared/store.js`. With
`shared/firebase-config.js` left empty it falls back to this browser's
localStorage, so the screens can be tried without Firebase (IDs are then only
unique inside that one browser).

## What it does

When someone presses **Create** on the selection screen:

1. A Firestore transaction picks a random 5-digit ID (10000-99999), reads
   `participants/{id}`, and only writes the row if it does not exist yet. On a clash
   it draws again. So several kiosks can never hand out the same ID.
2. The row is saved: `name, dance, hair, outfit, status: "created", createdAt, updatedAt`.
3. The **Thank you** screen shows the ID.

### Result station

`index.html?s=mine` is the screen where a volunteer looks someone up. It has a search box
(type an ID or part of a name) and, below it, a live list of the newest 300 participants:
name, ID, dance, "created N min ago" (from `createdAt`) and a dot that is green once the
video is ready. Picking a row, or pressing Enter, shows that person's video and a QR.
A full 5-digit ID that is older than the newest 300 is looked up directly.

The list is one Firestore listener (`orderBy createdAt desc, limit 300`), so after the first
load only changed rows count as reads. The rules allow it (`allow list` with limit <= 300), so
**publish the updated `firestore.rules`** for the list to work.

The video comes from the field **`videoUrl`** (a full https URL, or a path on the site).
Whoever generates the video sets, on that same row:

    videoUrl: "https://.../12345.mp4"
    status:   "done"

Until `videoUrl` exists the screen shows the person's name and choices with "still being
made" and checks again every 5 seconds, so it switches over by itself. The QR code encodes
the same `videoUrl`. The field name is a proposal; if the other team uses a different one,
change `videoOf` in `concepts/03/concept.js`. Without Firebase configured, or with `&demo=1`,
a row without `videoUrl` plays the dance's example clip so the screen can be tried. After
90 s without a touch the screen returns to the search (`&idle=N` changes it).

Other stations (photo and voice, generation) find the same row by its ID and add
their own fields. The rules in `firestore.rules` let a client create a row and read it
by ID or list the newest 300, nothing else. A server using the Firebase admin SDK is not subject to the
rules, so it can update rows. If a station running in the browser needs to write to
the row, add an update rule for exactly the fields it writes.

Also in `firestore.rules`: the existing rules for gallery hearts (`votes`).

## One-time setup

1. Create a Firebase project (the Spark plan is enough for this part).
2. Build > **Authentication** > Sign-in method > turn on **Anonymous**.
3. Build > **Firestore Database** > create (production mode).
4. Project settings > Your apps > add a **Web app**; copy its config into
   `shared/firebase-config.js`.
5. Publish the rules:
   `cd firebase && npx firebase-tools login && npx firebase-tools use --add && npx firebase-tools deploy --only firestore:rules`

## Try it with the emulator

Needs Node and Java.

```
cd firebase
npm install
npm run emulators               # Auth 9099, Firestore 8080, UI http://localhost:4000
python3 ../download_server.py   # in another terminal, serves the site on :8767
```

Open `http://localhost:8767/index.html?emu=localhost`, pick a dance, hair, outfit,
enter a name and press Create. The row appears in the emulator UI.
`npm test` runs `test/rules.test.js` against the emulator.

## Known limits

- The ID is not secret (90,000 possibilities) and any signed-in client can read a row by
  its ID, so a row holds only name and choices. Keep photos and voice out of it.
- Anyone with the site open can create rows. Add Firebase App Check if that matters.
