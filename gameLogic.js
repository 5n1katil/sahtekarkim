import { escapeHtml } from './utils.js';
import { TR_ACTORS } from './data/characters_tr_actors.js';

let anonymousSignInPromise = null;

const MIN_PLAYERS = 3;
const ROOM_PLAYER_LIMIT = 20;

function generateRoundId() {
  const newRef = window.db.ref().push();
  return newRef.key || String(Date.now());
}

function getSpyUids(spies) {
  if (Array.isArray(spies)) return spies;
  if (spies && typeof spies === "object") return Object.keys(spies);
  return [];
}

function appendFinalSpyInfo(updates, data) {
  if (data?.final?.spyNames) return updates;

  const spies = data?.spies;
  const playerNames = data?.playerNames || {};
  const players = data?.players || {};
  const spyUids = getSpyUids(spies);
  if (spyUids.length === 0) return updates;

  const spyNames = spyUids.map(
    (uid) => playerNames?.[uid] || players?.[uid]?.name || uid
  );
  const finalState = data?.final || {};
  updates.final = {
    ...finalState,
    spyUids,
    spyNames,
    revealedAt:
      finalState.revealedAt || window.firebase.database.ServerValue.TIMESTAMP,
  };

  return updates;
}

function deriveSpyDetails(data) {
  const roles = data?.playerRoles || {};
  const players = data?.players || {};
  const spyCandidates = new Set(getSpyUids(data?.spies));

  Object.entries(roles).forEach(([uid, role]) => {
    if (!role) return;
    if (role.isSpy || role.roleType === "spy" || role.isImpostor) {
      spyCandidates.add(uid);
    }
  });

  const spies = [];
  spyCandidates.forEach((uid) => {
    const name = players?.[uid]?.name;
    if (name && String(name).trim() !== "") {
      spies.push({ uid, name });
    }
  });

  return spies;
}

function normalizeWinnerValue(winner) {
  if (winner === "innocent") return "innocents";
  if (winner === "spy") return "spies";
  return winner;
}

async function ensureSpiesSnapshot(roomCode, data, spiesOverride) {
  if (Array.isArray(data?.spiesSnapshot?.spies)) {
    const cleaned = data.spiesSnapshot.spies.filter(
      (s) => s && s.uid && s.name
    );
    if (cleaned.length > 0) return cleaned;
  }

  const spies = Array.isArray(spiesOverride)
    ? spiesOverride
    : deriveSpyDetails(data);
  if (!spies.length) return spies;

  const snapshotRef = window.db.ref(`rooms/${roomCode}/spiesSnapshot`);
  await snapshotRef.transaction((current) => {
    if (current && Array.isArray(current.spies) && current.spies.length > 0) {
      return current;
    }
    return {
      createdAt: window.firebase.database.ServerValue.TIMESTAMP,
      roundId: data?.roundId || null,
      spies,
    };
  });

  return spies;
}

async function finalizeGameOver(roomCode, data, payload) {
  const existingSpies = Array.isArray(data?.spiesSnapshot?.spies)
    ? data.spiesSnapshot.spies.filter((s) => s && s.uid && s.name)
    : [];

  let spies = existingSpies;
  if (!spies.length) {
    spies = await ensureSpiesSnapshot(roomCode, data);
  }
  if (!spies.length) {
    spies = deriveSpyDetails(data);
  }
  const winner = normalizeWinnerValue(payload?.winner);
  const spyNames = formatSpyNames(spies, data);
  const gameOver = {
    ...payload,
    winner,
    spies,
    spyNames,
    roundId: data?.roundId || null,
    finalizedAt: window.firebase.database.ServerValue.TIMESTAMP,
  };

  const ref = window.db.ref(`rooms/${roomCode}/gameOver`);
  return ref.transaction((current) => {
    if (current?.finalizedAt) return undefined;
    return gameOver;
  });
}

function sanitizeName(name) {
  if (typeof name !== "string") return name;
  const trimmed = name.trim();
  if (!trimmed) return null;
  const cleaned = trimmed.replace(/^[()]+|[()]+$/g, "").trim();
  return cleaned || null;
}

