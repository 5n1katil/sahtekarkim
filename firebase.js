/***********************
 * Firebase Config
 ***********************/
const firebaseConfig = {
  apiKey: "AIzaSyBx_Tme2B-2g2Rtj53WBfgmZ5QsE0UN1Bw",
  authDomain: "detektif-c17bb.firebaseapp.com",
  databaseURL: "https://detektif-c17bb-default-rtdb.firebaseio.com",
  projectId: "detektif-c17bb",
  storageBucket: "detektif-c17bb.firebasestorage.app",
  messagingSenderId: "422256375848",
  appId: "1:422256375848:web:873b0a6372c992accf9d1d"
};

/***********************
 * Firebase Başlat
 ***********************/
firebase.initializeApp(firebaseConfig);

/***********************
 * Realtime Database Referansı
 ***********************/
window.db = firebase.database();
