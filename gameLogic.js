import {
  escapeHtml,
  getActivePlayers,
  isPlayerAlive,
  resolveRoleName,
} from './utils.js';
import { TR_ACTORS } from './data/characters_tr_actors.js';

let anonymousSignInPromise = null;

const MIN_PLAYERS = 3;
const ROOM_PLAYER_LIMIT = 20;
const votingWatchers = new Map();

function generateRoundId() {
  const newRef = window.db.ref().push();
  return newRef.key || String(Date.now());
}

function getSpyUids(spies) {
  if (Array.isArray(spies)) return spies;
  if (spies && typeof spies === "object") return Object.keys(spies);
  return [];
}

function getSpyUidsFromRoom(room) {
  const spies = new Set(getSpyUids(room?.spies));
  Object.entries(room?.playerRoles || {}).forEach(([uid, role]) => {
    if (role && (role.isSpy || role.roleType === "spy" || role.isImpostor)) {
      spies.add(uid);
    }
  });
  return Array.from(spies);
}

/** Canonical correct answer for guesses: from game.correctAnswer, or fallback from first innocent (legacy). */
function getCanonicalCorrectAnswer(room) {
  const game = room?.game;
  if (game && game.correctAnswer != null && String(game.correctAnswer).trim() !== "") {
    return String(game.correctAnswer).trim();
  }
  const roles = room?.playerRoles || {};
  const gameType = room?.settings?.gameType;
  for (const uid in roles) {
    const r = roles[uid];
    if (r && !r.isSpy) {
      if (gameType === "category") {
        return resolveRoleName(r?.role);
      }
      const loc = r?.location;
      if (loc === undefined || loc === null) return null;
      return typeof loc === "string" ? loc : String(loc);
    }
  }
  return null;
}

function isVotingStateMachineActive(room) {
  const votingStatus = room?.voting?.status;
  const gamePhase = room?.game?.phase;
  return (
    votingStatus === "in_progress" ||
    gamePhase === "voting" ||
    gamePhase === "results"
  );
}

function getAliveUids(playersObj) {
  return Object.entries(playersObj || {})
    .filter(([, player]) => isPlayerAlive(player))
    .map(([uid]) => uid);
}

function getAlivePlayersFromState(players, roles) {
  const candidates = new Set([
    ...Object.keys(players || {}),
    ...Object.keys(roles || {}),
  ]);

  const alive = [];
  candidates.forEach((uid) => {
    if (isPlayerAlive(players?.[uid])) {
      alive.push(uid);
    }
  });

  return alive;
}

function buildExpectedVotersMap(uids) {
  return uids.reduce((acc, id) => {
    acc[id] = true;
    return acc;
  }, {});
}

