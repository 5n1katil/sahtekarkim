<!-- Firebase SDK (Realtime DB dahil) -->
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js"></script>

<script>
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
  createRoom: function (creatorName, playerCount, spyCount, useRoles, questionCount, guessCount, canEliminate) {
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
  joinRoom: function (playerName, roomCode, callback) {
    const roomRef = window.db.ref("rooms/" + roomCode);

    roomRef.get().then((snapshot) => {
      if (!snapshot.exists()) {
        callback?.("Oda bulunamadı!", null);
        return;
      }

      const roomData = snapshot.val();
      const players = roomData.players || {};

      if (Object.keys(players).length >= roomData.settings.playerCount) {
        callback?.("Oda dolu!", null);
        return;
      }

      if (players[playerName]) {
        callback?.("Bu isim zaten alınmış!", null);
        return;
      }

      const playerRef = window.db.ref(`rooms/${roomCode}/players/${playerName}`);
      playerRef.set({ name: playerName, isCreator: false });

      localStorage.setItem("roomCode", roomCode);
      localStorage.setItem("playerName", playerName);
      localStorage.setItem("isCreator", "false");

      callback?.(null, Object.keys(players).concat(playerName));
    });
  },

  /** Odadan çık */
  leaveRoom: function (roomCode, playerName) {
    return new Promise((resolve) => {
      if (!roomCode || !playerName) {
        resolve();
        return;
      }

      const isCreator = localStorage.getItem("isCreator") === "true";
      const playerRef = window.db.ref(`rooms/${roomCode}/players/${playerName}`);

      playerRef.remove().then(() => {
        if (isCreator) {
          // Kurucu çıkınca oda tamamen silinir
          window.db.ref(`rooms/${roomCode}`).remove().then(() => {
            localStorage.clear();
            window.location.href = "index.html";
            resolve();
          });
        } else {
          localStorage.clear();
          window.location.href = "index.html";
          resolve();
        }
      });
    });
  },

  /** Oyuncuları canlı dinle */
  listenPlayers: function (roomCode, callback) {
    const playersRef = window.db.ref(`rooms/${roomCode}/players`);
    playersRef.on("value", (snapshot) => {
      const playersObj = snapshot.val() || {};
      const playersArr = Object.values(playersObj).map((p) => p.name);

      // UI güncelle
      const playerListEl = document.getElementById("playerList");
      const playerCountEl = document.getElementById("playerCountDisplay");

      if (playerListEl && playerCountEl) {
        playerListEl.innerHTML = Object.values(playersObj)
          .map((p) => `<li>${p.name}${p.isCreator ? " ⭐" : ""}</li>`)
          .join("") || "<li>Henüz oyuncu yok</li>";

        playerCountEl.textContent = playersArr.length;
      }

      // Oda tamamen boşaldıysa kapat
      if (playersArr.length === 0) {
        window.db.ref("rooms/" + roomCode).remove().then(() => {
          localStorage.clear();
          window.location.href = "index.html";
        });
        return;
      }

      // Kurucu yoksa oda kapanır
      const creatorExists = Object.values(playersObj).some((p) => p.isCreator);
      if (!creatorExists) {
        window.db.ref(`rooms/${roomCode}`).remove().then(() => {
          localStorage.clear();
          window.location.href = "index.html";
        });
        return;
      }

      callback?.(playersArr);
    });
  },
};

/***********************
 * Sekme kapanınca odadan çık
 ***********************/
let unloadTimer;

window.addEventListener("beforeunload", () => {
  const navEntries = performance.getEntriesByType("navigation");
  const navType = navEntries.length ? navEntries[0].type : null;
  if (navType === "reload") return; // sadece gerçek çıkışta

  unloadTimer = setTimeout(() => {
    const roomCode = localStorage.getItem("roomCode");
    const playerName = localStorage.getItem("playerName");
    if (roomCode && playerName) {
      window.gameLogic.leaveRoom(roomCode, playerName);
    }
  }, 300);
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) clearTimeout(unloadTimer);
});

/***********************
 * UI Butonları
 ***********************/
document.getElementById("createRoomBtn")?.addEventListener("click", () => {
  const name = document.getElementById("nameInput").value;
  const playerCount = document.getElementById("playerCountInput").value;
  const roomCode = window.gameLogic.createRoom(name, playerCount, 1, false, 3, 1, true);
  alert(`Oda kodunuz: ${roomCode}`);
});

document.getElementById("leaveRoomBtn")?.addEventListener("click", () => {
  const roomCode = localStorage.getItem("roomCode");
  const playerName = localStorage.getItem("playerName");
  if (roomCode && playerName) {
    window.gameLogic.leaveRoom(roomCode, playerName);
  }
});
</script>
