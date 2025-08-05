let anonymousSignInPromise = null;

// All game related logic lives in this object and will be exposed globally
// as `window.gameLogic` so other scripts can use it without importing.
const gameLogic = {
  getUid: async function () {
    if (!window.auth) return null;
    if (window.auth.currentUser && window.auth.currentUser.uid) {
      return window.auth.currentUser.uid;
    }

    if (!anonymousSignInPromise) {
      anonymousSignInPromise = new Promise((resolve) => {
        const unsubscribe = window.auth.onAuthStateChanged((user) => {
          if (user && user.uid) {
            unsubscribe();
            resolve(user.uid);
          }
        });
        window.auth
          .signInAnonymously()
          .catch((err) => {
            console.error("Anonymous sign-in error:", err);
            unsubscribe();
            resolve(null);
          });
      });
    }

    return anonymousSignInPromise;
  },
  /** Oda oluştur */
  createRoom: async function (
    creatorName,
    playerCount,
    spyCount,
    useRoles,
    questionCount,
    guessCount,
    canEliminate
  ) {
    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();

    const uid = await this.getUid();
    if (!uid) {
      alert("Kimlik doğrulaması tamamlanamadı. Lütfen tekrar deneyin.");
      return null;
    }

    const roomData = {
      creator: creatorName,
      settings: {
        playerCount: Number(playerCount),
        spyCount: Number(spyCount),
        useRoles,
        questionCount: Number(questionCount),
        guessCount: Number(guessCount),
        canEliminate,
        creatorUid: uid,
      },
      status: "waiting",
      createdAt: Date.now(),
      players: {
        [uid]: {
          name: creatorName,
          isCreator: true,
        },
      },
    };

    // Save room data with creator player in a single set call
    await window.db.ref(`rooms/${roomCode}`).set(roomData);

    localStorage.setItem("roomCode", roomCode);
    localStorage.setItem("playerName", creatorName);
    localStorage.setItem("isCreator", "true");

    return roomCode;
  },

  /** Odaya katıl */
  joinRoom: async function (playerName, roomCode) {
    const roomRef = window.db.ref("rooms/" + roomCode);
    const snapshot = await roomRef.get();
    if (!snapshot.exists()) {
      throw new Error("Oda bulunamadı!");
    }

    const roomData = snapshot.val();
    const players = roomData.players || {};

    if (Object.keys(players).length >= roomData.settings.playerCount) {
      throw new Error("Oda dolu!");
    }

    const uid = await this.getUid();
    if (!uid) {
      throw new Error("Kimlik doğrulanamadı");
    }
    const playerRef = window.db.ref(`rooms/${roomCode}/players/${uid}`);
    await playerRef.set({ name: playerName, isCreator: false });

    const updatedPlayers = {
      ...players,
      [uid]: { name: playerName, isCreator: false },
    };

    return Object.values(updatedPlayers).map((p) => p.name);
  },

  /** Odayı sil */
  deleteRoom: function (roomCode) {
    return window.db.ref("rooms/" + roomCode).remove();
  },

  /** Odadan çık */
  leaveRoom: async function (roomCode) {
    const uid = await this.getUid();
    if (!uid) return Promise.resolve();
    const playerRef = window.db.ref(`rooms/${roomCode}/players/${uid}`);
    localStorage.clear();
    return playerRef.remove();
  },

  /** Oyuncuları canlı dinle */
  listenPlayers: function (roomCode, callback) {
    const playersRef = window.db.ref(`rooms/${roomCode}/players`);
    playersRef.on("value", (snapshot) => {
      const playersObj = snapshot.val() || {};
      const playersArr = Object.entries(playersObj).map(([uid, p]) => ({
        uid,
        ...p,
      }));

      // Pass both the names array and the raw players object to the callback
      const playerNames = playersArr.map((p) => p.name);
      callback(playerNames, playersObj);

      const uids = Object.keys(playersObj);

      // Oda tamamen boşaldıysa kapat
      if (uids.length === 0) {
        window.db.ref("rooms/" + roomCode).remove();
        localStorage.clear();
        location.reload();
      }

      // Kurucu ayrıldıysa ve oyun başlamadıysa odayı kapat
      const roomRef = window.db.ref(`rooms/${roomCode}`);
      roomRef.get().then((snap) => {
        const data = snap.val();
        const creatorUid = data?.settings?.creatorUid;
        if (
          data &&
          data.status !== "started" &&
          (!creatorUid || !uids.includes(creatorUid))
        ) {
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

    roomRef.on("value", async (snapshot) => {
      const roomData = snapshot.val();
      if (!roomData) return;

      // Oyuncu listesi güncelle
      const playersObj = roomData.players || {};
      const players = Object.values(playersObj).map((p) => p.name);
      const playerListEl = document.getElementById("playerList");
      if (playerListEl) {
        playerListEl.innerHTML = players.map((p) => `<li>${p}</li>`).join("");
      }

      // Oyun başladıysa rol göster
      if (roomData.status === "started") {
        const uid = await this.getUid();
        if (uid && roomData.playerRoles && roomData.playerRoles[uid]) {
          const myRole = roomData.playerRoles[uid];

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

      if (players.length < 4) {
        alert("Oyuna başlamak için en az 4 oyuncu olmalıdır!");
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
        guessResult: null,
      });
    });
  },

  /**
   * Bir oyuncu oylamayı başlatma isteği gönderdiğinde çağrılır.
   * Tüm oyuncular isteği gönderdiğinde oylama otomatik başlar.
   */
  requestVotingStart: function (roomCode, playerUid) {
    const ref = window.db.ref("rooms/" + roomCode);
    ref.child(`voteRequests/${playerUid}`).set(true).then(() => {
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

  guessLocation: function (roomCode, playerUid, guessedLocation) {
    const ref = window.db.ref("rooms/" + roomCode);
    ref.get().then((snap) => {
      if (!snap.exists()) return;
      const data = snap.val();
      if (
        data.status !== "started" ||
        !data.spies ||
        !data.spies.includes(playerUid) ||
        (data.settings && data.settings.guessCount <= 0) ||
        data.guessResult
      ) {
        return;
      }

      const remaining = data.settings?.guessCount || 0;
      const correct = data.location === guessedLocation;

      if (correct) {
        ref.update({
          guessResult: { guesser: playerUid, guessedLocation, correct: true },
          status: "finished",
        });
      } else if (remaining > 1) {
        ref.update({
          'settings/guessCount': remaining - 1,
          guessResult: { correct: false },
        });
      } else {
        ref.update({
          'settings/guessCount': 0,
          guessResult: { guesser: playerUid, guessedLocation, correct: false },
          status: "finished",
        });
      }
    });
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

  endRound: function (roomCode) {
    const ref = window.db.ref("rooms/" + roomCode);
    ref.get().then((snap) => {
      if (!snap.exists()) return;
      const data = snap.val();
      const removals = [];
      if (data.voteResult && data.voteResult.voted && !data.voteResult.isSpy) {
        removals.push(
          ref.child(`eliminations/${data.voteResult.voted}`).set("vote")
        );
        removals.push(ref.child(`players/${data.voteResult.voted}`).remove());
        removals.push(ref.child(`playerRoles/${data.voteResult.voted}`).remove());
      }

      Promise.all(removals).then(() => {
        this.checkSpyWin(roomCode).then((spyWon) => {
          if (spyWon) return;
          ref.get().then((snap2) => {
            const data2 = snap2.val();
            if (data2.settings && data2.settings.canEliminate) {
              ref.update({ eliminationPending: true, voteResult: null });
            } else {
              ref.update({ voteResult: null }).then(() => {
                this.nextRound(roomCode);
              });
            }
          });
        });
      });
    });
  },

  eliminatePlayer: function (roomCode, target) {
    const ref = window.db.ref("rooms/" + roomCode);
    ref
      .update({ [`eliminations/${target}`]: "impostor", eliminationPending: false })
      .then(() => {
        Promise.all([
          ref.child(`players/${target}`).remove(),
          ref.child(`playerRoles/${target}`).remove(),
        ]).then(() => {
          this.checkSpyWin(roomCode).then((spyWon) => {
            if (spyWon) return;
            this.nextRound(roomCode);
          });
        });
      });
  },

  checkSpyWin: function (roomCode) {
    const ref = window.db.ref("rooms/" + roomCode);
    return ref.get().then((snap) => {
      if (!snap.exists()) return false;
      const data = snap.val();
      const players = Object.keys(data.players || {});
      const activeSpies = (data.spies || []).filter((s) => players.includes(s));
      const innocentCount = players.length - activeSpies.length;
      if (innocentCount <= 1) {
        ref.update({ status: "finished", winner: "spy", spyParityWin: true });
        return true;
      }
      return false;
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
        eliminationPending: false,
      });
    });
  },
};

// Expose globally so that main.js can access it without imports
window.gameLogic = gameLogic;
