// firebase.js
// -------------------------
// Firebase compat setup (no modules)
// -------------------------

const firebaseConfig = {
  apiKey: "AIzaSyBX_Tme2B-2g2Rtj53WBfgmZ5QsE0UN1Bw",
  authDomain: "detektif-c17bb.firebaseapp.com",
  databaseURL: "https://detektif-c17bb-default-rtdb.firebaseio.com",
  projectId: "detektif-c17bb",
  storageBucket: "detektif-c17bb.appspot.com",
  messagingSenderId: "422256375848",
  appId: "1:422256375848:web:873b0a6372c992accf9d1d",
};

// 2) Initialize Firebase (guard against double init)
if (!firebase.apps || !firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// 3) Initialize and expose Auth & Database
const auth = firebase.auth();
const db = firebase.database();

window.auth = auth;
window.db = db;

// 3.1) Server time offset helper
let serverTimeOffset = 0;
const offsetRef = db.ref(".info/serverTimeOffset");

const serverTime = {
  offset: serverTimeOffset,
  now: () => Date.now() + serverTimeOffset,
  getOffset: () => serverTimeOffset,
};

offsetRef.on("value", (snap) => {
  const offset = snap.val();
  if (typeof offset === "number") {
    serverTimeOffset = offset;
    serverTime.offset = offset;
  }
});

window.serverTime = serverTime;

// 4) Sign in anonymously ONCE with persistence
auth
  .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    if (auth.currentUser) return auth.currentUser; // already signed in
    return auth.signInAnonymously().then((cred) => cred.user);
  })
  .then((user) => {
    if (user?.uid) console.log("Anonim giriş başarılı. UID:", user.uid);
  })
  .catch((err) => {
    console.error("Anonim giriş/persistence hatası:", err.code, err.message);
  });

// 5) Listen for auth state changes
auth.onAuthStateChanged((user) => {
  window.myUid = user ? user.uid : null;
});
