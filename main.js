window.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("beforeunload", () => {
    localStorage.clear();
  });

  let currentRoomCode = localStorage.getItem("roomCode") || null;
  let currentPlayerName = localStorage.getItem("playerName") || null;
  let isCreator = localStorage.getItem("isCreator") === "true";
  let currentPlayers = [];
  let lastVoteResult = null;
  let lastGuessResult = null;

  function showResultOverlay(isSpy, name) {
    const overlay = document.getElementById("resultOverlay");
    const cls = isSpy ? "impostor-animation" : "innocent-animation";
    overlay.textContent = isSpy
      ? `${name} sahtekar çıktı!`
      : `${name} masumdu.`;
    overlay.classList.remove(
      "hidden",
      "impostor-animation",
      "innocent-animation"
    );
    overlay.classList.add(cls);
    setTimeout(() => {
      overlay.classList.add("hidden");
      overlay.classList.remove("impostor-animation", "innocent-animation");
      if (isSpy) {
        localStorage.clear();
        location.reload();
      } else {
        window.gameLogic.endRound(currentRoomCode);
      }
    }, 3000);
  }

  function showGuessOverlay(correct, location, guesser) {
    const overlay = document.getElementById("resultOverlay");
    const cls = correct ? "impostor-animation" : "innocent-animation";
    overlay.innerHTML = correct
      ? `Sahtekar kazandı! Oyun Bitti...<br><span class="impostor-name">${guesser}</span> konumu ${location} doğru tahmin etti.`
      : `${guesser} yanlış tahmin etti! Konum ${location}. Masumlar kazandı!`;
    overlay.classList.remove(
      "hidden",
      "impostor-animation",
      "innocent-animation"
    );
    overlay.classList.add(cls);
    const delay = correct ? 10000 : 3000;
    setTimeout(() => {
      overlay.classList.add("hidden");
      overlay.classList.remove("impostor-animation", "innocent-animation");
      if (correct) {
        window.gameLogic.deleteRoom(currentRoomCode).then(() => {
          localStorage.clear();
          location.href = "/";
        });
      } else {
        localStorage.clear();
        location.reload();
      }
    }, delay);
  }

  function showGuessWarning(remaining) {
    const overlay = document.getElementById("resultOverlay");
    overlay.textContent =
      "Bir sahtekar konumu tahmin etti ama bulamadı!" +
      (typeof remaining === "number" ? ` Kalan tahmin hakkı: ${remaining}.` : "");
    overlay.classList.remove("hidden", "impostor-animation", "innocent-animation");
    overlay.classList.add("innocent-animation");
    setTimeout(() => {
      overlay.classList.add("hidden");
      overlay.classList.remove("innocent-animation");
      window.db.ref(`rooms/${currentRoomCode}/guessResult`).remove();
    }, 3000);
  }

  function showSpyWinOverlay(spyNames) {
    const overlay = document.getElementById("resultOverlay");
    const names = (spyNames || [])
      .filter((n) => currentPlayers.includes(n))
      .join(", ");
    overlay.innerHTML =
      "Sahtekar kazandı! Oyun Bitti..." +
      (names ? `<br><span class=\"impostor-name\">${names}</span>` : "");
    overlay.classList.remove(
      "hidden",
      "impostor-animation",
      "innocent-animation"
    );
    overlay.classList.add("impostor-animation");
    setTimeout(() => {
      overlay.classList.add("hidden");
      overlay.classList.remove("impostor-animation", "innocent-animation");
      window.gameLogic.deleteRoom(currentRoomCode).then(() => {
        localStorage.clear();
        location.href = "/";
      });
    }, 10000);
  }

  /** Sayfa yenilendiğinde oyuncu bilgisini koru */
  if (currentRoomCode && currentPlayerName) {
    const roomRef = window.db.ref("rooms/" + currentRoomCode);
    roomRef.get().then((roomSnap) => {
      if (!roomSnap.exists()) {
        // Oda silinmişse bilgiler geçersizdir
        localStorage.clear();
        currentRoomCode = null;
        currentPlayerName = null;
        isCreator = false;
        return;
      }

      // Her ihtimale karşı oyuncuyu tekrar kaydet
      const playerRef = window.db.ref(
        `rooms/${currentRoomCode}/players/${currentPlayerName}`
      );
      playerRef.set({ name: currentPlayerName });
          });
  }

  /** ------------------------
   *  SAYFA YENİLENİNCE ODADA KAL
   * ------------------------ */
  if (currentRoomCode && currentPlayerName) {
    const roomRef = window.db.ref("rooms/" + currentRoomCode);
    roomRef.get().then((roomSnap) => {
      if (!roomSnap.exists()) {
        // Oda silinmişse bilgiler geçersizdir
        localStorage.clear();
        currentRoomCode = null;
        currentPlayerName = null;
        isCreator = false;
        return;
      }

      // Her ihtimale karşı oyuncuyu tekrar kaydet
      const playerRef = window.db.ref(
        `rooms/${currentRoomCode}/players/${currentPlayerName}`
      );
      playerRef.set({ name: currentPlayerName });
          });
  }

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
        document.getElementById("leaveRoomBtn")?.classList.add("hidden");
        document.getElementById("backToHomeBtn")?.classList.remove("hidden");
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
  const hasInvalidChars = (name) => /[.#$\[\]\/]/.test(name);

  document.getElementById("createRoomBtn").addEventListener("click", () => {
    const creatorName = document.getElementById("creatorName").value.trim();
    if (hasInvalidChars(creatorName)) {
      alert("İsminizde geçersiz karakter (. # $ [ ] /) kullanılamaz.");
      return;
    }
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

    if (hasInvalidChars(joinName)) {
      alert("İsminizde geçersiz karakter (. # $ [ ] /) kullanılamaz.");
      return;
    }

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
    const action = isCreator
      ? window.gameLogic.deleteRoom(currentRoomCode)
      : window.gameLogic.leaveRoom(currentRoomCode, currentPlayerName);

    Promise.resolve(action).then(() => {
      localStorage.clear();
      location.reload();
    });
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
  document.getElementById("guessBtn").addEventListener("click", () => {
    const loc = document.getElementById("guessSelect").value;
    if (loc) {
      window.gameLogic.guessLocation(currentRoomCode, currentPlayerName, loc);
      document.getElementById("guessSection").classList.add("hidden");
    }
  });

  // Oylamayı başlatma isteği
  document.getElementById("startVotingBtn").addEventListener("click", () => {
    window.gameLogic.requestVotingStart(currentRoomCode, currentPlayerName);
    document
      .getElementById("waitingVoteStart")
      .classList.remove("hidden");
  });

  // Oy ver
  document.getElementById("submitVoteBtn").addEventListener("click", () => {
    const target = document.getElementById("voteSelect").value;
    if (target) {
      window.gameLogic.submitVote(currentRoomCode, currentPlayerName, target);
      document.getElementById("votingSection").classList.add("hidden");
    }
  });

  document.getElementById("eliminateBtn").addEventListener("click", () => {
    const target = document.getElementById("eliminateSelect").value;
    if (target) {
      window.gameLogic.eliminatePlayer(currentRoomCode, target);
      document.getElementById("eliminationSection").classList.add("hidden");
    }
  });

  // Sonraki tur
  document.getElementById("nextRoundBtn").addEventListener("click", () => {
    window.gameLogic.nextRound(currentRoomCode);
  });

  /** ------------------------
   *  ODA & OYUNCULARI DİNLE
   * ------------------------ */
  function listenPlayersAndRoom(roomCode) {
    // Oyuncu listesi
    window.gameLogic.listenPlayers(roomCode, (players) => {
      // Update player list in UI and player count
      window.updatePlayerList?.(players);

      // Maintain a filtered array of current players
      currentPlayers = (players || []).filter((p) => p && p.trim() !== "");

      const selectEl = document.getElementById("voteSelect");
      if (selectEl) {
        selectEl.innerHTML = currentPlayers
          .filter((p) => p !== currentPlayerName)
          .map((p) => `<option value="${p}">${p}</option>`)
          .join("");
      }
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
      const leaveBtn = document.getElementById("leaveRoomBtn");
      const exitBtn = document.getElementById("backToHomeBtn");
      if (
        roomData &&
        roomData.eliminations &&
        roomData.eliminations[currentPlayerName]
      ) {
        const reason = roomData.eliminations[currentPlayerName];
        const overlay = document.getElementById("resultOverlay");
        overlay.textContent =
          reason === "vote" ? "Oylama sonucu elendin!" : "Sahtekar seni eledi!";
        overlay.classList.remove(
          "hidden",
          "impostor-animation",
          "innocent-animation"
        );
        overlay.classList.add("impostor-animation");
        setTimeout(() => {
          window.db
            .ref(`rooms/${currentRoomCode}/eliminations/${currentPlayerName}`)
            .remove();
          localStorage.clear();
          location.reload();
        }, 3000);
        return;
      }
      if (roomData && roomData.guessResult) {
        const key = JSON.stringify(roomData.guessResult);
        if (key !== lastGuessResult) {
          lastGuessResult = key;
          if (roomData.guessResult.correct) {
            showGuessOverlay(true, roomData.location, roomData.guessResult.guesser);
          } else if (roomData.guessResult.guesser) {
            showGuessOverlay(false, roomData.location, roomData.guessResult.guesser);
          } else {
            showGuessWarning(roomData.settings && roomData.settings.guessCount);
          }
        }
      } else {
        lastGuessResult = null;
      }
      if (
        roomData &&
        !roomData.guessResult?.correct &&
        (roomData.spyParityWin ||
          (roomData.status === "finished" && roomData.winner === "spy"))
      ) {
        showSpyWinOverlay(roomData.spies);
        window.db.ref(`rooms/${roomCode}/spyParityWin`).remove();
        return;
      }
      if (!roomData || roomData.status !== "started") {
        document.getElementById("gameActions").classList.add("hidden");
        leaveBtn?.classList.remove("hidden");
        exitBtn?.classList.remove("hidden");
        return;
      }
      leaveBtn?.classList.add("hidden");
      exitBtn?.classList.remove("hidden");

      if (roomData.playerRoles && roomData.playerRoles[currentPlayerName]) {
        const myData = roomData.playerRoles[currentPlayerName];
        const roleMessageEl = document.getElementById("roleMessage");

        document.getElementById("roomInfo").classList.add("hidden");
        document.getElementById("playerRoleInfo").classList.remove("hidden");
        document.getElementById("gameActions").classList.remove("hidden");

        if (myData.role.includes("Sahtekar")) {
          roleMessageEl.innerHTML =
            `🎭 Sen <b>SAHTEKAR</b>sın! Konumu bilmiyorsun.<br>` +
            `Olası konumlar: ${myData.allLocations.join(", ")}`;
          const guessSection = document.getElementById("guessSection");
          const canGuess =
            roomData.settings && roomData.settings.guessCount > 0 && !roomData.guessResult;
          guessSection.classList.toggle("hidden", !canGuess);
          const guessSelect = document.getElementById("guessSelect");
          guessSelect.innerHTML = myData.allLocations
            .map((loc) => `<option value="${loc}">${loc}</option>`)
            .join("");
          const elimSection = document.getElementById("eliminationSection");
          if (
            roomData.settings &&
            roomData.settings.canEliminate &&
            roomData.eliminationPending
          ) {
            elimSection.classList.remove("hidden");
            const elimSelect = document.getElementById("eliminateSelect");
            elimSelect.innerHTML = currentPlayers
              .filter((p) => p !== currentPlayerName)
              .map((p) => `<option value="${p}">${p}</option>`)
              .join("");
          } else {
            elimSection.classList.add("hidden");
          }
        } else {
          roleMessageEl.innerHTML =
            `📍 Konum: <b>${myData.location}</b><br>` +
            `🎭 Rolün: <b>${myData.role}</b>`;
          document.getElementById("guessSection").classList.add("hidden");
          document.getElementById("eliminationSection").classList.add("hidden");
        }

        // Oylama durumu
        const hasRequested =
          roomData.voteRequests && roomData.voteRequests[currentPlayerName];
        document
          .getElementById("startVotingBtn")
          .classList.toggle("hidden", !!roomData.votingStarted);
        document
          .getElementById("waitingVoteStart")
          .classList.toggle(
            "hidden",
            !(hasRequested && !roomData.votingStarted)
          );
        const hasVoted =
          roomData.votes && roomData.votes[currentPlayerName] ? true : false;
        document
          .getElementById("votingSection")
          .classList.toggle("hidden", !roomData.votingStarted || hasVoted);

        const liveCountsEl = document.getElementById("liveVoteCounts");
        const voteCountListEl = document.getElementById("voteCountList");
        if (roomData.votingStarted) {
          liveCountsEl.classList.remove("hidden");
          const votes = roomData.votes || {};
          const counts = {};
          Object.values(votes).forEach((t) => {
            counts[t] = (counts[t] || 0) + 1;
          });
          voteCountListEl.innerHTML = currentPlayers
            .map((p) => `<li>${p}: ${counts[p] || 0}</li>`)
            .join("");
        } else {
          liveCountsEl.classList.add("hidden");
        }
        const resultEl = document.getElementById("voteResults");
        if (roomData.voteResult) {
          const outcomeEl = document.getElementById("voteOutcome");
          if (roomData.voteResult.tie) {
            resultEl.classList.remove("hidden");
            outcomeEl.textContent = "Oylar eşit! Oylama yeniden başlayacak.";
            document.getElementById("nextRoundBtn").classList.add("hidden");
          } else {
            const key = JSON.stringify(roomData.voteResult);
            if (key !== lastVoteResult) {
              lastVoteResult = key;
              showResultOverlay(
                roomData.voteResult.isSpy,
                roomData.voteResult.voted
              );
            }
            resultEl.classList.add("hidden");
          }
        } else {
          resultEl.classList.add("hidden");
          lastVoteResult = null;
        }

        if (
          isCreator &&
          roomData.votingStarted &&
          roomData.votes &&
          Object.keys(roomData.votes).length === currentPlayers.length &&
          !roomData.voteResult
        ) {
          window.gameLogic.tallyVotes(currentRoomCode);
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
