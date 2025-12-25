// firebase.js
// -------------------------
// Firebase compat setup using CDN loader for modern browsers
// -------------------------

const logInitFailure = (err) => {
  const message = `FIREBASE INIT FAILURE (firebase.js): ${err?.message || err}`;
  console.error("================ firebase.js ================");
  console.error(message);
  console.error("=============================================");
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

const CDN_VERSION = "10.12.0";
const firebaseCompatScripts = [
  `https://www.gstatic.com/firebasejs/${CDN_VERSION}/firebase-app-compat.js`,
  `https://www.gstatic.com/firebasejs/${CDN_VERSION}/firebase-auth-compat.js`,
  `https://www.gstatic.com/firebasejs/${CDN_VERSION}/firebase-database-compat.js`,
];

let firebaseCompat;
let firebaseCompatPromise;
let authInstance;
let dbInstance;

const waitForWindowFirebase = () =>
  new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(undefined);
      return;
    }

    const existing = window.firebase;
    if (existing) {
      resolve(existing);
      return;
    }

    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (window.firebase) {
        clearInterval(timer);
        resolve(window.firebase);
      } else if (attempts > 50) {
        clearInterval(timer);
        resolve(undefined);
      }
    }, 50);
  });

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Document is not available to load Firebase scripts."));
      return;
    }

    const existing = document.querySelector(`script[data-firebase-cdn="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", (err) => reject(err));
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.async = true;
    script.dataset.firebaseCdn = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load Firebase compat script: ${src}`));

    document.head.appendChild(script);
  });

const loadFirebaseCompat = () => {
  if (firebaseCompat) return Promise.resolve(firebaseCompat);
  if (firebaseCompatPromise) return firebaseCompatPromise;

  firebaseCompatPromise = (async () => {
    const existingCompat = typeof window !== "undefined" ? window.firebase : undefined;
    if (existingCompat) {
      firebaseCompat = existingCompat;
      return firebaseCompat;
    }

    for (const src of firebaseCompatScripts) {
      await loadScript(src);
    }

    const compat = await waitForWindowFirebase();
  console.error("================ firebase.js ================");
  console.error(message);
  console.error("=============================================");
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

const CDN_VERSION = "10.12.0";
const firebaseCompatScripts = [
  `https://www.gstatic.com/firebasejs/${CDN_VERSION}/firebase-app-compat.js`,
  `https://www.gstatic.com/firebasejs/${CDN_VERSION}/firebase-auth-compat.js`,
  `https://www.gstatic.com/firebasejs/${CDN_VERSION}/firebase-database-compat.js`,
];

let firebaseCompat;
let firebaseCompatPromise;
let authInstance;
let dbInstance;

const waitForWindowFirebase = () =>
  new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(undefined);
      return;
    }

    const existing = window.firebase;
    if (existing) {
      resolve(existing);
      return;
    }

    let attempts = 0;
    const timer = setInterval(() => {
      attempts += 1;
      if (window.firebase) {
        clearInterval(timer);
        resolve(window.firebase);
      } else if (attempts > 50) {
        clearInterval(timer);
        resolve(undefined);
      }
    }, 50);
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

const requireFirebaseReady = () => firebaseInitPromise;
const getAuth = () => authInstance;
const getDb = () => dbInstance;

export default firebaseCompat;
export { firebaseCompat, firebaseInitPromise, loadFirebaseCompat, getAuth, getDb, requireFirebaseReady };
