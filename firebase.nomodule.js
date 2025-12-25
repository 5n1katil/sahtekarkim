// firebase.nomodule.js
// -------------------------
// Firebase compat setup for legacy browsers (no ES modules)
// -------------------------

const firebaseNomoduleGuard = () => {
  let firebaseCompat = typeof firebase !== "undefined" ? firebase : undefined;

  if (!firebaseCompat && typeof window !== "undefined" && window.firebase) {
    firebaseCompat = window.firebase;
  }

  if (!firebaseCompat) {
    const message =
      "Firebase SDK failed to load in firebase.nomodule.js. CDN scripts may be blocked.";
    console.error(message);
    throw new Error(message);
  }

  return firebaseCompat;
};

const firebaseCompat = firebaseNomoduleGuard();

const logInitFailure = (err) => {
  const message = `FIREBASE INIT FAILURE (firebase.nomodule.js): ${err?.message || err}`;
  console.error("============= firebase.nomodule.js =============");
  console.error(message);
  console.error("=================================================");
  if (typeof alert === "function") alert(message);
};

const firebaseConfig = {
  apiKey: "AIzaSyBX_Tme2B-2g2Rtj53WBfgmZ5QsE0UN1Bw",
  authDomain: "detektif-c17bb.firebaseapp.com",
  databaseURL: "https://detektif-c17bb-default-rtdb.firebaseio.com",
  projectId: "detektif-c17bb",
  storageBucket: "detektif-c17bb.appspot.com",
  messagingSenderId: "422256375848",
  appId: "1:422256375848:web:873b0a6372c992accf9d1d",
};

try {
  // 2) Initialize Firebase (guard against double init)
  if (!firebaseCompat.apps || !firebaseCompat.apps.length) {
    firebaseCompat.initializeApp(firebaseConfig);
  }

  // 3) Initialize and expose Auth & Database
  const auth = firebaseCompat.auth();
  const db = firebaseCompat.database();

  window.auth = auth;
  window.db = db;
  window.firebase = firebaseCompat;

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
  const authReady = auth
    .setPersistence(firebaseCompat.auth.Auth.Persistence.LOCAL)
    .then(() => {
      if (auth.currentUser) return auth.currentUser; // already signed in
      return auth.signInAnonymously().then((cred) => cred.user);
    })
    .then((user) => {
      if (user?.uid) console.log("Anonim giriş başarılı. UID:", user.uid);
      return user;
    })
    .catch((err) => {
      logInitFailure(err);
      throw err;
    });

  // 5) Listen for auth state changes
  auth.onAuthStateChanged((user) => {
    window.myUid = user ? user.uid : null;
  });

  // 6) Expose auth readiness promise for consumers
  window.authReady = authReady;
} catch (err) {
  logInitFailure(err);
  throw err;
}
