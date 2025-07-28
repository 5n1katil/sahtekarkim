// main.js

// DOM yüklendikten sonra başlat
window.addEventListener("DOMContentLoaded", () => {
  const setupDiv = document.getElementById("setup");
  const playerJoinDiv = document.getElementById("playerJoin");

  const currentRoomCode = localStorage.getItem("roomCode") || null;
  const currentPlayerName = localStorage.getItem("playerName") || null;

  if (currentRoomCode && currentPlayerName) {
    listenRoom(currentRoomCode);
    showRoomUI(currentRoomCode, currentPlayerName);
  } else {
    showElement(setupDiv);
    showElement(playerJoinDiv);
  }
});

// Oda Oluştur
const createRoomBtn = document.getElementById("createRoomBtn");
createRoomBtn.addEventListener("click", () => {
  const creatorName = document.getElementById("creatorName").value.trim();
  if (!creatorName) return alert("Lütfen isminizi girin.");

  const roomCode = createRoom(creatorName);

  localStorage.setItem("roomCode", roomCode);
  localStorage.setItem("playerName", creatorName);
  localStorage.setItem("isCreator", "true");

  listenRoom(roomCode);
  showRoomUI(roomCode, creatorName);
});

// Odaya Katıl
const joinRoomBtn = document.getElementById("joinRoomBtn");
joinRoomBtn.addEventListener("click", () => {
  const joinName = document.getElementById("joinName").value.trim();
  const joinCode = document.getElementById("joinCode").value.trim().toUpperCase();
  if (!joinName || !joinCode) return alert("Ad ve oda kodu gerekli.");

  joinRoom(joinName, joinCode, (err) => {
    if (err) return alert(err);

    localStorage.setItem("roomCode", joinCode);
    localStorage.setItem("playerName", joinName);
    localStorage.setItem("isCreator", "false");

    listenRoom(joinCode);
    showRoomUI(joinCode, joinName);
  });
});

// Oyundan Çık
const leaveRoomBtn = document.getElementById("leaveRoomBtn");
leaveRoomBtn.addEventListener("click", () => {
  const code = localStorage.getItem("roomCode");
  const name = localStorage.getItem("playerName");
  const isCreator = localStorage.getItem("isCreator") === "true";

  if (isCreator) {
    db.ref("rooms/" + code).remove();
  } else {
    leaveRoom(code, name);
  }
  localStorage.clear();
  location.reload();
});

// Oyunu Başlat
const startGameBtn = document.getElementById("startGameBtn");
startGameBtn.addEventListener("click", () => {
  const code = localStorage.getItem("roomCode");
  const settings = {
    spyCount: 1,
    useRoles: true,
    roles: ["Aşcı", "Güvenlik", "Kütüphaneci", "Doktor", "Öğretmen"],
    locations: ["Havalimanı", "Restoran", "Kütüphane", "Müze", "Okul", "Tiyatro"]
  };
  startGame(code, settings);
});
