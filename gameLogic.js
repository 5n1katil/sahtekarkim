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

      const playerRef = window.db.ref(`rooms/${roomCode}/players/${playerName}`);
      playerRef.set({ name: playerName });

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

      // Oda tamamen boşaldıysa kapat
      if (players.length === 0) {
        window.db.ref("rooms/" + roomCode).remove();
        localStorage.clear();
        location.reload();
      }

      // Kurucu yoksa odayı kapat
      const roomRef = window.db.ref(`rooms/${roomCode}`);
      roomRef.get().then((snap) => {
        const data = snap.val();
        if (!data || !data.creator || !players.includes(data.creator)) {
          roomRef.remove();
          localStorage.clear();
          location.reload();
        }
      });
    });
  },

  /** Oda ve oyun durumunu canlı dinle */
  listenRoom: function (roomCode) {
    const roomRef = window.db.ref("rooms/" + roomCode);

    roomRef.on("value", (snapshot) => {
      const roomData = snapshot.val();
      if (!roomData) return;

      // Oyuncu listesi güncelle
      const players = Object.keys(roomData.players || {});
      const playerListEl = document.getElementById("playerList");
      if (playerListEl) {
        playerListEl.innerHTML = players.map((p) => `<li>${p}</li>`).join("");
      }

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

      const locationRoles = {
        "Havalimanı": ["Pilot","Hostes","Yolcu","Güvenlik","Bagaj Görevlisi","Yer Hizmetleri"],
        "Restoran": ["Şef","Garson","Müşteri","Kasiyer","Temizlikçi","Barmen"],
        "Kütüphane": ["Kütüphaneci","Öğrenci","Okur","Temizlikçi","Güvenlik","Araştırmacı"],
        "Müze": ["Sanatçı","Rehber","Turist","Güvenlik","Temizlikçi","Koleksiyoncu"],
        "Otobüs": ["Şoför","Biletçi","Yolcu","Turist","Öğrenci","Memur"],
        "Okul": ["Öğretmen","Öğrenci","Müdür","Hademe","Güvenlik","Kütüphaneci"],
        "Hastane": ["Doktor","Hemşire","Hasta","Ziyaretçi","Temizlikçi","Güvenlik"],
        "Spor Salonu": ["Antrenör","Sporcu","Üye","Resepsiyonist","Temizlikçi","Fizyoterapist"],
        "Otel": ["Resepsiyonist","Müşteri","Kat Görevlisi","Güvenlik","Aşçı","Vale"],
        "Sirk": ["Palyaço","Akrobat","Hayvan Terbiyecisi","Gösteri Sunucusu","Seyirci","Biletçi"],
        "Stadyum": ["Futbolcu","Hakem","Seyirci","Biletçi","Güvenlik","Satıcı"],
        "Denizaltı": ["Kaptan","Subay","Mühendis","Dalgıç","Teknisyen","Gözlemci"],
        "Sinema": ["Biletçi","Seyirci","Gösterim Görevlisi","Temizlikçi","Satıcı","Yönetici"],
        "Kayık": ["Balıkçı","Yolcu","Turist","Kaptan","Kürekçi","Rehber"],
        "Çiftlik": ["Çiftçi","Veteriner","İşçi","Çocuk","Turist","Komşu"],
        "Tren İstasyonu": ["Makinist","Biletçi","Yolcu","Turist","Güvenlik","Temizlikçi"],
        "Hapishane": ["Gardiyan","Mahkum","Müdür","Avukat","Ziyaretçi","Temizlikçi"],
        "Kışla": ["Asker","Komutan","Doktor","Aşçı","Eğitmen","Ziyaretçi"],
        "Kafe": ["Barista","Garson","Müşteri","Kasiyer","Öğrenci","Turist"],
        "Pazar": ["Satıcı","Müşteri","Hırsız","Güvenlik","Çocuk","Dilenci"],
        "Dağ Evi": ["Dağcı","Turist","Ev Sahibi","Avcı","Aşçı","Komşu"],
        "Festival": ["Dansçı","Müzisyen","Satıcı","Seyirci","Görevli","Turist"],
        "Plaj": ["Cankurtaran","Turist","Çocuk","Satıcı","Yüzücü","Balıkçı"],
        "Yat Limanı": ["Kaptan","Turist","Balıkçı","Teknisyen","Güvenlik","Satıcı"],
        "Konsolosluk": ["Konsolos","Sekreter","Misafir","Güvenlik","Temizlikçi","Vatandaş"],
        "Tiyatro": ["Oyuncu","Seyirci","Biletçi","Işıkçı","Dekoratör","Temizlikçi"],
        "Kilise": ["Papaz","Seyirci","Ziyaretçi","Güvenlik","Koro Üyesi","Temizlikçi"],
        "Lunapark": ["Operatör","Biletçi","Çocuk","Anne-Baba","Satıcı","Güvenlik"],
        "Üniversite": ["Profesör","Öğrenci","Memur","Temizlikçi","Güvenlik","Ziyaretçi"],
        "Hayvanat Bahçesi": ["Bakıcı","Veteriner","Turist","Satıcı","Çocuk","Güvenlik"]
      };

      const locations = Object.keys(locationRoles);
      const chosenLocation = locations[Math.floor(Math.random() * locations.length)];

      const spyCount = Math.min(settings.spyCount, players.length - 1);
      const shuffledPlayers = [...players].sort(() => Math.random() - 0.5);
      const spies = shuffledPlayers.slice(0, spyCount);

      const playerRoles = {};
      const gameStatePlayers = {};

      shuffledPlayers.forEach((player) => {
        const isSpy = spies.includes(player);

        if (isSpy) {
          playerRoles[player] = {
            isSpy: true,
            role: "Sahtekar",
            location: null,
            allLocations: locations,
          };

          gameStatePlayers[player] = {
            roleInfo: "SAHTEKAR",
            location: null,
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

          gameStatePlayers[player] = {
            roleInfo: randomRole,
            location: chosenLocation,
          };
        }
      });

      const gameState = {
        started: true,
        players: gameStatePlayers,
        allLocations: locations,
      };

      roomRef.update({
        status: "started",
        location: chosenLocation,
        spies,
        playerRoles,
        gameState,
        round: 1,
        votingStarted: false,
      });
    });
  },

  /**
   * Bir oyuncu oylamayı başlatma isteği gönderdiğinde çağrılır.
   * Tüm oyuncular isteği gönderdiğinde oylama otomatik başlar.
   */
  requestVotingStart: function (roomCode, playerName) {
    const ref = window.db.ref("rooms/" + roomCode);
    ref.child(`voteRequests/${playerName}`).set(true).then(() => {
      ref.get().then((snap) => {
        if (!snap.exists()) return;
        const data = snap.val();
        const players = Object.keys(data.players || {});
        const requests = Object.keys(data.voteRequests || {});

        if (requests.length === players.length) {
          this.startVoting(roomCode);
          ref.child("voteRequests").remove();
        }
      });
    });
  },

  startVoting: function (roomCode) {
    const ref = window.db.ref("rooms/" + roomCode);
    ref.update({ votingStarted: true, votes: null, voteResult: null });
  },

  submitVote: function (roomCode, voter, target) {
    window.db
      .ref(`rooms/${roomCode}/votes/${voter}`)
      .set(target);
  },

  tallyVotes: function (roomCode) {
    const ref = window.db.ref("rooms/" + roomCode);
    ref.get().then((snap) => {
      if (!snap.exists()) return;
      const data = snap.val();
      const players = Object.keys(data.players || {});
      const votes = data.votes || {};
      if (Object.keys(votes).length < players.length) return;

      const counts = {};
      Object.values(votes).forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
      const max = Math.max(...Object.values(counts));
      const top = Object.keys(counts).filter((p) => counts[p] === max);
      if (top.length !== 1) {
        ref.update({
          votes: null,
          voteRequests: null,
          votingStarted: false,
          voteResult: { tie: true },
        });
        return;
      }
      const voted = top[0];
      const votedRole = data.playerRoles && data.playerRoles[voted];
      const isSpy = votedRole ? votedRole.isSpy : false;

      ref.update({
        voteResult: { voted, isSpy },
        votingStarted: false,
      });

      if (isSpy) {
        ref.update({ status: "finished" });
      }
    });
  },

  nextRound: function (roomCode) {
    const ref = window.db.ref("rooms/" + roomCode);
    ref.get().then((snap) => {
      if (!snap.exists()) return;
      const data = snap.val();
      const nextRound = (data.round || 1) + 1;
      ref.update({
        round: nextRound,
        votes: null,
        voteResult: null,
        votingStarted: false,
        voteRequests: null,
      });
    });
  },
};
