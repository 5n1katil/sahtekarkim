(function () {
  'use strict';

  const ACTIVE_PLAYER_KEYS = ["active", "connected", "isOnline"];
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, ch => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[ch]);
  }
  function hasInvalidChars(name) {
    return /[.#$\[\]\/]/.test(name);
  }
  function resolveRoleName(role) {
    if (role === undefined || role === null) return null;
    const resolvedRole = role?.roleName ?? role?.name ?? role;
    if (resolvedRole === undefined || resolvedRole === null) return null;
    return typeof resolvedRole === "string" ? resolvedRole : String(resolvedRole);
  }
  function detectActivePlayerKey(playersObj) {
    const players = Object.values(playersObj || {});
    for (const key of ACTIVE_PLAYER_KEYS) {
      if (players.some(p => p && typeof p === "object" && key in p)) {
        return key;
      }
    }
    return null;
  }
  function isPlayerActive(playerEntry, activeKey) {
    if (!playerEntry || typeof playerEntry !== "object") return true;
    const key = activeKey || ACTIVE_PLAYER_KEYS.find(k => k in playerEntry);
    if (!key) return true;
    return Boolean(playerEntry[key]);
  }
  function getActivePlayers(playerRoles, playersObj) {
    const players = playersObj || {};
    const roles = playerRoles || {};
    const activeKey = detectActivePlayerKey(players);
    return Object.keys(roles).map(uid => {
      const playerEntry = players[uid] || {};
      const status = typeof playerEntry?.status === "string" ? playerEntry.status : "alive";
      if (status !== "alive") return null;
      if (!isPlayerActive(playerEntry, activeKey)) return null;
      return {
        uid,
        name: playerEntry?.name || uid,
        status
      };
    }).filter(Boolean);
  }

  const TR_ACTORS = [{
    name: "Kıvanç Tatlıtuğ",
    hint: "Kuzey Güney'in Kuzey'i",
    fameTier: "S"
  }, {
    name: "Beren Saat",
    hint: "Aşk-ı Memnu'nun Bihter'i",
    fameTier: "S"
  }, {
    name: "Halit Ergenç",
    hint: "Muhteşem Yüzyıl'ın Süleyman'ı",
    fameTier: "S"
  }, {
    name: "Bergüzar Korel",
    hint: "Binbir Gece'nin Şehrazat'ı",
    fameTier: "A"
  }, {
    name: "Kenan İmirzalıoğlu",
    hint: "Ezel'in Ezel'i",
    fameTier: "S"
  }, {
    name: "Tuba Büyüküstün",
    hint: "Kara Para Aşk'ın Elif'i",
    fameTier: "A"
  }, {
    name: "Engin Akyürek",
    hint: "Fatmagül'ün Kerim'i",
    fameTier: "A"
  }, {
    name: "Burak Özçivit",
    hint: "Çalıkuşu'nun Kamran'ı",
    fameTier: "A"
  }, {
    name: "Fahriye Evcen",
    hint: "Yaprak Dökümü'nün Necla'sı",
    fameTier: "B"
  }, {
    name: "Çağatay Ulusoy",
    hint: "İçerde'nin Sarp'ı",
    fameTier: "A"
  }, {
    name: "Elçin Sangu",
    hint: "Kiralık Aşk'ın Defne'si",
    fameTier: "A"
  }, {
    name: "Neslihan Atagül",
    hint: "Kara Sevda'nın Nihan'ı",
    fameTier: "A"
  }, {
    name: "Serenay Sarıkaya",
    hint: "Medcezir'in Mira'sı",
    fameTier: "A"
  }, {
    name: "Haluk Bilginer",
    hint: "Şahsiyet'in Agah'ı",
    fameTier: "S"
  }, {
    name: "Nurgül Yeşilçay",
    hint: "Paramparça'nın Gülseren'i",
    fameTier: "A"
  }, {
    name: "Binnur Kaya",
    hint: "Kırmızı Oda'nın Doktor Hanım'ı",
    fameTier: "A"
  }, {
    name: "Demet Özdemir",
    hint: "Erkenci Kuş'un Sanem'i",
    fameTier: "B"
  }, {
    name: "Özcan Deniz",
    hint: "İstanbullu Gelin'in Faruk'u",
    fameTier: "A"
  }, {
    name: "Aslı Enver",
    hint: "İstanbullu Gelin'in Süreyya'sı",
    fameTier: "A"
  }, {
    name: "Meryem Uzerli",
    hint: "Hürrem Sultan'ı canlandırdı",
    fameTier: "A"
  }, {
    name: "Nesrin Cavadzade",
    hint: "Yasak Elma'nın Şahika'sı",
    fameTier: "B"
  }, {
    name: "Hazal Kaya",
    hint: "Adını Feriha Koydum'un Feriha'sı",
    fameTier: "A"
  }, {
    name: "Aras Bulut İynemli",
    hint: "Çukur'un Yamaç'ı",
    fameTier: "A"
  }, {
    name: "Cansu Dere",
    hint: "Anne'nin Zeynep'i",
    fameTier: "A"
  }, {
    name: "İlker Kaleli",
    hint: "Poyraz Karayel",
    fameTier: "B"
  }, {
    name: "Tolga Sarıtaş",
    hint: "Söz'ün Yavuz'u",
    fameTier: "B"
  }, {
    name: "Hande Erçel",
    hint: "Sen Çal Kapımı'nın Eda'sı",
    fameTier: "A"
  }, {
    name: "Gülse Birsel",
    hint: "Avrupa Yakası'nın yazarı ve oyuncusu",
    fameTier: "A"
  }, {
    name: "Şener Şen",
    hint: "Hababam Sınıfı'nın efsanesi",
    fameTier: "S"
  }, {
    name: "Demet Evgar",
    hint: "Aile Arasında'nın Solmaz'ı",
    fameTier: "A"
  }, {
    name: "Afra Saraçoğlu",
    hint: "Yalı Çapkını'nın Seyran'ı",
    fameTier: "B"
  }, {
    name: "Kadir İnanır",
    hint: "Yeşilçam'ın usta ismi",
    fameTier: "S"
  }, {
    name: "Türkan Şoray",
    hint: "Sultan lakaplı Yeşilçam yıldızı",
    fameTier: "S"
  }, {
    name: "Kerem Bürsin",
    hint: "Güneşi Beklerken'in Kerem'i",
    fameTier: "B"
  }, {
    name: "Birce Akalay",
    hint: "Kuş Uçuşu'nun Lale'si",
    fameTier: "B"
  }];

  let anonymousSignInPromise = null;
  const MIN_PLAYERS$1 = 3;
  const ROOM_PLAYER_LIMIT = 20;
  function generateRoundId() {
    const newRef = window.db.ref().push();
    return newRef.key || String(Date.now());
  }
  function getSpyUids$1(spies) {
    if (Array.isArray(spies)) return spies;
    if (spies && typeof spies === "object") return Object.keys(spies);
    return [];
  }
  function appendFinalSpyInfo(updates, data) {
    if (data?.final?.spyNames) return updates;
    const spies = data?.spies;
    const playerNames = data?.playerNames || {};
    const players = data?.players || {};
    const spyUids = getSpyUids$1(spies);
    if (spyUids.length === 0) return updates;
    const spyNames = spyUids.map(uid => playerNames?.[uid] || players?.[uid]?.name || uid);
    const finalState = data?.final || {};
    updates.final = {
      ...finalState,
      spyUids,
      spyNames,
      revealedAt: finalState.revealedAt || window.firebase.database.ServerValue.TIMESTAMP
    };
    return updates;
  }
  function deriveSpyDetails(data) {
    const roles = data?.playerRoles || {};
    const players = data?.players || {};
    const spyCandidates = new Set(getSpyUids$1(data?.spies));
    Object.entries(roles).forEach(_ref => {
      let [uid, role] = _ref;
      if (!role) return;
      if (role.isSpy || role.roleType === "spy" || role.isImpostor) {
        spyCandidates.add(uid);
      }
    });
    const spies = [];
    spyCandidates.forEach(uid => {
      const name = players?.[uid]?.name;
      if (name && String(name).trim() !== "") {
        spies.push({
          uid,
          name
        });
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
      const cleaned = data.spiesSnapshot.spies.filter(s => s && s.uid && s.name);
      if (cleaned.length > 0) return cleaned;
    }
    const spies = Array.isArray(spiesOverride) ? spiesOverride : deriveSpyDetails(data);
    if (!spies.length) return spies;
    const snapshotRef = window.db.ref(`rooms/${roomCode}/spiesSnapshot`);
    await snapshotRef.transaction(current => {
      if (current && Array.isArray(current.spies) && current.spies.length > 0) {
        return current;
      }
      return {
        createdAt: window.firebase.database.ServerValue.TIMESTAMP,
        roundId: data?.roundId || null,
        spies
      };
    });
    return spies;
  }
  async function finalizeGameOver(roomCode, data, payload) {
    const existingSpies = Array.isArray(data?.spiesSnapshot?.spies) ? data.spiesSnapshot.spies.filter(s => s && s.uid && s.name) : [];
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
      finalizedAt: window.firebase.database.ServerValue.TIMESTAMP
    };
    const ref = window.db.ref(`rooms/${roomCode}/gameOver`);
    return ref.transaction(current => {
      if (current?.finalizedAt) return undefined;
      return gameOver;
    });
  }
  function sanitizeName$1(name) {
    if (typeof name !== "string") return name;
    const trimmed = name.trim();
    if (!trimmed) return null;
    const cleaned = trimmed.replace(/^[()]+|[()]+$/g, "").trim();
    return cleaned || null;
  }
  function uniqueNames$1(names) {
    const seen = new Set();
    return names.filter(name => {
      if (!name) return false;
      const key = typeof name === "string" ? name.toLowerCase() : name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  function formatSpyNames(spies, data) {
    const players = data?.players || {};
    const spyNames = (spies || []).map(s => {
      const uid = s?.uid ?? s;
      const rawName = uid && players?.[uid]?.name || (typeof s === "object" ? s?.name : null) || (typeof uid === "string" ? uid : null);
      return sanitizeName$1(rawName);
    }).filter(Boolean);
    return uniqueNames$1(spyNames);
  }
  async function getSpyNamesForMessage(roomCode, data, spiesOverride) {
    const snapshotSpies = Array.isArray(data?.spiesSnapshot?.spies) ? data.spiesSnapshot.spies.filter(s => s && s.uid && s.name) : [];
    let spies = snapshotSpies;
    if (!spies.length) {
      spies = await ensureSpiesSnapshot(roomCode, data, spiesOverride);
    }
    if (!Array.isArray(spies) || spies.length === 0) {
      spies = Array.isArray(spiesOverride) && spiesOverride.length ? spiesOverride : deriveSpyDetails(data);
    }
    const spyNames = formatSpyNames(spies, data);
    return {
      spies,
      spyNames
    };
  }
  function formatSpyLabel$1(spyNames) {
    const count = Array.isArray(spyNames) ? spyNames.length : 0;
    return count <= 1 ? "Sahtekar" : "Sahtekarlar";
  }
  function formatSpyIntro$1(spyNames) {
    const names = Array.isArray(spyNames) ? spyNames : [];
    const label = formatSpyLabel$1(names);
    const namesText = names.join(", ");
    return namesText ? `${label} ${namesText}` : label;
  }
  function getServerNow() {
    const source = window.serverTime;
    if (source && typeof source.now === "function") {
      return source.now();
    }
    return Date.now();
  }

  // Konumlar ve kategoriler için veri havuzları
  const POOLS = {
    locations: ["Havalimanı", "Hastane", "Restoran", "Okul", "Polis Merkezi", "İtfaiye", "Kütüphane", "Müze", "Sinema", "Stadyum", "Plaj", "Park", "Alışveriş Merkezi", "Tren Garı", "Otobüs Terminali", "Otel", "Üniversite", "Ofis", "Fabrika", "Banka", "Hayvanat Bahçesi", "Lunapark", "Dağ", "Köy", "Liman", "Denizaltı", "Depo"],
    "Ünlü Türk Oyuncular": TR_ACTORS,
    "Türk Şarkıcılar": ["Sezen Aksu", "Tarkan", "Ajda Pekkan", "Sertab Erener", "Hadise", "Barış Manço", "Zeki Müren", "Mabel Matiz", "Kenan Doğulu", "Gülşen", "Edis", "Murat Boz", "Aleyna Tilki", "Berkay", "Teoman", "Gökhan Özen", "Sıla", "Hakan Peker", "Ceza", "Sagopa Kajmer", "Mustafa Sandal", "İbrahim Tatlıses", "Nil Karaibrahimgil", "Yıldız Tilbe", "Demet Akalın", "Hande Yener", "Nazan Öncel", "Funda Arar", "Gökçe", "İrem Derici", "Mahsun Kırmızıgül", "Cem Adrian", "Zehra"],
    "Medya ve Influencerlar": ["Acun Ilıcalı", "Beyazıt Öztürk", "Mehmet Ali Erbil", "Okan Bayülgen", "Cüneyt Özdemir", "Çağla Şikel", "Ece Üner", "Seren Serengil", "Seda Sayan", "Müge Anlı", "Fatih Portakal", "Ali İhsan Varol", "Enes Batur", "Danla Bilic", "Orkun Işıtmak", "Reynmen", "Ruhi Çenet", "Barış Özcan", "Duygu Özaslan", "Doğan Kabak", "Meryem Can", "Berkcan Güven", "Cemre Solmaz", "Kendine Müzisyen", "Furkan Yaman", "Tolga Çevik", "Mesut Can Tomay", "Kafalar", "Büşra Pekin", "Şeyma Subaşı", "Haluk Levent", "Ceyda Kasabalı", "Yasemin Sakallıoğlu"],
    "Politikacılar": ["Recep Tayyip Erdoğan", "Kemal Kılıçdaroğlu", "Devlet Bahçeli", "Meral Akşener", "Ekrem İmamoğlu", "Mansur Yavaş", "Abdullah Gül", "Ahmet Davutoğlu", "Ali Babacan", "Binali Yıldırım", "Süleyman Soylu", "Bekir Bozdağ", "Mehmet Şimşek", "Fuat Oktay", "Numan Kurtulmuş", "Nureddin Nebati", "Hulusi Akar", "Fahrettin Koca", "Mevlüt Çavuşoğlu", "Selahattin Demirtaş", "Figen Yüksekdağ", "Ahmet Türk", "Pervin Buldan", "Doğu Perinçek", "Temel Karamollaoğlu", "Muharrem İnce", "Ümit Özdağ", "Ömer Çelik", "Tanju Özcan", "Veli Ağbaba", "Mustafa Sarıgül", "Tansu Çiller", "Necmettin Erbakan", "İsmet İnönü"],
    "Animasyon Karakterleri": ["Mickey Mouse", "Bugs Bunny", "Homer Simpson", "Bart Simpson", "Lisa Simpson", "Marge Simpson", "SpongeBob SquarePants", "Patrick Star", "Squidward Tentacles", "Dora the Explorer", "Shrek", "Donkey", "Fiona", "Rick Sanchez", "Morty Smith", "Naruto Uzumaki", "Sasuke Uchiha", "Son Goku", "Vegeta", "Pikachu", "Ash Ketchum", "Tom Cat", "Jerry Mouse", "Scooby-Doo", "Fred Flintstone", "Wilma Flintstone", "Barney Rubble", "Betty Rubble", "Popeye", "Olive Oyl", "Donald Duck", "Goofy", "Woody", "Buzz Lightyear"],
    "Dizi Karakterleri": ["Polat Alemdar", "Memati Baş", "Süleyman Çakır", "Ezel Bayraktar", "Ramiz Karaeski", "Behlül Haznedar", "Bihter Yöreoğlu", "Adnan Ziyagil", "Fatmagül Ketenci Ilgaz", "Kerim Ilgaz", "Mecnun Çınar", "Leyla Yıldız", "İsmail Abi", "Behzat Ç.", "Harun", "Yaman Koper", "Mira Beylice", "Feriha Yılmaz", "Emir Sarrafoğlu", "Hürrem Sultan", "Kanuni Sultan Süleyman", "Şehzade Mustafa", "Mihrimah Sultan", "Mahmut", "Yıldız", "Ender", "Onur", "Seymen Karadağ", "Ferhunde", "Ali Rıza Bey", "Deniz", "Zeynep", "Ömer", "Ali Kaptan"],
    "Fantastik Karakterler": ["Harry Potter", "Hermione Granger", "Ron Weasley", "Albus Dumbledore", "Lord Voldemort", "Gandalf", "Frodo Baggins", "Aragorn", "Legolas", "Gimli", "Bilbo Baggins", "Samwise Gamgee", "Galadriel", "Saruman", "Gollum", "Sauron", "Jon Snow", "Daenerys Targaryen", "Tyrion Lannister", "Cersei Lannister", "Arya Stark", "Eddard Stark", "Robb Stark", "Bran Stark", "Night King", "Geralt of Rivia", "Yennefer", "Dandelion", "Triss Merigold", "Batman", "Superman", "Wonder Woman", "Iron Man", "Spider-Man"],
    "En iyiler (Karışık)": ["Recep Tayyip Erdoğan", "Ekrem İmamoğlu", "Mansur Yavaş", "Kemal Kılıçdaroğlu", "Meral Akşener", "Devlet Bahçeli", "Aleyna Tilki", "Tarkan", "Sezen Aksu", "Ajda Pekkan", "Hadise", "Zeynep Bastık", "Kenan Doğulu", "Edis", "Mabel Matiz", "Buray", "Demet Akalın", "Cem Yılmaz", "Şahan Gökbakar", "Hasan Can Kaya", "Acun Ilıcalı", "Barış Özcan", "Enes Batur", "Reynmen", "Danla Bilic", "Orkun Işıtmak", "Kıvanç Tatlıtuğ", "Beren Saat", "Serenay Sarıkaya", "Çağatay Ulusoy", "Hande Erçel", "Burak Özçivit", "Afra Saraçoğlu", "Mert Ramazan Demir", "Pınar Deniz", "Aras Bulut İynemli", "Kerem Bürsin", "Engin Akyürek", "Hazal Kaya", "Cristiano Ronaldo", "Lionel Messi", "Kylian Mbappé", "Erling Haaland", "Neymar", "Karim Benzema", "Robert Lewandowski", "Zlatan İbrahimović", "Diego Maradona", "Pelé", "Ronaldinho", "David Beckham", "Novak Djokovic", "Roger Federer", "Rafael Nadal", "Michael Phelps", "Usain Bolt", "Simone Biles", "LeBron James", "Stephen Curry", "Giannis Antetokounmpo", "Nikola Jokic", "Michael Jordan", "Muhammad Ali", "Mike Tyson", "Khabib Nurmagomedov", "Conor McGregor", "Harry Potter", "Hermione Granger", "Ron Weasley", "Lord Voldemort", "Albus Dumbledore", "Batman", "Superman", "Wonder Woman", "Spider-Man", "Iron Man", "Captain America", "Thor", "Loki", "Thanos", "Black Panther", "Deadpool", "Joker", "Harley Quinn", "Homer Simpson", "Bart Simpson", "SpongeBob SquarePants", "Patrick Star", "Rick Sanchez", "Morty Smith", "BoJack Horseman", "Walter White", "Jesse Pinkman", "Saul Goodman", "Eleven", "Jon Snow", "Daenerys Targaryen", "Arya Stark", "Tyrion Lannister", "Darth Vader", "Luke Skywalker", "Yoda", "The Mandalorian", "Grogu"]
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
  const gameLogic = {
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
          unsubscribe = window.auth.onAuthStateChanged(user => {
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
        anonymousSignInPromise = new Promise(resolve => {
          const unsubscribe = window.auth.onAuthStateChanged(user => {
            if (user && user.uid) {
              unsubscribe();
              resolve(user.uid);
            }
          });
          window.auth.signInAnonymously().catch(err => {
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
      const {
        spyGuessLimit,
        ...rest
      } = settings;
      return window.db.ref(`savedSettings/${uid}`).set({
        ...rest,
        spyGuessLimit
      });
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
        settings: {
          ...settings,
          spyGuessLimit
        },
        players: {
          [uid]: {
            name: creatorName,
            isCreator: true,
            status: "alive",
            eliminatedAt: null
          }
        }
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
                throw new Error("Oda oluşturma yetkisi reddedildi. Tarayıcı çerezlerini temizleyip sayfayı yenilemeyi deneyin veya yöneticiden veritabanı kurallarını doğrulamasını isteyin.");
              }
              throw retryErr;
            }
          } else {
            throw new Error("Oturum doğrulanamadı. Lütfen sayfayı yenileyip yeniden deneyin.")
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
        eliminatedAt: null
      });
      const updatedPlayers = {
        ...players,
        [uid]: {
          name: playerName,
          isCreator: false,
          status: "alive",
          eliminatedAt: null
        }
      };
      return Object.values(updatedPlayers).map(p => p.name);
    },
    /** Oyunculara roller atayın */
    assignRoles: async function (roomCode, roundId) {
      const settingsRef = window.db.ref(`rooms/${roomCode}/settings`);
      const playersRef = window.db.ref(`rooms/${roomCode}/players`);
      const [settingsSnap, playersSnap] = await Promise.all([settingsRef.get(), playersRef.get()]);
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
        uids.forEach(uid => {
          const isSpy = spyUids.includes(uid);
          updates[`rooms/${roomCode}/playerRoles/${uid}`] = isSpy ? {
            isSpy: true,
            role: "Sahtekar",
            location: null,
            allLocations: pool,
            guessesLeft: settings.spyGuessLimit
          } : {
            isSpy: false,
            role: "Masum",
            location: chosenLocation,
            allLocations: pool
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
        const poolNames = pool.map(item => {
          if (item && typeof item === "object") {
            return item.name ?? "";
          }
          return item ?? "";
        });
        const chosenRoleName = chosenRole && typeof chosenRole === "object" ? chosenRole.name ?? "" : chosenRole;
        const chosenRoleHint = chosenRoleIsObject ? chosenRole.hint ?? null : null;
        const chosenRoleFameTier = chosenRoleIsObject ? chosenRole.fameTier ?? chosenRole.tier ?? null : null;
        uids.forEach(uid => {
          const isSpy = spyUids.includes(uid);
          updates[`rooms/${roomCode}/playerRoles/${uid}`] = isSpy ? {
            isSpy: true,
            role: "Sahtekar",
            location: null,
            allLocations: poolNames,
            guessesLeft: settings.spyGuessLimit
          } : {
            isSpy: false,
            role: chosenRole,
            roleName: chosenRoleName,
            location: categoryName,
            allLocations: poolNames,
            ...(chosenRoleIsObject ? {
              roleHint: chosenRoleHint,
              ...(chosenRoleFameTier !== null ? {
                roleFameTier: chosenRoleFameTier
              } : {})
            } : {})
          };
        });
      } else {
        throw new Error("Bilinmeyen oyun türü");
      }
      const spiesArr = spyUids.map(uid => ({
        uid,
        name: players[uid]?.name || ""
      })).filter(s => s.name);
      await window.db.ref().update(updates);
      await window.db.ref(`rooms/${roomCode}/spiesSnapshot`).transaction(current => {
        if (current && Array.isArray(current.spies) && current.spies.length) {
          return current;
        }
        return {
          createdAt: window.firebase.database.ServerValue.TIMESTAMP,
          roundId: roundId || null,
          spies: spiesArr
        };
      });
    },
    startGame: async function (roomCode) {
      const roundId = generateRoundId();
      const settingsRef = window.db.ref(`rooms/${roomCode}/settings`);
      const playersRef = window.db.ref(`rooms/${roomCode}/players`);
      const [settingsSnap, playersSnap] = await Promise.all([settingsRef.get(), playersRef.get()]);
      settingsSnap.val();
      const allPlayers = playersSnap.val() || {};
      const players = Object.fromEntries(Object.entries(allPlayers).filter(_ref2 => {
        let [_, p] = _ref2;
        return p && p.name;
      }));
      if (Object.keys(players).length !== Object.keys(allPlayers).length) {
        throw new Error("Tüm oyuncuların bir adı olmalıdır.");
      }
      const playerCount = Object.keys(players).length;
      if (playerCount < MIN_PLAYERS$1) {
        throw new Error("Oyunu başlatmak için en az 3 oyuncu gerekli.");
      }
      const playerStatusUpdates = {};
      Object.keys(players).forEach(uid => {
        playerStatusUpdates[`${uid}/status`] = "alive";
        playerStatusUpdates[`${uid}/eliminatedAt`] = null;
      });
      if (Object.keys(playerStatusUpdates).length > 0) {
        await playersRef.update(playerStatusUpdates);
      }
      await this.assignRoles(roomCode, roundId);
      await window.db.ref(`rooms/${roomCode}`).update({
        roundId,
        status: "started",
        round: 1,
        phase: "clue",
        game: {
          phase: "playing"
        },
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
        spiesSnapshot: null
      });
    },
    restartGame: async function (roomCode) {
      const roomRef = window.db.ref(`rooms/${roomCode}`);
      const settingsRef = roomRef.child("settings");
      const playersRef = roomRef.child("players");
      const eliminatedRef = roomRef.child("eliminated");
      const [settingsSnap, playersSnap, eliminatedSnap] = await Promise.all([settingsRef.get(), playersRef.get(), eliminatedRef.get()]);
      settingsSnap.val();
      const players = playersSnap.val() || {};
      const eliminatedPlayers = eliminatedSnap.val() || {};

      // Re-add eliminated players before restarting
      await Promise.all(Object.entries(eliminatedPlayers).map(_ref3 => {
        let [uid, pdata] = _ref3;
        return playersRef.child(uid).set({
          ...pdata,
          status: "alive",
          eliminatedAt: null
        });
      }));

      // Clear eliminated list
      if (Object.keys(eliminatedPlayers).length > 0) {
        await eliminatedRef.remove();
      }
      const allPlayers = {
        ...players,
        ...eliminatedPlayers
      };
      const playerCount = Object.keys(allPlayers).length;
      if (playerCount < MIN_PLAYERS$1) {
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
        final: null
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
      const cleanupSession = () => {
        ["roomCode", "playerName", "isCreator"].forEach(key => localStorage.removeItem(key));
      };

      playersRef.on("value", async snapshot => {
        const roomRef = snapshot.ref.parent;
        const roomSnap = roomRef ? await roomRef.get() : null;
        const playersData = snapshot.val();

        if (!(roomSnap && roomSnap.exists()) || playersData === null) {
          playersRef.off("value");
          cleanupSession();

          const setupHidden = document.getElementById("setup")?.classList.contains("hidden");

          if (setupHidden) {
            window.location.replace("./index.html");
          } else {
            window.showSetupJoin?.();
          }

          return;
        }

        const playersObj = playersData || {};
        const playersArr = Object.entries(playersObj).map(_ref4 => {
          let [uid, p] = _ref4;
          return {
            uid,
            ...p
          };
        });

        // Hem isim dizisini hem de ham oyuncu nesnesini geri çağrıya aktar
        const playerNames = playersArr.map(p => p.name);
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
        const resolvedCreatorUid = roomData?.settings?.creatorUid || roomData?.creatorUid || Object.entries(roomData?.players || {}).find(([, player]) => Boolean(player?.isCreator))?.[0];

        // Only close the lobby when we know the creator is missing before start.
        if (roomData && roomData.status !== "started" && resolvedCreatorUid && !uids.includes(resolvedCreatorUid)) {
          roomRef.remove();
          localStorage.clear();
          location.reload();
        }
      });
    },
    /** Oda ve oyun durumunu canlı dinle */
    listenRoom: function (roomCode) {
      const roomRef = window.db.ref("rooms/" + roomCode);
      roomRef.on("value", async snapshot => {
        const roomData = snapshot.val();
        if (!roomData) return;

        // Oyuncu listesi güncelle
        const playersObj = roomData.players || {};
        const players = Object.values(playersObj).map(p => p.name);
        const playerListEl = document.getElementById("playerList");
        if (playerListEl) {
          playerListEl.innerHTML = players.map(p => `<li>${escapeHtml(p)}</li>`).join("");
        }

        // Oyun başladıysa rol göster
        if (roomData.status === "started") {
          const uid = await this.getUid();
          if (uid && roomData.playerRoles && roomData.playerRoles[uid]) {
            const myRole = roomData.playerRoles[uid];
            document.getElementById("roomInfo")?.classList.add("hidden");
            document.getElementById("playerRoleInfo")?.classList.remove("hidden");
            const isCategoryGame = roomData.settings?.gameType === "category";
            const resolvedRole = isCategoryGame ? myRole?.roleName ?? myRole?.role?.name ?? myRole?.role : myRole?.role;
            const safeRole = escapeHtml(resolvedRole ?? "");
            const safeLocations = Array.isArray(myRole.allLocations) ? myRole.allLocations.map(loc => escapeHtml(loc ?? "")) : [];
            const roleEl = document.getElementById("roleMessage");
            if (myRole.isSpy) {
              const unknownText = isCategoryGame ? "Rolü bilmiyorsun." : "Konumu bilmiyorsun.";
              const label = isCategoryGame ? "Olası roller" : "Olası konumlar";
              roleEl.textContent = `🎭 Sen BİR SAHTEKARSIN! ${unknownText} ${label}: ${safeLocations.join(", ")}`;
            } else {
              const locLabel = isCategoryGame ? "Kategori" : "Konum";
              roleEl.textContent = `✅ ${locLabel}: ${escapeHtml(myRole.location ?? "")} | Rolün: ${safeRole}`;
            }
          }
        }
      });
    },
    // Oylamayı başlatma isteği kaydet
    startVote: function (roomCode, uid) {
      const roomRef = window.db.ref(`rooms/${roomCode}`);
      roomRef.transaction(currentData => {
        if (!currentData) return;
        const votingState = currentData.voting || {};
        if (votingState.status === "in_progress") return;
        const voteRequests = {
          ...(currentData.voteStartRequests || {})
        };
        voteRequests[uid] = true;
        const roles = currentData.playerRoles || {};
        const players = currentData.players || {};
        const alivePlayers = getActivePlayers(roles, players);
        const aliveUids = alivePlayers.map(p => p.uid);
        if (!aliveUids.includes(uid)) return currentData;
        const filteredRequests = aliveUids.reduce((acc, id) => {
          if (voteRequests[id]) acc[id] = true;
          return acc;
        }, {});
        const requestCount = Object.keys(filteredRequests).length;
        const required = Math.floor(alivePlayers.length / 2) + 1;
        if (alivePlayers.length && requestCount >= required) {
          const snapshotOrder = alivePlayers.map(p => p.uid);
          const snapshotNames = alivePlayers.reduce((acc, p) => {
            if (p?.uid) acc[p.uid] = p.name;
            return acc;
          }, {});
          const aliveAtStart = snapshotOrder.reduce((acc, playerId) => {
            acc[playerId] = true;
            return acc;
          }, {});
          const startedAt = window.firebase.database.ServerValue.TIMESTAMP;
          return {
            ...currentData,
            phase: "voting",
            game: {
              ...(currentData.game || {}),
              phase: "voting"
            },
            votingStarted: true,
            votes: null,
            voteResult: null,
            voteRequests: null,
            voteStartRequests: null,
            voting: {
              ...votingState,
              status: "in_progress",
              round: votingState.round || currentData.round || 1,
              startedAt,
              startedBy: uid,
              endsAt: null,
              roster: alivePlayers,
              votes: {},
              result: null,
              snapshot: {
                order: snapshotOrder,
                names: snapshotNames,
                aliveAtStart
              },
              snapshotPlayers: alivePlayers
            }
          };
        }
        return {
          ...currentData,
          voteStartRequests: filteredRequests
        };
      }).then(_ref5 => {
        let {
          committed,
          snapshot
        } = _ref5;
        if (!committed || !snapshot) return;
        const votingSnap = snapshot.child("voting");
        const status = votingSnap?.child("status")?.val();
        if (status !== "in_progress") return;
        const startedAt = votingSnap?.child("startedAt")?.val();
        const endsAt = votingSnap?.child("endsAt")?.val();
        if (startedAt && endsAt == null) {
          roomRef.child("voting/endsAt").set(startedAt + 30000);
        }
      });
    },
    startVoting: function (roomCode, playersSnapshot) {
      const ref = window.db.ref("rooms/" + roomCode);
      const mappedPlayers = (playersSnapshot || []).map(p => ({
        uid: p.uid || p.id,
        name: p.name
      }));
      const snapshotPromise = playersSnapshot ? Promise.resolve(mappedPlayers) : Promise.all([ref.child("playerRoles").get(), ref.child("players").get()]).then(_ref6 => {
        let [rolesSnap, playersSnap] = _ref6;
        const roles = rolesSnap.val() || {};
        const players = playersSnap.val() || {};
        return Object.keys(roles).map(uid => ({
          uid,
          name: players?.[uid]?.name || uid
        }));
      });
      snapshotPromise.then(snapshotPlayers => {
        ref.get().then(snap => {
          if (!snap.exists()) return;
          const data = snap.val() || {};
          if (data.voting?.status === "in_progress") return;
          const snapshotOrder = (snapshotPlayers || []).map(p => p.uid);
          const snapshotNames = (snapshotPlayers || []).reduce((acc, p) => {
            if (p?.uid) acc[p.uid] = p.name;
            return acc;
          }, {});
          const aliveAtStart = snapshotOrder.reduce((acc, uid) => {
            acc[uid] = true;
            return acc;
          }, {});
          ref.update({
            phase: "voting",
            game: {
              ...(data.game || {}),
              phase: "voting"
            },
            votingStarted: true,
            votes: null,
            voteResult: null,
            voteRequests: null,
            voteStartRequests: null,
            voting: {
              status: "in_progress",
              round: data.round || 1,
              startedAt: window.firebase.database.ServerValue.TIMESTAMP,
              startedBy: null,
              endsAt: null,
              roster: snapshotPlayers || [],
              votes: {},
              result: null,
              snapshot: {
                order: snapshotOrder,
                names: snapshotNames,
                aliveAtStart
              },
              snapshotPlayers: snapshotPlayers || []
            }
          }).then(() => {
            ref.child("voting/startedAt").get().then(snap => {
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
      ref.get().then(snap => {
        if (!snap.exists()) return;
        const data = snap.val();
        const roles = data.playerRoles || {};
        const spyRole = roles[spyUid];
        if (!spyRole) return;
        let guessesLeft = spyRole.guessesLeft || 0;
        if (guessesLeft <= 0) return;
        let correctAnswer = null;
        const gameType = data.settings?.gameType;
        const guessValue = typeof guess === "string" ? guess : String(guess);
        for (const uid in roles) {
          const r = roles[uid];
          if (r && !r.isSpy) {
            if (gameType === "category") {
              correctAnswer = resolveRoleName(r?.role);
            } else {
              const locationValue = r?.location;
              correctAnswer = locationValue === undefined || locationValue === null ? null : typeof locationValue === "string" ? locationValue : String(locationValue);
            }
            break;
          }
        }
        if (!correctAnswer) return;
        const finalGuess = gameType === "category" ? {
          guessedRole: guessValue,
          isCorrect: guessValue === correctAnswer
        } : {
          guessedLocation: guessValue,
          isCorrect: guessValue === correctAnswer
        };
        if (gameType === "category") {
          finalGuess.actualRole = correctAnswer;
        } else {
          finalGuess.actualLocation = correctAnswer;
        }
        const preserveVotingStarted = data.votingStarted;
        const preserveVotes = data.voting?.votes;
        if (guessValue === correctAnswer) {
          const guessWord = gameType === "category" ? "rolü" : "konumu";
          getSpyNamesForMessage(roomCode, data).then(_ref7 => {
            let {
              spyNames
            } = _ref7;
            const spyIntro = formatSpyIntro$1(spyNames);
            const message = `${spyIntro} ${guessWord} ${guessValue} olarak doğru tahmin etti ve oyunu kazandı!`;
            const winUpdate = {
              status: "finished",
              winner: "spy",
              lastGuess: {
                spy: spyUid,
                guess: guessValue,
                correct: true,
                finalGuess,
                roundId: data.roundId || null
              },
              votingStarted: false,
              votes: null,
              voting: {
                ...(data.voting || {}),
                votes: null
              },
              voteResult: null,
              voteRequests: null,
              guess: null
            };
            appendFinalSpyInfo(winUpdate, data);
            ref.update(winUpdate).then(() => finalizeGameOver(roomCode, data, {
              winner: "spies",
              reason: "guess",
              message,
              finalGuess
            }));
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
              guess: guessValue,
              correct: false,
              guessesLeft: 0,
              finalGuess,
              roundId: data.roundId || null
            };
            updates.votingStarted = false;
            updates.votes = null;
            updates["voting/votes"] = null;
            updates.voteResult = null;
            updates.voteRequests = null;
            updates.guess = null;
          } else {
            updates.lastGuess = {
              spy: spyUid,
              guess: guessValue,
              correct: false,
              guessesLeft,
              finalGuess,
              roundId: data.roundId || null
            };
            if (typeof preserveVotingStarted !== "undefined") {
              updates.votingStarted = preserveVotingStarted;
            }
            if (typeof preserveVotes !== "undefined") {
              updates["voting/votes"] = preserveVotes;
            }
          }
          if (!updates.guess) {
            updates.guess = null;
          }
          if (updates.status === "finished") {
            const guessWord = gameType === "category" ? "rolü" : "konumu";
            const actualWord = gameType === "category" ? "rol" : "konum";
            appendFinalSpyInfo(updates, data);
            getSpyNamesForMessage(roomCode, data).then(_ref8 => {
              let {
                spyNames
              } = _ref8;
              const spyIntro = formatSpyIntro$1(spyNames);
              const message = `${spyIntro} ${guessWord} ${guessValue} olarak yanlış tahmin etti. Doğru ${actualWord} ${correctAnswer} idi ve oyunu masumlar kazandı!`;
              ref.update(updates).then(() => finalizeGameOver(roomCode, data, {
                winner: "innocents",
                reason: "guess",
                message,
                finalGuess
              }));
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
      ref.get().then(snap => {
        if (!snap.exists()) return;
        const data = snap.val();
        const votingState = data.voting || {};
        if (votingState.status !== "in_progress") return;
        const alivePlayers = getActivePlayers(data.playerRoles, data.players);
        const aliveUids = new Set(alivePlayers.map(p => p.uid));
        if (!aliveUids.has(voter)) return;
        if (!aliveUids.has(target)) return;
        const updates = {
          [`voting/votes/${voter}`]: target
        };
        ref.update(updates).then(() => {
          const existingVotes = votingState.votes || {};
          const nextVotes = {
            ...existingVotes,
            [voter]: target
          };
          const allVoted = alivePlayers.every(p => nextVotes[p.uid]);
          if (allVoted) {
            this.finalizeVoting(roomCode);
          }
        });
      });
    },
    finalizeVoting: function (roomCode) {
      const ref = window.db.ref("rooms/" + roomCode);
      const serverNow = getServerNow();
      return ref.transaction(room => {
        if (!room) return room;
        const votingState = room.voting || {};
        if (votingState.status !== "in_progress") return room;
        const roles = room.playerRoles || {};
        const players = room.players || {};
        const alivePlayers = getActivePlayers(roles, players);
        const aliveUids = alivePlayers.map(p => p.uid);
        if (!aliveUids.length) return room;
        const votesMap = votingState.votes || {};
        const voteEntries = Object.entries(votesMap).filter(_ref9 => {
          let [voter, target] = _ref9;
          return aliveUids.includes(voter) && aliveUids.includes(target);
        });
        const allAliveVoted = aliveUids.every(uid => votesMap[uid]);
        const endsAt = votingState.endsAt;
        const canFinalizeByTime = typeof endsAt === "number" && serverNow >= endsAt;
        if (!allAliveVoted && !canFinalizeByTime) {
          return room;
        }
        const counts = {};
        voteEntries.forEach(_ref0 => {
          let [, t] = _ref0;
          if (aliveUids.includes(t)) {
            counts[t] = (counts[t] || 0) + 1;
          }
        });
        const hasVotes = Object.keys(counts).length > 0;
        const max = hasVotes ? Math.max(...Object.values(counts)) : 0;
        const top = hasVotes ? Object.keys(counts).filter(p => counts[p] === max) : [];
        const isTie = !hasVotes || top.length !== 1;
        const snapshotPlayers = votingState.snapshotPlayers || votingState.roster || [];
        const snapshot = votingState.snapshot;
        const getName = uid => {
          if (snapshot?.names && snapshot.names[uid]) return snapshot.names[uid];
          const playerName = room.players?.[uid]?.name;
          if (playerName) return playerName;
          const snap = snapshotPlayers.find(p => p.uid === uid);
          return snap?.name || uid;
        };
        const finalizedAt = window.firebase.database.ServerValue.TIMESTAMP;
        const votingRound = votingState.round ?? room.round ?? null;
        const nextRoom = {
          ...room
        };
        const baseResult = {
          ...(votingState.result || {}),
          round: votingRound,
          finalizedAt,
          tie: isTie
        };
        nextRoom.voting = {
          ...votingState,
          status: "resolved",
          startedBy: null,
          votes: {},
          result: baseResult
        };
        nextRoom.votingStarted = false;
        nextRoom.voteResult = null;
        nextRoom.votes = null;
        nextRoom.voteRequests = null;
        nextRoom.voteStartRequests = null;
        nextRoom.game = {
          ...(room.game || {}),
          phase: "playing"
        };
        nextRoom.phase = "clue";
        if (isTie) {
          nextRoom.guess = null;
          return nextRoom;
        }
        const eliminatedUid = top[0];
        const votedRole = roles && roles[eliminatedUid];
        const isSpy = votedRole ? votedRole.isSpy : false;
        const remainingPlayers = aliveUids.filter(uid => uid !== eliminatedUid);
        const remainingSpies = getSpyUids$1(room.spies).filter(id => remainingPlayers.includes(id));
        const eliminatedName = getName(eliminatedUid);
        nextRoom.voting.result = {
          ...nextRoom.voting.result,
          eliminatedUid,
          eliminatedName,
          isSpy,
          tie: false,
          eliminatedAt: finalizedAt,
          roundId: room.roundId || null
        };
        const playerEntry = players[eliminatedUid] || {};
        nextRoom.players = {
          ...players,
          [eliminatedUid]: {
            ...playerEntry,
            status: "eliminated",
            eliminatedAt: finalizedAt
          }
        };
        nextRoom.eliminated = {
          ...(room.eliminated || {}),
          [eliminatedUid]: {
            name: eliminatedName,
            isCreator: !!playerEntry.isCreator,
            eliminatedAt: finalizedAt
          }
        };
        if (isSpy) {
          const role = votedRole && votedRole.role !== undefined ? votedRole.role : null;
          const location = votedRole && votedRole.location !== undefined ? votedRole.location : null;
          nextRoom.voting.result.role = role;
          nextRoom.voting.result.location = location;
          nextRoom.voting.result.remainingSpies = remainingSpies;
          nextRoom.voting.result.lastSpy = remainingSpies.length === 0;
        }
        const aliveCount = remainingPlayers.length;
        const spyAlive = remainingSpies.length;
        let gamePhase = "playing";
        if (spyAlive === 0) {
          nextRoom.status = "finished";
          nextRoom.winner = "innocent";
          appendFinalSpyInfo(nextRoom, room);
          gamePhase = "ended";
        } else if (aliveCount === 2 && spyAlive === 1) {
          nextRoom.status = "finished";
          nextRoom.winner = "spy";
          nextRoom.spyParityWin = true;
          gamePhase = "ended";
        }
        nextRoom.game = {
          ...(nextRoom.game || {}),
          phase: gamePhase
        };
        nextRoom.phase = gamePhase === "ended" ? "ended" : "clue";
        nextRoom.guess = null;
        return nextRoom;
      }).then(result => {
        if (!result.committed) return;
        const roomData = result.snapshot?.val();
        const votingResult = roomData?.voting?.result;
        if (roomData?.status === "finished" && votingResult?.eliminatedUid) {
          const eliminatedName = votingResult.eliminatedName || votingResult.eliminatedUid;
          const winner = roomData.winner === "innocent" ? "innocents" : roomData.winner;
          getSpyNamesForMessage(roomCode, roomData).then(_ref1 => {
            let {
              spyNames
            } = _ref1;
            const spyIntro = formatSpyIntro$1(spyNames);
            const message = winner === "innocents" ? `${spyIntro} arasından ${eliminatedName} elendi ve oyunu masumlar kazandı!` : `${spyIntro} sayıca üstünlük sağladı ve oyunu kazandı!`;
            finalizeGameOver(roomCode, roomData, {
              winner,
              reason: "vote",
              eliminatedUid: votingResult.eliminatedUid,
              eliminatedName,
              message
            });
          });
        }
      });
    },
    resetVotingState: function (roomCode) {
      const ref = window.db.ref("rooms/" + roomCode);
      return ref.transaction(room => {
        if (!room) return room;
        if (room.voting?.status === "in_progress") return room;
        const hasResult = room.voting?.result?.finalizedAt || room.voteResult;
        if (!hasResult) return room;
        const nextRoom = {
          ...room
        };
        nextRoom.votes = null;
        nextRoom.voteRequests = null;
        nextRoom.voteStartRequests = null;
        nextRoom.votingStarted = false;
        nextRoom.voteResult = null;
        nextRoom.voting = null;
        nextRoom.phase = "clue";
        nextRoom.game = {
          ...(room.game || {}),
          phase: "playing"
        };
        return nextRoom;
      });
    },
    finalizeGuessTimeout: function (roomCode) {
      const ref = window.db.ref("rooms/" + roomCode);
      ref.get().then(snap => {
        if (!snap.exists()) return;
        const data = snap.val();
        if (data.status === "finished") return;
        const guessState = data.guess;
        if (!guessState || !guessState.endsAt) return;
        if (getServerNow() < guessState.endsAt) return;
        const updates = {
          guess: null
        };
        const votingResult = data.voting?.result;
        if (votingResult && votingResult.eliminatedUid) {
          updates.status = "finished";
          updates.winner = "innocent";
          appendFinalSpyInfo(updates, data);
        }
        const updatePromise = ref.update(updates);
        if (updates.status === "finished") {
          updatePromise.then(() => getSpyNamesForMessage(roomCode, data).then(_ref10 => {
            let {
              spyNames
            } = _ref10;
            const spyIntro = formatSpyIntro$1(spyNames);
            return finalizeGameOver(roomCode, data, {
              winner: "innocents",
              reason: "timeout",
              message: `${spyIntro} tahmin süresini kaçırdı ve oyunu masumlar kazandı!`,
              eliminatedUid: votingResult?.eliminatedUid,
              eliminatedName: votingResult?.eliminatedName
            });
          }));
        }
      });
    },
    tallyVotes: function (roomCode) {
      const ref = window.db.ref("rooms/" + roomCode);
      ref.get().then(snap => {
        if (!snap.exists()) return;
        const data = snap.val();
        if (data.voting?.status !== "in_progress") return;
        const alivePlayers = getActivePlayers(data.playerRoles, data.players);
        const players = alivePlayers.map(p => p.uid);
        const votes = data.voting?.votes || data.votes || {};
        const voteEntries = Object.entries(votes).filter(_ref11 => {
          let [voter, target] = _ref11;
          return players.includes(voter) && players.includes(target);
        });
        if (voteEntries.length < players.length) return;
        const counts = {};
        voteEntries.forEach(_ref12 => {
          let [, t] = _ref12;
          counts[t] = (counts[t] || 0) + 1;
        });
        console.log("[tallyVotes] Vote counts:", counts);
        const max = Math.max(...Object.values(counts));
        const top = Object.keys(counts).filter(p => counts[p] === max);
        if (top.length !== 1) {
          ref.update({
            votes: null,
            votingStarted: false,
            voteResult: {
              tie: true
            }
          });
          return;
        }
        const voted = top[0];
        const votedRole = data.playerRoles && data.playerRoles[voted];
        const rosterSnapshot = data.voting?.snapshotPlayers || data.voting?.roster || [];
        const rosterEntry = Array.isArray(rosterSnapshot) && rosterSnapshot.find(p => p?.uid === voted);
        const eliminatedName = data.voting?.snapshot?.names?.[voted] || data.players?.[voted]?.name || rosterEntry?.name || voted;
        const isSpy = votedRole ? votedRole.isSpy : false;
        const remainingPlayers = Object.keys(data.playerRoles || {}).filter(uid => uid !== voted);
        const remainingSpies = getSpyUids$1(data.spies).filter(id => remainingPlayers.includes(id));
        console.log(`[tallyVotes] Player ${voted} received ${counts[voted]} votes. Eliminated: ${!isSpy}`);
        const voteResult = {
          voted,
          isSpy,
          eliminatedName
        };
        let votingResultUpdate = data.voting ? {
          ...(data.voting.result || {}),
          eliminatedUid: voted,
          eliminatedName,
          isSpy
        } : null;
        if (isSpy) {
          const role = votedRole && votedRole.role !== undefined ? votedRole.role : null;
          const location = votedRole && votedRole.location !== undefined ? votedRole.location : null;
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
              lastSpy: remainingSpies.length === 0
            };
          }
        }
        const updates = {
          voteResult,
          votingStarted: false
        };
        if (votingResultUpdate) {
          updates.voting = {
            ...data.voting,
            result: votingResultUpdate
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
      ref.get().then(snap => {
        if (!snap.exists()) return;
        const data = snap.val();
        const vote = data.voteResult;
        const tasks = [];
        const votedUid = vote && vote.voted;
        let playerInfo = null;
        if (votedUid) {
          playerInfo = (data.players || {})[votedUid] || {};
          const {
            name = null,
            isCreator = false
          } = playerInfo;
          tasks.push(ref.child(`players/${votedUid}`).remove());
          tasks.push(ref.child(`playerRoles/${votedUid}`).remove());
          tasks.push(ref.child(`eliminated/${votedUid}`).set({
            name,
            isCreator
          }));
        }
        Promise.all(tasks).then(() => ref.get()).then(freshSnap => {
          if (!freshSnap || !freshSnap.exists()) return;
          const latestData = freshSnap.val();
          const activePlayers = getActivePlayers(latestData.playerRoles, latestData.players);
          const activeUids = activePlayers.map(p => p.uid);
          const remainingSpies = getSpyUids$1(latestData.spies).filter(id => activeUids.includes(id));
          if (remainingSpies.length === 0) {
            const updates = appendFinalSpyInfo({
              status: "finished",
              winner: "innocent"
            }, latestData);
            const eliminatedName = playerInfo?.name || votedUid;
            ref.update(updates).then(() => getSpyNamesForMessage(roomCode, latestData).then(_ref13 => {
              let {
                spyNames
              } = _ref13;
              const spyIntro = formatSpyIntro$1(spyNames);
              return finalizeGameOver(roomCode, latestData, {
                winner: "innocents",
                reason: "vote",
                eliminatedUid: votedUid,
                eliminatedName,
                message: `${spyIntro} arasından ${eliminatedName} elendi ve oyunu masumlar kazandı!`
              });
            }));
            return;
          }
          this.checkSpyWin(roomCode, latestData).then(spyWon => {
            if (spyWon) {
              const updates = appendFinalSpyInfo({
                status: "finished"
              }, latestData);
              ref.update(updates);
              return;
            }
            ref.update({
              voteResult: null
            }).then(() => {
              this.nextRound(roomCode);
            });
          });
        });
      });
    },
    checkSpyWin: function (roomCode, latestData) {
      const isVotingOrResultsPhase = data => Boolean(data?.voting?.status || data?.game?.phase === "results" || data?.game?.phase === "voting");
      const shouldSkipSpyCheck = data => Boolean(isVotingOrResultsPhase(data) || data?.status === "finished");
      const shouldExitEarly = data => {
        if (!data) return false;
        if (shouldSkipSpyCheck(data)) return true;
        const activePlayers = getActivePlayers(data.playerRoles, data.players);
        const activeUids = activePlayers.map(p => p.uid);
        const activeSpies = getSpyUids$1(data.spies).filter(s => activeUids.includes(s));
        const innocentAlive = activePlayers.length - activeSpies.length;
        return innocentAlive > 1;
      };
      if (shouldExitEarly(room) || shouldExitEarly(latestData)) {
        return Promise.resolve(false);
      }
      const ref = window.db.ref("rooms/" + roomCode);
      const dataPromise = latestData ? Promise.resolve(latestData) : ref.get().then(snap => snap.exists() ? snap.val() : null);
      return dataPromise.then(data => {
        if (!data) return false;
        if (shouldExitEarly(data)) return false;
        const activePlayers = getActivePlayers(data.playerRoles, data.players);
        const activeUids = activePlayers.map(p => p.uid);
        const activeSpies = getSpyUids$1(data.spies).filter(s => activeUids.includes(s));
        const spyAlive = activeSpies.length;
        const innocentAlive = activePlayers.length - spyAlive;
        if (spyAlive === 0) {
          const updates = appendFinalSpyInfo({
            status: "finished",
            winner: "innocents"
          }, data);
          return ref.update(updates).then(() => getSpyNamesForMessage(roomCode, data)).then(_ref14 => {
            let {
              spyNames
            } = _ref14;
            const spyIntro = formatSpyIntro$1(spyNames);
            return finalizeGameOver(roomCode, data, {
              winner: "innocents",
              reason: "parity",
              message: `${spyIntro} arasından son sahtekar elendi ve oyunu masumlar kazandı!`
            });
          }).then(() => true);
        }
        if (innocentAlive <= 1 && spyAlive > 0) {
          const updates = appendFinalSpyInfo({
            status: "finished",
            winner: "spy",
            spyParityWin: true
          }, data);
          return ref.update(updates).then(() => getSpyNamesForMessage(roomCode, data)).then(_ref15 => {
            let {
              spyNames
            } = _ref15;
            const spyIntro = formatSpyIntro$1(spyNames);
            return finalizeGameOver(roomCode, data, {
              winner: "spies",
              reason: "parity",
              message: `${spyIntro} sayıca üstünlük sağladı ve oyunu kazandı!`
            });
          }).then(() => true);
        }
        return false;
      });
    },
    nextRound: function (roomCode) {
      const ref = window.db.ref("rooms/" + roomCode);
      ref.get().then(snap => {
        if (!snap.exists()) return;
        const data = snap.val();
        const nextRound = (data.round || 1) + 1;
        ref.update({
          round: nextRound,
          votes: null,
          voteResult: null,
          votingStarted: false,
          voteRequests: null,
          voteStartRequests: null,
          voting: null,
          game: {
            ...(data.game || {}),
            phase: "playing"
          }
        });
      });
    }
  };

  // Global fallback for compatibility
  gameLogic.POOLS = POOLS;
  window.gameLogic = gameLogic;

  console.log('main.js yüklendi');
  const MIN_PLAYERS = 3;
  const DEFAULT_PLAYER_COUNT = 20; // Eski güvenlik kurallarıyla uyum için oyuncu sayısını varsayılanla gönder

  function resolveGamePhase(roomData) {
    return roomData?.game?.phase || roomData?.phase;
  }
  function isAlivePlayer(player) {
    const status = typeof player?.status === "string" ? player.status : "alive";
    return status === "alive";
  }
  function resolveVotes(roomData) {
    return roomData?.voting?.votes || roomData?.votes || {};
  }
  function getSpyUids(spies) {
    if (Array.isArray(spies)) return spies;
    if (spies && typeof spies === "object") return Object.keys(spies);
    return [];
  }
  function clearStoragePreservePromo() {
    const promoDismissedFlag = localStorage.getItem("promoModalDismissed");
    localStorage.removeItem("roomCode");
    localStorage.removeItem("playerName");
    localStorage.removeItem("isCreator");
    localStorage.clear();
    if (promoDismissedFlag) {
      localStorage.setItem("promoModalDismissed", promoDismissedFlag);
    }
  }
  function showEliminationOverlay(roomCode) {
    const overlay = document.getElementById("resultOverlay");
    const actions = document.getElementById("gameActions");
    if (!overlay) return;
    overlay.innerHTML = "";
    const message = document.createElement("div");
    message.className = "result-message";
    message.textContent = "Elendin! Oyun devam ediyor...";
    overlay.appendChild(message);
    const closeOverlay = () => {
      overlay.classList.add("hidden");
      overlay.classList.remove("impostor-animation", "innocent-animation");
      actions?.classList.add("hidden");
    };
    if (isCreator) {
      const actionBtn = document.createElement("button");
      actionBtn.classList.add("overlay-btn");
      actionBtn.textContent = "Yeniden oyna";
      actionBtn.addEventListener("click", () => {
        closeOverlay();
        gameLogic.restartGame(roomCode);
      });
      overlay.appendChild(actionBtn);
    } else {
      actions?.classList.add("hidden");
    }
    overlay.classList.remove("hidden", "impostor-animation", "innocent-animation");
    actions?.classList.add("hidden");
  }

  // Kullanıcının anonim şekilde doğrulandığından emin ol
  if (window.auth && !window.auth.currentUser) {
    window.auth.signInAnonymously().catch(err => {
      console.error("Anonim giriş hatası:", err);
    });
  }
  // Sayfa yenilendiğinde oyun bilgilerini koru, yeni oturumda sıfırla
  try {
    const nav = performance.getEntriesByType("navigation")[0];
    const isReload = nav ? nav.type === "reload" : performance.navigation.type === 1;
    if (!isReload) {
      clearStoragePreservePromo();
    }
  } catch (err) {
    console.warn("Gezinme performans kontrolü başarısız oldu:", err);
  }
  let currentRoomCode = localStorage.getItem("roomCode") || null;
  let currentPlayerName = localStorage.getItem("playerName") || null;
  let isCreator = localStorage.getItem("isCreator") === "true";
  let currentPlayers = [];
  let playerUidMap = {};
  let currentUid = null;
  let wasEliminated = false;
  let voteCandidatesSnapshot = null;
  let selectedVoteUid = null;
  let selectedVoteName = null;
  let voteCountdownInterval = null;
  let guessCountdownInterval = null;
  if (window.auth && typeof window.auth.onAuthStateChanged === "function") {
    window.auth.onAuthStateChanged(async user => {
      currentUid = user ? user.uid : null;
      if (user) {
        currentRoomCode = localStorage.getItem("roomCode") || null;
        currentPlayerName = localStorage.getItem("playerName") || null;
        isCreator = localStorage.getItem("isCreator") === "true";
        if (currentRoomCode && currentPlayerName) {
          const roomRef = window.db.ref("rooms/" + currentRoomCode);
          roomRef.get().then(roomSnap => {
            if (!roomSnap.exists()) {
              clearStoragePreservePromo();
              currentRoomCode = null;
              currentPlayerName = null;
              isCreator = false;
              showSetupJoin();
              return;
            }
            const roomData = roomSnap.val();
            const uid = user.uid;
            if (roomData?.eliminated && roomData.eliminated[uid] && roomData.status !== "finished") {
              wasEliminated = true;
              showRoomUI(currentRoomCode, currentPlayerName, isCreator);
              showEliminationOverlay(currentRoomCode);
              listenPlayersAndRoom(currentRoomCode);
              gameLogic.listenRoom(currentRoomCode);
              return;
            }
            const playerRef = window.db.ref(`rooms/${currentRoomCode}/players/${uid}`);
            if (typeof currentPlayerName === "string" && currentPlayerName.trim() !== "") {
              playerRef.set({
                name: currentPlayerName,
                isCreator
              });
            } else {
              console.error("Geçersiz veya boş oyuncu adı, veritabanı güncellemesi atlandı.");
            }
            showRoomUI(currentRoomCode, currentPlayerName, isCreator);
            listenPlayersAndRoom(currentRoomCode);
            gameLogic.listenRoom(currentRoomCode);
            window.db.ref("rooms/" + currentRoomCode).once("value", snapshot => {
              const roomData = snapshot.val();
              if (roomData && roomData.status === "started" && roomData.playerRoles && roomData.playerRoles[currentUid]) {
                document.getElementById("leaveRoomBtn")?.classList.add("hidden");
                document.getElementById("backToHomeBtn")?.classList.remove("hidden");
                const myData = roomData.playerRoles[currentUid];
                document.getElementById("roomInfo").classList.add("hidden");
                document.getElementById("playerRoleInfo").classList.remove("hidden");
                updateRoleDisplay(myData, roomData.settings);
              }
            });
          });
        } else {
          showSetupJoin();
        }
      } else {
        showSetupJoin();
      }
    });
  } else {
    console.warn("Firebase Auth yüklenmedi, temel arayüz başlatılıyor");
    showSetupJoin();
  }
  let lastVoteResult = null;
  let gameEnded = false;
  let lastGuessEvent = null;
  let lastVotingState = null;
  let parityHandled = false;
  let lastRoomStatus = null;
  let lastVotingFinalizedAt = null;
  let votingCleanupTimeout = null;
  let lastGuessOptionsKey = null;
  let lastGuessSelection = null;
  let lastRoundId = null;
  let lastRoundNumber = null;
  let endRoundTriggeredForRound = null;
  function isCurrentRoundPayload(roomData, payload) {
    if (!payload) return true;
    const roomRoundId = roomData?.roundId;
    const payloadRoundId = payload.roundId;
    if (roomRoundId && payloadRoundId && roomRoundId !== payloadRoundId) {
      return false;
    }
    return true;
  }
  function updateRoleDisplay(myData, settings) {
    const roleMessageEl = document.getElementById("roleMessage");
    const guessLabel = document.getElementById("guessLabel");
    const poolInfo = document.getElementById("poolInfo");
    const poolSummary = document.getElementById("poolSummary");
    const poolListEl = document.getElementById("poolList");
    const roleHintBlock = document.getElementById("roleHintBlock");
    const roleHintText = document.getElementById("roleHintText");
    const isCategory = settings?.gameType === "category";
    const poolLabel = isCategory ? "Sahtekarın gördüğü roller" : "Sahtekarın gördüğü konumlar";
    const roleHint = isCategory ? myData?.roleHint ?? myData?.role?.roleHint ?? myData?.role?.hint ?? null : null;
    if (roleHintBlock) {
      roleHintBlock.classList.add("hidden");
    }
    if (roleHintText) {
      roleHintText.textContent = "";
    }
    const resolvedRole = myData?.roleName ?? myData?.role?.name ?? myData?.role;
    const displayName = typeof resolvedRole === "string" ? resolvedRole : "";
    const poolEntries = (myData?.allLocations || []).map(item => item && typeof item === "object" ? item.name : item).filter(item => item !== undefined && item !== null && item !== "");
    if (myData && displayName && typeof displayName === "string" && displayName.includes("Sahtekar")) {
      const safeLocations = poolEntries.map(escapeHtml).join(", ");
      roleMessageEl.innerHTML = `🎭 Sen <b>SAHTEKAR</b>sın! ${isCategory ? "Rolü" : "Konumu"} bilmiyorsun.<br>` + `${isCategory ? "Olası roller" : "Olası konumlar"}: ${safeLocations}`;
      if (guessLabel) {
        guessLabel.textContent = isCategory ? "Rolü tahmin et:" : "Konumu tahmin et:";
      }
      poolInfo.classList.add("hidden");
      return;
    } else if (myData && displayName) {
      const safeLocation = escapeHtml(myData.location ?? "");
      const safeRole = escapeHtml(displayName);
      roleMessageEl.innerHTML = `📍 Konum: <b>${safeLocation}</b><br>` + `🎭 Rolün: <b>${safeRole}</b>`;
      poolSummary.textContent = poolLabel;
      poolListEl.textContent = poolEntries.map(escapeHtml).join(", ");
      poolInfo.classList.remove("hidden");
      if (roleHint && roleHintBlock && roleHintText) {
        roleHintText.textContent = roleHint;
        roleHintBlock.classList.remove("hidden");
      }
    } else {
      roleMessageEl.textContent = "Rol bilgisi bulunamadı.";
      poolInfo.classList.add("hidden");
      return;
    }
  }
  function getResolvedVoteResult(roomData) {
    const votingResult = roomData.voting?.result;
    if (!isCurrentRoundPayload(roomData, votingResult)) return null;
    if (votingResult) {
      if (votingResult.tie) return {
        tie: true
      };
      if (votingResult.eliminatedUid) {
        return {
          tie: false,
          voted: votingResult.eliminatedUid,
          eliminatedUid: votingResult.eliminatedUid,
          eliminatedName: votingResult.eliminatedName,
          isSpy: !!votingResult.isSpy,
          role: votingResult.role,
          location: votingResult.location,
          remainingSpies: votingResult.remainingSpies,
          lastSpy: votingResult.lastSpy,
          roundId: votingResult.roundId
        };
      }
    }
    if (!isCurrentRoundPayload(roomData, roomData.voteResult)) return null;
    return roomData.voteResult || null;
  }
  function getRoundKey(roomData) {
    if (!roomData) return "default";
    if (roomData.roundId) return `id:${roomData.roundId}`;
    if (roomData.round) return `num:${roomData.round}`;
    return "default";
  }
  function triggerEndRoundIfNeeded(roomData, resolvedResult) {
    if (!roomData || !resolvedResult || resolvedResult.tie) return false;
    const roundKey = getRoundKey(roomData);
    const alreadyTriggered = endRoundTriggeredForRound === roundKey;
    if (alreadyTriggered) return true;
    const eliminatedUid = resolvedResult.voted || resolvedResult.eliminatedUid;
    const isGameOngoing = roomData.status === "started";
    if (!eliminatedUid || !isGameOngoing) return false;
    endRoundTriggeredForRound = roundKey;
    gameLogic.endRound(currentRoomCode);
    return true;
  }
  function buildVotingOutcomeMessage(_ref) {
    let {
      eliminatedName,
      eliminatedIsImpostor,
      alivePlayersCount,
      aliveImpostorsCount,
      spyNames = []
    } = _ref;
    const safeName = escapeHtml(eliminatedName || "");
    const normalizedSpyNames = uniqueNames((spyNames || []).map(name => sanitizeName(name))).filter(Boolean);
    const impostorWinnersText = formatSpyWinnersText(normalizedSpyNames);
    if (eliminatedIsImpostor) {
      return {
        message: `Oylama sonucunda Sahtekar ${safeName} elendi ve oyunu masumlar kazandı!`,
        gameEnded: true,
        impostorVictory: false
      };
    }
    if (alivePlayersCount > 2) {
      return {
        message: `Oylama sonucunda ${safeName} elendi. Elenen kişi masumdu — oyun devam ediyor.`,
        gameEnded: false,
        gameEnded: false,
        impostorVictory: false
      };
    }
    if (alivePlayersCount === 2) {
      if (aliveImpostorsCount >= 1) {
        return {
          message: `Oylama sonucunda ${safeName} elendi. Elenen kişi masumdu — oyunu ${impostorWinnersText} kazandı!`,
          gameEnded: true,
          impostorVictory: true
        };
      }
      return {
        message: `Oylama sonucunda ${safeName} elendi. Elenen kişi masumdu — oyunu masumlar kazandı!`,
        gameEnded: true,
        impostorVictory: false
      };
    }
    return {
      message: `Oylama sonucunda ${safeName} elendi.`,
      gameEnded: false,
      impostorVictory: false
    };
  }
  function resolveEliminatedName(resolvedResult, roomData, votedUid, fallbackName) {
    if (resolvedResult?.eliminatedName) return resolvedResult.eliminatedName;
    if (roomData?.voting?.result?.eliminatedName) {
      return roomData.voting.result.eliminatedName;
    }
    const snapshotName = roomData?.voting?.snapshot?.names?.[votedUid];
    if (snapshotName) return snapshotName;
    const eliminatedRecordName = roomData?.eliminated?.[votedUid]?.name;
    if (eliminatedRecordName) return eliminatedRecordName;
    if (fallbackName) return fallbackName;
    const mappedName = playerUidMap[votedUid]?.name || roomData?.players?.[votedUid]?.name;
    if (mappedName) return mappedName;
    const rosterSources = [...(roomData?.voting?.snapshotPlayers || []), ...(roomData?.voting?.roster || [])];
    const rosterMatch = rosterSources.find(p => p?.uid === votedUid);
    if (rosterMatch?.name) return rosterMatch.name;
    return votedUid;
  }
  function buildVoteOutcomeContext(roomData, resolvedResult) {
    if (!roomData || !resolvedResult || resolvedResult.tie) return null;
    const votedUid = resolvedResult.voted || resolvedResult.eliminatedUid;
    if (!votedUid) return null;
    const votedName = resolveEliminatedName(resolvedResult, roomData, votedUid, playerUidMap[votedUid]?.name);
    const remaining = Object.entries(roomData.players || {}).filter(_ref2 => {
      let [uid, p] = _ref2;
      return uid !== votedUid && isAlivePlayer(p);
    }).map(_ref3 => {
      let [uid] = _ref3;
      return uid;
    });
    const activeSpies = getSpyUids(roomData.spies).filter(id => remaining.includes(id));
    const alivePlayersCount = remaining.length;
    const aliveImpostorsCount = activeSpies.length;
    const outcome = buildVotingOutcomeMessage({
      eliminatedName: votedName,
      eliminatedIsImpostor: resolvedResult.isSpy,
      alivePlayersCount,
      aliveImpostorsCount,
      spyNames: getSpyNames(roomData, roomData?.players)
    });
    return {
      votedUid,
      votedName,
      alivePlayersCount,
      aliveImpostorsCount,
      outcome
    };
  }
  function renderVoteResultOverlay(roomData, resolvedResult, outcomeContext) {
    const resolvedResultToRender = resolvedResult || getResolvedVoteResult(roomData);
    if (!resolvedResultToRender || resolvedResultToRender.tie) return false;
    if (!isCurrentRoundPayload(roomData, resolvedResultToRender)) return false;
    const context = outcomeContext || buildVoteOutcomeContext(roomData, resolvedResultToRender);
    if (!context) return false;
    const renderKey = JSON.stringify({
      result: resolvedResultToRender,
      context
    });
    if (renderKey === lastVoteResult) return true;
    lastVoteResult = renderKey;
    showResultOverlay({
      eliminatedIsImpostor: resolvedResultToRender.isSpy,
      eliminatedName: context.votedName,
      alivePlayersCount: context.alivePlayersCount,
      aliveImpostorsCount: context.aliveImpostorsCount,
      votedUid: context.votedUid
    }, roomData, resolvedResultToRender, context.outcome);
    return true;
  }
  function showResultOverlay(_ref4, roomData, resolvedResult, precomputedOutcome) {
    let {
      eliminatedIsImpostor,
      eliminatedName,
      alivePlayersCount,
      aliveImpostorsCount,
      votedUid
    } = _ref4;
    const resolvedEliminatedName = resolveEliminatedName(resolvedResult, roomData, votedUid, eliminatedName);
    const outcome = precomputedOutcome || buildVotingOutcomeMessage({
      eliminatedName: resolvedEliminatedName,
      eliminatedIsImpostor,
      alivePlayersCount,
      aliveImpostorsCount,
      spyNames: getSpyNames(roomData, roomData?.players)
    });
    const overlay = document.getElementById("resultOverlay");
    if (!overlay) {
      console.error("resultOverlay element not found");
      return;
    }
    const isEliminatedPlayer = currentUid === votedUid;
    const cls = outcome.impostorVictory ? "impostor-animation" : "innocent-animation";
    const msgDiv = document.createElement("div");
    msgDiv.className = "result-message";
    overlay.innerHTML = "";
    const actionsEl = document.getElementById("gameActions");
    const spyInfo = getSpyInfo(roomData);
    const resolvedMessage = resolveGameOverMessage(roomData, outcome.message, spyInfo);
    msgDiv.textContent = resolvedMessage;
    appendSpyNamesLine(msgDiv, roomData, {
      spyInfo,
      primaryMessage: resolvedMessage
    });
    if (outcome.gameEnded) {
      actionsEl?.classList.add("hidden");
    } else {
      actionsEl?.classList.remove("hidden");
    }
    overlay.appendChild(msgDiv);
    overlay.classList.remove("hidden", "impostor-animation", "innocent-animation");
    overlay.classList.add(cls);
    const shouldShowEliminationOverlay = isEliminatedPlayer && !outcome.gameEnded && alivePlayersCount > 2 && !outcome.impostorVictory;
    if (shouldShowEliminationOverlay) {
      showEliminationOverlay(currentRoomCode);
      return;
    }
    if (outcome.gameEnded) {
      let restartBtn;
      if (isCreator) {
        restartBtn = document.createElement("button");
        restartBtn.id = "restartBtn";
        restartBtn.classList.add("overlay-btn");
        restartBtn.textContent = "Yeniden oyna";
        overlay.appendChild(restartBtn);
      }
      const exitBtn = document.createElement("button");
      exitBtn.id = "exitBtn";
      exitBtn.classList.add("overlay-btn");
      exitBtn.textContent = "Odadan ayrıl";
      overlay.appendChild(exitBtn);
      const hideOverlay = () => {
        overlay.classList.add("hidden");
        overlay.classList.remove("impostor-animation", "innocent-animation");
      };
      if (restartBtn) {
        restartBtn.addEventListener("click", () => {
          hideOverlay();
          gameEnded = false;
          parityHandled = false;
          lastVoteResult = null;
          lastGuessEvent = null;
          restartBtn.disabled = true;
          gameLogic.restartGame(currentRoomCode);
        });
      }
      exitBtn.addEventListener("click", () => {
        hideOverlay();
        gameLogic.leaveRoom(currentRoomCode).finally(() => {
          showSetupJoin();
        });
      });
    } else if (!isEliminatedPlayer) {
      const btn = document.createElement("button");
      btn.id = "continueBtn";
      btn.classList.add("overlay-btn");
      btn.textContent = "Oyuna Devam Et";
      overlay.appendChild(btn);
      btn.addEventListener("click", () => {
        overlay.classList.add("hidden");
        overlay.classList.remove("impostor-animation", "innocent-animation");
        if (currentRoomCode && currentUid && window.db) {
          window.db.ref(`rooms/${currentRoomCode}/ui/${currentUid}`).update({
            screen: "playing"
          }).catch(err => console.error("Kullanıcı ekran durumu güncellenemedi:", err));
        }
      });
    }
  }
  function resolveAnswerValue(value, gameType) {
    if (value === undefined || value === null) return null;
    if (gameType === "category") {
      return resolveRoleName(value);
    }
    return typeof value === "string" ? value : String(value);
  }
  function getActualAnswer(roomData) {
    const isCategory = roomData?.settings?.gameType === "category";
    const roles = roomData?.playerRoles || {};
    for (const uid in roles) {
      const role = roles[uid];
      if (role && !role.isSpy) {
        const actualValue = isCategory ? role?.role : role?.location;
        return resolveAnswerValue(actualValue, roomData?.settings?.gameType);
      }
    }
    return null;
  }
  function buildGuessDetails(finalGuess, actualAnswer, gameType) {
    const isCategory = gameType === "category";
    const guessedValue = finalGuess?.guessedRole || finalGuess?.guessedLocation || finalGuess?.guess;
    const resolvedActualAnswer = resolveAnswerValue(actualAnswer, gameType);
    const lines = [];
    const hasGuess = Boolean(guessedValue);
    if (hasGuess) {
      const guessedLabel = isCategory ? "Sahtekarın tahmin ettiği rol:" : "Sahtekarın tahmin ettiği konum:";
      lines.push(`${guessedLabel} ${escapeHtml(String(guessedValue))}`);
      if (finalGuess?.isCorrect) {
        lines.push("Doğru tahmin!");
      } else if (resolvedActualAnswer) {
        const actualLabel = isCategory ? "Doğru rol:" : "Doğru konum:";
        lines.push(`${actualLabel} ${escapeHtml(resolvedActualAnswer)}`);
      }
    }
    return lines;
  }
  function normalizeFinalGuess(rawFinalGuess, roomData) {
    const finalGuess = rawFinalGuess || {};
    if (!isCurrentRoundPayload(roomData, finalGuess)) return null;
    const hasGuessValue = finalGuess.guessedRole || finalGuess.guessedLocation || finalGuess.guess;
    if (hasGuessValue) {
      return finalGuess;
    }
    const guessEntry = roomData?.lastGuess;
    if (!isCurrentRoundPayload(roomData, guessEntry)) return rawFinalGuess;
    const guessValue = guessEntry?.guess;
    if (!guessValue) return rawFinalGuess;
    const isCategory = roomData?.settings?.gameType === "category";
    const normalized = {
      isCorrect: !!guessEntry?.correct
    };
    if (isCategory) {
      normalized.guessedRole = guessValue;
      normalized.actualRole = getActualAnswer(roomData);
    } else {
      normalized.guessedLocation = guessValue;
      normalized.actualLocation = getActualAnswer(roomData);
    }
    return normalized;
  }
  function getGameOverInfo(roomData) {
    const gameOver = roomData?.gameOver;
    if (!gameOver || !gameOver.finalizedAt) return null;
    if (!isCurrentRoundPayload(roomData, gameOver)) return null;
    const spies = Array.isArray(gameOver.spies) ? gameOver.spies.filter(s => s?.uid && s?.name) : [];
    return {
      ...gameOver,
      spies
    };
  }
  function buildSpyNames(spies) {
    let players = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    const names = (spies || []).map(s => {
      const uid = s?.uid ?? s;
      const rawName = uid && players?.[uid]?.name || (typeof s === "object" ? s?.name : null) || (typeof uid === "string" ? uid : null);
      return sanitizeName(rawName);
    });
    return uniqueNames(names).filter(Boolean);
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
    return names.filter(name => {
      if (!name) return false;
      const key = typeof name === "string" ? name.toLowerCase() : name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  function formatSpyWinnersText(spyNames) {
    const cleaned = uniqueNames((spyNames || []).map(name => sanitizeName(name))).filter(Boolean);
    if (cleaned.length === 1) {
      return `sahtekar ${cleaned[0]}`;
    }
    if (cleaned.length > 1) {
      const lastName = cleaned[cleaned.length - 1];
      const leading = cleaned.slice(0, -1);
      const joined = leading.length ? `${leading.join(", ")} ve ${lastName}` : lastName;
      return `sahtekarlar ${joined}`;
    }
    return "sahtekarlar";
  }
  function formatSpyLabel(spyNames) {
    const count = Array.isArray(spyNames) ? spyNames.length : 0;
    return count <= 1 ? "Sahtekar" : "Sahtekarlar";
  }
  function formatSpyIntro(spyInfo) {
    const spyNames = Array.isArray(spyInfo) ? spyInfo : Array.isArray(spyInfo?.spyNames) ? spyInfo.spyNames : [];
    const label = formatSpyLabel(spyNames);
    const namesText = spyNames.join(", ");
    return namesText ? `${label} ${namesText}` : label;
  }
  function normalizeSpyLabel(message, spyInfo) {
    if (!message || !spyInfo?.hasNames) return message;
    const replacement = formatSpyIntro(spyInfo);
    const patterns = [/Sahtekar\(\s*lar\s*\)\s*\([^)]*\)/g, /Sahtekarlar\s*\([^)]*\)/g, /Sahtekar\(\s*lar\s*\)/g];
    const replaced = patterns.reduce((msg, pattern) => msg.replace(pattern, replacement), message);
    return replaced.replace(/\(\s*\)/g, "").replace(/\s{2,}/g, " ").trim();
  }
  function resolveGameOverMessage(roomData, fallbackMessage, spyInfo) {
    const gameOver = getGameOverInfo(roomData);
    if (gameOver?.message) {
      return gameOver.message;
    }
    return normalizeSpyLabel(fallbackMessage, spyInfo);
  }
  function appendGuessDetails(msgDiv, lines) {
    lines.forEach(line => {
      const detail = document.createElement("div");
      detail.innerHTML = line;
      msgDiv.appendChild(detail);
    });
  }
  function getSpyNames(roomState, players) {
    const state = roomState || {};
    const playerMap = players || state.players || {};
    const spiesSource = state.spies ?? state.spyUids ?? (Array.isArray(state.spiesSnapshot?.spies) ? state.spiesSnapshot.spies : null);
    if (Array.isArray(spiesSource)) {
      return buildSpyNames(spiesSource, playerMap);
    }
    const spyIds = getSpyUids(spiesSource);
    if (spyIds.length > 0) {
      return buildSpyNames(spyIds, playerMap);
    }
    return [];
  }
  function getSpyInfo(roomData) {
    const spyNames = getSpyNames(roomData, roomData?.players);
    const spiesLabel = spyNames.length ? spyNames.join(", ") : "—";
    const spyLabel = formatSpyLabel(spyNames);
    return {
      spyNames,
      spiesLabel,
      spyLabel,
      hasNames: spyNames.length > 0
    };
  }
  function appendSpyNamesLine(msgDiv, roomData) {
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    const spyInfo = options.spyInfo || getSpyInfo(roomData);
    const primaryMessage = options.primaryMessage || msgDiv?.textContent || "";
    const hasSnapshot = !!roomData?.spiesSnapshot && isCurrentRoundPayload(roomData, roomData.spiesSnapshot);
    const alreadyHasNames = spyInfo.hasNames && primaryMessage.includes(spyInfo.spiesLabel);
    if (!hasSnapshot || alreadyHasNames) return;
    const spyLine = document.createElement("div");
    spyLine.className = "spy-reveal";
    const label = spyInfo.spyLabel || formatSpyLabel(spyInfo.spyNames);
    spyLine.textContent = `${label}: ${spyInfo.spiesLabel}`;
    msgDiv.appendChild(spyLine);
  }
  function showSpyWinOverlay(roomData, finalGuess, gameType, actualAnswer) {
    const overlay = document.getElementById("resultOverlay");
    if (!overlay) {
      console.error("resultOverlay element not found");
      return;
    }
    const spyInfo = getSpyInfo(roomData);
    gameEnded = true;
    overlay.innerHTML = "";
    const msgDiv = document.createElement("div");
    msgDiv.className = "result-message";
    const guessWord = gameType === "category" ? "rolü" : "konumu";
    const guessedValue = finalGuess?.guessedRole || finalGuess?.guessedLocation || finalGuess?.guess;
    const spyIntro = formatSpyIntro(spyInfo);
    const fallbackMessage = guessedValue ? `${spyIntro} ${guessWord} ${guessedValue} olarak doğru tahmin etti ve oyunu kazandı!` : spyInfo.hasNames ? `${spyIntro} kazandı! Oyun Bitti...` : "Sahtekar(lar) kazandı! Oyun Bitti...";
    msgDiv.textContent = resolveGameOverMessage(roomData, fallbackMessage, spyInfo);
    appendSpyNamesLine(msgDiv, roomData, {
      spyInfo,
      primaryMessage: msgDiv.textContent
    });
    const resolvedActualAnswer = actualAnswer || finalGuess?.actualRole || finalGuess?.actualLocation;
    const detailLines = buildGuessDetails(finalGuess, resolvedActualAnswer || actualAnswer, gameType);
    appendGuessDetails(msgDiv, detailLines);
    overlay.appendChild(msgDiv);
    let restartBtn;
    if (isCreator) {
      restartBtn = document.createElement("button");
      restartBtn.id = "restartBtn";
      restartBtn.classList.add("overlay-btn");
      restartBtn.textContent = "Yeniden oyna";
      overlay.appendChild(restartBtn);
    }
    const exitBtn = document.createElement("button");
    exitBtn.id = "exitBtn";
    exitBtn.classList.add("overlay-btn");
    exitBtn.textContent = "Odadan ayrıl";
    overlay.appendChild(exitBtn);
    overlay.classList.remove("hidden", "impostor-animation", "innocent-animation");
    overlay.classList.add("impostor-animation");
    const hideOverlay = () => {
      overlay.classList.add("hidden");
      overlay.classList.remove("impostor-animation", "innocent-animation");
    };
    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        hideOverlay();
        gameEnded = false;
        parityHandled = false;
        lastVoteResult = null;
        lastGuessEvent = null;
        restartBtn.disabled = true;
        gameLogic.restartGame(currentRoomCode);
      });
    }
    exitBtn.addEventListener("click", () => {
      hideOverlay();
      gameLogic.leaveRoom(currentRoomCode).finally(() => {
        showSetupJoin();
      });
    });
  }
  function showSpyFailOverlay(roomData, finalGuess, gameType, actualAnswer) {
    const overlay = document.getElementById("resultOverlay");
    if (!overlay) {
      console.error("resultOverlay element not found");
      return;
    }
    const spyInfo = getSpyInfo(roomData);
    gameEnded = true;
    overlay.innerHTML = "";
    const msgDiv = document.createElement("div");
    msgDiv.className = "result-message";
    const guessWord = gameType === "category" ? "rolü" : "konumu";
    const actualWord = gameType === "category" ? "rol" : "konum";
    const guessedValue = finalGuess?.guessedRole || finalGuess?.guessedLocation || finalGuess?.guess;
    const resolvedActualAnswer = resolveAnswerValue(actualAnswer || finalGuess?.actualRole || finalGuess?.actualLocation, gameType);
    const spyIntro = formatSpyIntro(spyInfo);
    const guessDetail = guessedValue ? `${guessWord} ${escapeHtml(String(guessedValue))} olarak` : `${guessWord} olarak`;
    const fallbackMessage = resolvedActualAnswer ? `${spyIntro} ${guessDetail} yanlış tahmin etti. Doğru ${actualWord} ${escapeHtml(resolvedActualAnswer)} idi ve oyunu masumlar kazandı!` : `${spyIntro} ${guessDetail} yanlış tahmin etti ve oyunu masumlar kazandı!`;
    msgDiv.textContent = resolveGameOverMessage(roomData, fallbackMessage, spyInfo);
    appendSpyNamesLine(msgDiv, roomData, {
      spyInfo,
      primaryMessage: msgDiv.textContent
    });
    const detailLines = buildGuessDetails(finalGuess, resolvedActualAnswer, gameType);
    appendGuessDetails(msgDiv, detailLines);
    overlay.appendChild(msgDiv);
    let restartBtn;
    if (isCreator) {
      restartBtn = document.createElement("button");
      restartBtn.id = "restartBtn";
      restartBtn.classList.add("overlay-btn");
      restartBtn.textContent = "Yeniden oyna";
      overlay.appendChild(restartBtn);
    }
    const exitBtn = document.createElement("button");
    exitBtn.id = "exitBtn";
    exitBtn.classList.add("overlay-btn");
    exitBtn.textContent = "Odadan ayrıl";
    overlay.appendChild(exitBtn);
    overlay.classList.remove("hidden", "impostor-animation", "innocent-animation");
    overlay.classList.add("innocent-animation");
    const hideOverlay = () => {
      overlay.classList.add("hidden");
      overlay.classList.remove("impostor-animation", "innocent-animation");
    };
    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        hideOverlay();
        gameEnded = false;
        parityHandled = false;
        lastVoteResult = null;
        lastGuessEvent = null;
        restartBtn.disabled = true;
        gameLogic.restartGame(currentRoomCode);
      });
    }
    exitBtn.addEventListener("click", () => {
      hideOverlay();
      gameLogic.leaveRoom(currentRoomCode).finally(() => {
        showSetupJoin();
      });
    });
  }

  /** ------------------------
   *  ODA OLUŞTUR
   * ------------------------ */
  function updatePlayerList(playersObj) {
    const listEl = document.getElementById("playerList");
    const countEl = document.getElementById("playerCountDisplay");
    if (!listEl || !countEl) return;
    const aliveEntries = Object.values(playersObj || {}).filter(isAlivePlayer);
    const validPlayers = aliveEntries.map(p => p?.name || "").filter(p => p && p.trim() !== "");
    listEl.innerHTML = validPlayers.map(p => `<li>${escapeHtml(p)}</li>`).join("");
    countEl.textContent = validPlayers.length;
    updateStartButtonState(validPlayers.length);
  }
  function updateStartButtonState(joinedPlayerCount) {
    const startGameBtn = document.getElementById("startGameBtn");
    const warningEl = document.getElementById("startGameWarning");
    if (!startGameBtn) return;
    const hasEnoughPlayers = joinedPlayerCount >= MIN_PLAYERS;
    startGameBtn.disabled = !hasEnoughPlayers;
    startGameBtn.title = hasEnoughPlayers ? "" : "Oyunu başlatmak için en az 3 oyuncu gerekli.";
    if (warningEl) {
      const shouldShowWarning = !hasEnoughPlayers && isCreator && !startGameBtn.classList.contains("hidden");
      warningEl.classList.toggle("hidden", hasEnoughPlayers || !shouldShowWarning);
    }
  }
  function buildVoteCandidates(source) {
    return Object.entries(source || {}).filter(_ref5 => {
      let [uid, player] = _ref5;
      return uid !== currentUid && isAlivePlayer(player);
    }).map(_ref6 => {
      let [uid, p] = _ref6;
      return {
        uid,
        name: p?.name || uid
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }
  function renderVoteOptions(candidates) {
    const voteList = document.getElementById("voteList");
    const selectEl = document.getElementById("voteSelect");
    const items = candidates || [];
    if (voteList) {
      voteList.innerHTML = items.map(p => `<li><button type="button" class="vote-option" data-uid="${p.uid}">${escapeHtml(p.name)}</button></li>`).join("");
      if (selectedVoteUid) {
        voteList.querySelectorAll(".vote-option").forEach(btn => btn.classList.toggle("active", btn.dataset.uid === selectedVoteUid));
      }
    }
    if (selectEl) {
      selectEl.innerHTML = items.map(p => `<option value="${p.uid}">${escapeHtml(p.name)}</option>`).join("");
      if (selectedVoteUid) {
        selectEl.value = selectedVoteUid;
      }
    }
  }
  function lockVoteCandidates(roomData) {
    if (voteCandidatesSnapshot) return;
    const snapshot = roomData?.voting?.snapshot;
    const playerEntries = roomData?.players || playerUidMap || {};
    if (snapshot?.order?.length) {
      voteCandidatesSnapshot = snapshot.order.map(uid => ({
        uid,
        name: snapshot.names?.[uid] || roomData?.players?.[uid]?.name || playerUidMap[uid]?.name || uid
      })).filter(p => {
        if (!p.uid || p.uid === currentUid) return false;
        const playerEntry = playerEntries[p.uid];
        return !playerEntry || isAlivePlayer(playerEntry);
      });
      renderVoteOptions(voteCandidatesSnapshot);
      return;
    }
    const legacySnapshot = roomData?.voting?.snapshotPlayers;
    const source = legacySnapshot && legacySnapshot.length ? legacySnapshot.reduce((acc, p) => {
      if (p?.uid) acc[p.uid] = {
        name: p.name,
        status: p.status
      };
      return acc;
    }, {}) : roomData?.players || playerUidMap;
    voteCandidatesSnapshot = buildVoteCandidates(source);
    renderVoteOptions(voteCandidatesSnapshot);
  }
  function unlockVoteCandidates() {
    voteCandidatesSnapshot = null;
    renderVoteOptions(buildVoteCandidates(playerUidMap));
  }
  function updateSelectedVoteName() {
    if (!selectedVoteUid) return;
    const latestName = playerUidMap[selectedVoteUid]?.name || selectedVoteName || selectedVoteUid;
    if (latestName !== selectedVoteName) {
      selectedVoteName = latestName;
      const selectedNameEl = document.getElementById("selectedPlayerName");
      if (selectedNameEl) selectedNameEl.textContent = selectedVoteName;
      const confirmArea = document.getElementById("voteConfirmArea");
      const confirmTextEl = document.getElementById("voteConfirmText");
      const isConfirmVisible = confirmArea && !confirmArea.classList.contains("hidden");
      if (confirmTextEl && isConfirmVisible) {
        confirmTextEl.textContent = `${selectedVoteName} kişisine oy veriyorsun. Onaylıyor musun?`;
      }
    }
  }
  function resetVoteSelection() {
    selectedVoteUid = null;
    selectedVoteName = null;
    const selectionCard = document.getElementById("voteSelectionCard");
    selectionCard?.classList.add("hidden");
    const confirmArea = document.getElementById("voteConfirmArea");
    confirmArea?.classList.add("hidden");
    const confirmBtn = document.getElementById("confirmVoteBtn");
    if (confirmBtn) confirmBtn.disabled = false;
    const submitVoteBtn = document.getElementById("submitVoteBtn");
    if (submitVoteBtn) submitVoteBtn.disabled = true;
    const voteList = document.getElementById("voteList");
    voteList?.querySelectorAll(".vote-option").forEach(btn => btn.classList.remove("active"));
  }
  function setSelectedVote(uid, name) {
    selectedVoteUid = uid;
    selectedVoteName = name;
    const selectionCard = document.getElementById("voteSelectionCard");
    const selectedNameEl = document.getElementById("selectedPlayerName");
    if (selectedNameEl) selectedNameEl.textContent = selectedVoteName;
    selectionCard?.classList.remove("hidden");
    const submitVoteBtn = document.getElementById("submitVoteBtn");
    if (submitVoteBtn) submitVoteBtn.disabled = !selectedVoteUid;
    const confirmArea = document.getElementById("voteConfirmArea");
    confirmArea?.classList.add("hidden");
    const confirmBtn = document.getElementById("confirmVoteBtn");
    if (confirmBtn) confirmBtn.disabled = false;
  }
  function showVoteConfirmation() {
    if (!selectedVoteUid || !selectedVoteName) return;
    const confirmArea = document.getElementById("voteConfirmArea");
    const confirmText = document.getElementById("voteConfirmText");
    if (confirmText) confirmText.textContent = `${selectedVoteName} kişisine oy veriyorsun. Onaylıyor musun?`;
    confirmArea?.classList.remove("hidden");
  }
  function resetLocalRoundState() {
    gameEnded = false;
    parityHandled = false;
    lastVoteResult = null;
    lastGuessEvent = null;
    lastVotingState = null;
    lastVotingFinalizedAt = null;
    voteCandidatesSnapshot = null;
    selectedVoteUid = null;
    selectedVoteName = null;
    lastGuessOptionsKey = null;
    lastGuessSelection = null;
    endRoundTriggeredForRound = null;
    clearInterval(voteCountdownInterval);
    voteCountdownInterval = null;
    clearInterval(guessCountdownInterval);
    guessCountdownInterval = null;
    const overlay = document.getElementById("resultOverlay");
    if (overlay) {
      overlay.classList.add("hidden");
      overlay.classList.remove("impostor-animation", "innocent-animation");
      overlay.innerHTML = "";
    }
  }

  /** ------------------------
   *  ODA & OYUNCULARI DİNLE
   * ------------------------ */
  function listenPlayersAndRoom(roomCode) {
    // Oyuncu listesi
    gameLogic.listenPlayers(roomCode, (playerNames, playersObj) => {
      // İsim dizisini kullanarak UI'da oyuncu listesini ve oyuncu sayısını güncelle
      updatePlayerList(playersObj);

      // Ham oyuncu nesnesini eşleştirme ve açılır menüyü doldurma için kullan
      playerUidMap = playersObj || {};

      // Geçerli oyuncuların (isimler) filtrelenmiş bir dizisini tut
      currentPlayers = Object.values(playersObj || {}).filter(isAlivePlayer).map(p => p?.name).filter(p => p && p.trim() !== "");
      const candidates = voteCandidatesSnapshot || buildVoteCandidates(playerUidMap);
      renderVoteOptions(candidates);
      updateSelectedVoteName();
    });

    // Oda silinirse herkesi at (oyun bitmediyse)
    window.db.ref("rooms/" + roomCode).on("value", snapshot => {
      if (!snapshot.exists() && !gameEnded) {
        clearStoragePreservePromo();
        location.reload();
      }
    });

    // Oyun başlama durumunu canlı dinle
    window.db.ref("rooms/" + roomCode).on("value", snapshot => {
      const resultEl = document.getElementById("voteResults");
      const outcomeEl = document.getElementById("voteOutcome");
      const roomData = snapshot.val();
      const prevStatus = lastRoomStatus;
      lastRoomStatus = roomData ? roomData.status : null;
      const currentRoundId = roomData?.roundId || null;
      const currentRoundNumber = roomData?.round ?? null;
      const roundIdChanged = currentRoundId !== null && lastRoundId !== null && currentRoundId !== lastRoundId;
      const roundNumberChanged = currentRoundNumber !== null && lastRoundNumber !== null && currentRoundNumber !== lastRoundNumber;
      const roundChanged = roundIdChanged || roundNumberChanged;
      const roundResetNeeded = roomData?.status === "waiting" && (currentRoundId === null && lastRoundId !== null || currentRoundNumber === null && lastRoundNumber !== null);
      if (roundChanged || roundResetNeeded) {
        resetLocalRoundState();
      }
      lastRoundId = currentRoundId;
      lastRoundNumber = currentRoundNumber;
      const currentVotingResult = isCurrentRoundPayload(roomData, roomData?.voting?.result) ? roomData?.voting?.result : null;
      const currentVoteResult = isCurrentRoundPayload(roomData, roomData?.voteResult) ? roomData?.voteResult : null;
      const currentGuessState = isCurrentRoundPayload(roomData, roomData?.guess) ? roomData?.guess : null;
      const currentLastGuess = isCurrentRoundPayload(roomData, roomData?.lastGuess) ? roomData?.lastGuess : null;
      const roundSafeGameOver = getGameOverInfo(roomData);
      const resolvedVoteResult = getResolvedVoteResult(roomData);
      const voteOutcomeContext = buildVoteOutcomeContext(roomData, resolvedVoteResult);
      const voteEndsGame = !!voteOutcomeContext && (voteOutcomeContext.outcome?.gameEnded || voteOutcomeContext.outcome?.impostorVictory);
      const isEliminatedPlayer = roomData?.eliminated && roomData.eliminated[currentUid] || roomData?.players?.[currentUid]?.status === "eliminated";
      const isGameFinished = roomData?.status === "finished" || roomData?.spyParityWin;
      const shouldShowEliminationOverlay = isEliminatedPlayer && !isGameFinished && !voteEndsGame;
      if (shouldShowEliminationOverlay) {
        wasEliminated = true;
        showEliminationOverlay(roomCode);
        return;
      } else if (isEliminatedPlayer) {
        wasEliminated = true;
      } else if (wasEliminated && prevStatus === "finished" && (roomData?.status === "waiting" || roomData?.status === "started") && (!roomData?.eliminated || !roomData.eliminated[currentUid])) {
        wasEliminated = false;
        if (currentPlayerName) {
          window.db.ref(`rooms/${roomCode}/players/${currentUid}`).set({
            name: currentPlayerName,
            isCreator
          });
        }
        const overlay = document.getElementById("resultOverlay");
        if (overlay) {
          overlay.classList.add("hidden");
          overlay.classList.remove("impostor-animation", "innocent-animation");
          overlay.innerHTML = "";
        }
        const roleMessageEl = document.getElementById("roleMessage");
        const poolInfo = document.getElementById("poolInfo");
        const poolSummary = document.getElementById("poolSummary");
        const poolListEl = document.getElementById("poolList");
        const roleHintBlock = document.getElementById("roleHintBlock");
        const roleHintText = document.getElementById("roleHintText");
        if (roleMessageEl) roleMessageEl.innerHTML = "";
        if (poolSummary) poolSummary.textContent = "";
        if (poolListEl) poolListEl.textContent = "";
        if (roleHintText) roleHintText.textContent = "";
        roleHintBlock?.classList.add("hidden");
        poolInfo?.classList.add("hidden");
        if (roomData.status === "started" && roomData.playerRoles && roomData.playerRoles[currentUid]) {
          updateRoleDisplay(roomData.playerRoles[currentUid], roomData.settings);
        }
      }
      if (roomData && roomData.status === "started" && prevStatus !== "started") {
        const overlay = document.getElementById("resultOverlay");
        if (overlay) {
          overlay.classList.add("hidden");
          overlay.classList.remove("impostor-animation", "innocent-animation");
        }
        gameEnded = false;
        lastVoteResult = null;
        lastGuessEvent = null;
      parityHandled = false;
    }
    if (roomData && roomData.players) {
      playerUidMap = roomData.players;
      currentPlayers = Object.values(playerUidMap).filter(isAlivePlayer).map(p => p.name).filter(p => p && p.trim() !== "");
      updatePlayerList(playerUidMap);
      const candidates = voteCandidatesSnapshot || buildVoteCandidates(playerUidMap);
      renderVoteOptions(candidates);
      updateSelectedVoteName();
    }
      const leaveBtn = document.getElementById("leaveRoomBtn");
      const exitBtn = document.getElementById("backToHomeBtn");
      if (roomData && (roomData.spyParityWin || roomData.status === "finished" && roomData.winner === "spy")) {
        const resolvedSpyVoteResult = getResolvedVoteResult(roomData);
        const resolvedSpyVoteFallback = !resolvedSpyVoteResult && roomData?.voting?.status === "resolved" && roomData?.voting?.result ? normalizeVotingResult(roomData.voting.result) : null;
        const activeVoteResult = resolvedSpyVoteResult || resolvedSpyVoteFallback || null;

        if (activeVoteResult && !activeVoteResult.tie) {
          const voteOutcomeContext = buildVoteOutcomeContext(roomData, activeVoteResult);
          const handledByVote = renderVoteResultOverlay(roomData, activeVoteResult, voteOutcomeContext);
          if (handledByVote) return;
        }

        const finalGuess = normalizeFinalGuess(roundSafeGameOver?.finalGuess || currentLastGuess?.finalGuess || null, roomData);
        const actualAnswer = getActualAnswer(roomData);
        const gameType = roomData.settings?.gameType;
        if (!parityHandled) {
          showSpyWinOverlay(roomData, finalGuess, gameType, actualAnswer);
        }
        window.db.ref(`rooms/${roomCode}/spyParityWin`).remove();
        return;
      }
      if (roomData && roomData.status === "finished" && roomData.winner === "innocent") {
        const handledByVote = renderVoteResultOverlay(roomData, resolvedVoteResult, voteOutcomeContext);
        if (handledByVote) return;
        const finalGuess = normalizeFinalGuess(roundSafeGameOver?.finalGuess || currentLastGuess?.finalGuess || null, roomData);
        const actualAnswer = getActualAnswer(roomData);
        const gameType = roomData.settings?.gameType;
        showSpyFailOverlay(roomData, finalGuess, gameType, actualAnswer);
        return;
      }
      if (!roomData || roomData.status !== "started") {
        document.getElementById("gameActions").classList.add("hidden");
        leaveBtn?.classList.remove("hidden");
        exitBtn?.classList.remove("hidden");
        lastGuessOptionsKey = null;
        lastGuessSelection = null;
        return;
      }
      leaveBtn?.classList.add("hidden");
      exitBtn?.classList.remove("hidden");
      if (roomData.playerRoles && roomData.playerRoles[currentUid]) {
        const myData = roomData.playerRoles[currentUid];
        document.getElementById("roomInfo").classList.add("hidden");
        document.getElementById("playerRoleInfo").classList.remove("hidden");
        document.getElementById("gameActions").classList.remove("hidden");
        if (roomData.status === "started" && prevStatus !== "started") {
          setTimeout(() => window.scrollTo(0, 0), 0);
        }
        updateRoleDisplay(myData, roomData.settings);
        if (myData && myData.role) {
          const guessesLeft = myData.guessesLeft ?? 0;
          const roleDisplay = myData.role?.name ?? myData.role;
          const isSpy = roleDisplay && typeof roleDisplay === "string" && roleDisplay.includes("Sahtekar");
          if (isSpy && guessesLeft > 0) {
            const guessSection = document.getElementById("guessSection");
            guessSection.classList.remove("hidden");
            const guessSelect = document.getElementById("guessSelect");
            const locations = myData.allLocations || [];
            const displayLocations = locations.map(loc => loc && typeof loc === "object" ? loc.name : loc).filter(loc => loc !== undefined && loc !== null && loc !== "");
            const locationsKey = JSON.stringify(displayLocations);
            const previousSelection = guessSelect.value || lastGuessSelection;
            if (locationsKey !== lastGuessOptionsKey) {
              guessSelect.innerHTML = displayLocations.map(loc => `<option value="${escapeHtml(loc)}">${escapeHtml(loc)}</option>`).join("");
              lastGuessOptionsKey = locationsKey;
            }
            const selectionToRestore = displayLocations.includes(previousSelection) ? previousSelection : guessSelect.value;
            if (selectionToRestore) {
              guessSelect.value = selectionToRestore;
            }
            if (!guessSelect.value && guessSelect.options.length > 0) {
              guessSelect.value = guessSelect.options[0].value;
            }
            lastGuessSelection = guessSelect.value || null;
          } else {
            document.getElementById("guessSection").classList.add("hidden");
            lastGuessOptionsKey = null;
            lastGuessSelection = null;
          }
        } else {
          document.getElementById("guessSection").classList.add("hidden");
          lastGuessOptionsKey = null;
          lastGuessSelection = null;
        }
        const votingInstructionEl = document.getElementById("votingInstruction");
        if (votingInstructionEl) {
          votingInstructionEl.textContent = "Her tur en az 1 tek kelimelik ipucu verin. Hazır olduğunuzda oylamayı başlatabilirsiniz.";
        }

        // Oylama durumu
        const currentPhase = resolveGamePhase(roomData);
        const isVotingPhase = currentPhase === "voting" || roomData.votingStarted === true || roomData.voting?.status === "in_progress";
        if (roomData.voting?.status === "in_progress" || roomData.votingStarted) {
          lockVoteCandidates(roomData);
        } else {
          unlockVoteCandidates();
          resetVoteSelection();
        }
        const votingStateKey = JSON.stringify({
          votingStarted: roomData.votingStarted,
          votingStatus: roomData.voting?.status,
          votes: roomData.voting?.votes
        });
        if (votingStateKey !== lastVotingState) {
          const votingSection = document.getElementById("votingSection");
          const hasVoted = roomData.voting?.votes && roomData.voting.votes[currentUid];
          const hasResult = currentVotingResult?.finalizedAt || currentVoteResult;
          const shouldShowVoting = roomData.voting?.status === "in_progress" && !hasVoted && !hasResult;
          if (votingSection) {
            votingSection.classList.toggle("hidden", !shouldShowVoting);
          }
          const submitVoteBtn = document.getElementById("submitVoteBtn");
          if (submitVoteBtn) submitVoteBtn.disabled = !!hasVoted || !selectedVoteUid;
          const votePendingMsg = document.getElementById("votePendingMsg");
          if (votePendingMsg) {
            votePendingMsg.classList.toggle("hidden", !(hasVoted && !hasResult));
          }
          if (roomData.voting?.status !== "in_progress" || hasVoted) {
            const confirmArea = document.getElementById("voteConfirmArea");
            confirmArea?.classList.add("hidden");
          }
          lastVotingState = votingStateKey;
        }
        updateSelectedVoteName();
        const voteCountdownEl = document.getElementById("voteCountdown");
        const votingEndsAt = roomData.voting?.endsAt;
        const votingFinalized = currentVotingResult?.finalizedAt || currentVoteResult;
        const isVotingCountdownActive = roomData.voting?.status === "in_progress" && !votingFinalized;
        const stopVoteCountdown = function () {
          let hide = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
          clearInterval(voteCountdownInterval);
          voteCountdownInterval = null;
          if (hide) {
            voteCountdownEl?.classList.add("hidden");
          }
        };
        if (isVotingCountdownActive) {
          const updateCountdown = () => {
            const remaining = (votingEndsAt ?? 0) - (getServerNow() || Date.now());
            const remainingMs = Math.max(0, remaining);
            if (voteCountdownEl) {
              const seconds = Math.ceil(remainingMs / 1000);
              const padded = String(Math.max(0, seconds)).padStart(2, "0");
              voteCountdownEl.textContent = `Oylama bitiyor: 00:${padded}`;
              voteCountdownEl.classList.toggle("hidden", false);
            }
            if (remaining <= 0) {
              if (voteCountdownEl) {
                voteCountdownEl.textContent = "Oylama bitiyor: 00:00";
                voteCountdownEl.classList.toggle("hidden", false);
              }
              stopVoteCountdown(false);
              gameLogic.finalizeVoting(currentRoomCode, "time_up");
              return false;
            }
            return true;
          };
          stopVoteCountdown(false);
          const shouldContinue = updateCountdown();
          if (shouldContinue) {
            voteCountdownInterval = setInterval(() => {
              const stillActive = updateCountdown();
              if (!stillActive) {
                stopVoteCountdown(false);
              }
            }, 1000);
          }
        } else {
          stopVoteCountdown();
        }
        const guessState = currentGuessState;
        const shouldShowGuessCountdown = guessState?.spyUid === currentUid && guessState.endsAt && !currentLastGuess && roomData.status !== "finished";
        if (shouldShowGuessCountdown && voteCountdownEl) {
          const updateGuessCountdown = () => {
            const remainingMs = Math.max(0, guessState.endsAt - Date.now());
            const seconds = Math.ceil(remainingMs / 1000);
            const padded = String(Math.max(0, seconds)).padStart(2, "0");
            voteCountdownEl.textContent = `Tahmin süresi: 00:${padded}`;
            voteCountdownEl.classList.toggle("hidden", false);
            if (remainingMs <= 0) {
              clearInterval(guessCountdownInterval);
              guessCountdownInterval = null;
              gameLogic.finalizeGuessTimeout(currentRoomCode);
            }
          };
          clearInterval(guessCountdownInterval);
          updateGuessCountdown();
          guessCountdownInterval = setInterval(updateGuessCountdown, 1000);
        } else {
          clearInterval(guessCountdownInterval);
          guessCountdownInterval = null;
        }
        const startBtn = document.getElementById("startVotingBtn");
        const waitingEl = document.getElementById("waitingVoteStart");
        const voteRequests = roomData.voteStartRequests || {};
        const votingStatus = roomData.voting?.status;
        const alivePlayers = getActivePlayers(roomData.playerRoles, roomData.players).map(p => ({
          ...p,
          name: p.name || playerUidMap[p.uid]?.name || p.uid
        }));
        const aliveUids = alivePlayers.map(p => p.uid);
        const playersCount = alivePlayers.length;
        const filteredRequests = aliveUids.reduce((acc, uid) => {
          if (voteRequests[uid]) acc[uid] = true;
          return acc;
        }, {});
        const requestCount = Object.keys(filteredRequests).length;
        const hasRequested = !!filteredRequests[currentUid];
        const threshold = Math.floor(playersCount / 2) + 1;
        const isWaiting = votingStatus !== "in_progress" && !roomData.votingStarted && hasRequested && requestCount < threshold;
        if (startBtn) {
          startBtn.classList.toggle("hidden", isVotingPhase || isWaiting);
          startBtn.disabled = isWaiting;
        }
        if (waitingEl) {
          waitingEl.classList.toggle("hidden", !isWaiting);
          if (isWaiting) {
            waitingEl.textContent = `Oylama isteği gönderildi (${requestCount}/${threshold}). Aktif oyuncuların onayı bekleniyor...`;
          }
        }
        if (votingInstructionEl) {
          if (!roomData.votingStarted && !hasRequested) {
            votingInstructionEl.classList.remove("hidden");
            votingInstructionEl.textContent = "Her tur tek kelimelik ipucu verin. Hazır olduğunuzda oylamayı başlatabilirsiniz.";
          } else {
            votingInstructionEl.classList.add("hidden");
          }
        }
        const liveVoteCounts = document.getElementById("liveVoteCounts");
        const voteCountList = document.getElementById("voteCountList");
        const hasActiveVoting = roomData.voting?.status === "in_progress";
        const votingHasResult = currentVotingResult?.finalizedAt || currentVoteResult;
        if (!hasActiveVoting || votingHasResult) {
          liveVoteCounts?.classList.add("hidden");
          if (voteCountList) voteCountList.innerHTML = "";
        } else {
          liveVoteCounts?.classList.remove("hidden");
          const tally = {};
          const alivePlayerList = getActivePlayers(roomData.playerRoles, roomData.players);
          const aliveUids = new Set(alivePlayerList.map(p => p.uid));
          Object.entries(roomData.voting?.votes || {}).forEach(_ref7 => {
            let [voter, uid] = _ref7;
            if (!aliveUids.has(voter) || !aliveUids.has(uid)) return;
            tally[uid] = (tally[uid] || 0) + 1;
          });
          const snapshot = roomData.voting?.snapshot;
          const playerMap = snapshot?.names ? snapshot.order.map(uid => ({
            uid,
            name: snapshot.names[uid] || playerUidMap[uid]?.name || uid
          })) : (roomData.voting?.snapshotPlayers || []).map(p => ({
            uid: p.uid,
            name: p.name
          })).filter(p => p.uid) || [];
          const filteredSnapshotPlayers = playerMap.filter(p => aliveUids.has(p.uid));
          const fallbackPlayers = !filteredSnapshotPlayers.length ? Object.entries(roomData.players || playerUidMap || {}).filter(_ref8 => {
            let [, p] = _ref8;
            return isAlivePlayer(p);
          }).map(_ref9 => {
            let [uid, p] = _ref9;
            return {
              uid,
              name: p?.name || uid
            };
          }) : filteredSnapshotPlayers;
          const ranked = fallbackPlayers.map(p => ({
            uid: p.uid,
            name: p.name,
            count: tally[p.uid] || 0
          }));
          ranked.sort((a, b) => b.count - a.count);
          if (voteCountList) {
            voteCountList.innerHTML = ranked.map((p, i) => `<li>${i + 1}) ${escapeHtml(p.name)} – ${p.count}</li>`).join("");
          }
        }
        const hasElimination = resolvedVoteResult && !resolvedVoteResult.tie && (resolvedVoteResult.voted || resolvedVoteResult.eliminatedUid);
        const endRoundTriggered = triggerEndRoundIfNeeded(roomData, resolvedVoteResult);
        if (resolvedVoteResult) {
          if (resolvedVoteResult.tie) {
            resultEl.classList.remove("hidden");
            outcomeEl.textContent = "Oylar eşit! Oylama yeniden başlayacak.";
            document.getElementById("nextRoundBtn").classList.add("hidden");
          } else {
            renderVoteResultOverlay(roomData, resolvedVoteResult, voteOutcomeContext);
            resultEl.classList.add("hidden");
          }
        } else {
          resultEl.classList.add("hidden");
          lastVoteResult = null;
        }
        if (currentLastGuess) {
          const guessKey = JSON.stringify(currentLastGuess);
          if (guessKey !== lastGuessEvent) {
            lastGuessEvent = guessKey;
            const guessWord = roomData.settings?.gameType === "category" ? "rolü" : "konumu";
            const isSpyGuess = currentLastGuess.spy === currentUid;
            const msg = isSpyGuess ? `Yanlış tahmin ettin! ${guessWord} ${currentLastGuess.guess}. Kalan tahmin hakkı: ${currentLastGuess.guessesLeft}` : `Sahtekar ${guessWord} ${currentLastGuess.guess} tahmin etti ama yanıldı. Kalan tahmin hakkı: ${currentLastGuess.guessesLeft}`;
            alert(msg);
          }
        } else {
          lastGuessEvent = null;
        }
        const votingResult = currentVotingResult;
        const aliveList = getActivePlayers(roomData.playerRoles, roomData.players);
        const allAlivePlayers = aliveList.map(p => p.uid);
        const voteCount = Object.entries(resolveVotes(roomData)).filter(_ref0 => {
          let [voter, target] = _ref0;
          return allAlivePlayers.includes(voter) && allAlivePlayers.includes(target);
        }).length;
        const currentServerNow = getServerNow() || Date.now();
        const shouldFinalizeByCount = isCreator && roomData.voting?.status === "in_progress" && allAlivePlayers.length > 0 && voteCount === allAlivePlayers.length && !votingResult?.finalizedAt;
        const shouldFinalizeByTimeout = isCreator && roomData.voting?.status === "in_progress" && typeof roomData.voting.endsAt === "number" && currentServerNow >= roomData.voting.endsAt && !votingResult?.finalizedAt;
        if (shouldFinalizeByCount) {
          gameLogic.finalizeVoting(currentRoomCode, "all_voted");
        } else if (shouldFinalizeByTimeout) {
          gameLogic.finalizeVoting(currentRoomCode, "time_up");
        }
        const finalizedAt = votingResult?.finalizedAt;
        const shouldScheduleCleanup = finalizedAt && roomData.voting?.status !== "in_progress" && roomData.status === "started" && !currentGuessState && (!hasElimination || endRoundTriggered);
        if (shouldScheduleCleanup && finalizedAt !== lastVotingFinalizedAt) {
          lastVotingFinalizedAt = finalizedAt;
          if (votingCleanupTimeout) clearTimeout(votingCleanupTimeout);
          votingCleanupTimeout = setTimeout(() => {
            gameLogic.resetVotingState(currentRoomCode);
          }, 4000);
        } else if (!finalizedAt) {
          lastVotingFinalizedAt = null;
        }
      }
    });
  }

  /** ------------------------
   *  ODA UI GÖSTER
   * ------------------------ */
  function showRoomUI(roomCode, playerName, isCreator) {
    // UI güncelleme
    document.getElementById("setup").classList.add("hidden");
    document.getElementById("playerJoin").classList.add("hidden");
    document.getElementById("roomInfo").classList.remove("hidden");
    document.getElementById("roomCode").textContent = roomCode;
    document.getElementById("roomTitle").textContent = isCreator ? "Oda başarıyla oluşturuldu!" : "Oyun odasına hoş geldiniz!";
    document.getElementById("roomInstructions").textContent = isCreator ? "Diğer oyuncular bu kodla giriş yapabilir." : "Oda kurucusunun oyunu başlatmasını bekleyin.";
    const startGameBtn = document.getElementById("startGameBtn");
    if (startGameBtn) {
      startGameBtn.classList.toggle("hidden", !isCreator);
    }
    document.getElementById("leaveRoomBtn").classList.remove("hidden");
    setTimeout(() => window.scrollTo(0, 0), 0);
  }
  function showSetupJoin() {
    document.getElementById("setup").classList.remove("hidden");
    document.getElementById("playerJoin").classList.remove("hidden");
    document.getElementById("roomInfo").classList.add("hidden");
    document.getElementById("playerRoleInfo").classList.add("hidden");
    document.getElementById("gameActions").classList.add("hidden");
  }

  /** ------------------------
   *  EVENT LISTENERS
   * ------------------------ */
  function initUI() {
    const gameTypeSelect = document.getElementById("gameType");
    const categoryLabel = document.getElementById("categoryLabel");
    const categorySelect = document.getElementById("categoryName");
    if (categorySelect) {
      categorySelect.innerHTML = "";
      Object.keys(POOLS).filter(key => key !== "locations").forEach(key => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = key;
        categorySelect.appendChild(opt);
      });
    }
    const updateCategoryVisibility = () => {
      const show = gameTypeSelect?.value === "category";
      categoryLabel?.classList.toggle("hidden", !show);
      categorySelect?.classList.toggle("hidden", !show);
    };
    gameTypeSelect?.addEventListener("change", updateCategoryVisibility);
    updateCategoryVisibility();
    async function prefillSettings() {
      if (!gameLogic.loadSettings) return;
      try {
        const saved = await gameLogic.loadSettings();
        if (!saved) return;
        const spyCountEl = document.getElementById("spyCount");
        const spyGuessCountEl = document.getElementById("spyGuessCount");
        const poolSizeEl = document.getElementById("poolSize");
        const voteAnytimeEl = document.getElementById("voteAnytime");
        if (saved.spyCount) spyCountEl.value = saved.spyCount;
        if (saved.spyGuessLimit) spyGuessCountEl.value = saved.spyGuessLimit;
        if (saved.poolSize) poolSizeEl.value = saved.poolSize;
        if (typeof saved.voteAnytime !== "undefined") voteAnytimeEl.checked = saved.voteAnytime;
        if (saved.gameType) {
          gameTypeSelect.value = saved.gameType;
          const show = saved.gameType === "category";
          categoryLabel.classList.toggle("hidden", !show);
          categorySelect.classList.toggle("hidden", !show);
          if (show && saved.categoryName) {
            categorySelect.value = saved.categoryName;
          }
        }
      } catch (err) {
        console.warn("Ayarlar yüklenemedi:", err);
      }
    }
    prefillSettings();
    resetVoteSelection();
    const createRoomBtn = document.getElementById("createRoomBtn");
    const createRoomLoading = document.getElementById("createRoomLoading");
    const saveSettingsBtn = document.getElementById("saveSettingsBtn");
    const joinRoomBtn = document.getElementById("joinRoomBtn");
    saveSettingsBtn.addEventListener("click", async () => {
      const settings = await buildSettings();
      try {
        await gameLogic.saveSettings(settings);
        alert("Ayarlar kaydedildi!");
      } catch (err) {
        alert(err.message || err);
      }
    });
    let createRoomRunning = false;
    async function handleCreateRoom() {
      if (createRoomRunning) return;
      createRoomRunning = true;
      const creatorName = document.getElementById("creatorName").value.trim();
      if (hasInvalidChars(creatorName)) {
        alert("İsminizde geçersiz karakter (. # $ [ ] /) kullanılamaz.");
        createRoomRunning = false;
        return;
      }

      // Buton tepkisiz görünmesin diye yükleme başlamadan önce kapat
      createRoomBtn.disabled = true;
      createRoomLoading.classList.remove("hidden");
      try {
        const settings = await buildSettings();
        if (!creatorName || isNaN(settings.spyCount) || isNaN(settings.spyGuessLimit)) {
          alert("Lütfen tüm alanları doldurun.");
          return;
        }
        const roomCode = await gameLogic.createRoom({
          creatorName,
          ...settings
        });
        if (!roomCode) return;
        currentRoomCode = roomCode;
        currentPlayerName = creatorName;
        isCreator = true;

        // LocalStorage güncelle
        localStorage.setItem("roomCode", currentRoomCode);
        localStorage.setItem("playerName", currentPlayerName);
        localStorage.setItem("isCreator", "true");
        showRoomUI(roomCode, creatorName, true);
        listenPlayersAndRoom(roomCode);
        gameLogic.listenRoom(roomCode);
      } catch (err) {
        alert(err.message || err);
      } finally {
        createRoomRunning = false;
        createRoomBtn.disabled = false;
        createRoomLoading.classList.add("hidden");
      }
    }
    createRoomBtn.addEventListener("click", handleCreateRoom);
    createRoomBtn.addEventListener("pointerdown", handleCreateRoom);
    let joinRoomRunning = false;
    async function handleJoinRoom() {
      if (joinRoomRunning) return;
      joinRoomRunning = true;
      const joinName = document.getElementById("joinName").value.trim();
      const joinCode = document.getElementById("joinCode").value.trim().toUpperCase();
      if (hasInvalidChars(joinName)) {
        alert("İsminizde geçersiz karakter (. # $ [ ] /) kullanılamaz.");
        joinRoomRunning = false;
        return;
      }
      if (!joinName || !joinCode) {
        alert("Lütfen adınızı ve oda kodunu girin.");
        joinRoomRunning = false;
        return;
      }
      try {
        const players = await gameLogic.joinRoom(joinName, joinCode);
        currentRoomCode = joinCode;
        currentPlayerName = joinName;
        isCreator = false;
        localStorage.setItem("roomCode", currentRoomCode);
        localStorage.setItem("playerName", currentPlayerName);
        localStorage.setItem("isCreator", "false");
        showRoomUI(joinCode, joinName, false);
        listenPlayersAndRoom(joinCode);
        gameLogic.listenRoom(joinCode);
      } catch (err) {
        alert(err.message);
        return;
      } finally {
        joinRoomRunning = false;
      }
    }
    joinRoomBtn.addEventListener("click", handleJoinRoom);
    joinRoomBtn.addEventListener("pointerdown", handleJoinRoom);
    document.getElementById("leaveRoomBtn").addEventListener("click", () => {
      const action = isCreator ? gameLogic.deleteRoom(currentRoomCode) : gameLogic.leaveRoom(currentRoomCode);
      Promise.resolve(action)
        .catch(error => {
          console.error("[leaveRoomBtn] room action failed", error);
        })
        .finally(() => {
          clearStoragePreservePromo();
          window.location.replace("./index.html");
        });
    });
    document.getElementById("startGameBtn").addEventListener("click", async e => {
      if (!currentRoomCode) {
        alert("Oda kodu bulunamadı!");
        return;
      }
      const joinedPlayerCount = currentPlayers.length;
      if (joinedPlayerCount < MIN_PLAYERS) {
        updateStartButtonState(joinedPlayerCount);
        alert("Oyunu başlatmak için en az 3 oyuncu gerekli.");
        return;
      }
      const btn = e.currentTarget;
      btn.disabled = true;
      try {
        await gameLogic.startGame(currentRoomCode);
      } catch (error) {
        alert("Oyunu başlatırken bir hata oluştu: " + (error.message || error));
      } finally {
        btn.disabled = false;
      }
    });
    document.getElementById("startVotingBtn").addEventListener("click", () => {
      gameLogic.startVote(currentRoomCode, currentUid);
    });
    const voteList = document.getElementById("voteList");
    if (voteList) {
      voteList.addEventListener("click", event => {
        const targetBtn = event.target.closest(".vote-option");
        if (!targetBtn) return;
        const {
          uid
        } = targetBtn.dataset;
        const candidates = voteCandidatesSnapshot || buildVoteCandidates(playerUidMap);
        const selected = candidates.find(c => c.uid === uid);
        if (selected) {
          setSelectedVote(selected.uid, selected.name || selected.uid);
          voteList.querySelectorAll(".vote-option").forEach(btn => btn.classList.toggle("active", btn.dataset.uid === uid));
        }
      });
    }

    // Oy ver
    document.getElementById("submitVoteBtn").addEventListener("click", () => {
      if (!selectedVoteUid) {
        alert("Lütfen oy vereceğin kişiyi seç.");
        return;
      }
      showVoteConfirmation();
    });
    document.getElementById("confirmVoteBtn").addEventListener("click", () => {
      if (!selectedVoteUid) return;
      const btn = document.getElementById("submitVoteBtn");
      if (btn) btn.disabled = true;
      const confirmBtn = document.getElementById("confirmVoteBtn");
      if (confirmBtn) confirmBtn.disabled = true;
      const msg = document.getElementById("votePendingMsg");
      if (msg) msg.classList.remove("hidden");
      const confirmArea = document.getElementById("voteConfirmArea");
      confirmArea?.classList.add("hidden");
      gameLogic.submitVote(currentRoomCode, currentUid, selectedVoteUid);
    });
    document.getElementById("cancelVoteBtn").addEventListener("click", () => {
      const confirmArea = document.getElementById("voteConfirmArea");
      confirmArea?.classList.add("hidden");
      const confirmBtn = document.getElementById("confirmVoteBtn");
      if (confirmBtn) confirmBtn.disabled = false;
    });
    document.getElementById("submitGuessBtn").addEventListener("click", () => {
      const guessSelect = document.getElementById("guessSelect");
      const guess = guessSelect ? guessSelect.value : "";
      if (guessSelect) {
        lastGuessSelection = guessSelect.value || lastGuessSelection;
      }
      if (guess) {
        gameLogic.guessLocation(currentRoomCode, currentUid, guess);
      }
    });

    // Sonraki tur
    document.getElementById("nextRoundBtn").addEventListener("click", () => {
      gameLogic.nextRound(currentRoomCode);
    });

    // Rol bilgisini kopyalama
    document.getElementById("copyRoleBtn").addEventListener("click", () => {
      const text = document.getElementById("roleMessage").innerText;
      navigator.clipboard.writeText(text).then(() => alert("Rolünüz kopyalandı!"));
    });

    // Oyundan çık (ana ekrana dön)
    document.getElementById("backToHomeBtn").addEventListener("click", () => {
      const roomCode = localStorage.getItem("roomCode");
      const playerName = localStorage.getItem("playerName");
      const isCreator = localStorage.getItem("isCreator") === "true";
      const action = roomCode
        ? isCreator
          ? gameLogic.deleteRoom(roomCode)
          : playerName
          ? gameLogic.leaveRoom(roomCode)
          : Promise.resolve()
        : Promise.resolve();
      Promise.resolve(action)
        .catch((error) => {
          console.error("[backToHomeBtn] room action failed", error);
        })
        .finally(() => {
          clearStoragePreservePromo();
          window.location.replace("./index.html");
        });
    });
  }
  document.addEventListener("DOMContentLoaded", initUI);
  async function buildSettings() {
    const playerCount = DEFAULT_PLAYER_COUNT;
    const spyCount = parseInt(document.getElementById("spyCount").value);
    const spyGuessCount = parseInt(document.getElementById("spyGuessCount").value);
    const gameType = document.getElementById("gameType").value;
    let categoryName = null;
    if (gameType === "category") {
      const c = document.getElementById("categoryName").value.trim();
      if (c) categoryName = c;
    }
    const poolSize = parseInt(document.getElementById("poolSize").value);
    const voteAnytime = document.getElementById("voteAnytime").checked;
    const creatorUid = await gameLogic.getUid();
    return {
      playerCount,
      spyCount,
      gameType,
      categoryName,
      poolSize,
      voteAnytime,
      spyGuessLimit: spyGuessCount,
      clueMode: "tek-kelime",
      creatorUid
    };
  }

})();
