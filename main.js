window.addEventListener("DOMContentLoaded", () => {
  let currentRoomCode = localStorage.getItem("roomCode") || null;
  let currentPlayerName = localStorage.getItem("playerName") || null;
  let isCreator = localStorage.getItem("isCreator") === "true";

  // Oda veya oyuncu kaydı varsa otomatik olarak odada kal
  if (currentRoomCode && currentPlayerName) {
    showRoomUI(currentRoomCode, currentPlayerName, isCreator);

    // Oyuncu listesini dinle
    listenPlayersAndRoom(currentRoomCode);

  } else {
    document.getElementById("setup").classList.remove("hidden");
    document.getElementById("playerJoin").classList.remove("hidden");
    document.getElementById("roomInfo").classList.add("hidden");
    document.getElementById("playerRoleInfo").classList.add("hidden");
  }

  // ODA OLUŞTUR
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

    localStorage.setItem("roomCode", currentRoomCode);
    localStorage.setItem("playerName", currentPlayerName);
    localStorage.setItem("isCreator", "true");

    showRoomUI(roomCode, creatorName, true);

    // YENİ: Canlı oda ve oyuncu kontrolü başlat
    listenPlayersAndRoom(roomCode);
  });

  // OYUNA KATIL
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

      localStorage.setItem("roomCode", currentRoomCode);
      localStorage.setItem("playerName", currentPlayerName);
      localStorage.setItem("isCreator", "false");

      showRoomUI(joinCode, joinName, false);

      // YENİ: Canlı oda ve oyuncu kontrolü başlat
      listenPlayersAndRoom(joinCode);
    });
  });

  // ODADAN ÇIKIŞ BUTONU
  document.getElementById("leaveRoomBtn").addEventListener("click", () => {
    if (isCreator) {
      // Kurucu çıkarsa oda silinsin, herkes ana ekrana döner!
      window.gameLogic.deleteRoom(currentRoomCode).then(() => {
        localStorage.clear();
        location.reload();
      });
    } else {
      // Katılımcı çıkarsa sadece kendisi çıkar
      localStorage.clear();
      location.reload();
    }
  });

  // OYUN BAŞLAT
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

  // Ortak: Oda ve oyuncu listesini, oda silinirse kontrol et
  function listenPlayersAndRoom(roomCode) {
    // Oyuncu dinleyici
    window.gameLogic.listenPlayers(roomCode, function(players) {
      if (!players || players.length === 0) {
        localStorage.clear();
        location.reload();
        return;
      }
      document.getElementById("playerList").innerHTML =
        players.map(name => `<li>${name}</li>`).join("");
    });

    // ODA var mı, canlı dinle!
    window.db.ref("rooms/" + roomCode).on("value", function(snapshot) {
      if (!snapshot.exists()) {
        localStorage.clear();
        location.reload();
      }
    });
  }

  // Oda ekranı yardımcı fonksiyon
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
