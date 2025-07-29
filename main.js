<script>
window.addEventListener("DOMContentLoaded", () => {
  let currentRoomCode = localStorage.getItem("roomCode") || null;
  let currentPlayerName = localStorage.getItem("playerName") || null;
  let isCreator = localStorage.getItem("isCreator") === "true";
  let isRefreshing = false;

  // Sayfa yenileme tespiti
  window.addEventListener("beforeunload", () => {
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length && navEntries[0].type === "reload") {
      isRefreshing = true;
    }
  });

  // Sekme kapanınca veya tarayıcı kapanınca
  window.addEventListener("unload", () => {
    if (!isRefreshing && currentRoomCode && currentPlayerName && !isCreator) {
      const payload = JSON.stringify({ room: currentRoomCode, player: currentPlayerName });
      // sendBeacon ile gönder
      const beaconSuccess = navigator.sendBeacon?.("/leave-room", payload);
      // fallback
      if (!beaconSuccess) {
        fetch("/leave-room", { method: "POST", body: payload });
      }
      // Firebase üzerinden de kaldır
      if (window.gameLogic?.leaveRoom) {
        window.gameLogic.leaveRoom(currentRoomCode, currentPlayerName);
      }
    }
  });

  // Odaya geri dön veya giriş ekranını göster
  if (currentRoomCode && currentPlayerName) {
    showRoomUI(currentRoomCode, currentPlayerName, isCreator);
    listenPlayersAndRoom(currentRoomCode);

    window.db.ref(`rooms/${currentRoomCode}/gameState`).once("value", (snapshot) => {
      const gameState = snapshot.val();
      if (gameState?.started && gameState.players?.[currentPlayerName]) {
        restorePlayerRole(gameState.players[currentPlayerName], gameState.allLocations);
      }
    });
  } else {
    document.getElementById("setup").classList.remove("hidden");
    document.getElementById("playerJoin").classList.remove("hidden");
    document.getElementById("roomInfo").classList.add("hidden");
    document.getElementById("playerRoleInfo").classList.add("hidden");
  }

  // === Oda oluştur ===
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

    if (!window.gameLogic?.createRoom) {
      console.error("gameLogic.createRoom bulunamadı!");
      return;
    }

    const roomCode = window.gameLogic.createRoom(
      creatorName, playerCount, spyCount, useRoles, questionCount, guessCount, canEliminate
    );

    currentRoomCode = roomCode;
    currentPlayerName = creatorName;
    isCreator = true;

    localStorage.setItem("roomCode", roomCode);
    localStorage.setItem("playerName", creatorName);
    localStorage.setItem("isCreator", "true");

    showRoomUI(roomCode, creatorName, true);
    listenPlayersAndRoom(roomCode);
  });

  // === Odaya katıl ===
  document.getElementById("joinRoomBtn").addEventListener("click", () => {
    const joinName = document.getElementById("joinName").value.trim();
    const joinCode = document.getElementById("joinCode").value.trim().toUpperCase();

    if (!joinName || !joinCode) {
      alert("Lütfen adınızı ve oda kodunu girin.");
      return;
    }

    if (!window.gameLogic?.joinRoom) {
      console.error("gameLogic.joinRoom bulunamadı!");
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

      localStorage.setItem("roomCode", joinCode);
      localStorage.setItem("playerName", joinName);
      localStorage.setItem("isCreator", "false");

      showRoomUI(joinCode, joinName, false);
      listenPlayersAndRoom(joinCode);
    });
  });

  // === Odadan ayrıl ===
  document.getElementById("leaveRoomBtn").addEventListener("click", () => {
    if (isCreator) {
      window.gameLogic?.deleteRoom(currentRoomCode)?.then(() => {
        localStorage.clear();
        location.reload();
      });
    } else {
      window.gameLogic?.leaveRoom(currentRoomCode, currentPlayerName)?.then(() => {
        localStorage.clear();
        location.reload();
      });
    }
  });

  // === Oyunu başlat ===
  document.getElementById("startGameBtn").addEventListener("click", () => {
    if (!currentRoomCode || !isCreator) {
      alert("Sadece oda kurucusu oyunu başlatabilir!");
      return;
    }

    const settings = {
      playerCount: parseInt(document.getElementById("playerCount").value),
      spyCount: parseInt(document.getElementById("spyCount").value),
      useRoles: document.getElementById("useRoles").value === "yes",
      questionCount: parseInt(document.getElementById("questionCount").value),
      guessCount: parseInt(document.getElementById("guessCount").value),
      canEliminate: document.getElementById("canEliminate").value === "yes",
      locations: ["Havalimanı", "Restoran", "Kütüphane", "Müze"],
      roles: ["Güvenlik", "Aşçı", "Kütüphaneci", "Sanatçı"]
    };

    if (!window.gameLogic?.startGame) {
      alert("Oyun başlatılamıyor. Konsolu kontrol et.");
      console.error("gameLogic.startGame yok!");
      return;
    }

    window.gameLogic.startGame(currentRoomCode, settings);
  });

  // === Oyuncu ve oda dinleme ===
  function listenPlayersAndRoom(roomCode) {
    window.gameLogic?.listenPlayers(roomCode, (playersObj) => {
      const listEl = document.getElementById("playerList");
      const players = playersObj ? Object.keys(playersObj) : [];
      listEl.innerHTML =
        players.length > 0
          ? players.map((name) => `<li>${name}</li>`).join("")
          : "<li>Oyuncu bekleniyor...</li>";
    });

    // Oda silinirse herkesi düşür
    window.db.ref(`rooms/${roomCode}`).on("value", (snapshot) => {
      if (!snapshot.exists()) {
        localStorage.clear();
        location.reload();
      }
    });

    // Oyun başlarsa rolü göster
    window.db.ref(`rooms/${roomCode}/gameState`).on("value", (snapshot) => {
      const gameState = snapshot.val();
      if (gameState?.started && gameState.players?.[currentPlayerName]) {
        restorePlayerRole(gameState.players[currentPlayerName], gameState.allLocations);
      }
    });
  }

  // === Rol ekranı ===
  function restorePlayerRole(playerData, allLocations) {
    const roleMessageEl = document.getElementById("roleMessage");

    document.getElementById("roomInfo").classList.add("hidden");
    document.getElementById("playerRoleInfo").classList.remove("hidden");

    if (playerData.roleInfo.includes("SAHTEKAR")) {
      roleMessageEl.innerHTML =
        `🎭 Sen <b>SAHTEKAR</b>sın! Konumu bilmiyorsun.<br>` +
        `Olası konumlar: ${allLocations.join(", ")}`;
    } else {
      roleMessageEl.innerHTML =
        `📍 Konum: <b>${playerData.location}</b><br>` +
        `🎭 Rolün: <b>${playerData.roleInfo}</b>`;
    }
  }

  // === Oda arayüzünü göster ===
  function showRoomUI(roomCode, playerName, isCreator) {
    document.getElementById("setup").classList.add("hidden");
    document.getElementById("playerJoin").classList.add("hidden");
    document.getElementById("roomInfo").classList.remove("hidden");

    document.getElementById("roomCode").textContent = roomCode;
    document.getElementById("roomTitle").textContent = isCreator
      ? "Oda başarıyla oluşturuldu!"
      : "Oyun odasına hoş geldiniz!";
    document.getElementById("roomInstructions").textContent = isCreator
      ? "Diğer oyuncular bu kodla giriş yapabilir."
      : "Oda kurucusunun oyunu başlatmasını bekleyin.";

    document.getElementById("startGameBtn").classList.toggle("hidden", !isCreator);
    document.getElementById("leaveRoomBtn").classList.remove("hidden");
  }
});
</script>
