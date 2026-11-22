/*
  Firebase web config for gallery hearts. Leave the strings empty and the
  hearts still render, but taps are not stored.

  In the Firebase console, turn on Authentication > Anonymous, create a
  Firestore database, and use rules that only allow a signed-in client to
  move a count by 1:

  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /votes/{id} {
        allow read: if true;
        allow create: if request.auth != null
          && request.resource.data.keys().hasOnly(['count'])
          && request.resource.data.count == 1;
        allow update: if request.auth != null
          && request.resource.data.keys().hasOnly(['count'])
          && request.resource.data.count is int
          && request.resource.data.count >= 0
          && (request.resource.data.count == resource.data.count + 1
              || request.resource.data.count == resource.data.count - 1);
      }
    }
  }
*/
window.DP_FIREBASE = {
  apiKey: "AIzaSyCD3lczIweM7KnW4jmpgjUHH32npsUTYOs",
  authDomain: "neurips2026-f0b0b.firebaseapp.com",
  projectId: "neurips2026-f0b0b",
  storageBucket: "neurips2026-f0b0b.firebasestorage.app",
  messagingSenderId: "510275620665",
  appId: "1:510275620665:web:182e8c35d09c7a581322e8"
};
