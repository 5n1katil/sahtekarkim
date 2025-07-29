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
        "Plaj": ["Can Kurtaran","Turist","Çocuk","Satıcı","Yüzücü","Balıkçı"],
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

  // Yenileme durumunda çıkış yapma
  if (navType === "reload") return;

  // Sekme kapandıysa veya tarayıcı kapandıysa
  unloadTimer = setTimeout(() => {
    const roomCode = localStorage.getItem("roomCode");
    const playerName = localStorage.getItem("playerName");
    if (roomCode && playerName) {
      window.gameLogic.leaveRoom(roomCode, playerName);
    }
  }, 1500);
});

// Sayfa geri görünür olursa çıkışı iptal et
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    clearTimeout(unloadTimer);
  }
});
