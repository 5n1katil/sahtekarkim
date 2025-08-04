/***********************
 * Firebase Config
 ***********************/
const firebaseConfig = {
  apiKey: "AIzaSyBx_Tme2B-2g2Rtj53WBfgmZ5QsE0UN1Bw",
  authDomain: "detektif-c17bb.firebaseapp.com",
  databaseURL: "https://detektif-c17bb-default-rtdb.firebaseio.com",
  projectId: "detektif-c17bb",
  storageBucket: "detektif-c17bb.appspot.com",  // Düzeltilmiş!
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

/***********************
 * Anonim Kimlik Doğrulama
 * - Kullanıcıyı otomatik olarak anonim giriş yaptırır
 * - UID ile kullanıcıyı tanıyabiliriz
 ***********************/
if (firebase.auth) {
  window.auth = firebase.auth();

  // Anonim giriş
  window.auth.signInAnonymously()
    .then(() => {
      console.log("Anonim giriş başarılı. UID:", window.auth.currentUser.uid);
    })
    .catch(err => console.error("Anonim giriş hatası:", err));

  // Kullanıcı değişimini dinle
  window.auth.onAuthStateChanged(user => {
    if (user) {
      console.log("Aktif UID:", user.uid);
      window.myUid = user.uid;
    } else {
      console.log("Çıkış yapıldı.");
    }
  });
}
