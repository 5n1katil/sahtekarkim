window.gameLogic = {
  /** Oda oluştur */
  createRoom: function (
    creatorName,
    playerCount,
    spyCount,
    useRoles,
    questionCount,
    guessCount,
    canEliminate
  ) {
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

      // Aynı isimde oyuncu varsa engelle
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

  /** Odayı sil */
  deleteRoom: function (roomCode) {
    return window.db.ref("rooms/" + roomCode).remove();
  },

  /** Odadan çık */
  leaveRoom: function (roomCode, playerName) {
    const playerRef = window.db.ref(`rooms/${roomCode}/players/${playerName}`);
    localStorage.clear();
    playerRef.remove();
    location.href = "index.html";
  },

/** Oyuncuları canlı dinle */
listenPlayers: function (roomCode, callback) {
    const playersRef = window.db.ref(`rooms/${roomCode}/players`);
    playersRef.on("value", (snapshot) => {
        const playersObj = snapshot.val() || {};
        const players = Object.keys(playersObj);

        // HTML elementlerini al
        const playerListEl = document.getElementById("playerList");
        const playerCountEl = document.getElementById("playerCountDisplay"); // doğru id

        if (playerListEl && playerCountEl) {
            playerListEl.innerHTML = players
                .map((p) => {
                    const isCreator = playersObj[p]?.isCreator;
                    return `<li>${p}${isCreator ? " ⭐" : ""}</li>`;
                })
                .join("");
            playerCountEl.textContent = players.length; // Oyuncu sayısını güncelle
        }

        // Callback ile dışarıya da gönder
        callback(players);
    });
},

      // Oda tamamen boşaldıysa kapat
      if (players.length === 0) {
        window.db.ref("rooms/" + roomCode).remove();
        localStorage.clear();
        location.reload();
        return;
      }

      // Kurucu yoksa odayı kapat
      const creatorName = snapshot.val()?.[Object.keys(playersObj)[0]]?.isCreator
        ? Object.keys(playersObj).find((p) => playersObj[p].isCreator)
        : null;

      if (!creatorName || !players.includes(creatorName)) {
        window.db.ref(`rooms/${roomCode}`).remove();
        localStorage.clear();
        location.reload();
      }
    });
  },

  /** Oda ve oyun durumunu canlı dinle */
  listenRoom: function (roomCode) {
    const roomRef = window.db.ref("rooms/" + roomCode);

    roomRef.on("value", (snapshot) => {
      const roomData = snapshot.val();
      if (!roomData) return;

      // Oyun başladıysa rol göster
      if (roomData.status === "started") {
        const myName = localStorage.getItem("playerName");
        if (myName && roomData.playerRoles && roomData.playerRoles[myName]) {
          const myRole = roomData.playerRoles[myName];

          document.getElementById("roomInfo")?.classList.add("hidden");
          document.getElementById("playerRoleInfo")?.classList.remove("hidden");

          document.getElementById("roleMessage").textContent = myRole.isSpy
            ? `🎭 Sen BİR SAHTEKARSIN! Konumu bilmiyorsun. Olası konumlar: ${myRole.allLocations.join(", ")}`
            : `✅ Konum: ${myRole.location} | Rolün: ${myRole.role}`;
        }
      }
    });
  },

  /** Oyunu başlat ve roller ata */
  startGame: function (roomCode, settings) {
    const roomRef = window.db.ref("rooms/" + roomCode);

    roomRef.get().then((snapshot) => {
      if (!snapshot.exists()) return;
      const roomData = snapshot.val();
      const players = Object.keys(roomData.players || {});

      if (players.length < 2) {
        alert("Oyun başlamak için en az 2 oyuncu olmalı!");
        return;
      }

      // 30 konum ve 6 rol örneği
      const locationRoles = {
        "Hastane": ["Doktor", "Hemşire", "Hasta", "Ziyaretçi", "Temizlikçi", "Güvenlik"],
        "Restoran": ["Garson", "Şef", "Müşteri", "Kasiyer", "Temizlikçi", "Menajer"],
        "Kütüphane": ["Kütüphaneci", "Öğrenci", "Araştırmacı", "Güvenlik", "Temizlikçi", "Ziyaretçi"]
        // Diğer konumlar eklenecek
      };

      const locations = Object.keys(locationRoles);
      const chosenLocation = locations[Math.floor(Math.random() * locations.length)];

      const spyCount = Math.min(settings.spyCount, players.length - 1);
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
      const spies = shuffledPlayers.slice(0, spyCount);

      const playerRoles = {};
      shuffledPlayers.forEach((player) => {
        const isSpy = spies.includes(player);

        if (isSpy) {
          playerRoles[player] = {
            isSpy: true,
            role: "Sahtekar",
            location: null,
            allLocations: locations,
          };
        } else {
          const rolesForLoc = locationRoles[chosenLocation];
          const randomRole = settings.useRoles
            ? rolesForLoc[Math.floor(Math.random() * rolesForLoc.length)]
            : "Masum";
          playerRoles[player] = {
            isSpy: false,
            role: randomRole,
            location: chosenLocation,
            allLocations: null,
          };
        }
      });

      roomRef.update({
        status: "started",
        location: chosenLocation,
        spies,
        playerRoles,
      });
    });
  },
};

// ------------------------
// Sekme kapanınca odadan çık (F5'te çıkmaz)
// ------------------------
let unloadTimer;

window.addEventListener("beforeunload", () => {
  const navEntries = performance.getEntriesByType("navigation");
  const navType = navEntries.length ? navEntries[0].type : null;

  if (navType === "reload") return;

  unloadTimer = setTimeout(() => {
    const roomCode = localStorage.getItem("roomCode");
    const playerName = localStorage.getItem("playerName");
    if (roomCode && playerName) {
      window.gameLogic.leaveRoom(roomCode, playerName);
    }
  }, 1500);
});

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    clearTimeout(unloadTimer);
  }
});