function uniqueNames(names) {
  const seen = new Set();
  return names.filter((name) => {
    if (!name) return false;
    const key = typeof name === "string" ? name.toLowerCase() : name;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatSpyNames(spies, data) {
  const players = data?.players || {};
  const spyNames = (spies || [])
    .map((s) => {
      const uid = s?.uid ?? s;
      const rawName =
        (uid && players?.[uid]?.name) ||
        (typeof s === "object" ? s?.name : null) ||
        (typeof uid === "string" ? uid : null);
      return sanitizeName(rawName);
    })
    .filter(Boolean);

  return uniqueNames(spyNames);
}

async function getSpyNamesForMessage(roomCode, data, spiesOverride) {
  const snapshotSpies = Array.isArray(data?.spiesSnapshot?.spies)
    ? data.spiesSnapshot.spies.filter((s) => s && s.uid && s.name)
    : [];

  let spies = snapshotSpies;
  if (!spies.length) {
    spies = await ensureSpiesSnapshot(roomCode, data, spiesOverride);
  }
  if (!Array.isArray(spies) || spies.length === 0) {
    spies = Array.isArray(spiesOverride) && spiesOverride.length
      ? spiesOverride
      : deriveSpyDetails(data);
  }

  const spyNames = formatSpyNames(spies, data);
  return { spies, spyNames };
}

function formatSpyLabel(spyNames) {
  const count = Array.isArray(spyNames) ? spyNames.length : 0;
  return count <= 1 ? "Sahtekar" : "Sahtekarlar";
}

function formatSpyIntro(spyNames) {
  const names = Array.isArray(spyNames) ? spyNames : [];
  const label = formatSpyLabel(names);
  const namesText = names.join(", ");
  return namesText ? `${label} ${namesText}` : label;
}

// Konumlar ve kategoriler için veri havuzları
export const POOLS = {
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
  "Ünlü Türk Oyuncular": TR_ACTORS,
  "Türk Şarkıcılar": [
    "Sezen Aksu",
    "Tarkan",
    "Ajda Pekkan",
    "Sertab Erener",
    "Hadise",
    "Barış Manço",
    "Zeki Müren",
    "Mabel Matiz",
    "Kenan Doğulu",
    "Gülşen",
    "Edis",
    "Murat Boz",
    "Aleyna Tilki",
    "Berkay",
    "Teoman",
    "Gökhan Özen",
    "Sıla",
    "Hakan Peker",
    "Ceza",
    "Sagopa Kajmer",
    "Mustafa Sandal",
    "İbrahim Tatlıses",
    "Nil Karaibrahimgil",
    "Yıldız Tilbe",
    "Demet Akalın",
    "Hande Yener",
    "Nazan Öncel",
    "Funda Arar",
    "Gökçe",
    "İrem Derici",
    "Mahsun Kırmızıgül",
    "Cem Adrian",
    "Zehra"
  ],
  "Medya ve Influencerlar": [
    "Acun Ilıcalı",
    "Beyazıt Öztürk",
    "Mehmet Ali Erbil",
    "Okan Bayülgen",
    "Cüneyt Özdemir",
    "Çağla Şikel",
    "Ece Üner",
    "Seren Serengil",
    "Seda Sayan",
    "Müge Anlı",
    "Fatih Portakal",
    "Ali İhsan Varol",
    "Enes Batur",
    "Danla Bilic",
    "Orkun Işıtmak",
    "Reynmen",
    "Ruhi Çenet",
    "Barış Özcan",
    "Duygu Özaslan",
    "Doğan Kabak",
    "Meryem Can",
    "Berkcan Güven",
    "Cemre Solmaz",
    "Kendine Müzisyen",
    "Furkan Yaman",
    "Tolga Çevik",
    "Mesut Can Tomay",
    "Kafalar",
    "Büşra Pekin",
    "Şeyma Subaşı",
    "Haluk Levent",
    "Ceyda Kasabalı",
    "Yasemin Sakallıoğlu"
  ],
  "Politikacılar": [
    "Recep Tayyip Erdoğan",
    "Kemal Kılıçdaroğlu",
    "Devlet Bahçeli",
    "Meral Akşener",
    "Ekrem İmamoğlu",
    "Mansur Yavaş",
    "Abdullah Gül",
    "Ahmet Davutoğlu",
    "Ali Babacan",
    "Binali Yıldırım",
    "Süleyman Soylu",
    "Bekir Bozdağ",
    "Mehmet Şimşek",
    "Fuat Oktay",
    "Numan Kurtulmuş",
    "Nureddin Nebati",
    "Hulusi Akar",
    "Fahrettin Koca",
    "Mevlüt Çavuşoğlu",
    "Selahattin Demirtaş",
    "Figen Yüksekdağ",
    "Ahmet Türk",
    "Pervin Buldan",
    "Doğu Perinçek",
    "Temel Karamollaoğlu",
    "Muharrem İnce",
    "Ümit Özdağ",
    "Ömer Çelik",
    "Tanju Özcan",
    "Veli Ağbaba",
    "Mustafa Sarıgül",
    "Tansu Çiller",
    "Necmettin Erbakan",
    "İsmet İnönü"
  ],
  "Animasyon Karakterleri": [
    "Mickey Mouse",
    "Bugs Bunny",
    "Homer Simpson",
    "Bart Simpson",
    "Lisa Simpson",
    "Marge Simpson",
    "SpongeBob SquarePants",
    "Patrick Star",
    "Squidward Tentacles",
    "Dora the Explorer",
    "Shrek",
    "Donkey",
    "Fiona",
    "Rick Sanchez",
    "Morty Smith",
    "Naruto Uzumaki",
    "Sasuke Uchiha",
    "Son Goku",
    "Vegeta",
    "Pikachu",
    "Ash Ketchum",
    "Tom Cat",
    "Jerry Mouse",
    "Scooby-Doo",
    "Fred Flintstone",
    "Wilma Flintstone",
    "Barney Rubble",
    "Betty Rubble",
    "Popeye",
    "Olive Oyl",
    "Donald Duck",
    "Goofy",
    "Woody",
    "Buzz Lightyear"
  ],
  "Dizi Karakterleri": [
    "Polat Alemdar",
    "Memati Baş",
    "Süleyman Çakır",
    "Ezel Bayraktar",
    "Ramiz Karaeski",
    "Behlül Haznedar",
    "Bihter Yöreoğlu",
    "Adnan Ziyagil",
    "Fatmagül Ketenci Ilgaz",
    "Kerim Ilgaz",
    "Mecnun Çınar",
    "Leyla Yıldız",
    "İsmail Abi",
    "Behzat Ç.",
    "Harun",
    "Yaman Koper",
    "Mira Beylice",
    "Feriha Yılmaz",
    "Emir Sarrafoğlu",
    "Hürrem Sultan",
    "Kanuni Sultan Süleyman",
    "Şehzade Mustafa",
    "Mihrimah Sultan",
    "Mahmut",
    "Yıldız",
    "Ender",
    "Onur",
    "Seymen Karadağ",
    "Ferhunde",
    "Ali Rıza Bey",
    "Deniz",
    "Zeynep",
    "Ömer",
    "Ali Kaptan"
  ],
  "Fantastik Karakterler": [
    "Harry Potter",
    "Hermione Granger",
    "Ron Weasley",
    "Albus Dumbledore",
    "Lord Voldemort",
    "Gandalf",
    "Frodo Baggins",
    "Aragorn",
    "Legolas",
    "Gimli",
    "Bilbo Baggins",
    "Samwise Gamgee",
    "Galadriel",
    "Saruman",
    "Gollum",
    "Sauron",
    "Jon Snow",
    "Daenerys Targaryen",
    "Tyrion Lannister",
    "Cersei Lannister",
    "Arya Stark",
    "Eddard Stark",
    "Robb Stark",
    "Bran Stark",
    "Night King",
    "Geralt of Rivia",
    "Yennefer",
    "Dandelion",
    "Triss Merigold",
    "Batman",
    "Superman",
    "Wonder Woman",
    "Iron Man",
    "Spider-Man"
  ],
  "En iyiler (Karışık)": [
    "Recep Tayyip Erdoğan",
    "Ekrem İmamoğlu",
    "Mansur Yavaş",
    "Kemal Kılıçdaroğlu",
    "Meral Akşener",
    "Devlet Bahçeli",
    "Aleyna Tilki",
    "Tarkan",
    "Sezen Aksu",
    "Ajda Pekkan",
    "Hadise",
    "Zeynep Bastık",
    "Kenan Doğulu",
    "Edis",
    "Mabel Matiz",
    "Buray",
    "Demet Akalın",
    "Cem Yılmaz",
    "Şahan Gökbakar",
    "Hasan Can Kaya",
    "Acun Ilıcalı",
    "Barış Özcan",
    "Enes Batur",
    "Reynmen",
    "Danla Bilic",
    "Orkun Işıtmak",
    "Kıvanç Tatlıtuğ",
    "Beren Saat",
    "Serenay Sarıkaya",
    "Çağatay Ulusoy",
    "Hande Erçel",
    "Burak Özçivit",
    "Afra Saraçoğlu",
    "Mert Ramazan Demir",
    "Pınar Deniz",
    "Aras Bulut İynemli",
    "Kerem Bürsin",
    "Engin Akyürek",
    "Hazal Kaya",
    "Cristiano Ronaldo",
    "Lionel Messi",
    "Kylian Mbappé",
    "Erling Haaland",
    "Neymar",
    "Karim Benzema",
    "Robert Lewandowski",
    "Zlatan İbrahimović",
    "Diego Maradona",
    "Pelé",
    "Ronaldinho",
    "David Beckham",
    "Novak Djokovic",
    "Roger Federer",
    "Rafael Nadal",
    "Michael Phelps",
    "Usain Bolt",
    "Simone Biles",
    "LeBron James",
    "Stephen Curry",
    "Giannis Antetokounmpo",
    "Nikola Jokic",
    "Michael Jordan",
    "Muhammad Ali",
    "Mike Tyson",
    "Khabib Nurmagomedov",
    "Conor McGregor",
    "Harry Potter",
    "Hermione Granger",
    "Ron Weasley",
    "Lord Voldemort",
    "Albus Dumbledore",
    "Batman",
    "Superman",
    "Wonder Woman",
    "Spider-Man",
    "Iron Man",
    "Captain America",
    "Thor",
    "Loki",
    "Thanos",
    "Black Panther",
    "Deadpool",
    "Joker",
    "Harley Quinn",
    "Homer Simpson",
    "Bart Simpson",
    "SpongeBob SquarePants",
    "Patrick Star",
    "Rick Sanchez",
    "Morty Smith",
    "BoJack Horseman",
    "Walter White",
    "Jesse Pinkman",
    "Saul Goodman",
    "Eleven",
    "Jon Snow",
    "Daenerys Targaryen",
    "Arya Stark",
    "Tyrion Lannister",
    "Darth Vader",
    "Luke Skywalker",
    "Yoda",
    "The Mandalorian",
    "Grogu"
  ]
};

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

// Tüm oyunla ilgili mantık bu nesnede bulunur.
export const gameLogic = {
  /**
   * Firebase bazen anonim oturumun süresi dolduğunda veya tarayıcı
   * bağlamı değiştiğinde yazma isteğini PERMISSION_DENIED ile
   * reddedebiliyor. Bu yardımcı, oturumu sıfırlayıp yeni bir anonim
   * kullanıcı alarak basit bir yeniden deneme yapar.
   */
  forceReauth: async function () {
    if (!window.auth) return null;

    try {
      if (window.auth.currentUser) {
        await window.auth.signOut();
      }
    } catch (err) {
      console.warn("Mevcut oturum kapatılamadı:", err);
    }

    try {
      await window.auth.signInAnonymously();
      return await new Promise((resolve, reject) => {
        let unsubscribe = () => {};
        const timeout = setTimeout(() => {
          unsubscribe();
          reject(new Error("Anonim oturum zaman aşımına uğradı"));
        }, 5000);

        unsubscribe = window.auth.onAuthStateChanged((user) => {
          if (user && user.uid) {
            clearTimeout(timeout);
            unsubscribe();
            resolve(user.uid);
          }
        });
      });
    } catch (err) {
      console.error("Anonim yeniden oturum açma başarısız:", err);
      return null;
    }
  },
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
    const uid = await this.getUid();
    if (!uid) {
      throw new Error("Kimlik doğrulaması tamamlanamadı");
    }
    const { spyGuessLimit, ...rest } = settings;
    return window.db
      .ref(`savedSettings/${uid}`)
      .set({ ...rest, spyGuessLimit });
  },

  loadSettings: async function () {
    const uid = await this.getUid();
    if (!uid) {
      return null;
    }
    const snap = await window.db.ref(`savedSettings/${uid}`).get();
    return snap.exists() ? snap.val() : null;
  },
  /** Oda oluştur */
  createRoom: async function (options) {
    const {
      creatorName,
      spyGuessLimit,
      ...settings
    } = options || {};
    const roomCode = Math.random().toString(36).substring(2, 7).toUpperCase();

    const uid = await this.getUid();
    if (!uid) {
      alert("Kimlik doğrulaması tamamlanamadı. Lütfen tekrar deneyin.");
      return null;
    }

    const roomRef = window.db.ref(`rooms/${roomCode}`);
    const roomData = {
      creatorUid: uid,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      status: "waiting",
      settings: { ...settings, spyGuessLimit },
      players: {
        [uid]: {
          name: creatorName,
          isCreator: true,
        },
      },
    };

    try {
      await roomRef.set(roomData);
    } catch (err) {
      const code = (err?.code || "").toLowerCase();
      if (code.includes("permission")) {
        console.warn("Oda oluşturma isteği yetki hatasıyla reddedildi, yeniden denenecek", err);
        const refreshedUid = await this.forceReauth();
        if (refreshedUid) {
          try {
            roomData.creatorUid = refreshedUid;
            roomData.players[refreshedUid] = roomData.players[uid];
            delete roomData.players[uid];
            await roomRef.set(roomData);
          } catch (retryErr) {
            const retryCode = (retryErr?.code || "").toLowerCase();
            if (retryCode.includes("permission")) {
              throw new Error(
                "Oda oluşturma yetkisi reddedildi. Tarayıcı çerezlerini temizleyip sayfayı yenilemeyi deneyin veya yöneticiden veritabanı kurallarını doğrulamasını isteyin."
              );
            }
            throw retryErr;
          }
        } else {
          throw new Error(
            "Oturum doğrulanamadı. Lütfen sayfayı yenileyip yeniden deneyin."
          );
        }
      } else {
        throw err;
      }
    }

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

    if (Object.keys(players).length >= ROOM_PLAYER_LIMIT) {
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
  assignRoles: async function (roomCode, roundId) {
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
    const spyUids = samplePool([...uids], spyCount);

    const updates = {};
    updates[`rooms/${roomCode}/spies`] = spyUids.reduce((acc, uid) => {
      acc[uid] = true;
      return acc;
    }, {});
    updates[`rooms/${roomCode}/playerNames`] = uids.reduce((acc, uid) => {
      const name = players[uid]?.name;
      if (name) acc[uid] = name;
      return acc;
    }, {});

    const gameType = settings.gameType;
    const isLocationGame = gameType === "location";
    const isCategoryGame = gameType === "category";

    if (isLocationGame) {
      const pool = samplePool([...POOLS.locations], settings.poolSize);
      const chosenLocation = randomFrom(pool);
      uids.forEach((uid) => {
        const isSpy = spyUids.includes(uid);
        updates[`rooms/${roomCode}/playerRoles/${uid}`] = isSpy
          ? {
              isSpy: true,
              role: "Sahtekar",
              location: null,
              allLocations: pool,
              guessesLeft: settings.spyGuessLimit,
            }
          : {
              isSpy: false,
              role: "Masum",
              location: chosenLocation,
              allLocations: pool,
            };
      });
    } else if (isCategoryGame) {
      const categoryName = settings.categoryName;
      const allItems = POOLS[categoryName] || [];
      const pool = samplePool([...allItems], settings.poolSize);
      if (pool.length < 1) {
        throw new Error("Kategori havuzunda yeterli öğe yok");
      }
      const chosenRole = randomFrom(pool);
      const chosenRoleIsObject = chosenRole && typeof chosenRole === "object";
      const poolNames = pool.map((item) => {
        if (item && typeof item === "object") {
          return item.name ?? "";
        }
        return item ?? "";
      });
      const chosenRoleName =
        chosenRole && typeof chosenRole === "object"
          ? chosenRole.name ?? ""
          : chosenRole;
      const chosenRoleHint =
        chosenRoleIsObject ? chosenRole.hint ?? null : null;
      const chosenRoleFameTier = chosenRoleIsObject
        ? chosenRole.fameTier ?? chosenRole.tier ?? null
        : null;
      uids.forEach((uid) => {
        const isSpy = spyUids.includes(uid);
        updates[`rooms/${roomCode}/playerRoles/${uid}`] = isSpy
          ? {
              isSpy: true,
              role: "Sahtekar",
              location: null,
              allLocations: poolNames,
              guessesLeft: settings.spyGuessLimit,
            }
          : {
              isSpy: false,
              role: chosenRole,
              roleName: chosenRoleName,
              location: categoryName,
              allLocations: poolNames,
              ...(chosenRoleIsObject
                ? {
                    roleHint: chosenRoleHint,
                    ...(chosenRoleFameTier !== null
                      ? { roleFameTier: chosenRoleFameTier }
                      : {}),
                  }
                : {}),
            };
      });
    } else {
      throw new Error("Bilinmeyen oyun türü");
    }

    const spiesArr = spyUids
      .map((uid) => ({ uid, name: players[uid]?.name || "" }))
      .filter((s) => s.name);

    await window.db.ref().update(updates);
    await window.db
      .ref(`rooms/${roomCode}/spiesSnapshot`)
      .transaction((current) => {
        if (current && Array.isArray(current.spies) && current.spies.length) {
          return current;
        }
        return {
          createdAt: window.firebase.database.ServerValue.TIMESTAMP,
          roundId: roundId || null,
          spies: spiesArr,
        };
      });
  },

  startGame: async function (roomCode) {
    const roundId = generateRoundId();
    const settingsRef = window.db.ref(`rooms/${roomCode}/settings`);
    const playersRef = window.db.ref(`rooms/${roomCode}/players`);
    const [settingsSnap, playersSnap] = await Promise.all([
      settingsRef.get(),
      playersRef.get()
    ]);
    const settings = settingsSnap.val();
    const allPlayers = playersSnap.val() || {};
    const players = Object.fromEntries(
      Object.entries(allPlayers).filter(([_, p]) => p && p.name)
    );
    if (Object.keys(players).length !== Object.keys(allPlayers).length) {
      throw new Error("Tüm oyuncuların bir adı olmalıdır.");
    }
    const playerCount = Object.keys(players).length;

    if (playerCount < MIN_PLAYERS) {
      throw new Error("Oyunu başlatmak için en az 3 oyuncu gerekli.");
    }

    await this.assignRoles(roomCode, roundId);
    await window.db.ref(`rooms/${roomCode}`).update({
      roundId,
      status: "started",
      round: 1,
      phase: "clue",
      votes: null,
      voteResult: null,
      votingStarted: false,
      voteRequests: null,
      voteStartRequests: null,
      voting: null,
      guess: null,
      lastGuess: null,
      eliminated: null,
      eliminatedUid: null,
      winner: null,
      spyParityWin: null,
      gameOver: null,
      final: null,
      spiesSnapshot: null,
    });
  },

  restartGame: async function (roomCode) {
    const roomRef = window.db.ref(`rooms/${roomCode}`);
    const settingsRef = roomRef.child("settings");
    const playersRef = roomRef.child("players");
    const eliminatedRef = roomRef.child("eliminated");
    const [settingsSnap, playersSnap, eliminatedSnap] = await Promise.all([
      settingsRef.get(),
      playersRef.get(),
      eliminatedRef.get(),
    ]);
    const settings = settingsSnap.val();
    const players = playersSnap.val() || {};
    const eliminatedPlayers = eliminatedSnap.val() || {};

    // Re-add eliminated players before restarting
    await Promise.all(
      Object.entries(eliminatedPlayers).map(([uid, pdata]) =>
        playersRef.child(uid).set(pdata)
      )
    );

    // Clear eliminated list
    if (Object.keys(eliminatedPlayers).length > 0) {
      await eliminatedRef.remove();
    }

    const allPlayers = { ...players, ...eliminatedPlayers };
    const playerCount = Object.keys(allPlayers).length;
    if (playerCount < MIN_PLAYERS) {
      throw new Error("Oyunu başlatmak için en az 3 oyuncu gerekli.");
    }
    await roomRef.update({
      status: "waiting",
      round: 0,
      roundId: null,
      votes: null,
      voteResult: null,
      votingStarted: false,
      voteRequests: null,
      voteStartRequests: null,
      voting: null,
      guess: null,
      spies: null,
      spiesSnapshot: null,
      playerRoles: null,
      winner: null,
      spyParityWin: null,
      lastGuess: null,
      eliminated: null,
      gameOver: null,
      final: null,
    });
    // Start game after players have been restored and room reset
    await this.startGame(roomCode);
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

  // Oylamayı başlatma isteği kaydet
  startVote: function (roomCode, uid) {
    const requestRef = window.db.ref(
      `rooms/${roomCode}/voteStartRequests/${uid}`
    );
    requestRef.set(true).then(() => {
      const roomRef = window.db.ref(`rooms/${roomCode}`);
      roomRef.get().then((snap) => {
        if (!snap.exists()) return;
        const data = snap.val();
        if (data.voting?.active) return;
        if (data.voting?.result?.finalizedAt) return;
        const requests = data.voteStartRequests || {};
        const alivePlayers = Object.entries(data.playerRoles || {}).map(
          ([id]) => ({
            uid: id,
            name: data.players?.[id]?.name || id,
          })
        );
        const aliveUids = alivePlayers.map((p) => p.uid);
        const requestCount = Object.keys(requests).filter((id) =>
          aliveUids.includes(id)
        ).length;
        const threshold = Math.ceil(alivePlayers.length / 2);
        if (alivePlayers.length && requestCount >= threshold) {
          this.startVoting(roomCode, alivePlayers);
        }
      });
    });
  },

  startVoting: function (roomCode, playersSnapshot) {
    const ref = window.db.ref("rooms/" + roomCode);
    const snapshotPromise = playersSnapshot
      ? Promise.resolve(
          (playersSnapshot || []).map((p) => ({
            uid: p.uid || p.id,
            name: p.name,
          }))
        )
      : Promise.all([
          ref.child("playerRoles").get(),
          ref.child("players").get(),
        ]).then(([rolesSnap, playersSnap]) => {
          const roles = rolesSnap.val() || {};
          const players = playersSnap.val() || {};
          return Object.keys(roles).map((uid) => ({
            uid,
            name: players?.[uid]?.name || uid,
          }));
        });

    snapshotPromise.then((snapshotPlayers) => {
      ref.get().then((snap) => {
        if (!snap.exists()) return;
        const data = snap.val() || {};
        if (data.voting?.active) return;
        if (data.voting?.result?.finalizedAt) return;

        const snapshotOrder = (snapshotPlayers || []).map((p) => p.uid);
        const snapshotNames = (snapshotPlayers || []).reduce((acc, p) => {
          if (p?.uid) acc[p.uid] = p.name;
          return acc;
        }, {});
        const aliveAtStart = snapshotOrder.reduce((acc, uid) => {
          acc[uid] = true;
          return acc;
        }, {});

        ref
          .update({
            phase: "voting",
            votingStarted: true,
            votes: null,
            voteResult: null,
            voteRequests: null,
            voteStartRequests: null,
            voting: {
              active: true,
              startedAt: window.firebase.database.ServerValue.TIMESTAMP,
              endsAt: null,
              roster: snapshotPlayers || [],
              result: null,
              snapshot: {
                order: snapshotOrder,
                names: snapshotNames,
                aliveAtStart,
              },
              snapshotPlayers: snapshotPlayers || [],
            },
          })
          .then(() => {
            ref
              .child("voting/startedAt")
              .get()
              .then((snap) => {
                const startedAt = snap.val();
                if (!startedAt) return;
                ref.child("voting/endsAt").set(startedAt + 30000);
              });
          });
      });
    });
  },

  guessLocation: function (roomCode, spyUid, guess) {
    const ref = window.db.ref("rooms/" + roomCode);
    ref.get().then((snap) => {
      if (!snap.exists()) return;
      const data = snap.val();
      const roles = data.playerRoles || {};
      const spyRole = roles[spyUid];
      if (!spyRole) return;
      let guessesLeft = spyRole.guessesLeft || 0;
      if (guessesLeft <= 0) return;
      let correctAnswer = null;
      const gameType = data.settings?.gameType;
      for (const uid in roles) {
        const r = roles[uid];
        if (r && !r.isSpy) {
          correctAnswer = gameType === "category" ? r.role : r.location;
          break;
        }
      }
      if (!correctAnswer) return;
      const finalGuess =
        gameType === "category"
          ? { guessedRole: guess, isCorrect: guess === correctAnswer }
          : { guessedLocation: guess, isCorrect: guess === correctAnswer };
      if (gameType === "category") {
        finalGuess.actualRole = correctAnswer;
      } else {
        finalGuess.actualLocation = correctAnswer;
      }

      const preserveVotingStarted = data.votingStarted;
      const preserveVotes = data.votes;
      if (guess === correctAnswer) {
        const guessWord = gameType === "category" ? "rolü" : "konumu";
        getSpyNamesForMessage(roomCode, data).then(({ spyNames }) => {
          const spyIntro = formatSpyIntro(spyNames);
          const message = `${spyIntro} ${guessWord} ${guess} olarak doğru tahmin etti ve oyunu kazandı!`;
          const winUpdate = {
            status: "finished",
            winner: "spy",
            lastGuess: {
              spy: spyUid,
              guess,
              correct: true,
              finalGuess,
              roundId: data.roundId || null,
            },
            votingStarted: false,
            votes: null,
            voteResult: null,
            voteRequests: null,
            guess: null,
          };
          appendFinalSpyInfo(winUpdate, data);
          ref
            .update(winUpdate)
            .then(() =>
              finalizeGameOver(roomCode, data, {
                winner: "spies",
                reason: "guess",
                message,
                finalGuess,
              })
            );
        });
      } else {
        guessesLeft -= 1;
        const updates = {};
        updates[`playerRoles/${spyUid}/guessesLeft`] = guessesLeft;
        if (guessesLeft <= 0) {
          updates.status = "finished";
          updates.winner = "innocent";
          updates.lastGuess = {
            spy: spyUid,
            guess,
            correct: false,
            guessesLeft: 0,
            finalGuess,
            roundId: data.roundId || null,
          };
          updates.votingStarted = false;
          updates.votes = null;
          updates.voteResult = null;
          updates.voteRequests = null;
          updates.guess = null;
        } else {
          updates.lastGuess = {
            spy: spyUid,
            guess,
            correct: false,
            guessesLeft,
            finalGuess,
            roundId: data.roundId || null,
          };
          if (typeof preserveVotingStarted !== "undefined") {
            updates.votingStarted = preserveVotingStarted;
          }
          if (typeof preserveVotes !== "undefined") {
            updates.votes = preserveVotes;
          }
        }
        if (!updates.guess) {
          updates.guess = null;
        }
        if (updates.status === "finished") {
          const guessWord = gameType === "category" ? "rolü" : "konumu";
          const actualWord = gameType === "category" ? "rol" : "konum";
          appendFinalSpyInfo(updates, data);
          getSpyNamesForMessage(roomCode, data).then(({ spyNames }) => {
            const spyIntro = formatSpyIntro(spyNames);
            const message = `${spyIntro} ${guessWord} ${guess} olarak yanlış tahmin etti. Doğru ${actualWord} ${correctAnswer} idi ve oyunu masumlar kazandı!`;
            ref
              .update(updates)
              .then(() =>
                finalizeGameOver(roomCode, data, {
                  winner: "innocents",
                  reason: "guess",
                  message,
                  finalGuess,
                })
              );
          });
        } else {
          ref.update(updates);
        }
      }
    });
  },

  submitVote: function (roomCode, voter, target) {
    if (target === voter) {
      alert("Kendine oy veremezsin.");
      return;
    }
    const ref = window.db.ref("rooms/" + roomCode);
    ref
      .child(`votes/${voter}`)
      .set(target)
      .then(() => {
        ref.get().then((snap) => {
          if (!snap.exists()) return;
          const data = snap.val();
          const activePlayers = Object.keys(data.playerRoles || {});
          const votes = data.votes || {};
          const activeVoteCount = Object.keys(votes).filter((v) =>
            activePlayers.includes(v)
          ).length;
          if (activeVoteCount >= activePlayers.length) {
            this.finalizeVoting(roomCode);
          }
        });
      });
  },

  finalizeVoting: function (roomCode) {
    const ref = window.db.ref("rooms/" + roomCode);
    return ref.transaction((room) => {
      if (!room) return room;
      const votingState = room.voting || {};
      if (votingState.result && votingState.result.finalizedAt) return room;
      if (!room.votingStarted && !votingState.active) return room;

      const players = Object.keys(room.playerRoles || {});
      if (!players.length) return room;

      const votes = room.votes || {};
      const voteEntries = Object.entries(votes).filter(([voter]) =>
        players.includes(voter)
      );
      const counts = {};
      voteEntries.forEach(([, t]) => {
        if (players.includes(t)) {
          counts[t] = (counts[t] || 0) + 1;
        }
      });
      const hasVotes = Object.keys(counts).length > 0;
      const max = hasVotes ? Math.max(...Object.values(counts)) : 0;
      const top = hasVotes
        ? Object.keys(counts).filter((p) => counts[p] === max)
        : [];
      const isTie = !hasVotes || top.length !== 1;

      const snapshotPlayers = votingState.snapshotPlayers || votingState.roster || [];
      const snapshot = votingState.snapshot;
      const getName = (uid) => {
        if (snapshot?.names && snapshot.names[uid]) return snapshot.names[uid];
        const snap = snapshotPlayers.find((p) => p.uid === uid);
        return snap?.name || (room.players?.[uid]?.name ?? uid);
      };

      const nextRoom = { ...room };
      nextRoom.votingStarted = false;
      nextRoom.voting = {
        ...(votingState || {}),
        active: false,
        result: {
          ...(votingState?.result || {}),
          voteCounts: counts,
          finalizedAt: window.firebase.database.ServerValue.TIMESTAMP,
          roundId: room.roundId || null,
        },
      };

      if (isTie) {
        nextRoom.voteResult = { tie: true, roundId: room.roundId || null };
        nextRoom.voting.result.tie = true;
        nextRoom.guess = null;
        return nextRoom;
      }

      const voted = top[0];
      const votedRole = room.playerRoles && room.playerRoles[voted];
      const isSpy = votedRole ? votedRole.isSpy : false;
      const remainingPlayers = Object.keys(room.playerRoles || {}).filter(
        (uid) => uid !== voted
      );
      const remainingSpies = getSpyUids(room.spies).filter((id) =>
        remainingPlayers.includes(id)
      );

      const eliminatedName = getName(voted);
      nextRoom.voteResult = { voted, isSpy, roundId: room.roundId || null };
      nextRoom.voting.result.eliminatedUid = voted;
      nextRoom.voting.result.eliminatedName = eliminatedName;
      nextRoom.voting.result.isSpy = isSpy;
      nextRoom.voting.result.tie = false;

      if (isSpy) {
        const role =
          votedRole && votedRole.role !== undefined ? votedRole.role : null;
        const location =
          votedRole && votedRole.location !== undefined
            ? votedRole.location
            : null;
        nextRoom.voteResult.role = role;
        nextRoom.voteResult.location = location;
        nextRoom.voteResult.remainingSpies = remainingSpies;
        nextRoom.voteResult.lastSpy = remainingSpies.length === 0;
        nextRoom.voting.result.role = role;
        nextRoom.voting.result.location = location;
        nextRoom.voting.result.remainingSpies = remainingSpies;
        nextRoom.voting.result.lastSpy = remainingSpies.length === 0;
      }

      const guessAllowance = (votedRole?.guessesLeft || 0) > 0;
      if (guessAllowance) {
        nextRoom.guess = {
          spyUid: voted,
          endsAt: Date.now() + 30000,
          roundId: room.roundId || null,
        };
        nextRoom.voting.result.guessAllowed = true;
      } else {
        nextRoom.guess = null;
      }

      if (isSpy && remainingSpies.length === 0 && !guessAllowance) {
        nextRoom.status = "finished";
        nextRoom.winner = "innocent";
        appendFinalSpyInfo(nextRoom, room);
      }

      return nextRoom;
    }).then((result) => {
      if (!result.committed) return;
      const roomData = result.snapshot?.val();
      const votingResult = roomData?.voting?.result;
      if (
        roomData?.status === "finished" &&
        roomData?.winner === "innocent" &&
        votingResult?.eliminatedUid &&
        votingResult?.lastSpy &&
        !roomData?.guess
      ) {
        const eliminatedName =
          votingResult.eliminatedName || votingResult.eliminatedUid;
        getSpyNamesForMessage(roomCode, roomData).then(({ spyNames }) => {
          const spyIntro = formatSpyIntro(spyNames);
          const message = `${spyIntro} arasından ${eliminatedName} elendi ve oyunu masumlar kazandı!`;
          finalizeGameOver(roomCode, roomData, {
            winner: "innocents",
            reason: "vote",
            eliminatedUid: votingResult.eliminatedUid,
            eliminatedName,
            message,
          });
        });
      }
    });
  },

  resetVotingState: function (roomCode) {
    const ref = window.db.ref("rooms/" + roomCode);
    return ref.transaction((room) => {
      if (!room) return room;
      if (room.voting?.active) return room;
      const hasResult = room.voting?.result?.finalizedAt || room.voteResult;
      if (!hasResult) return room;

      const nextRoom = { ...room };
      nextRoom.votes = null;
      nextRoom.voteRequests = null;
      nextRoom.voteStartRequests = null;
      nextRoom.votingStarted = false;
      nextRoom.voteResult = null;
      nextRoom.voting = null;
      nextRoom.phase = "clue";
      return nextRoom;
    });
  },

  finalizeGuessTimeout: function (roomCode) {
    const ref = window.db.ref("rooms/" + roomCode);
    ref.get().then((snap) => {
      if (!snap.exists()) return;
      const data = snap.val();
      if (data.status === "finished") return;
      const guessState = data.guess;
      if (!guessState || !guessState.endsAt) return;
      if (Date.now() < guessState.endsAt) return;

      const updates = { guess: null };
      const votingResult = data.voting?.result;
      if (votingResult && votingResult.eliminatedUid) {
        updates.status = "finished";
        updates.winner = "innocent";
        appendFinalSpyInfo(updates, data);
      }
      const updatePromise = ref.update(updates);
      if (updates.status === "finished") {
        updatePromise.then(() =>
          getSpyNamesForMessage(roomCode, data).then(({ spyNames }) => {
            const spyIntro = formatSpyIntro(spyNames);
            return finalizeGameOver(roomCode, data, {
              winner: "innocents",
              reason: "timeout",
              message: `${spyIntro} tahmin süresini kaçırdı ve oyunu masumlar kazandı!`,
              eliminatedUid: votingResult?.eliminatedUid,
              eliminatedName: votingResult?.eliminatedName,
            });
          })
        );
      }
    });
  },

  tallyVotes: function (roomCode) {
    const ref = window.db.ref("rooms/" + roomCode);
    ref.get().then((snap) => {
      if (!snap.exists()) return;
      const data = snap.val();
      const players = Object.keys(data.playerRoles || {});
      const votes = data.votes || {};
      const voteEntries = Object.entries(votes).filter(([voter]) =>
        players.includes(voter)
      );
      if (voteEntries.length < players.length) return;

      const counts = {};
      voteEntries.forEach(([, t]) => {
        counts[t] = (counts[t] || 0) + 1;
      });
      console.log("[tallyVotes] Vote counts:", counts);
      const max = Math.max(...Object.values(counts));
      const top = Object.keys(counts).filter((p) => counts[p] === max);
      if (top.length !== 1) {
        ref.update({
          votes: null,
          votingStarted: false,
          voteResult: { tie: true },
        });
        return;
      }
      const voted = top[0];
      const votedRole = data.playerRoles && data.playerRoles[voted];
      const isSpy = votedRole ? votedRole.isSpy : false;
      const remainingPlayers = Object.keys(data.playerRoles || {}).filter(
        (uid) => uid !== voted
      );
      const remainingSpies = getSpyUids(data.spies).filter((id) =>
        remainingPlayers.includes(id)
      );

      console.log(
        `[tallyVotes] Player ${voted} received ${counts[voted]} votes. Eliminated: ${!isSpy}`
      );

      const voteResult = { voted, isSpy };
      if (isSpy) {
        const role =
          votedRole && votedRole.role !== undefined ? votedRole.role : null;
        const location =
          votedRole && votedRole.location !== undefined
            ? votedRole.location
            : null;
        voteResult.role = role;
        voteResult.location = location;
        voteResult.remainingSpies = remainingSpies;
        voteResult.lastSpy = remainingSpies.length === 0;
      }

      const updates = {
        voteResult,
        votingStarted: false,
      };

      if (isSpy && remainingSpies.length === 0) {
        updates.status = "finished";
        updates.winner = "innocent";
        appendFinalSpyInfo(updates, data);
      }

      ref.update(updates);
    });
  },

  endRound: function (roomCode) {
    const ref = window.db.ref("rooms/" + roomCode);
    ref.get().then((snap) => {
      if (!snap.exists()) return;
      const data = snap.val();
      const vote = data.voteResult;
      const tasks = [];
      const votedUid = vote && vote.voted;
      if (votedUid) {
        const playerInfo = (data.players || {})[votedUid] || {};
        const { name = null, isCreator = false } = playerInfo;
        tasks.push(ref.child(`players/${votedUid}`).remove());
        tasks.push(ref.child(`playerRoles/${votedUid}`).remove());
        tasks.push(
          ref
            .child(`eliminated/${votedUid}`)
            .set({ name, isCreator })
        );
      }

      Promise.all(tasks).then(() => {
        const remainingPlayers = Object.keys(data.playerRoles || {}).filter(
          (uid) => uid !== votedUid
        );
        const remainingSpies = getSpyUids(data.spies).filter((id) =>
          remainingPlayers.includes(id)
        );
        if (remainingSpies.length === 0) {
          const updates = appendFinalSpyInfo(
            { status: "finished", winner: "innocent" },
            data
          );
          const eliminatedName = playerInfo?.name || votedUid;
          ref.update(updates).then(() =>
            getSpyNamesForMessage(roomCode, data).then(({ spyNames }) => {
              const spyIntro = formatSpyIntro(spyNames);
              return finalizeGameOver(roomCode, data, {
                winner: "innocents",
                reason: "vote",
                eliminatedUid: votedUid,
                eliminatedName,
                message: `${spyIntro} arasından ${eliminatedName} elendi ve oyunu masumlar kazandı!`,
              });
            })
          );
          return;
        }
        this.checkSpyWin(roomCode).then((spyWon) => {
          if (spyWon) {
            const updates = appendFinalSpyInfo({ status: "finished" }, data);
            ref.update(updates);
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
      const activeSpies = getSpyUids(data.spies).filter((s) =>
        players.includes(s)
      );
      const innocentCount = players.length - activeSpies.length;
      if (innocentCount <= 1) {
        const updates = appendFinalSpyInfo(
          { status: "finished", winner: "spy", spyParityWin: true },
          data
        );
        return ref
          .update(updates)
          .then(() => getSpyNamesForMessage(roomCode, data))
          .then(({ spyNames }) => {
            const spyIntro = formatSpyIntro(spyNames);
            return finalizeGameOver(roomCode, data, {
              winner: "spies",
              reason: "parity",
              message: `${spyIntro} sayıca üstünlük sağladı ve oyunu kazandı!`,
            });
          })
          .then(() => true);
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

// Global fallback for compatibility
gameLogic.POOLS = POOLS;
window.gameLogic = gameLogic;
