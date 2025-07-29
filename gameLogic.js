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
      players: { [creatorName]: { name: creatorName } },
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

    // Odayı kaydet
    roomRef.set(roomData);

    // LocalStorage kaydı
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

      // Oyuncuyu ekle
      const playerRef = window.db.ref(`rooms/${roomCode}/players/${playerName}`);
      playerRef.set({ name: playerName });

      // LocalStorage
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
    return playerRef.remove();
  },

  /** Oyuncuları canlı dinle */
  listenPlayers: function (roomCode, callback) {
    const playersRef = window.db.ref(`rooms/${roomCode}/players`);
    playersRef.on("value", (snapshot) => {
      const playersObj = snapshot.val() || {};
      const players = Object.keys(playersObj);
      callback(players);
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

      // Konum ve roller
      const locations = settings.locations || [];
      const roles = settings.roles || [];
      const chosenLocation = locations[Math.floor(Math.random() * locations.length)];

      // Casus sayısı
      const spyCount = Math.min(settings.spyCount, players.length - 1);

      // Oyuncuları karıştır
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

      // Casusları seç
      const spies = shuffledPlayers.slice(0, spyCount);

      // Oyuncu rolleri
      const playerRoles = {};
      shuffledPlayers.forEach((player, idx) => {
        if (spies.includes(player)) {
          playerRoles[player] = { role: "Spy", location: null };
        } else {
          const roleName =
            settings.useRoles && roles.length >= players.length
              ? roles[idx % roles.length]
              : "Sıradan Oyuncu";
          playerRoles[player] = { role: roleName, location: chosenLocation };
        }
      });

      // Firebase güncelle
      roomRef.update({
        status: "started",
        location: chosenLocation,
        playerRoles,
      });

      // UI'de kendi rolünü göster
      const myName = localStorage.getItem("playerName");
      if (myName && playerRoles[myName]) {
        const myRole = playerRoles[myName];
        document.getElementById("roomInfo")?.classList.add("hidden");
        document.getElementById("playerRoleInfo")?.classList.remove("hidden");

        document.getElementById("roleMessage").textContent =
          myRole.role === "Spy"
            ? "Sen BİR CASUSSUN! Konumu bilmiyorsun, dikkatli sorular sor."
            : `Konum: ${myRole.location} | Rolün: ${myRole.role}`;
      }
    });
  },
};
