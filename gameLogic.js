let anonymousSignInPromise = null;

// Basit HTML kaçış fonksiyonu
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) =>
    ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[ch])
  );
}

// Konumlar ve kategoriler için veri havuzları
const POOLS = {
  locations: [
    "Havalimanı",
    "Hastane",
    "Restoran",
    "Okul",
    "Polis Merkezi",
    "İtfaiye",
    "Kütüphane",
    "Müze",
    "Sinema",
    "Stadyum",
    "Plaj",
    "Park",
    "Alışveriş Merkezi",
    "Tren Garı",
    "Otobüs Terminali",
    "Otel",
    "Üniversite",
    "Ofis",
    "Fabrika",
    "Banka",
    "Hayvanat Bahçesi",
    "Lunapark",
    "Çiftlik",
    "Akvaryum",
    "Tiyatro",
    "Kumarhane",
    "Uzay İstasyonu",
    "Korsan Gemisi",
    "Çöl",
    "Orman",
    "Dağ",
    "Köy",
    "Liman",
    "Denizaltı",
    "Depo"
  ],
  "Famous Turkish Actors": [
    "Kıvanç Tatlıtuğ",
    "Beren Saat",
    "Halit Ergenç",
    "Bergüzar Korel",
    "Kenan İmirzalıoğlu",
    "Tuba Büyüküstün",
    "Engin Akyürek",
    "Burak Özçivit",
    "Fahriye Evcen",
    "Çağatay Ulusoy",
    "Elçin Sangu",
    "Neslihan Atagül",
    "Serenay Sarıkaya",
    "Haluk Bilginer",
    "Nurgül Yeşilçay",
    "Binnur Kaya",
    "Demet Özdemir",
    "Özcan Deniz",
    "Aslı Enver",
    "Meryem Uzerli",
    "Nesrin Cavadzade",
    "Hazal Kaya",
    "Aras Bulut İynemli",
    "Cansu Dere",
    "İlker Kaleli",
    "Tolga Sarıtaş",
    "Hande Erçel",
    "Gülse Birsel",
    "Şener Şen",
    "Demet Evgar",
    "Afra Saraçoğlu",
    "Kadir İnanır",
    "Türkan Şoray",
    "Kerem Bürsin",
    "Birce Akalay"
  ]
};

// Yerelleştirilmiş kategori adları için takma adlar
POOLS["Ünlü Türk Oyuncular"] = POOLS["Famous Turkish Actors"];

// Havuzları global olarak dışa aktar
window.POOLS = POOLS;

// Fisher–Yates karıştırma yardımcıları
function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function samplePool(list, n) {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list.slice(0, n);
}