function resolveExpectedVoters(room) {
  const votingState = room?.voting || {};
  const expectedVotersMap = votingState.expectedVoters;
  const expectedFromState =
    expectedVotersMap && typeof expectedVotersMap === "object"
      ? Object.keys(expectedVotersMap)
      : [];

  if (expectedFromState.length) {
    return {
      expectedVoters: expectedFromState,
      expectedSet: new Set(expectedFromState),
    };
  }

  const players = room?.players || {};
  const roles = room?.playerRoles || {};
  const activePlayers = getActivePlayers(roles, players);
  const activeUids = activePlayers.map((p) => p.uid);
  if (activeUids.length) {
    return {
      expectedVoters: activeUids,
      expectedSet: new Set(activeUids),
    };
  }

  const aliveUids = getAliveUids(players);
  return {
    expectedVoters: aliveUids,
    expectedSet: new Set(aliveUids),
  };
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

export function getServerNow() {
  const source = window.serverTime;
  if (source && typeof source.now === "function") {
    return source.now();
  }
  return Date.now();
}

function clearVotingWatcher(roomCode) {
  const watcher = votingWatchers.get(roomCode);
  if (watcher?.interval) {
    clearInterval(watcher.interval);
  }
  votingWatchers.delete(roomCode);
}

function ensureVotingWatcher(roomCode, votingState, finalizeVoting) {
  const status = votingState?.status;
  const endsAt =
    typeof votingState?.endsAt === "number" ? votingState.endsAt : null;

  if (status !== "in_progress" || !endsAt) {
    clearVotingWatcher(roomCode);
    return;
  }

  // Immediate guard: if the vote timer already elapsed, request finalization once.
  if (getServerNow() >= endsAt) {
    clearVotingWatcher(roomCode);
    finalizeVoting(roomCode, "time_up");
    return;
  }

  const existing = votingWatchers.get(roomCode);
  if (existing && existing.endsAt === endsAt) {
    return;
  }

  clearVotingWatcher(roomCode);
  const interval = setInterval(() => {
    if (getServerNow() >= endsAt) {
      // Time-up pathway lives here so multiple clients can safely converge on finalizeVoting.
      clearVotingWatcher(roomCode);
      finalizeVoting(roomCode, "time_up");
    }
  }, 1000);
  votingWatchers.set(roomCode, { interval, endsAt });
}

function buildRoleAssignments(roomCode, settings, players, roundId) {
  const uids = Object.keys(players);
  const spyCount = Math.min(settings?.spyCount || 0, uids.length);
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

  const gameType = settings?.gameType;
  const isLocationGame = gameType === "location";
  const isCategoryGame = gameType === "category";

  // Canonical correct answer for guesses (single source of truth; do not derive from first innocent)
  let correctAnswer = null;

  if (isLocationGame) {
    const pool = samplePool([...POOLS.locations], settings.poolSize);
    const chosenLocation = randomFrom(pool);
    // For location games, the correct answer is the chosen location
    if (chosenLocation != null) {
      correctAnswer = typeof chosenLocation === "string"
        ? chosenLocation
        : String(chosenLocation);
    }
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

    // For category games, the correct answer is the chosen role's display name
    if (chosenRoleName != null && chosenRoleName !== "") {
      correctAnswer =
        typeof chosenRoleName === "string"
          ? chosenRoleName
          : String(chosenRoleName);
    }

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

  const spiesSnapshotPayload = {
    createdAt: window.firebase.database.ServerValue.TIMESTAMP,
    roundId: roundId || null,
    spies: spiesArr,
  };

  return { updates, spiesSnapshotPayload, correctAnswer };
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
      settings: { ...settings, spyGuessLimit, creatorUid: uid },
      players: {
        [uid]: {
          name: creatorName,
          isCreator: true,
          status: "alive",
          eliminatedAt: null,
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
    await playerRef.set({
      name: playerName,
      isCreator: false,
      status: "alive",
      eliminatedAt: null,
    });

    const updatedPlayers = {
      ...players,
      [uid]: { name: playerName, isCreator: false, status: "alive", eliminatedAt: null },
    };

    return Object.values(updatedPlayers).map((p) => p.name);
  },

  /** Oyunculara roller atayın */
  assignRoles: async function (roomCode, roundId, prefetched = {}) {
    const settingsRef = window.db.ref(`rooms/${roomCode}/settings`);
    const playersRef = window.db.ref(`rooms/${roomCode}/players`);
    const needsFetch = !prefetched.settings || !prefetched.players;
    const [settingsSnap, playersSnap] = needsFetch
      ? await Promise.all([settingsRef.get(), playersRef.get()])
      : [
          { exists: () => true, val: () => prefetched.settings },
          { exists: () => true, val: () => prefetched.players },
        ];

    if (!settingsSnap.exists() || !playersSnap.exists()) {
      throw new Error("Oda bulunamadı");
    }

    const settings = settingsSnap.val();
    const players = playersSnap.val() || {};
    const { updates, spiesSnapshotPayload } = buildRoleAssignments(
      roomCode,
      settings,
      players,
      roundId
    );

    await window.db.ref().update(updates);
    await window.db
      .ref(`rooms/${roomCode}/spiesSnapshot`)
      .transaction((current) => {
        if (current && Array.isArray(current.spies) && current.spies.length) {
          return current;
        }
        return spiesSnapshotPayload;
      });
  },

  startGame: async function (roomCode) {
    clearVotingWatcher(roomCode);
    const roundId = generateRoundId();
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

    if (playerCount < MIN_PLAYERS) {
      throw new Error("Oyunu başlatmak için en az 3 oyuncu gerekli.");
    }

    const revivedPlayers = Object.fromEntries(
      Object.entries(players).map(([uid, player]) => [
        uid,
        { ...player, status: "alive", eliminatedAt: null },
      ])
    );

    const { updates, spiesSnapshotPayload, correctAnswer } = buildRoleAssignments(
      roomCode,
      settings,
      revivedPlayers,
      roundId
    );

    if (correctAnswer == null || correctAnswer === "") {
      throw new Error("Oyun başlatılamadı: geçerli konum/rol seçilemedi.");
    }

    const roomBasePath = `rooms/${roomCode}`;
    const updatePayload = {
      ...updates,
      [`${roomBasePath}/spiesSnapshot`]: spiesSnapshotPayload,
      [`${roomBasePath}/roundId`]: roundId,
      [`${roomBasePath}/status`]: "started",
      [`${roomBasePath}/round`]: 1,
      [`${roomBasePath}/phase`]: "clue",
      [`${roomBasePath}/game`]: {
        phase: "playing",
        correctAnswer,
      },
      [`${roomBasePath}/votes`]: null,
      [`${roomBasePath}/voteResult`]: null,
      [`${roomBasePath}/votingStarted`]: false,
      [`${roomBasePath}/voteRequests`]: null,
      [`${roomBasePath}/voteStartRequests`]: null,
      [`${roomBasePath}/voting`]: null,
      [`${roomBasePath}/guess`]: null,
      [`${roomBasePath}/lastGuess`]: null,
      [`${roomBasePath}/eliminated`]: null,
      [`${roomBasePath}/eliminatedUid`]: null,
      [`${roomBasePath}/winner`]: null,
      [`${roomBasePath}/spyParityWin`]: null,
      [`${roomBasePath}/gameOver`]: null,
      [`${roomBasePath}/final`]: null,
    };

    Object.entries(revivedPlayers).forEach(([uid, player]) => {
      updatePayload[`${roomBasePath}/players/${uid}`] = player;
    });

    await window.db.ref().update(updatePayload);
  },

  restartGame: async function (roomCode) {
    clearVotingWatcher(roomCode);
    const roundId = generateRoundId();
    const settingsRef = window.db.ref(`rooms/${roomCode}/settings`);
    const playersRef = window.db.ref(`rooms/${roomCode}/players`);
    const eliminatedRef = window.db.ref(`rooms/${roomCode}/eliminated`);
    const [settingsSnap, playersSnap, eliminatedSnap] = await Promise.all([
      settingsRef.get(),
      playersRef.get(),
      eliminatedRef.get(),
    ]);

    if (!settingsSnap.exists() || !playersSnap.exists()) {
      throw new Error("Oda bulunamadı");
    }

    const settings = settingsSnap.val();
    const players = playersSnap.val() || {};
    const eliminatedPlayers = eliminatedSnap.val() || {};
    const mergedPlayers = { ...eliminatedPlayers, ...players };

    const revivedPlayers = {};
    Object.entries(mergedPlayers).forEach(([uid, player]) => {
      if (!player?.name) {
        throw new Error("Tüm oyuncuların bir adı olmalıdır.");
      }
      revivedPlayers[uid] = { ...player, status: "alive", eliminatedAt: null };
    });

    const playerCount = Object.keys(revivedPlayers).length;
    if (playerCount < MIN_PLAYERS) {
      throw new Error("Oyunu başlatmak için en az 3 oyuncu gerekli.");
    }

    const { updates, spiesSnapshotPayload, correctAnswer } = buildRoleAssignments(
      roomCode,
      settings,
      revivedPlayers,
      roundId
    );

    if (correctAnswer == null || correctAnswer === "") {
      throw new Error("Oyun tekrar başlatılamadı: geçerli konum/rol seçilemedi.");
    }

    const roomBasePath = `rooms/${roomCode}`;
    const updatePayload = {
      ...updates,
      [`${roomBasePath}/spiesSnapshot`]: spiesSnapshotPayload,
      [`${roomBasePath}/roundId`]: roundId,
      [`${roomBasePath}/status`]: "started",
      [`${roomBasePath}/round`]: 1,
      [`${roomBasePath}/phase`]: "clue",
      [`${roomBasePath}/game`]: {
        phase: "playing",
        correctAnswer,
      },
      [`${roomBasePath}/votes`]: null,
      [`${roomBasePath}/voteResult`]: null,
      [`${roomBasePath}/votingStarted`]: false,
      [`${roomBasePath}/voteRequests`]: null,
      [`${roomBasePath}/voteStartRequests`]: null,
      [`${roomBasePath}/voting`]: null,
      [`${roomBasePath}/guess`]: null,
      [`${roomBasePath}/lastGuess`]: null,
      [`${roomBasePath}/eliminated`]: null,
      [`${roomBasePath}/eliminatedUid`]: null,
      [`${roomBasePath}/winner`]: null,
      [`${roomBasePath}/spyParityWin`]: null,
      [`${roomBasePath}/gameOver`]: null,
      [`${roomBasePath}/final`]: null,
    };

    Object.entries(revivedPlayers).forEach(([uid, player]) => {
      updatePayload[`${roomBasePath}/players/${uid}`] = player;
    });

    await window.db.ref().update(updatePayload);
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
    ["roomCode", "playerName", "isCreator"].forEach((key) =>
      localStorage.removeItem(key)
    );
    return playerRef.remove();
  },

  /** Oyuncuları canlı dinle */
  listenPlayers: function (roomCode, callback) {
    const playersRef = window.db.ref(`rooms/${roomCode}/players`);
    const listener = async (snapshot) => {
      const roomRef = snapshot.ref.parent;
      const roomSnap = roomRef ? await roomRef.get() : null;
      const playersData = snapshot.val();

      if (!roomSnap?.exists() || playersData === null) {
        return;
      }

      const playersObj = playersData || {};
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
      const roomData = roomSnap.val();
      const resolvedCreatorUid =
        roomData?.settings?.creatorUid ||
        roomData?.creatorUid ||
        Object.entries(roomData?.players || {}).find(([, player]) =>
          Boolean(player?.isCreator)
        )?.[0];

      // Only close the lobby when we know the creator is missing before start.
      if (
        roomData &&
        roomData.status !== "started" &&
        resolvedCreatorUid &&
        !uids.includes(resolvedCreatorUid)
      ) {
        roomRef.remove();
        localStorage.clear();
        location.reload();
      }
    };

    playersRef.on("value", listener);
    return () => playersRef.off("value", listener);
  },

  /** Oda ve oyun durumunu canlı dinle */
  listenRoom: function (roomCode) {
    const roomRef = window.db.ref("rooms/" + roomCode);

    const listener = async (snapshot) => {
      const roomData = snapshot.val();
      if (!roomData) return;

      // Watch for expired voting windows and finalize them once when time is up.
      ensureVotingWatcher(roomCode, roomData.voting, this.finalizeVoting.bind(this));

      // Oyuncu listesi güncelle
      const playersObj = roomData.players || {};
      const players = Object.values(playersObj)
        .filter((p) => isPlayerAlive(p))
        .map((p) => p.name);
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
          const resolvedRole = isCategoryGame
            ? myRole?.roleName ?? myRole?.role?.name ?? myRole?.role
            : myRole?.role;
          const safeRole = escapeHtml(resolvedRole ?? "");
          const safeLocations = Array.isArray(myRole.allLocations)
            ? myRole.allLocations.map((loc) => escapeHtml(loc ?? ""))
            : [];
          const roleEl = document.getElementById("roleMessage");
          if (myRole.isSpy) {
            const unknownText = isCategoryGame
              ? "Rolü bilmiyorsun."
              : "Konumu bilmiyorsun.";
            const label = isCategoryGame
              ? "Olası roller"
              : "Olası konumlar";
            roleEl.textContent =
              `🎭 Sen BİR SAHTEKARSIN! ${unknownText} ${label}: ${safeLocations.join(", ")}`;
          } else {
            const locLabel = isCategoryGame ? "Kategori" : "Konum";
            roleEl.textContent =
              `✅ ${locLabel}: ${escapeHtml(myRole.location ?? "")} | Rolün: ${safeRole}`;
          }
        }
      }
    };

    roomRef.on("value", listener);
    return () => roomRef.off("value", listener);
  },

  // Oylamayı başlatma isteği kaydet
  startVote: function (roomCode, uid) {
    const roomRef = window.db.ref(`rooms/${roomCode}`);
    return roomRef.transaction((currentData) => {
      if (!currentData) return currentData;
      const votingState = currentData.voting || {};
      const votingStatus = votingState.status || "idle";
      if (currentData.game?.phase !== "playing" || votingStatus !== "idle") {
        return currentData;
      }

      const players = currentData.players || {};
      const aliveUids = getAliveUids(players);

      if (!aliveUids.length || !aliveUids.includes(uid)) return currentData;

      const startedBy = aliveUids.reduce((acc, id) => {
        if (votingState.startedBy?.[id]) acc[id] = true;
        if (id === uid) acc[id] = true;
        return acc;
      }, {});

      const aliveCount = aliveUids.length;
      const required = Math.floor(aliveCount / 2) + 1;
      const startedCount = Object.keys(startedBy).length;

      if (startedCount >= required) {
        const now = getServerNow();
        const baseRound =
          typeof votingState.round === "number"
            ? votingState.round
            : typeof currentData.round === "number"
              ? currentData.round
              : 0;
        const nextRound = baseRound + 1;

        return {
          ...currentData,
          phase: "voting",
          game: { ...(currentData.game || {}), phase: "voting" },
          voting: {
            status: "in_progress",
            round: nextRound,
            startedAt: now,
            endsAt: now + 30000,
            startedBy,
            expectedVoters: buildExpectedVotersMap(aliveUids),
            votes: {},
            result: null,
            continueAcks: {},
          },
          votes: null,
          voteResult: null,
        };
      }

      return {
        ...currentData,
        voting: {
          ...votingState,
          status: "idle",
          startedBy,
        },
      };
    }).then((result) => {
      if (!result?.committed || !result.snapshot) return result;
      const votingSnap = result.snapshot.child("voting");
      const status = votingSnap?.child("status")?.val();
      if (status !== "in_progress") return result;
      const startedAt = votingSnap?.child("startedAt")?.val();
      const endsAt = votingSnap?.child("endsAt")?.val();
      if (startedAt && endsAt == null) {
        return roomRef
          .child("voting/endsAt")
          .set(startedAt + 30000)
          .then(() => result);
      }
      return result;
    });
  },

  startVoting: function (roomCode, playersSnapshot) {
    const ref = window.db.ref("rooms/" + roomCode);
    const snapshotUids = new Set(
      (playersSnapshot || [])
        .map((p) => p?.uid || p?.id)
        .filter(Boolean)
    );

    ref.transaction((room) => {
      if (!room) return room;
      if (room.game?.phase !== "playing") return room;

      const roles = room.playerRoles || {};
      const players = room.players || {};
      const alivePlayers = getActivePlayers(roles, players);
      const aliveUids = alivePlayers.map((p) => p.uid);
      if (!aliveUids.length) return room;

      const votingState = room.voting || {};
      const votingStatus = votingState.status || "idle";
      if (votingStatus !== "idle") {
        const filteredStartedBy = aliveUids.reduce((acc, id) => {
          if (votingState.startedBy?.[id]) acc[id] = true;
          return acc;
        }, {});
        return {
          ...room,
          voting: {
            ...votingState,
            status: votingStatus,
            startedBy: filteredStartedBy,
          },
        };
      }

      const startedBy = aliveUids.reduce((acc, id) => {
        if (votingState.startedBy?.[id] || snapshotUids.has(id)) acc[id] = true;
        return acc;
      }, {});
      const required = Math.floor(aliveUids.length / 2) + 1;
      if (Object.keys(startedBy).length < required) {
        return {
          ...room,
          voting: {
            ...votingState,
            status: "idle",
            startedBy,
          },
        };
      }

      const now = getServerNow();
      const baseRound =
        typeof votingState.round === "number"
          ? votingState.round
          : typeof room.round === "number"
            ? room.round
            : 0;
      const nextRound = baseRound + 1;

      return {
        ...room,
        phase: "voting",
        game: { ...(room.game || {}), phase: "voting" },
        voting: {
          status: "in_progress",
          round: nextRound,
          startedAt: now,
          endsAt: now + 30000,
          startedBy,
          expectedVoters: aliveUids.reduce((acc, id) => {
            acc[id] = true;
            return acc;
          }, {}),
          votes: {},
          result: null,
          continueAcks: {},
        },
        votes: null,
        voteResult: null,
      };
    });
  },

  guessLocation: function (roomCode, spyUid, guess) {
    const ref = window.db.ref("rooms/" + roomCode);
    const guessValue = typeof guess === "string" ? guess : String(guess).trim();
    if (!roomCode || !spyUid || guessValue === "") return;

    return ref
      .transaction((room) => {
        if (!room) return room;
        if (room.status === "finished") return room;

        const phase = room?.game?.phase || room?.phase;
        const isVoting = phase === "voting";
        if (!isVoting) return room;

        const roles = room.playerRoles || {};
        const spyRole = roles[spyUid];
        if (!spyRole || !spyRole.isSpy) return room;

        let guessesLeft = typeof spyRole.guessesLeft === "number" ? spyRole.guessesLeft : 0;
        if (guessesLeft <= 0) return room;

        const correctAnswer = getCanonicalCorrectAnswer(room);
        if (correctAnswer == null || correctAnswer === "") return room;

        const gameType = room.settings?.gameType;
        const isCorrect = guessValue === correctAnswer;
        const finalGuess =
          gameType === "category"
            ? { guessedRole: guessValue, isCorrect, actualRole: correctAnswer }
            : { guessedLocation: guessValue, isCorrect, actualLocation: correctAnswer };

        const blockLegacyVotingUpdates = !!room?.voting?.status;
        const roundId = room.roundId || null;

        if (isCorrect) {
          const nextRoom = { ...room };
          nextRoom.status = "finished";
          nextRoom.winner = "spy";
          nextRoom.lastGuess = {
            spy: spyUid,
            guess: guessValue,
            correct: true,
            finalGuess,
            roundId,
          };
          nextRoom.guess = null;
          if (room.voting) {
            nextRoom.voting = { ...room.voting, votes: null };
          }
          if (!blockLegacyVotingUpdates) {
            nextRoom.votingStarted = false;
            nextRoom.votes = null;
            nextRoom.voteResult = null;
            nextRoom.voteRequests = null;
          }
          appendFinalSpyInfo(nextRoom, room);
          return nextRoom;
        }

        guessesLeft -= 1;
        const nextRoom = { ...room };
        nextRoom.playerRoles = { ...room.playerRoles };
        nextRoom.playerRoles[spyUid] = { ...spyRole, guessesLeft };
        nextRoom.lastGuess = {
          spy: spyUid,
          guess: guessValue,
          correct: false,
          guessesLeft,
          finalGuess,
          roundId,
        };
        nextRoom.guess = null;

        if (guessesLeft <= 0) {
          nextRoom.status = "finished";
          nextRoom.winner = "innocent";
          if (nextRoom.voting) nextRoom.voting = { ...nextRoom.voting, votes: null };
          if (!blockLegacyVotingUpdates) {
            nextRoom.votingStarted = false;
            nextRoom.votes = null;
            nextRoom.voteResult = null;
            nextRoom.voteRequests = null;
          }
          appendFinalSpyInfo(nextRoom, room);
        } else {
          if (!blockLegacyVotingUpdates && room.votingStarted !== undefined) {
            nextRoom.votingStarted = room.votingStarted;
          }
          if (room.voting?.votes !== undefined) {
            nextRoom.voting = { ...(nextRoom.voting || {}), votes: room.voting.votes };
          }
        }
        return nextRoom;
      })
      .then((result) => {
        if (!result?.committed || !result.snapshot) return;
        const roomData = result.snapshot.val();
        if (!roomData || roomData.status !== "finished" || !roomData.lastGuess) return;

        const lastGuess = roomData.lastGuess;
        const gameType = roomData.settings?.gameType;
        const guessWord = gameType === "category" ? "rolü" : "konumu";
        const actualWord = gameType === "category" ? "rol" : "konum";
        const correctAnswer = roomData.lastGuess.finalGuess?.actualRole ?? roomData.lastGuess.finalGuess?.actualLocation;

        getSpyNamesForMessage(roomCode, roomData).then(({ spyNames }) => {
          const spyIntro = formatSpyIntro(spyNames);
          const message =
            roomData.winner === "spy"
              ? `${spyIntro} ${guessWord} ${lastGuess.guess} olarak doğru tahmin etti ve oyunu kazandı!`
              : `${spyIntro} ${guessWord} ${lastGuess.guess} olarak yanlış tahmin etti. Doğru ${actualWord} ${correctAnswer} idi ve oyunu masumlar kazandı!`;
          finalizeGameOver(roomCode, roomData, {
            winner: roomData.winner === "spy" ? "spies" : "innocents",
            reason: "guess",
            message,
            finalGuess: lastGuess.finalGuess,
          });
        });
      });
  },

  castVote: function (roomCode, voterUid, targetUid) {
    if (!roomCode || !voterUid || !targetUid) return;
    if (voterUid === targetUid) return;

    const ref = window.db.ref("rooms/" + roomCode);
    const finalizeVoting = this.finalizeVoting.bind(this);

    return ref
      .transaction((room) => {
        if (!room) return room;

        const votingState = room.voting || {};
        if (votingState.status !== "in_progress") return room;

        const { expectedVoters, expectedSet } = resolveExpectedVoters(room);
        if (!expectedVoters.length) return room;

        if (!expectedSet.has(voterUid) || !expectedSet.has(targetUid)) {
          return room;
        }

        const votes = { ...(votingState.votes || {}) };
        votes[voterUid] = targetUid;
        const nextExpectedVoters =
          votingState.expectedVoters && Object.keys(votingState.expectedVoters || {}).length
            ? votingState.expectedVoters
            : buildExpectedVotersMap(expectedVoters);

        return {
          ...room,
          voting: {
            ...votingState,
            expectedVoters: nextExpectedVoters,
            votes,
          },
        };
      })
      .then((result) => {
        if (!result.committed) return;
        const roomData = result.snapshot?.val();
        const votingState = roomData?.voting;
        if (!votingState || votingState.status !== "in_progress") return;

        const resolved = resolveExpectedVoters(roomData);
        let expectedVoters = resolved.expectedVoters;
        let expectedSet = resolved.expectedSet;

        if (expectedVoters.length === 0) {
          const alive = getAlivePlayersFromState(
            roomData?.players,
            roomData?.playerRoles
          );
          expectedVoters = alive;
          expectedSet = new Set(alive);
        }

        const expectedCount = expectedVoters.length;
        if (!expectedCount) return;

        const votes = votingState.votes || {};
        const validVotes = Object.entries(votes).reduce(
          (acc, [voter, target]) => {
            if (expectedSet.has(voter) && expectedSet.has(target)) {
              acc[voter] = target;
            }
            return acc;
          },
          {}
        );

        if (Object.keys(validVotes).length === expectedCount) {
          finalizeVoting(roomCode, "all_voted");
        }
      });
  },

  submitVote: function (roomCode, voter, target) {
    if (target === voter) {
      alert("Kendine oy veremezsin.");
      return;
    }
    this.castVote(roomCode, voter, target);
  },

finalizeVoting: function (roomCode, reason) {
  console.log("[finalizeVoting] called", { reason, roomId: roomCode });
  const ref = window.db.ref("rooms/" + roomCode);

  return ref
    .transaction((room) => {
      if (!room) return room;
      if (room.status === "finished") return room;

      const votingState = room.voting || {};

      const { expectedVoters, expectedSet } = resolveExpectedVoters(room);
      let derivedExpectedVoters = expectedVoters;
      let derivedExpectedSet = expectedSet;

      if (derivedExpectedVoters.length === 0) {
        const alive = getAlivePlayersFromState(room?.players, room?.playerRoles);
        derivedExpectedVoters = alive;
        derivedExpectedSet = new Set(alive);
      }

      const expectedVoterCount = derivedExpectedVoters.length;

      const normalizedExpectedVotersMap =
        votingState.expectedVoters &&
        Object.keys(votingState.expectedVoters || {}).length
          ? votingState.expectedVoters
          : buildExpectedVotersMap(derivedExpectedVoters);

      const endsAt =
        typeof votingState.endsAt === "number" ? votingState.endsAt : null;

      const votesMap = votingState.votes || {};

      const validVotes = Object.entries(votesMap).reduce((acc, [voter, target]) => {
        if (derivedExpectedSet.has(voter) && derivedExpectedSet.has(target)) {
          acc[voter] = target;
        }
        return acc;
      }, {});

      const votesCount = Object.keys(validVotes).length;
      const serverNow = getServerNow();

      const canFinalizeByCount =
        expectedVoterCount > 0 && votesCount === expectedVoterCount;

      const canFinalizeByTime =
        reason === "time_up"
          ? endsAt === null || serverNow >= endsAt
          : endsAt !== null && serverNow >= endsAt;

      console.log("[finalizeVoting] precheck", {
        status: votingState.status,
        endsAt,
        votesCount,
        expectedCount: expectedVoterCount,
      });

      if (votingState.status !== "in_progress") return room;

      if (reason === "all_voted" && votesCount !== expectedVoterCount) return room;
      if (!canFinalizeByCount && !canFinalizeByTime) return room;

      const counts = {};
      Object.values(validVotes).forEach((target) => {
        counts[target] = (counts[target] || 0) + 1;
      });

      const tallyTargets = Object.keys(counts).filter((id) => derivedExpectedSet.has(id));

      let eliminatedUid = null;
      let eliminatedRole = null;
      let eliminatedName = null;
      let isTie = true;

      if (tallyTargets.length > 0) {
        const maxVotes = Math.max(...tallyTargets.map((id) => counts[id]));
        const top = tallyTargets.filter((id) => counts[id] === maxVotes);
        if (top.length === 1) {
          eliminatedUid = top[0];
          eliminatedRole = (room.playerRoles || {})[eliminatedUid] || null;

          const playerEntry = (room.players || {})[eliminatedUid] || {};
          eliminatedName =
            playerEntry?.name ||
            room.voting?.snapshot?.names?.[eliminatedUid] ||
            eliminatedUid;

          isTie = false;
        }
      }

      const finalizedAt = window.firebase.database.ServerValue.TIMESTAMP;
      const votingRound = votingState.round ?? room.round ?? null;

      let nextPlayers = room.players || {};
      let nextEliminated = room.eliminated || {};

      if (!isTie && eliminatedUid) {
        const playerEntry = nextPlayers[eliminatedUid] || {};
        nextPlayers = {
          ...nextPlayers,
          [eliminatedUid]: {
            ...playerEntry,
            status: "eliminated",
            eliminatedAt: finalizedAt,
          },
        };

        nextEliminated = {
          ...nextEliminated,
          [eliminatedUid]: {
            name: playerEntry?.name || eliminatedUid,
            isCreator: !!playerEntry.isCreator,
            eliminatedAt: finalizedAt,
          },
        };
      }

      // Daha güvenli: canlıları direkt players status'ünden say (role sync hatalarından etkilenmez)
      const aliveUids = getAliveUids(nextPlayers);
      const remainingSpies = getSpyUidsFromRoom(room).filter((id) =>
        aliveUids.includes(id)
      );

      const spyAlive = remainingSpies.length;
      const aliveCount = aliveUids.length;
      const innocentAlive = Math.max(aliveCount - spyAlive, 0);

      let nextStatus = room.status;
      let nextWinner = room.winner;
      let nextGamePhase = "results";
      const finalUpdates = {};

      // 🎯 KAZANMA KOŞULLARI: parity rule — spies win iff spyAlive >= innocentAlive
      if (spyAlive === 0) {
        nextStatus = "finished";
        nextWinner = "innocent";
        appendFinalSpyInfo(finalUpdates, room);
        nextGamePhase = "ended";
      } else if (spyAlive >= innocentAlive) {
        nextStatus = "finished";
        nextWinner = "spy";
        finalUpdates.spyParityWin = true;
        nextGamePhase = "ended";
      } else {
        nextStatus = room.status;
        nextWinner = null;
        nextGamePhase = "results";
      }

      // Harmless sanity scenarios around vote resolution (counts derived from getAliveUids/getSpyUids)
      console.assert(
        !(spyAlive === 2 && innocentAlive === 1 && !isTie && eliminatedUid && !eliminatedRole?.isSpy) ||
          nextWinner === "spy",
        "2 spies + 2 innocents, innocent eliminated -> spies should win"
      );
      console.assert(
        !(spyAlive === 1 && innocentAlive === 1 && !isTie && eliminatedUid && !eliminatedRole?.isSpy) ||
          nextWinner === "spy",
        "1 spy + 2 innocents, innocent eliminated -> spies should win"
      );
      console.assert(
        !(spyAlive === 1 && innocentAlive === 2 && !isTie && eliminatedUid && eliminatedRole?.isSpy) ||
          nextStatus !== "finished",
        "2 spies + 2 innocents, spy eliminated -> game should continue"
      );
      console.assert(
        spyAlive !== 0 || (nextWinner === "innocent" && nextStatus === "finished"),
        "Any state with 0 spies -> innocents should win"
      );

      const canRevealImpostors =
        nextStatus === "finished" || typeof nextWinner === "string";

      const resultPayload = {
        ...(votingState.result || {}),
        round: votingRound,
        finalizedAt,
        tie: isTie,
        votes: validVotes,
        aliveCount,
        spyAlive,
        innocentAlive,
        roundId: room.roundId || null,
      };

      resultPayload.revealSpies = false;
      resultPayload.publicMessage = null;

      // Public message: oyun bitmediyse rol ifşası yok; never reveal spy list mid-game
      if (!isTie && eliminatedUid) {
        const publicName = eliminatedName || eliminatedUid;

        if (canRevealImpostors) {
          const normalizedWinner = normalizeWinnerValue(nextWinner);
          if (normalizedWinner === "innocents") {
            resultPayload.publicMessage = `Sahtekar ${publicName} elendi! Oyunu masumlar kazandı!`;
            resultPayload.revealSpies = true;
          } else {
            resultPayload.publicMessage = `${publicName} elendi! Sahtekarlar sayıca üstünlük sağladı ve oyunu kazandı!`;
            resultPayload.revealSpies = true;
          }
        } else {
          resultPayload.publicMessage = "Bir oyuncu elendi! Fakat oyun henüz bitmiş değil...";
        }
      }

      if (reason) resultPayload.reason = reason;

      if (!isTie && eliminatedUid) {
        resultPayload.eliminatedUid = eliminatedUid;
        resultPayload.eliminatedName = eliminatedName;
        resultPayload.eliminatedAt = finalizedAt;
        resultPayload.roundId = room.roundId || null;
        if (canRevealImpostors) {
          resultPayload.eliminatedRole = eliminatedRole;
          resultPayload.isSpy = !!(eliminatedRole && eliminatedRole.isSpy);
          if (eliminatedRole && eliminatedRole.role !== undefined) {
            resultPayload.role = eliminatedRole.role;
          }
          if (eliminatedRole && eliminatedRole.location !== undefined) {
            resultPayload.location = eliminatedRole.location;
          }
          resultPayload.remainingSpies = remainingSpies;
          resultPayload.lastSpy = remainingSpies.length === 0;
        }
      }

      const nextRoom = {
        ...room,
        ...finalUpdates,
        players: nextPlayers,
        eliminated: nextEliminated,
        voting: {
          ...votingState,
          status: "resolved",
          startedBy: null,
          votes: null,
          expectedVoters: normalizedExpectedVotersMap,
          continueAcks: {},
          result: resultPayload,
        },
        votingStarted: false,
        voteResult: null,
        votes: null,
        voteRequests: null,
        voteStartRequests: null,
        game: { ...(room.game || {}), phase: nextGamePhase },
        phase: nextGamePhase,
        guess: null,
      };

      if (nextStatus !== undefined) nextRoom.status = nextStatus;

      const resolvedWinner =
        typeof nextWinner === "string"
          ? nextWinner
          : typeof room.winner === "string" && room.status === "finished"
            ? room.winner
            : null;

      if (resolvedWinner) nextRoom.winner = resolvedWinner;
      else delete nextRoom.winner;

      return nextRoom;
    })
    .then((result) => {
      if (!result?.committed) return;

      const roomData = result.snapshot?.val();
      if (!roomData) return;

      const votingResult = roomData?.voting?.result;
      const votingStatus = roomData?.voting?.status;
      const finalizedAt = votingResult?.finalizedAt;
      const phase = roomData?.phase;
      const gamePhase = roomData?.game?.phase;

      const isEnded =
        roomData?.status === "finished" || phase === "ended" || gamePhase === "ended";

      console.log("[finalizeVoting] transaction result", {
        committed: result.committed,
        roomId: roomCode,
        votingStatus: votingStatus ?? null,
        finalizedAtPresent: !!finalizedAt,
        phase: phase ?? null,
        gamePhase: gamePhase ?? null,
      });

      const warnings = [];
      if (!votingStatus) warnings.push("Missing rooms/{room}/voting/status");
      if (finalizedAt === undefined || finalizedAt === null) {
        warnings.push("Missing voting.result.finalizedAt");
      }
      if (!isEnded && !phase && !gamePhase) {
        warnings.push("Missing phase and game.phase");
      }
      if (warnings.length) {
        console.warn("[finalizeVoting] transaction diagnostics", { roomId: roomCode, warnings });
      }

      // ✅ Sadece oyun bittiyse ve elimizde elimine edilen varsa gameOver'u finalize et
      if (roomData?.status !== "finished") return;
      if (!votingResult?.eliminatedUid) return;

      const eliminatedName = votingResult.eliminatedName || votingResult.eliminatedUid;

      const winner = normalizeWinnerValue(
        roomData.winner === "innocent"
          ? "innocents"
          : roomData.winner === "spy"
            ? "spies"
            : roomData.winner
      );

      return getSpyNamesForMessage(roomCode, roomData).then(({ spyNames }) => {
        const spyIntro = formatSpyIntro(spyNames);

        const message =
          winner === "innocents"
            ? `Sahtekar ${eliminatedName} elendi! Oyunu masumlar kazandı!`
            : `${spyIntro} sayıca üstünlük sağladı ve oyunu kazandı!`;

        return finalizeGameOver(roomCode, roomData, {
          winner,
          reason: "vote",
          eliminatedUid: votingResult.eliminatedUid,
          eliminatedName,
          message,
        });
      });
    })
    .catch((err) => {
      console.error("[finalizeVoting] error", err);
    });
},

  restartVotingAfterTie: function (roomCode) {
    if (!roomCode) return Promise.resolve(null);

    const votingRef = window.db.ref(`rooms/${roomCode}/voting`);
    return votingRef
      .transaction((voting) => {
        if (!voting) return voting;

        const isResolvedTie =
          voting.status === "resolved" &&
          voting.result &&
          typeof voting.result === "object" &&
          voting.result.tie === true;

        if (!isResolvedTie) return voting;
        if (voting.status === "in_progress") return voting;

        const now = getServerNow();
        const endsAt = now + 30000;

        const expectedVoters =
          voting.expectedVoters && typeof voting.expectedVoters === "object"
            ? voting.expectedVoters
            : voting.snapshot?.expectedVoters &&
                typeof voting.snapshot.expectedVoters === "object"
              ? voting.snapshot.expectedVoters
              : undefined;

        const nextVoting = {
          ...voting,
          status: "in_progress",
          startedAt: now,
          endsAt,
          startedBy: null,
          continueAcks: {},
          votes: {},
          result: null,
        };

        if (expectedVoters) {
          nextVoting.expectedVoters = expectedVoters;
        }

        return nextVoting;
      })
      .catch((err) => {
        console.error("[restartVotingAfterTie] error", err);
      });
  },

  continueAfterResults: async function (roomCode, uid) {
    const userUid = uid || (await this.getUid());
    if (!roomCode || !userUid) return;

    const ref = window.db.ref("rooms/" + roomCode);
    return ref.transaction((room) => {
      if (!room) return room;
      const blockLegacyVotingUpdates = !!room?.voting?.status;

      const phase = room.game?.phase || room.phase;
      if (phase !== "results") return room;

      const roles = room.playerRoles || {};
      const players = room.players || {};
      const playerStatus =
        typeof players[userUid]?.status === "string"
          ? players[userUid].status
          : "alive";
      if (playerStatus !== "alive") return room;
      const alivePlayers = getActivePlayers(roles, players);
      const aliveUids = alivePlayers.map((p) => p.uid);

      if (!aliveUids.includes(userUid)) return room;

      const continueAcks = { ...(room.voting?.continueAcks || {}) };
      continueAcks[userUid] = true;

      const allAcked =
        aliveUids.length > 0 && aliveUids.every((id) => continueAcks[id]);

      const nextRoom = {
        ...room,
        voting: {
          ...(room.voting || {}),
          status: room.voting?.status || "resolved",
          continueAcks,
        },
      };

      if (allAcked) {
        nextRoom.voting = {
          ...nextRoom.voting,
          status: "idle",
          startedBy: {},
          expectedVoters: null,
          votes: null,
          result: null,
          continueAcks: null,
        };
        if (!blockLegacyVotingUpdates) {
          nextRoom.votingStarted = false;
          nextRoom.voteRequests = null;
          nextRoom.voteStartRequests = null;
          nextRoom.votes = null;
          nextRoom.voteResult = null;
        }
        nextRoom.phase = "clue";
        nextRoom.game = { ...(room.game || {}), phase: "playing" };
      }

      return nextRoom;
    });
  },

  resetVotingState: function (roomCode) {
    const ref = window.db.ref("rooms/" + roomCode);
    return ref.transaction((room) => {
      if (!room) return room;
      const blockLegacyVotingUpdates = !!room?.voting?.status;
      if (room.voting?.status === "in_progress") return room;
      const hasResult = room.voting?.result?.finalizedAt || room.voteResult;
      if (!hasResult) return room;

      const nextRoom = { ...room };
      if (!blockLegacyVotingUpdates) {
        nextRoom.votes = null;
        nextRoom.voteRequests = null;
        nextRoom.voteStartRequests = null;
        nextRoom.votingStarted = false;
        nextRoom.voteResult = null;
      }
      nextRoom.voting = { status: "idle", startedBy: {} };
      nextRoom.phase = "clue";
      nextRoom.game = { ...(room.game || {}), phase: "playing" };
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
      if (getServerNow() < guessState.endsAt) return;

      const aliveUids = getAlivePlayersFromState(data?.players, data?.playerRoles);
      const aliveCount = aliveUids.length;
      const spyAlive = getSpyUidsFromRoom(data).filter((id) => aliveUids.includes(id)).length;

      const updates = { guess: null };
      const votingResult = data.voting?.result;
      const canInnocentsWin =
        votingResult &&
        votingResult.eliminatedUid &&
        aliveCount === 2 &&
        spyAlive === 1;

      if (canInnocentsWin) {
        updates.status = "finished";
        updates.winner = "innocent";
        appendFinalSpyInfo(updates, data);
      } else {
        ref.update(updates);
        return;
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

      if (
        data?.voting ||
        data?.game?.phase === "voting" ||
        data?.game?.phase === "results"
      ) {
        return;
      }

      if (isVotingStateMachineActive(data)) return;
      if (data?.voting?.status === "in_progress" || data?.voting?.status === "resolved") return;
      if (data.voting?.status !== "in_progress") return;
      const alivePlayers = getActivePlayers(data.playerRoles, data.players);
      const players = alivePlayers.map((p) => p.uid);
      const votes = data.voting?.votes || data.votes || {};
      const voteEntries = Object.entries(votes).filter(
        ([voter, target]) => players.includes(voter) && players.includes(target)
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
      const rosterSnapshot =
        data.voting?.snapshotPlayers || data.voting?.roster || [];
      const rosterEntry =
        Array.isArray(rosterSnapshot) &&
        rosterSnapshot.find((p) => p?.uid === voted);
      const eliminatedName =
        data.voting?.snapshot?.names?.[voted] ||
        data.players?.[voted]?.name ||
        rosterEntry?.name ||
        voted;
      const isSpy = votedRole ? votedRole.isSpy : false;
      const remainingPlayers = Object.keys(data.playerRoles || {}).filter(
        (uid) => uid !== voted
      );
      const remainingSpies = getSpyUidsFromRoom(data).filter((id) =>
        remainingPlayers.includes(id)
      );

      console.log(
        `[tallyVotes] Player ${voted} received ${counts[voted]} votes. Eliminated: ${!isSpy}`
      );

      const voteResult = { voted, isSpy, eliminatedName };
      let votingResultUpdate = data.voting
        ? {
            ...(data.voting.result || {}),
            eliminatedUid: voted,
            eliminatedName,
            isSpy,
          }
        : null;
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
        if (votingResultUpdate) {
          votingResultUpdate = {
            ...votingResultUpdate,
            role,
            location,
            remainingSpies,
            lastSpy: remainingSpies.length === 0,
          };
        }
      }

      const updates = {
        voteResult,
        votingStarted: false,
      };

      if (votingResultUpdate) {
        updates.voting = {
          ...data.voting,
          result: votingResultUpdate,
        };
      }

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
      const room = data;
      if (room?.voting || room?.game?.phase !== "playing") return;
      if (
        room.voting?.status ||
        room.game?.phase === "results" ||
        room.game?.phase === "voting"
      )
        return;
      if (isVotingStateMachineActive(data)) return;
      const vote = data.voteResult;
      const tasks = [];
      const votedUid = vote && vote.voted;
      let playerInfo = null;
      if (votedUid) {
        playerInfo = (data.players || {})[votedUid] || {};
        const { name = null, isCreator = false } = playerInfo;
        tasks.push(ref.child(`players/${votedUid}`).remove());
        tasks.push(ref.child(`playerRoles/${votedUid}`).remove());
        tasks.push(
          ref
            .child(`eliminated/${votedUid}`)
            .set({ name, isCreator })
        );
      }

      Promise.all(tasks)
        .then(() => ref.get())
        .then((freshSnap) => {
          if (!freshSnap || !freshSnap.exists()) return;
          const latestData = freshSnap.val();
          const activePlayers = getActivePlayers(
            latestData.playerRoles,
            latestData.players
          );
          const activeUids = activePlayers.map((p) => p.uid);
          const remainingSpies = getSpyUidsFromRoom(latestData).filter((id) =>
            activeUids.includes(id)
          );
          if (remainingSpies.length === 0) {
            const updates = appendFinalSpyInfo(
              { status: "finished", winner: "innocent" },
              latestData
            );
            const eliminatedName = playerInfo?.name || votedUid;
            ref.update(updates).then(() =>
              getSpyNamesForMessage(roomCode, latestData).then(({ spyNames }) => {
                const spyIntro = formatSpyIntro(spyNames);
                return finalizeGameOver(roomCode, latestData, {
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
          this.checkSpyWin(roomCode, latestData).then((spyWon) => {
            if (spyWon) {
              const updates = appendFinalSpyInfo(
                { status: "finished" },
                latestData
              );
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

checkSpyWin: function (roomCode, latestData) {
  const isVotingOrResultsPhase = (data) =>
    Boolean(
      data?.voting?.status ||
      data?.game?.phase === "results" ||
      data?.game?.phase === "voting"
    );

  const shouldExitEarly = (data) => {
    if (!data) return true;
    if (data?.status === "finished") return true;
    if (isVotingOrResultsPhase(data)) return true;
    const activePlayers = getActivePlayers(data.playerRoles, data.players);
    const activeUids = activePlayers.map((p) => p.uid);
    const activeSpies = getSpyUidsFromRoom(data).filter((s) =>
      activeUids.includes(s)
    );
    const spyAlive = activeSpies.length;
    const innocentAlive = activePlayers.length - spyAlive;
    return innocentAlive > spyAlive; // parity: only consider spy win when spyAlive >= innocentAlive
  };

  const ref = window.db.ref("rooms/" + roomCode);
  const dataPromise = latestData
    ? Promise.resolve(latestData)
    : ref.get().then((snap) => (snap.exists() ? snap.val() : null));

  return dataPromise.then((data) => {
    if (shouldExitEarly(data)) return false;

    const activePlayers = getActivePlayers(data.playerRoles, data.players);
    const activeUids = activePlayers.map((p) => p.uid);
    const activeSpies = getSpyUidsFromRoom(data).filter((s) =>
      activeUids.includes(s)
    );
    const spyAlive = activeSpies.length;
    const innocentAlive = activePlayers.length - spyAlive;

    if (spyAlive === 0) {
      const updates = appendFinalSpyInfo(
        { status: "finished", winner: "innocents" },
        data
      );
      return ref
        .update(updates)
        .then(() => getSpyNamesForMessage(roomCode, data))
        .then(({ spyNames }) =>
          finalizeGameOver(roomCode, data, {
            winner: "innocents",
            reason: "parity",
            message: `${formatSpyIntro(spyNames)} arasından son sahtekar elendi ve oyunu masumlar kazandı!`,
          })
        )
        .then(() => true);
    }

    if (spyAlive >= innocentAlive && spyAlive > 0) {
      const updates = appendFinalSpyInfo(
        { status: "finished", winner: "spy", spyParityWin: true },
        data
      );
      return ref
        .update(updates)
        .then(() => getSpyNamesForMessage(roomCode, data))
        .then(({ spyNames }) =>
          finalizeGameOver(roomCode, data, {
            winner: "spies",
            reason: "parity",
            message: `${formatSpyIntro(spyNames)} sayıca üstünlük sağladı ve oyunu kazandı!`,
          })
        )
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
      if (isVotingStateMachineActive(data)) return;
      const nextRound = (data.round || 1) + 1;
      ref.update({
        round: nextRound,
        votes: null,
        voteResult: null,
        votingStarted: false,
        voteRequests: null,
        voteStartRequests: null,
        voting: null,
        game: { ...(data.game || {}), phase: "playing" },
      });
    });
  },
};

// Global fallback for compatibility
gameLogic.POOLS = POOLS;
window.gameLogic = gameLogic;
