// firebase.js

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "...",
  databaseURL: "https://detektif-c17bb-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

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
