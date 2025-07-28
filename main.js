// main.js

window.addEventListener("DOMContentLoaded", () => {
  const createRoomBtn = document.getElementById("createRoomBtn");
  const joinRoomBtn = document.getElementById("joinRoomBtn");

  // Kurucu oda oluşturur
  createRoomBtn.addEventListener("click", () => {
    const creatorName = document.getElementById("creatorName").value.trim();
    const playerCount = parseInt(document.getElementById("playerCount").value);
    const spyCount = parseInt(document.getElementById("spyCount").value);
    const useRoles = document.getElementById("useRoles").value === "yes";
    const questionCount = parseInt(document.getElementById("questionCount").value);
    const guessCount = parseInt(document.getElementById("guessCount").value);
    const canEliminate = document.getElementById("canEliminate").value === "yes";

    if (!creatorName || isNaN(playerCount) || isNaN(spyCount)) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }

    const roomCode = gameLogic.createRoom(
      creatorName,
      playerCount,
      spyCount,
      useRoles,
      questionCount,
      guessCount,
      canEliminate
    );

    localStorage.setItem("roomCode", roomCode);
    localStorage.setItem("playerName", creatorName);
    localStorage.setItem("isCreator", "true");

    // Oda bilgilerini göster
    document.getElementById("setup").classList.add("hidden");
    document.getElementById("roomInfo").classList.remove("hidden");
    document.getElementById("roomCode").textContent = roomCode;
    document.getElementById("roomTitle").textContent = "Oda başarıyla oluşturuldu!";
    document.getElementById("roomInstructions").textContent = "Diğer oyuncular bu kodla giriş yapabilir.";
  });

  // Katılımcı odaya katılır
  joinRoomBtn.addEventListener("click", () => {
    const joinName = document.getElementById("joinName").value.trim();
    const joinCode = document.getElementById("joinCode").value.trim().toUpperCase();

    if (!joinName || !joinCode) {
      alert("Lütfen adınızı ve oda kodunu girin.");
      return;
    }

    gameLogic.joinRoom(joinName, joinCode, (error, players) => {
      if (error) return alert(error);

      localStorage.setItem("roomCode", joinCode);
      localStorage.setItem("playerName", joinName);
      localStorage.setItem("isCreator", "false");

      // Oda bilgilerini göster
      document.getElementById("playerJoin").classList.add("hidden");
      document.getElementById("roomInfo").classList.remove("hidden");
      document.getElementById("roomCode").textContent = joinCode;
      document.getElementById("roomTitle").textContent = "Oyun odasına hoş geldiniz!";
      document.getElementById("roomInstructions").textContent = "Oda kurucusunun oyunu başlatmasını bekleyin.";
    });
  });
});
