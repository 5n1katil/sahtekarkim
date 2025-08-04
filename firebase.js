/**
 * Firebase configuration
 */
const firebaseConfig = {
  apiKey: "AIzaSyBx_Tme2B-2g2Rtj53WBfgmZ5QsE0UN1Bw",
  authDomain: "detektif-c17bb.firebaseapp.com",
  databaseURL: "https://detektif-c17bb-default-rtdb.firebaseio.com",
  projectId: "detektif-c17bb",
  storageBucket: "detektif-c17bb.appspot.com",
  messagingSenderId: "422256375848",
  appId: "1:422256375848:web:873b0a6372c992accf9d1d",
};

/**
 * Initialize Firebase
 */
firebase.initializeApp(firebaseConfig);

/**
 * Expose database and auth for other scripts
 */
window.db = firebase.database();
window.auth = firebase.auth();

/**
 * Automatically sign in anonymously and store UID
 */
window.auth
  .signInAnonymously()
  .catch(err => console.error("Anonymous sign-in error:", err));

window.auth.onAuthStateChanged(user => {
  if (user) {
    window.myUid = user.uid;
    console.log("Signed in anonymously. UID:", window.myUid);
  }
});
