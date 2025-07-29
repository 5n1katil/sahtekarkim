window.gameLogic = {
  // Oda oluştur
  createRoom: function(creatorName, playerCount, spyCount, useRoles, questionCount, guessCount, canEliminate) {
    const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const roomRef = window.db.ref("rooms/" + roomCode);

    const roomData = {
      creator: creatorName,
      players: { [creatorName]: true },
      settings: {
        playerCount,
        spyCount,
        useRoles,
        questionCount,
        guessCount,
        canEliminate
      },
      createdAt: Date.now()
    };

    roomRef.set(roomData);
    return roomCode;
  },

  // Odaya katıl
  joinRoom: function(playerName, roomCode, callback) {
    const roomRef = window.db.ref("rooms/" + roomCode);
    roomRef.get().then(snapshot => {
      if (!snapshot.exists()) {
        callback("Oda bulunamadı!", null);
        return;
      }

      const roomData = snapshot.val();
      const players = roomData.players || {};

      if (Object.keys(players).length >= roomData.settings.playerCount) {
        callback("Oda dolu!", null);
        return;
      }

      // Oyuncuyu ekle
      window.db.ref(`rooms/${roomCode}/players/${playerName}`).set(true);

      callback(null, Object.keys(players).concat(playerName));
    });
  },

  // Odayı sil
  deleteRoom: function(roomCode) {
    return window.db.ref("rooms/" + roomCode).remove();
  },

  // Odadan çık
  leaveRoom: function(roomCode, playerName) {
    const playerRef = window.db.ref(`rooms/${roomCode}/players/${playerName}`);
    return playerRef.remove();
  },

  // Oyuncuları canlı dinle
  listenPlayers: function(roomCode, callback) {
    const playersRef = window.db.ref(`rooms/${roomCode}/players`);
    playersRef.on("value", snapshot => {
      const players = snapshot.exists() ? Object.keys(snapshot.val()) : [];
      callback(players);
    });
  },

  // Oyunu başlat ve roller ata
  startGame: function(roomCode, settings) {
    const roomRef = window.db.ref("rooms/" + roomCode);

    roomRef.get().then(snapshot => {
      if (!snapshot.exists()) return;
      const roomData = snapshot.val();
      const players = Object.keys(roomData.players || {});

      if (players.length < 2) {
        alert("Oyun başlamak için en az 2 oyuncu olmalı!");
        return;
      }

      // Roller ve konumlar
      const locations = settings.locations;
      const roles = settings.roles;
      const chosenLocation = locations[Math.floor(Math.random() * locations.length)];

      // Kaç casus olacak
      let spyCount = Math.min(settings.spyCount, players.length - 1);
      let spies = [];

      // Oyuncuları karıştır
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);

      // Casusları seç
      spies = shuffledPlayers.slice(0, spyCount);

      // Her oyuncuya rol belirle
      const playerRoles = {};
      shuffledPlayers.forEach((player, idx) => {
        if (spies.includes(player)) {
          playerRoles[player] = { role: "Spy", location: null };
        } else {
          const roleName = settings.useRoles && roles.length >= players.length
            ? roles[idx % roles.length]
            : "Sıradan Oyuncu";
          playerRoles[player] = { role: roleName, location: chosenLocation };
        }
      });

      // Firebase'e yaz
      roomRef.update({
        status: "started",
        location: chosenLocation,
        playerRoles
      });

      // UI güncelle
      if (localStorage.getItem("playerName")) {
        const myName = localStorage.getItem("playerName");
        const myRole = playerRoles[myName];
        document.getElementById("roomInfo").classList.add("hidden");
        document.getElementById("playerRoleInfo").classList.remove("hidden");

        if (myRole.role === "Spy") {
          document.getElementById("roleMessage").textContent =
            `Sen BİR CASUSSUN! Konumu bilmiyorsun, dikkatli sorular sor.`;
        } else {
          document.getElementById("roleMessage").textContent =
            `Konum: ${myRole.location} | Rolün: ${myRole.role}`;
        }
      }
    });
  }
};
