// firebase.js

// Firebase ayarlarını içerir ve dışa aktarır

const firebaseConfig = {
  apiKey: "AIzaSyBX_Tme2B-2g2Rtj53WBfgmZ5QsE0UN1Bw",
  authDomain: "detektif-c17bb.firebaseapp.com",
  projectId: "detektif-c17bb",
  storageBucket: "detektif-c17bb.appspot.com",
  messagingSenderId: "422256375848",
  appId: "1:422256375848:web:873b0a6372c992accf9d1d",
  databaseURL: "https://detektif-c17bb-default-rtdb.firebaseio.com/"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

// Veritabanı referansını dışa aktar
const db = firebase.database();

// Diğer dosyalarda kullanmak üzere dışa aktar
window.db = db;

// Odaya katılanları canlı dinle
function listenToRoomChanges(roomCode, callback) {
  const roomRef = doc(db, "rooms", roomCode);
  onSnapshot(roomRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback(data.players || []);
    }
  });
}
export { listenToRoomChanges };
