window.addEventListener("DOMContentLoaded", () => {
  let currentRoomCode = localStorage.getItem("roomCode") || null;
  let currentPlayerName = localStorage.getItem("playerName") || null;
  let isCreator = localStorage.getItem("isCreator") === "true";

  // Geçerli sayfa yenileme işaretini temizle
  sessionStorage.removeItem("reloading");

  /** ------------------------
   *  SAYFA KAPANIRSA (Kurucu değilse) odadan çık
   *  - F5 yenilemede çıkmaz
   *  - Tarayıcı / sekme kapanınca çıkar
   * ------------------------ */
  let isRefreshing = false;

  const markReload = () => {
    const navEntries = performance.getEntriesByType("navigation");
    const navType = navEntries.length
      ? navEntries[0].type
      : performance.navigation && performance.navigation.type === 1
      ? "reload"
      : null;
    if (navType === "reload") {
      isRefreshing = true;
      sessionStorage.setItem("reloading", "true");
    }
  };

  window.addEventListener("beforeunload", markReload);
  window.addEventListener("pagehide", markReload);

  window.addEventListener("unload", () => {
    if (sessionStorage.getItem("reloading") === "true") return;
    if (!isRefreshing && currentRoomCode && currentPlayerName && !isCreator) {
      navigator.sendBeacon(
        "/leave-room",
        JSON.stringify({ room: currentRoomCode, player: currentPlayerName })
      );
      window.gameLogic.leaveRoom(currentRoomCode, currentPlayerName);
    }
  });

  /** ------------------------
   *  SAYFA YENİLENİNCE ODADA KAL
   * ------------------------ */
  if (currentRoomCode && currentPlayerName) {
    showRoomUI(currentRoomCode, currentPlayerName, isCreator);
    listenPlayersAndRoom(currentRoomCode);

    // Oyun başlamışsa rolü geri yükle
    window.db.ref("rooms/" + currentRoomCode).once("value", (snapshot) => {
      const roomData = snapshot.val();
      if (
        roomData &&
        roomData.status === "started" &&
        roomData.playerRoles &&
        roomData.playerRoles[currentPlayerName]
      ) {
        const myData = roomData.playerRoles[currentPlayerName];
        document.getElementById("roomInfo").classList.add("hidden");
        document.getElementById("playerRoleInfo").classList.remove("hidden");

        const roleMessageEl = document.getElementById("roleMessage");
        if (myData.role.includes("Sahtekar")) {
          roleMessageEl.innerHTML =
            `🎭 Sen <b>SAHTEKAR</b>sın! Konumu bilmiyorsun.<br>` +
            `Olası konumlar: ${myData.allLocations.join(", ")}`;
        } else {
          roleMessageEl.innerHTML =
            `📍 Konum: <b>${myData.location}</b><br>` +
            `🎭 Rolün: <b>${myData.role}</b>`;
        }
      }
    });
  } else {
    // İlk giriş ekranı
    document.getElementById("setup").classList.remove("hidden");
    document.getElementById("playerJoin").classList.remove("hidden");
    document.getElementById("roomInfo").classList.add("hidden");
    document.getElementById("playerRoleInfo").classList.add("hidden");
  }

  /** ------------------------
   *  ODA OLUŞTUR
   * ------------------------ */
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
      creatorName,
      playerCount,
      spyCount,
      useRoles,
      questionCount,
      guessCount,
      canEliminate
    );

    currentRoomCode = roomCode;
    currentPlayerName = creatorName;
    isCreator = true;

    // LocalStorage güncelle
    localStorage.setItem("roomCode", currentRoomCode);
    localStorage.setItem("playerName", currentPlayerName);
    localStorage.setItem("isCreator", "true");

    showRoomUI(roomCode, creatorName, true);
    listenPlayersAndRoom(roomCode);
  });

  /** ------------------------
   *  ODAYA KATIL
   * ------------------------ */
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
      listenPlayersAndRoom(joinCode);
    });
  });

  /** ------------------------
   *  ODADAN ÇIK
   * ------------------------ */
  document.getElementById("leaveRoomBtn").addEventListener("click", () => {
    if (isCreator) {
      // Kurucu çıkarsa oda kapanır
      window.gameLogic.deleteRoom(currentRoomCode).then(() => {
        localStorage.clear();
        location.reload();
      });
    } else {
      window.gameLogic.leaveRoom(currentRoomCode, currentPlayerName).then(() => {
        localStorage.clear();
        location.reload();
      });
    }
  });

  /** ------------------------
   *  OYUNU BAŞLAT
   * ------------------------ */
  document.getElementById("startGameBtn").addEventListener("click", () => {
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

   window.gameLogic.startGame(currentRoomCode, settings);
  });

  /** ------------------------
   *  ODA & OYUNCULARI DİNLE
   * ------------------------ */
  function listenPlayersAndRoom(roomCode) {
    // Oyuncu listesi
    window.gameLogic.listenPlayers(roomCode, (players) => {
      const listEl = document.getElementById("playerList");
      listEl.innerHTML =
        players && players.length > 0
          ? players.map((name) => `<li>${name}</li>`).join("")
          : "<li>Oyuncu bekleniyor...</li>";
    });

    // Oda silinirse herkesi at
    window.db.ref("rooms/" + roomCode).on("value", (snapshot) => {
      if (!snapshot.exists()) {
        localStorage.clear();
        location.reload();
      }
    });

    // Oyun başlama durumunu canlı dinle
    window.db.ref("rooms/" + roomCode).on("value", (snapshot) => {
      const roomData = snapshot.val();
      if (
        roomData &&
        roomData.status === "started" &&
        roomData.playerRoles &&
        roomData.playerRoles[currentPlayerName]
      ) {
        const myData = roomData.playerRoles[currentPlayerName];
        const roleMessageEl = document.getElementById("roleMessage");

        document.getElementById("roomInfo").classList.add("hidden");
        document.getElementById("playerRoleInfo").classList.remove("hidden");

        if (myData.role.includes("Sahtekar")) {
          roleMessageEl.innerHTML =
            `🎭 Sen <b>SAHTEKAR</b>sın! Konumu bilmiyorsun.<br>` +
            `Olası konumlar: ${myData.allLocations.join(", ")}`;
        } else {
          roleMessageEl.innerHTML =
            `📍 Konum: <b>${myData.location}</b><br>` +
            `🎭 Rolün: <b>${myData.role}</b>`;
        }
      }
    });
  }

  /** ------------------------
   *  ODA UI GÖSTER
   * ------------------------ */
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
