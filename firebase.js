// firebase.js
// -------------------------
// Firebase compat setup using bundled npm modules
// -------------------------

import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

const logInitFailure = (err) => {
  const message = `FIREBASE INIT FAILURE (firebase.js): ${err?.message || err}`;
  console.error("================ firebase.js ================");
  console.error(message);
  console.error("=============================================");
  if (typeof alert === "function") alert(message);
};

let firebaseCompat = firebase;

const loadFirebaseCompat = async () => {
  if (firebaseCompat) return firebaseCompat;

  const existingCompat = typeof window !== "undefined" ? window.firebase : undefined;

  if (existingCompat) {
    firebaseCompat = existingCompat;
  }

  if (!firebaseCompat) {
    throw new Error("Firebase SDK failed to load in firebase.js. Modules may be missing from the bundle.");
  }

  return firebaseCompat;
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

const initializeFirebase = async () => {
  const compat = await loadFirebaseCompat();

  if (!compat) {
    throw new Error("Firebase SDK failed to load in firebase.js. CDN scripts may be blocked.");
  }

  if (!compat.apps || !compat.apps.length) {
    compat.initializeApp(firebaseConfig);
  }

  const auth = compat.auth();
  const db = compat.database();

  window.auth = auth;
  window.db = db;
  window.firebase = compat;

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

  // Firestore'un modüler addDoc API'sini bekleyen eski önbellekler için uyarı niteliğinde bir koruma ekleyelim.
  // Böylece tarayıcı, tanımsız referans hatası fırlatmak yerine anlaşılır bir hata verir.
  if (typeof window.addDoc !== "function") {
    window.addDoc = () => {
      throw new Error(
        "Firestore API'si bu sürümde kullanılmıyor. Lütfen sayfayı yenileyip yeniden deneyin."
      );
    };
  }

  // 4) Sign in anonymously ONCE with persistence
  const authReady = auth
    .setPersistence(compat.auth.Auth.Persistence.LOCAL)
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

  return { compat, auth, db, authReady };
};

const firebaseInitPromise = initializeFirebase()
  .then((result) => {
    window.firebaseInitPromise = firebaseInitPromise;
    return result;
  })
  .catch((err) => {
    window.firebaseInitPromise = Promise.reject(err);
    logInitFailure(err);
    window.dispatchEvent(
      new CustomEvent("firebase-init-failed", {
        detail: err,
      })
    );
    throw err;
  });

// Ortak kullanıma aç
if (typeof window !== "undefined") {
  window.firebaseInitPromise = firebaseInitPromise;
}

export default firebaseCompat;
export { firebaseCompat, firebaseInitPromise, loadFirebaseCompat };
