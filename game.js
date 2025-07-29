/***********************
 * Firebase Config
 ***********************/
const firebaseConfig = {
  apiKey: "AIzaSyBX_Tme2B-2g2Rtj53WBfgmZ5QsE0UN1Bw",
  authDomain: "detektif-c17bb.firebaseapp.com",
  databaseURL: "https://detektif-c17bb-default-rtdb.firebaseio.com",
  projectId: "detektif-c17bb",
  storageBucket: "detektif-c17bb.firebasestorage.app",
  messagingSenderId: "422256375848",
  appId: "1:422256375848:web:873b0a6372c992accf9d1d",
};

firebase.initializeApp(firebaseConfig);
window.db = firebase.database();

/***********************
 * Oyun Mantığı
 ***********************/
window.gameLogic = {
  /** Oda oluştur */
  createRoom(creatorName, playerCount, spyCount, useRoles, questionCount, guessCount, canEliminate) {
    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    const roomRef = window.db.ref("rooms/" + roomCode);

    const roomData = {
      creator: creatorName,
      players: { [creatorName]: { name: creatorName, isCreator: true } },
      settings: {
        playerCount: Number(playerCount),
        spyCount: Number(spyCount),
        useRoles,
        questionCount: Number(questionCount),
        guessCount: Number(guessCount),
        canEliminate,
      },
      status: "waiting",
      createdAt: Date.now(),
    };

    roomRef.set(roomData);

    localStorage.setItem("roomCode", roomCode);
    localStorage.setItem("playerName", creatorName);
    localStorage.setItem("isCreator", "true");

    return roomCode;
  },

  /** Odaya katıl */
  joinRoom(playerName, roomCode, callback) {
    const roomRef = window.db.ref("rooms/" + roomCode);

    roomRef.get().then((snapshot) => {
      if (!snapshot.exists()) return callback?.("Oda bulunamadı!", null);

      const roomData = snapshot.val();
      const players = roomData.players || {};

      if (Object.keys(players).length >= roomData.settings.playerCount) {
        return callback?.("Oda dolu!", null);
      }
      if (players[playerName]) return callback?.("Bu isim zaten alınmış!", null);

      const playerRef = window.db.ref(`rooms/${roomCode}/players/${playerName}`);
      playerRef.set({ name: playerName, isCreator: false });

      localStorage.setItem("roomCode", roomCode);
      localStorage.setItem("playerName", playerName);
      localStorage.setItem("isCreator", "false");

      callback?.(null, Object.keys(players).concat(playerName));
    });
  },

  /** Odadan çık */
  leaveRoom(roomCode, playerName) {
    const isCreator = localStorage.getItem("isCreator") === "true";
    const playerRef = window.db.ref(`rooms/${roomCode}/players/${playerName}`);

    playerRef.remove().then(() => {
      if (isCreator) {
        window.db.ref(`rooms/${roomCode}`).remove().then(() => {
          localStorage.clear();
          window.location.href = "index.html";
        });
      } else {
        localStorage.clear();
        window.location.href = "index.html";
      }
    });
  },

  /** Oyuncuları canlı dinle */
  listenPlayers(roomCode) {
    const playersRef = window.db.ref(`rooms/${roomCode}/players`);
    playersRef.on("value", (snapshot) => {
      const playersObj = snapshot.val() || {};
      const playersArr = Object.values(playersObj).map((p) => p.name);

      const playerListEl = document.getElementById("playerList");
      const playerCountEl = document.getElementById("playerCountDisplay");

      if (playerListEl && playerCountEl) {
        playerListEl.innerHTML = Object.values(playersObj)
          .map((p) => `<li>${p.name}${p.isCreator ? " ⭐" : ""}</li>`)
          .join("") || "<li>Henüz oyuncu yok</li>";

        playerCountEl.textContent = playersArr.length;
      }

      // Oda boşsa kapat
      if (playersArr.length === 0 || !Object.values(playersObj).some((p) => p.isCreator)) {
        window.db.ref("rooms/" + roomCode).remove().then(() => {
          localStorage.clear();
          window.location.href = "index.html";
        });
      }
    });
  },
};
