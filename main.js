// main.js

// Sayfa yüklendiğinde çalışacak ana mantık
window.addEventListener("DOMContentLoaded", () => {
  // Odadan ve oyuncudan bilgiler localStorage'dan alınır (tarayıcıya kaydedilir)
  let currentRoomCode = localStorage.getItem("roomCode") || null;
  let currentPlayerName = localStorage.getItem("playerName") || null;
  let isCreator = localStorage.getItem("isCreator") === "true";

  // Eğer bir oda ve oyuncu kaydı varsa otomatik olarak odada kal
  if (currentRoomCode && currentPlayerName) {
    showRoomUI(currentRoomCode, currentPlayerName, isCreator);

    // Canlı olarak oyuncuları dinle
    window.gameLogic.listenPlayers(currentRoomCode, function(players) {
      // Oda silinmişse veya oyuncu listesi boşsa, ana ekrana at
      if (!players || players.length === 0) {
        localStorage.clear();
        location.reload();
        return;
      }
      document.getElementById("playerList").innerHTML =
        players.map(name => `<li>${name}</li>`).join("");
    });
  } else {
    // Eğer kayıt yoksa ana ekranlar açık
    document.getElementById("setup").classList.remove("hidden");
    document.getElementById("playerJoin").classList.remove("hidden");
    document.getElementById("roomInfo").classList.add("hidden");
    document.getElementById("playerRoleInfo").classList.add("hidden");
  }

  // ODA OLUŞTUR BUTONU
  document.getElementById("createRoomBtn").addEventListener("click", () => {
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

    const roomCode = window.gameLogic.createRoom(
      creatorName, playerCount, spyCount, useRoles, questionCount, guessCount, canEliminate
    );
    currentRoomCode = roomCode;
    currentPlayerName = creatorName;
    isCreator = true;

    // LocalStorage kaydet
    localStorage.setItem("roomCode", currentRoomCode);
    localStorage.setItem("playerName", currentPlayerName);
    localStorage.setItem("isCreator", "true");

    showRoomUI(roomCode, creatorName, true);

    window.gameLogic.listenPlayers(roomCode, function(players) {
      if (!players || players.length === 0) {
        localStorage.clear();
        location.reload();
        return;
      }
      document.getElementById("playerList").innerHTML =
        players.map(name => `<li>${name}</li>`).join("");
    });
  });

  // OYUNA KATIL BUTONU
  document.getElementById("joinRoomBtn").addEventListener("click", () => {
    const joinName = document.getElementById("joinName").value.trim();
    const joinCode = document.getElementById("joinCode").value.trim().toUpperCase();
    if (!joinName || !joinCode) {
      alert("Lütfen adınızı ve oda kodunu girin.");
      return;
    }
    window.gameLogic.joinRoom(joinName, joinCode, (err, players) => {
      if (err) {
        alert(err);
        return;
      }
      currentRoomCode = joinCode;
      currentPlayerName = joinName;
      isCreator = false;

      // LocalStorage kaydet
      localStorage.setItem("roomCode", currentRoomCode);
      localStorage.setItem("playerName", currentPlayerName);
      localStorage.setItem("isCreator", "false");

      showRoomUI(joinCode, joinName, false);

      window.gameLogic.listenPlayers(joinCode, function(players) {
        if (!players || players.length === 0) {
          localStorage.clear();
          location.reload();
          return;
        }
        document.getElementById("playerList").innerHTML =
          players.map(name => `<li>${name}</li>`).join("");
      });
    });
  });

  // ODADAN ÇIKIŞ BUTONU
  document.getElementById("leaveRoomBtn").addEventListener("click", () => {
    // LocalStorage temizle
    localStorage.removeItem("roomCode");
    localStorage.removeItem("playerName");
    localStorage.removeItem("isCreator");

    // Ekranları sıfırla
    document.getElementById("roomInfo").classList.add("hidden");
    document.getElementById("setup").classList.remove("hidden");
    document.getElementById("playerJoin").classList.remove("hidden");
    // Gerekirse başka temizleme kodları eklenebilir
  });

  // OYUN BAŞLAT BUTONU
  document.getElementById("startGameBtn").addEventListener("click", () => {
    const roomCode = currentRoomCode;
    const playerCount = parseInt(document.getElementById("playerCount").value);
    const spyCount = parseInt(document.getElementById("spyCount").value);
    const useRoles = document.getElementById("useRoles").value === "yes";
    const questionCount = parseInt(document.getElementById("questionCount").value);
    const guessCount = parseInt(document.getElementById("guessCount").value);
    const canEliminate = document.getElementById("canEliminate").value === "yes";

    const settings = {
      playerCount,
      spyCount,
      useRoles,
      questionCount,
      guessCount,
      canEliminate,
      locations: ["Havalimanı", "Restoran", "Kütüphane", "Müze"],
      roles: ["Güvenlik", "Aşçı", "Kütüphaneci", "Sanatçı"]
    };

    window.gameLogic.startGame(roomCode, settings);

    document.getElementById("roomInfo").classList.add("hidden");
    document.getElementById("playerRoleInfo").classList.remove("hidden");
    document.getElementById("roleMessage").textContent = "Rol atanıyor...";
  });

  // Oda ekranını gösteren yardımcı fonksiyon
  function showRoomUI(roomCode, playerName, isCreator) {
    document.getElementById("setup").classList.add("hidden");
    document.getElementById("playerJoin").classList.add("hidden");
    document.getElementById("roomInfo").classList.remove("hidden");
    document.getElementById("roomCode").textContent = roomCode;
    document.getElementById("roomTitle").textContent = isCreator ? "Oda başarıyla oluşturuldu!" : "Oyun odasına hoş geldiniz!";
    document.getElementById("roomInstructions").textContent = isCreator
      ? "Diğer oyuncular bu kodla giriş yapabilir." : "Oda kurucusunun oyunu başlatmasını bekleyin.";
    document.getElementById("startGameBtn").classList.toggle("hidden", !isCreator);
    document.getElementById("leaveRoomBtn").classList.remove("hidden");
  }
});
