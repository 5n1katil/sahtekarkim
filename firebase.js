// firebase.js

// Firebase yapılandırması
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

// Veritabanı referansı
const db = firebase.database();

// 🔸 Oda oluşturma
function createRoom(roomCode, hostName) {
  const roomRef = db.ref(`rooms/${roomCode}`);
  return roomRef.set({
    players: [{ name: hostName }],
    createdAt: Date.now()
  });
}

// 🔸 Oyuncu ekleme
function addPlayerToRoom(roomCode, playerName) {
  const playersRef = db.ref(`rooms/${roomCode}/players`);
  return playersRef.once("value").then(snapshot => {
    const players = snapshot.val() || [];
    players.push({ name: playerName });
    return playersRef.set(players);
  });
}

// 🔸 Odayı canlı dinle
function listenToRoomChanges(roomCode, callback) {
  const playersRef = db.ref(`rooms/${roomCode}/players`);
  playersRef.on("value", (snapshot) => {
    const players = snapshot.val() || [];
    callback(players);
  });
}

// 🔸 Dinlemeyi durdur (örnek: oyun bittiğinde)
function stopListeningToRoom(roomCode) {
  const playersRef = db.ref(`rooms/${roomCode}/players`);
  playersRef.off("value");
}

// Modül olarak dışa aktar
window.firebaseUtils = {
  db,
  createRoom,
  addPlayerToRoom,
  listenToRoomChanges,
  stopListeningToRoom
};
