// firebase.js
// -------------------------
// Firebase compat setup (no modules)
// -------------------------

// 1. Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBX_Tme2B-2g2Rtj53WBfgmZ5QsE0UN1Bw",
  authDomain: "detektif-c17bb.firebaseapp.com",
  databaseURL: "https://detektif-c17bb-default-rtdb.firebaseio.com",
  projectId: "detektif-c17bb",
  storageBucket: "detektif-c17bb.appspot.com",
  messagingSenderId: "422256375848",
  appId: "1:422256375848:web:873b0a6372c992accf9d1d",
};

// 2. Initialize Firebase
firebase.initializeApp(firebaseConfig);

// 3. Initialize and expose Auth & Database
const auth = firebase.auth();
const db = firebase.database();

window.auth = auth;
window.db = db;

// 4. Sign in anonymously on load
auth
  .signInAnonymously()
  .then((userCredential) => {
    console.log("Anonim giriş başarılı. UID:", userCredential.user.uid);
  })
  .catch((err) => {
    console.error("Anonim giriş hatası:", err.code, err.message);
  });

// 5. Listen for auth state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    window.myUid = user.uid;
  } else {
    window.myUid = null;
  }
});
