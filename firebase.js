// firebase.js
// -------------------------
// Modular Firebase v10+ setup for browser (ESM)
// -------------------------

// 1. Import the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// 2. Your web app's Firebase configuration
//    → Replace apiKey with the one from Firebase Console → Project Settings → General → Web API Key
const firebaseConfig = {
  apiKey: "YOUR_REAL_API_KEY_HERE",
  authDomain: "detektif-c17bb.firebaseapp.com",
  databaseURL: "https://detektif-c17bb-default-rtdb.firebaseio.com",
  projectId: "detektif-c17bb",
  storageBucket: "detektif-c17bb.appspot.com",
  messagingSenderId: "422256375848",
  appId: "1:422256375848:web:873b0a6372c992accf9d1d"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 4. Initialize and expose Auth & Database
const auth = getAuth(app);
const db   = getDatabase(app);

window.auth = auth;
window.db   = db;

// 5. Sign in anonymously on load
signInAnonymously(auth)
  .then((userCredential) => {
    const user = userCredential.user;
    console.log("Anonim giriş başarılı. UID:", user.uid);
    window.myUid = user.uid;
  })
  .catch((err) => {
    console.error("Anonim giriş hatası:", err.code, err.message);
    window.myUid = null;
  });

// 6. Listen for auth state changes (e.g. page reloads)
onAuthStateChanged(auth, (user) => {
  if (user) {
    if (window.myUid !== user.uid) {
      console.log("Auth state değişti, yeni UID:", user.uid);
      window.myUid = user.uid;
    }
  } else {
    console.warn("Kullanıcı oturumu kapattı veya hiç açılmadı.");
    window.myUid = null;
  }
});
