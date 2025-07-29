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
    if (!roomCode || !playerName) return;
    const isCreator = localStorage.getItem("isCreator") === "true";

    const playerRef = window.db.ref(`rooms/${roomCode}/players/${playerName}`);
    return playerRef.remove().then(() => {
      if (isCreator) {
        // Kurucu çıkarsa oda tamamen kapanır
        window.db.ref(`rooms/${roomCode}`).remove();
      }
      localStorage.clear();
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

      // --- 30 konum × 6 rol ---
      const locationRoles = {
        "Hastane": ["Doktor", "Hemşire", "Hasta", "Ziyaretçi", "Temizlikçi", "Güvenlik"],
        "Restoran": ["Garson", "Şef", "Müşteri", "Kasiyer", "Temizlikçi", "Menajer"],
        "Kütüphane": ["Kütüphaneci", "Öğrenci", "Araştırmacı", "Güvenlik", "Temizlikçi", "Ziyaretçi"],
        "Okul": ["Öğretmen", "Öğrenci", "Müdür", "Hizmetli", "Güvenlik", "Veli"],
        "Plaj": ["Cankurtaran", "Turist", "Çocuk", "Satıcı", "Balıkçı", "Fotoğrafçı"],
        "Uçak": ["Pilot", "Hostes", "Yolcu", "Kaptan", "Güvenlik", "Temizlikçi"],
        "Otobüs": ["Şoför", "Muavin", "Yolcu", "Kontrolör", "Turist", "Çocuk"],
        "Tren": ["Makinist", "Hostes", "Yolcu", "Biletçi", "Güvenlik", "Temizlikçi"],
        "Spor Salonu": ["Antrenör", "Sporcu", "Temizlikçi", "Doktor", "Seyirci", "Görevli"],
        "Stadyum": ["Hakem", "Oyuncu", "Antrenör", "Seyirci", "Satıcı", "Güvenlik"],
        "Sinema": ["Biletçi", "İzleyici", "Projeksiyoncu", "Görevli", "Temizlikçi", "Satıcı"],
        "Tiyatro": ["Oyuncu", "Yönetmen", "Seyirci", "Işıkçı", "Dekoratör", "Temizlikçi"],
        "Park": ["Çocuk", "Anne", "Baba", "Satıcı", "Koşucu", "Güvenlik"],
        "Hapishane": ["Gardiyan", "Mahkum", "Müdür", "Avukat", "Doktor", "Temizlikçi"],
        "Müze": ["Rehber", "Ziyaretçi", "Güvenlik", "Temizlikçi", "Öğrenci", "Sanatçı"],
        "Otogar": ["Şoför", "Biletçi", "Yolcu", "Güvenlik", "Satıcı", "Temizlikçi"],
        "Havaalanı": ["Pilot", "Hostes", "Yolcu", "Kontrol", "Güvenlik", "Bagaj Görevlisi"],
        "Denizaltı": ["Kaptan", "Mühendis", "Asker", "Aşçı", "Doktor", "Gözcü"],
        "Uzay Üssü": ["Astronot", "Komutan", "Mühendis", "Doktor", "Bilim İnsanı", "Teknisyen"],
        "Ofis": ["Sekreter", "Müdür", "Çalışan", "Temizlikçi", "Misafir", "Teknisyen"],
        "Kafe": ["Garson", "Barista", "Müşteri", "Kasiyer", "Temizlikçi", "Sokak Sanatçısı"],
        "Market": ["Kasiyer", "Müşteri", "Reyon Görevlisi", "Temizlikçi", "Güvenlik", "Depocu"],
        "Fabrika": ["İşçi", "Mühendis", "Müdür", "Teknisyen", "Temizlikçi", "Güvenlik"],
        "Otelde": ["Resepsiyonist", "Müşteri", "Temizlikçi", "Aşçı", "Güvenlik", "Bellboy"],
        "Bahçe": ["Bahçıvan", "Çocuk", "Ev Sahibi", "Komşu", "Kedi", "Köpek"],
        "Dağ Evi": ["Dağcı", "Avcı", "Turist", "Aşçı", "Rehber", "Köylü"],
        "Kışla": ["Asker", "Komutan", "Doktor", "Aşçı", "Temizlikçi", "Mühendis"],
        "Sahil": ["Balıkçı", "Cankurtaran", "Turist", "Satıcı", "Çocuk", "Güvenlik"],
        "Tatil Köyü": ["Turist", "Animatör", "Garson", "Aşçı", "Temizlikçi", "Yönetici"]
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
// Sekme kapanınca odadan çık
// ------------------------
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