// Tüm oyunla ilgili mantık bu nesnede bulunur ve diğer betikler import etmeye gerek kalmadan
// `window.gameLogic` üzerinden erişebilsin diye global olarak ortaya çıkarılır.
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
            console.error("Anonim giriş hatası:", err);
            unsubscribe();
            resolve(null);
          });
      });
    }

    return anonymousSignInPromise;
  },
  saveSettings: async function (settings) {
    return window.db.ref("rooms/tmp/settings").set(settings);
  },
  /** Oda oluştur */
  createRoom: async function (options) {
    const {
      creatorName,
      ...settings
    } = options || {};
    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();

    const uid = await this.getUid();
    if (!uid) {
      alert("Kimlik doğrulaması tamamlanamadı. Lütfen tekrar deneyin.");
      return null;
    }

    const updates = {};
    updates[`rooms/${roomCode}/settings`] = settings;
    updates[`rooms/${roomCode}/players/${uid}`] = {
      name: creatorName,
      isCreator: true,
    };

    await window.db.ref().update(updates);

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

  /** Oyunculara roller atayın */
  assignRoles: async function (roomCode) {
    const settingsRef = window.db.ref(`rooms/${roomCode}/settings`);
    const playersRef = window.db.ref(`rooms/${roomCode}/players`);
    const [settingsSnap, playersSnap] = await Promise.all([
      settingsRef.get(),
      playersRef.get(),
    ]);
    if (!settingsSnap.exists() || !playersSnap.exists()) {
      throw new Error("Oda bulunamadı");
    }

    const settings = settingsSnap.val();
    const players = playersSnap.val() || {};
    const uids = Object.keys(players);
    const spyCount = Math.min(settings.spyCount || 0, uids.length);
    const spies = samplePool([...uids], spyCount);

    const updates = {};
    updates[`rooms/${roomCode}/spies`] = spies;

    const gameType = settings.gameType;
    const isLocationGame = gameType === "location";
    const isCategoryGame = gameType === "category";

    if (isLocationGame) {
      const pool = samplePool([...POOLS.locations], settings.poolSize);
      const chosenLocation = randomFrom(pool);
      uids.forEach((uid) => {
        const isSpy = spies.includes(uid);
        updates[`rooms/${roomCode}/playerRoles/${uid}`] = isSpy
          ? {
              isSpy: true,
              role: "Sahtekar",
              location: null,
              allLocations: pool,
            }
          : {
              isSpy: false,
              role: "Vatandaş",
              location: chosenLocation,
              allLocations: pool,
            };
      });
    } else if (isCategoryGame) {
      const categoryName = settings.categoryName;
      const allItems = POOLS[categoryName] || [];
      const pool = samplePool([...allItems], settings.poolSize);
      if (pool.length === 0) {
        throw new Error("Kategori havuzunda yeterli öğe yok");
      }
      const nonSpyCount = uids.length - spyCount;
      if (pool.length < nonSpyCount) {
        throw new Error("Kategori havuzunda yeterli öğe yok");
      }
      const rolesForPlayers = samplePool([...pool], nonSpyCount);
      let idx = 0;
      uids.forEach((uid) => {
        const isSpy = spies.includes(uid);
        updates[`rooms/${roomCode}/playerRoles/${uid}`] = isSpy
          ? {
              isSpy: true,
              role: "Sahtekar",
              location: null,
              allLocations: pool,
            }
          : {
              isSpy: false,
              role: rolesForPlayers[idx++],
              location: categoryName,
              allLocations: pool,
            };
      });
    } else {
      throw new Error("Bilinmeyen oyun türü");
    }

    await window.db.ref().update(updates);
  },

  startGame: async function (roomCode) {
    const settingsRef = window.db.ref(`rooms/${roomCode}/settings`);
    const playersRef = window.db.ref(`rooms/${roomCode}/players`);
    const [settingsSnap, playersSnap] = await Promise.all([
      settingsRef.get(),
      playersRef.get(),
    ]);
    if (!settingsSnap.exists() || !playersSnap.exists()) {
      throw new Error("Oda bulunamadı");
    }

    const settings = settingsSnap.val();
    const allPlayers = playersSnap.val() || {};
    const players = Object.fromEntries(
      Object.entries(allPlayers).filter(([_, p]) => p && p.name)
    );
    if (Object.keys(players).length !== Object.keys(allPlayers).length) {
      throw new Error("Tüm oyuncuların bir adı olmalıdır.");
    }
    const playerCount = Object.keys(players).length;

    if (playerCount < 3) {
      throw new Error("Oyun en az 3 oyuncu ile başlamalı.");
    }
    if (playerCount !== settings.playerCount) {
      throw new Error("Belirlenen oyuncu sayısına ulaşılmadı.");
    }

    await this.assignRoles(roomCode);
    await window.db.ref(`rooms/${roomCode}`).update({
      status: "started",
      round: 1,
      phase: "clue",
      votes: null,
      voteResult: null,
      votingStarted: false,
      voteRequests: null,
    });
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

      // Hem isim dizisini hem de ham oyuncu nesnesini geri çağrıya aktar
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
        playerListEl.innerHTML = players
          .map((p) => `<li>${escapeHtml(p)}</li>`)
          .join("");
      }

      // Oyun başladıysa rol göster
      if (roomData.status === "started") {
        const uid = await this.getUid();
        if (uid && roomData.playerRoles && roomData.playerRoles[uid]) {
          const myRole = roomData.playerRoles[uid];

          document.getElementById("roomInfo")?.classList.add("hidden");
          document.getElementById("playerRoleInfo")?.classList.remove("hidden");

          const isCategoryGame = roomData.settings?.gameType === "category";
          const roleEl = document.getElementById("roleMessage");
          if (myRole.isSpy) {
            const unknownText = isCategoryGame
              ? "Rolü bilmiyorsun."
              : "Konumu bilmiyorsun.";
            const label = isCategoryGame
              ? "Olası roller"
              : "Olası konumlar";
            roleEl.textContent =
              `🎭 Sen BİR SAHTEKARSIN! ${unknownText} ${label}: ${myRole.allLocations.join(", ")}`;
          } else {
            const locLabel = isCategoryGame ? "Kategori" : "Konum";
            roleEl.textContent =
              `✅ ${locLabel}: ${myRole.location} | Rolün: ${myRole.role}`;
          }
        }
      }
    });
  },

  // Oylamayı başlatma isteği gönder. Artık tüm oyuncuların onayı
  // bekleniyor; herhangi bir oyuncu düğmeye bastığında oylama hemen
  // başlamaz.
  startVote: function (roomCode, uid) {
    this.requestVotingStart(roomCode, uid);
  },

  requestVotingStart: function (roomCode, playerUid) {
    const ref = window.db.ref("rooms/" + roomCode);
    ref.child(`voteRequests/${playerUid}`).set(true).then(() => {
      ref.get().then((snap) => {
        if (!snap.exists()) return;
        const data = snap.val();
        const players = Object.keys(data.players || {});
        const requests = Object.keys(data.voteRequests || {});

        const allRequested = players.every((uid) => requests.includes(uid));
        if (allRequested) {
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
    const ref = window.db.ref("rooms/" + roomCode);
    ref
      .child(`votes/${voter}`)
      .set(target)
      .then(() => {
        ref.get().then((snap) => {
          if (!snap.exists()) return;
          const data = snap.val();
          const players = Object.keys(data.players || {});
          const votes = data.votes || {};
          if (
            Object.keys(votes).length === players.length &&
            !data.voteResult
          ) {
            this.tallyVotes(roomCode);
          }
        });
      });
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
      const role = votedRole ? votedRole.role : null;
      const location = votedRole ? votedRole.location : null;

      ref.update({
        voteResult: { voted, isSpy, role, location },
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
          removals.push(ref.child(`players/${data.voteResult.voted}`).remove());
          removals.push(ref.child(`playerRoles/${data.voteResult.voted}`).remove());
        }

      Promise.all(removals).then(() => {
        this.checkSpyWin(roomCode).then((spyWon) => {
          if (spyWon) {
            ref.update({ status: "finished" });
            return;
          }
            ref.update({ voteResult: null }).then(() => {
              this.nextRound(roomCode);
            });
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
      });
    });
  },
};

// main.js import gerektirmeden erişebilsin diye global olarak açığa çıkar
gameLogic.POOLS = POOLS;
window.gameLogic = gameLogic;
