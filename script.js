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

// Yardımcı fonksiyon: Kod üret
function generateRoomCode(length = 5) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// HTML elemanları
const setupDiv = document.getElementById("setup");
const roomInfoDiv = document.getElementById("roomInfo");
const playerJoinDiv = document.getElementById("playerJoin");
const roleInfoDiv = document.getElementById("playerRoleInfo");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const leaveRoomBtn = document.getElementById("leaveRoomBtn");
const startGameBtn = document.getElementById("startGameBtn");

let currentRoomCode = null;
let currentPlayerName = null;
let isCreator = false;

// Başlangıçta hem kurucu hem katılımcı bölümlerini göster
window.addEventListener("DOMContentLoaded", () => {
  setupDiv.classList.remove("hidden");
  playerJoinDiv.classList.remove("hidden");
});

// Odayı oluştur
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

// Oyuna katıl
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
    listenRoom(joinCode);
    showRoomUI();
  });
});

// Odayı dinle ve oyuncuları güncelle
function listenRoom(code) {
  db.ref("rooms/" + code + "/players").on("value", snapshot => {
    const list = snapshot.val();
    const playerList = document.getElementById("playerList");
    playerList.innerHTML = "";
    if (list) list.forEach(name => {
      const li = document.createElement("li");
      li.textContent = name;
      playerList.appendChild(li);
    });
  });

  db.ref("rooms/" + code).on("value", snapshot => {
    if (!snapshot.exists()) {
      alert("Oda kapatıldı.");
      location.reload();
    }
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
}

leaveRoomBtn.addEventListener("click", () => {
  if (!currentRoomCode || !currentPlayerName) return;

  db.ref("rooms/" + currentRoomCode + "/players").once("value").then(snapshot => {
    const updatedPlayers = (snapshot.val() || []).filter(name => name !== currentPlayerName);
    db.ref("rooms/" + currentRoomCode + "/players").set(updatedPlayers);

    if (isCreator) db.ref("rooms/" + currentRoomCode).remove();

    location.reload();
  });
});

startGameBtn.addEventListener("click", () => {
  roomInfoDiv.classList.add("hidden");
  roleInfoDiv.classList.remove("hidden");
  document.getElementById("roleMessage").textContent = "(örnek) Rolünüz: Sahtekar.";
});
