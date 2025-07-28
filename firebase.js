// firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyBX_Tme2B-2g2Rtj53WBfgmZ5QsE0UN1Bw",
  authDomain: "detektif-c17bb.firebaseapp.com",
  projectId: "detektif-c17bb",
  storageBucket: "detektif-c17bb.appspot.com",
  messagingSenderId: "422256375848",
  appId: "1:422256375848:web:873b0a6372c992accf9d1d",
  databaseURL: "https://detektif-c17bb-default-rtdb.firebaseio.com/"
};

// Firebase başlat
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Genişletilmiş utils fonksiyonları (window ile global erişim)
window.firebaseUtils = {
  createRoom: function (roomCode, hostName) {
    const roomRef = db.ref(`rooms/${roomCode}`);
    return roomRef.set({
      players: [{ name: hostName }],
      createdAt: Date.now()
    });
  },
  addPlayer: function (roomCode, playerName) {
    const playersRef = db.ref(`rooms/${roomCode}/players`);
    return playersRef.once("value").then(snapshot => {
      const players = snapshot.val() || [];
      // Aynı isimle tekrar ekleme
      if (players.some(p => p.name === playerName)) {
        return Promise.reject("Bu isim zaten ekli.");
      }
      players.push({ name: playerName });
      return playersRef.set(players);
    });
  },
  listenToRoomChanges: function (roomCode, callback) {
    const playersRef = db.ref(`rooms/${roomCode}/players`);
    playersRef.on("value", snapshot => {
      const players = snapshot.val() || [];
      callback(players);
    });
  }
};
