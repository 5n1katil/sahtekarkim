// Firebase ayarları
const firebaseConfig = {
  apiKey: "AIzaSyBX_Tme2B-2g2Rtj53WBfgmZ5QsE0UN1Bw",
  authDomain: "detektif-c17bb.firebaseapp.com",
  projectId: "detektif-c17bb",
  storageBucket: "detektif-c17bb.appspot.com",
  messagingSenderId: "422256375848",
  appId: "1:422256375848:web:873b0a6372c992accf9d1d",
  databaseURL: "https://detektif-c17bb-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const setupDiv = document.getElementById("setup");
const roomInfoDiv = document.getElementById("roomInfo");
const playerJoinDiv = document.getElementById("playerJoin");
const roleInfoDiv = document.getElementById("playerRoleInfo");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const leaveRoomBtn = document.getElementById("leaveRoomBtn");
const startGameBtn = document.getElementById("startGameBtn");
const exitGameBtn = document.getElementById("exitGameBtn");

let currentRoomCode = localStorage.getItem("roomCode") || null;
let currentPlayerName = localStorage.getItem("playerName") || null;
let isCreator = localStorage.getItem("isCreator") === "true";
let roomRef = null;

const locations = ["Havalimanı", "Restoran", "Kütüphane", "Müze"];
const roles = ["Güvenlik", "Aşçı", "Kütüphaneci", "Sanatçı"];

window.addEventListener("DOMContentLoaded", () => {
  if (currentRoomCode && currentPlayerName) {
    listenRoom(currentRoomCode);
    showRoomUI();
  } else {
    setupDiv.classList.remove("hidden");
    playerJoinDiv.classList.remove("hidden");
  }
});

createRoomBtn.addEventListener("click", () => {
  const creatorName = document.getElementById("creatorName").value.trim();
  const playerCount = parseInt(document.getElementById("playerCount").value);
  const spyCount = parseInt(document.getElementById("spyCount").value);
  const useRoles = document.getElementById("useRoles").value === "yes";
  const questionCount = parseInt(document.getElementById("questionCount").value);
  const guessCount = parseInt(document.getElementById("guessCount").value);
  const canEliminate = document.getElementById("canEliminate").value === "yes";

  if (!creatorName || isNaN(playerCount) || isNaN(spyCount)) return alert("Lütfen tüm alanları doldurun.");

  const roomCode = generateRoomCode();
  currentRoomCode = roomCode;
  currentPlayerName = creatorName;
  isCreator = true;

  localStorage.setItem("roomCode", roomCode);
  localStorage.setItem("playerName", creatorName);
  localStorage.setItem("isCreator", "true");

  db.ref("rooms/" + roomCode).set({
    code: roomCode,
    createdAt: Date.now(),
    players: [creatorName],
    settings: {
      playerCount,
      spyCount,
      useRoles,
      questionCount,
      guessCount,
      canEliminate
    }
  });

  listenRoom(roomCode);
  showRoomUI();
});

joinRoomBtn.addEventListener("click", () => {
  const joinName = document.getElementById("joinName").value.trim();
  const joinCode = document.getElementById("joinCode").value.trim().toUpperCase();

  if (!joinName || !joinCode) return alert("Lütfen adınızı ve oda kodunu girin.");

  db.ref("rooms/" + joinCode).once("value").then(snapshot => {
    if (!snapshot.exists()) return alert("Oda bulunamadı.");

    const players = snapshot.val().players || [];
    if (players.includes(joinName)) return alert("Bu isim zaten kullanılıyor.");

    players.push(joinName);
    db.ref("rooms/" + joinCode + "/players").set(players);

    currentRoomCode = joinCode;
    currentPlayerName = joinName;
    isCreator = false;

    localStorage.setItem("roomCode", joinCode);
    localStorage.setItem("playerName", joinName);
    localStorage.setItem("isCreator", "false");

    listenRoom(joinCode);
    showRoomUI();
  });
});

function listenRoom(code) {
  roomRef = db.ref("rooms/" + code);

  roomRef.child("players").on("value", snapshot => {
    const list = snapshot.val();
    const playerList = document.getElementById("playerList");
    playerList.innerHTML = "";
    if (list) list.forEach(name => {
      const li = document.createElement("li");
      li.textContent = name;
      playerList.appendChild(li);
    });
  });

  roomRef.child("assignments").on("value", snapshot => {
    const assignments = snapshot.val();
    if (assignments && currentPlayerName in assignments) {
      const { role, location, character } = assignments[currentPlayerName];
      roleInfoDiv.classList.remove("hidden");
      roomInfoDiv.classList.add("hidden");

      const roleMessage = document.getElementById("roleMessage");
      roleMessage.innerHTML = "";

      if (role === "spy") {
        roleMessage.innerHTML += `<div style="font-size: 1.8rem">Rolünüz: Sahtekar</div>`;
        roleMessage.innerHTML += `<div style="margin-top: 10px; font-size: 1.2rem">Tüm olası konumlar:</div>`;
        roleMessage.innerHTML += `<ul style="columns: 2; font-size: 1rem; padding-left: 20px">${locations.map(loc => `<li>${loc}</li>`).join('')}</ul>`;
      } else {
        roleMessage.innerHTML += `<div style="font-size: 1.8rem">Konum: ${location}</div>`;
        if (character) {
          roleMessage.innerHTML += `<div style="font-size: 1.8rem">Rolünüz: ${character}</div>`;
        }
      }

      const exitBtn = document.createElement("button");
      exitBtn.textContent = isCreator ? "Oyunu Bitir" : "Oyundan Çık";
      exitBtn.style.marginTop = "20px";
      exitBtn.onclick = () => {
        if (isCreator) {
          db.ref("rooms/" + currentRoomCode).remove();
        } else {
          leaveRoom();
        }
      };
      roleMessage.appendChild(exitBtn);
      roleMessage.appendChild(voteStartBtn);
      roleMessage.appendChild(voteDiv);
    }
  });

  roomRef.on("value", snapshot => {
    if (!snapshot.exists()) {
      alert("Oda kapatıldı.");
      localStorage.clear();
      location.reload();
    }
  });
}

function leaveRoom() {
  if (!currentRoomCode || !currentPlayerName) return;
  db.ref("rooms/" + currentRoomCode + "/players").once("value").then(snapshot => {
    const updatedPlayers = (snapshot.val() || []).filter(name => name !== currentPlayerName);
    db.ref("rooms/" + currentRoomCode + "/players").set(updatedPlayers);
    localStorage.clear();
    location.reload();
  });
}

function showRoomUI() {
  setupDiv.classList.add("hidden");
  playerJoinDiv.classList.add("hidden");
  roomInfoDiv.classList.remove("hidden");

  document.getElementById("roomCode").textContent = currentRoomCode;
  document.getElementById("roomTitle").textContent = isCreator ? "Oda başarıyla oluşturuldu!" : "Oyun odasına hoş geldiniz!";
  document.getElementById("roomInstructions").textContent = isCreator ? "Diğer oyuncular bu kodla giriş yapabilir." : "Oda kurucusunun oyunu başlatmasını bekleyin.";

  startGameBtn.classList.toggle("hidden", !isCreator);
  leaveRoomBtn.classList.remove("hidden");
}

leaveRoomBtn.addEventListener("click", () => {
  if (isCreator && currentRoomCode) {
    db.ref("rooms/" + currentRoomCode).remove();
  } else {
    leaveRoom();
  }
});

startGameBtn.addEventListener("click", () => {
  db.ref("rooms/" + currentRoomCode).once("value").then(snapshot => {
    const room = snapshot.val();
    if (!room) return;

    const players = room.players || [];
    const settings = room.settings;
    if (players.length < 2) return alert("En az 2 oyuncu gerekli.");

    const shuffled = [...players].sort(() => 0.5 - Math.random());

    const assignments = {};
    const spies = shuffled.slice(0, settings.spyCount);
    const location = locations[Math.floor(Math.random() * locations.length)];

    players.forEach(name => {
      const isSpy = spies.includes(name);
      assignments[name] = {
        role: isSpy ? "spy" : "normal",
        location: isSpy ? null : location,
        character: !isSpy && settings.useRoles ? roles[Math.floor(Math.random() * roles.length)] : null
      };
    });

    db.ref("rooms/" + currentRoomCode + "/assignments").set(assignments);
  });
});

// OYLAMA SİSTEMİ
const voteStartBtn = document.createElement("button");
voteStartBtn.textContent = "Oylamayı Başlat";
voteStartBtn.className = "button";
voteStartBtn.onclick = () => {
  db.ref(`rooms/${currentRoomCode}/voteReady/${currentPlayerName}`).set(true);
};

const voteDiv = document.createElement("div");
voteDiv.id = "voteDiv";
voteDiv.style.marginTop = "20px";
voteDiv.style.display = "none";

const voteSelect = document.createElement("select");
voteSelect.id = "voteSelect";
voteSelect.className = "dropdown";
voteDiv.appendChild(voteSelect);

const voteBtn = document.createElement("button");
voteBtn.textContent = "Oy Ver";
voteBtn.className = "button";
voteBtn.onclick = () => {
  const selected = voteSelect.value;
  if (!selected) return alert("Lütfen bir oyuncu seçin.");
  db.ref(`rooms/${currentRoomCode}/votes/${currentPlayerName}`).set(selected);
  voteDiv.innerHTML = `<p>Oyunuzu ${selected} kişisine verdiniz.</p>`;
};
voteDiv.appendChild(voteBtn);

db.ref(`rooms/${currentRoomCode}/voteReady`).on("value", snap => {
  const ready = snap.val();
  if (ready && Object.keys(ready).length > 1) {
    voteDiv.style.display = "block";
    db.ref(`rooms/${currentRoomCode}/players`).once("value").then(psnap => {
      const players = psnap.val();
      voteSelect.innerHTML = "<option value='' disabled selected>Bir oyuncu seçin</option>";
      players.forEach(name => {
        if (name !== currentPlayerName) {
          const opt = document.createElement("option");
          opt.value = name;
          opt.textContent = name;
          voteSelect.appendChild(opt);
        }
      });
    });
  }
});

db.ref(`rooms/${currentRoomCode}/votes`).on("value", snap => {
  const votes = snap.val();
  if (!votes) return;
  db.ref(`rooms/${currentRoomCode}/players`).once("value").then(psnap => {
    const players = psnap.val();
    if (Object.keys(votes).length === players.length) {
      const counts = {};
      Object.values(votes).forEach(v => {
        counts[v] = (counts[v] || 0) + 1;
      });
      const max = Math.max(...Object.values(counts));
      const eliminated = Object.keys(counts).find(k => counts[k] === max);
      db.ref(`rooms/${currentRoomCode}/assignments/${eliminated}`).once("value").then(roleSnap => {
        const role = roleSnap.val().role;
        alert(`${eliminated} elendi. Rolü: ${role === "spy" ? "Sahtekar" : "Masum"}`);
        db.ref(`rooms/${currentRoomCode}/eliminated/${eliminated}`).set(role);
      });
    }
  });
});
