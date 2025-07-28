window.addEventListener("DOMContentLoaded", () => {
  // Oda oluşturma butonu
  document.getElementById("createRoomBtn").addEventListener("click", () => {
    const creatorName = document.getElementById("creatorName").value.trim();
    const playerCount = parseInt(document.getElementById("playerCount").value);
    const spyCount = parseInt(document.getElementById("spyCount").value);
    const useRoles = document.getElementById("useRoles").value === "yes";
    const questionCount = parseInt(document.getElementById("questionCount").value);
    const guessCount = parseInt(document.getElementById("guessCount").value);
    const canEliminate = document.getElementById("canEliminate").value === "yes";
    if (!creatorName || isNaN(playerCount) || isNaN(spyCount)) {
      alert("Lütfen tüm alanları doldurun."); return;
    }
    const roomCode = window.gameLogic.createRoom(
      creatorName, playerCount, spyCount, useRoles, questionCount, guessCount, canEliminate
    );
    // UI update
    document.getElementById("setup").classList.add("hidden");
    document.getElementById("playerJoin").classList.add("hidden");
    document.getElementById("roomInfo").classList.remove("hidden");
    document.getElementById("roomCode").textContent = roomCode;
    document.getElementById("roomTitle").textContent = "Oda başarıyla oluşturuldu!";
    document.getElementById("roomInstructions").textContent = "Diğer oyuncular bu kodla giriş yapabilir.";
    document.getElementById("startGameBtn").classList.remove("hidden");
    document.getElementById("leaveRoomBtn").classList.remove("hidden");
    document.getElementById("playerList").innerHTML = `<li>${creatorName}</li>`;
  });

  // Oyuna katıl
  document.getElementById("joinRoomBtn").addEventListener("click", () => {
    const joinName = document.getElementById("joinName").value.trim();
    const joinCode = document.getElementById("joinCode").value.trim().toUpperCase();
    if (!joinName || !joinCode) {
      alert("Lütfen adınızı ve oda kodunu girin."); return;
    }
    window.gameLogic.joinRoom(joinName, joinCode, (err, players) => {
      if (err) { alert(err); return; }
      document.getElementById("setup").classList.add("hidden");
      document.getElementById("playerJoin").classList.add("hidden");
      document.getElementById("roomInfo").classList.remove("hidden");
      document.getElementById("roomCode").textContent = joinCode;
      document.getElementById("roomTitle").textContent = "Oyun odasına hoş geldiniz!";
      document.getElementById("roomInstructions").textContent = "Oda kurucusunun oyunu başlatmasını bekleyin.";
      document.getElementById("startGameBtn").classList.add("hidden");
      document.getElementById("leaveRoomBtn").classList.remove("hidden");
      document.getElementById("playerList").innerHTML = players.map(name => `<li>${name}</li>`).join("");
    });
  });

  // Odadan çık
  document.getElementById("leaveRoomBtn").addEventListener("click", () => {
    document.getElementById("roomInfo").classList.add("hidden");
    document.getElementById("setup").classList.remove("hidden");
    document.getElementById("playerJoin").classList.remove("hidden");
  });

  // Oyun başlat
  document.getElementById("startGameBtn").addEventListener("click", () => {
    const roomCode = document.getElementById("roomCode").textContent;
    const playerCount = parseInt(document.getElementById("playerCount").value);
    const spyCount = parseInt(document.getElementById("spyCount").value);
    const useRoles = document.getElementById("useRoles").value === "yes";
    const questionCount = parseInt(document.getElementById("questionCount").value);
    const guessCount = parseInt(document.getElementById("guessCount").value);
    const canEliminate = document.getElementById("canEliminate").value === "yes";
    const settings = {
      playerCount, spyCount, useRoles, questionCount, guessCount, canEliminate,
      locations: ["Havalimanı", "Restoran", "Kütüphane", "Müze"],
      roles: ["Güvenlik", "Aşçı", "Kütüphaneci", "Sanatçı"]
    };
    window.gameLogic.startGame(roomCode, settings);
    document.getElementById("roomInfo").classList.add("hidden");
    document.getElementById("playerRoleInfo").classList.remove("hidden");
    document.getElementById("roleMessage").textContent = "Rol atanıyor...";
  });
});
