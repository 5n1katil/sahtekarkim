function getQuestionWord(count) {
  const words = {
    1: "birer",
    2: "ikişer",
    3: "üçer",
    4: "dörder",
    5: "beşer",
    6: "altışar",
    7: "yedişer",
    8: "sekizer",
    9: "dokuzar",
    10: "onar",
  };
  if (words[count]) return words[count];

  const suffixes = {
    0: "ar",
    1: "er",
    2: "şer",
    3: "er",
    4: "er",
    5: "er",
    6: "şar",
    7: "şer",
    8: "er",
    9: "ar",
  };
  const lastDigit = Math.abs(Number(count)) % 10;
  const suffix = suffixes[lastDigit] || "er";
  return `${count}'${suffix}`;
}

window.addEventListener("DOMContentLoaded", () => {
  window.addEventListener("beforeunload", () => {
    localStorage.clear();
  });

  let currentRoomCode = localStorage.getItem("roomCode") || null;
  let currentPlayerName = localStorage.getItem("playerName") || null;
  let isCreator = localStorage.getItem("isCreator") === "true";
  let currentPlayers = [];
  let playerUidMap = {};
  let currentUid = window.auth.currentUser ? window.auth.currentUser.uid : null;
  window.auth?.onAuthStateChanged((u) => {
    currentUid = u ? u.uid : null;
  });
  let lastVoteResult = null;
  let lastGuessResult = null;
  let gameEnded = false;

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
        location.href = "https://5n1katil.github.io/detective/";
      } else {
        window.gameLogic.endRound(currentRoomCode);
      }
    }, 3000);
  }

  function showGuessOverlay(correct, location, guesser) {
    const overlay = document.getElementById("resultOverlay");
    const cls = correct ? "impostor-animation" : "innocent-animation";
    if (correct) gameEnded = true;
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
        const finish = () => {
          localStorage.clear();
          location.href = "https://5n1katil.github.io/detective/";
        };
        if (isCreator) {
          window.gameLogic.deleteRoom(currentRoomCode).finally(finish);
        } else {
          finish();
        }
      } else {
        localStorage.clear();
        location.href = "https://5n1katil.github.io/detective/";
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

  function showSpyWinOverlay(spyIds) {
    const overlay = document.getElementById("resultOverlay");
    const names = (spyIds || [])
      .map((id) => playerUidMap[id]?.name)
      .filter((n) => n && currentPlayers.includes(n))
      .join(", ");
    gameEnded = true;
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
      const finish = () => {
        localStorage.clear();
        location.href = "https://5n1katil.github.io/detective/";
      };
      if (isCreator) {
        window.gameLogic.deleteRoom(currentRoomCode).finally(finish);
      } else {
        finish();
      }
    }, 10000);
  }

  /** Sayfa yenilendiğinde oyuncu bilgisini koru */
  if (currentRoomCode && currentPlayerName && currentUid) {
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
      const uid = currentUid;
      const playerRef = window.db.ref(
        `rooms/${currentRoomCode}/players/${uid}`
      );
      playerRef.set({ name: currentPlayerName, isCreator });
    });
  }

  /** ------------------------
   *  SAYFA YENİLENİNCE ODADA KAL
   * ------------------------ */
  if (currentRoomCode && currentPlayerName && currentUid) {
    showRoomUI(currentRoomCode, currentPlayerName, isCreator);
    listenPlayersAndRoom(currentRoomCode);

    // Oyun başlamışsa rolü geri yükle
    window.db.ref("rooms/" + currentRoomCode).once("value", (snapshot) => {
      const roomData = snapshot.val();
      if (
        roomData &&
        roomData.status === "started" &&
        roomData.playerRoles &&
        roomData.playerRoles[currentUid]
      ) {
        document.getElementById("leaveRoomBtn")?.classList.add("hidden");
        document.getElementById("backToHomeBtn")?.classList.remove("hidden");
        const myData = roomData.playerRoles[currentUid];
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

  document.getElementById("createRoomBtn").addEventListener("click", async () => {
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

    const roomCode = await window.gameLogic.createRoom(
      creatorName,
      playerCount,
      spyCount,
      useRoles,
      questionCount,
      guessCount,
      canEliminate
    );
    if (!roomCode) return;

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

    try {
      await window.gameLogic.joinRoom(joinName, joinCode);
    } catch (err) {
      alert(err.message || err);
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

  /** ------------------------
   *  ODADAN ÇIK
   * ------------------------ */
  document.getElementById("leaveRoomBtn").addEventListener("click", () => {
    const action = isCreator
      ? window.gameLogic.deleteRoom(currentRoomCode)
      : window.gameLogic.leaveRoom(currentRoomCode);

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
      window.gameLogic.guessLocation(currentRoomCode, currentUid, loc);
      document.getElementById("guessSection").classList.add("hidden");
    }
  });

  // Oylamayı başlatma isteği
  document.getElementById("startVotingBtn").addEventListener("click", () => {
    window.gameLogic.requestVotingStart(currentRoomCode, currentUid);
    document
      .getElementById("waitingVoteStart")
      .classList.remove("hidden");
  });

  // Oy ver
  document.getElementById("submitVoteBtn").addEventListener("click", () => {
    const target = document.getElementById("voteSelect").value;
    if (target) {
      window.gameLogic.submitVote(currentRoomCode, currentUid, target);
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
    window.gameLogic.listenPlayers(roomCode, (players, playersObj) => {
      // Update player list in UI and player count
      window.updatePlayerList?.(players);

      playerUidMap = playersObj || {};

      // Maintain a filtered array of current players (names)
      currentPlayers = (players || []).filter((p) => p && p.trim() !== "");

      const selectEl = document.getElementById("voteSelect");
      if (selectEl) {
        selectEl.innerHTML = Object.entries(playerUidMap)
          .filter(([uid]) => uid !== currentUid)
          .map(([uid, p]) => `<option value="${uid}">${p.name}</option>`)
          .join("");
      }
    });

    // Oda silinirse herkesi at (oyun bitmediyse)
    window.db.ref("rooms/" + roomCode).on("value", (snapshot) => {
      if (!snapshot.exists() && !gameEnded) {
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
        roomData.eliminations[currentUid]
      ) {
        const reason = roomData.eliminations[currentUid];
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
            .ref(`rooms/${currentRoomCode}/eliminations/${currentUid}`)
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
            const g =
              playerUidMap[roomData.guessResult.guesser]?.name ||
              roomData.guessResult.guesser;
            showGuessOverlay(true, roomData.location, g);
          } else if (roomData.guessResult.guesser) {
            const g =
              playerUidMap[roomData.guessResult.guesser]?.name ||
              roomData.guessResult.guesser;
            showGuessOverlay(false, roomData.location, g);
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

      if (roomData.playerRoles && roomData.playerRoles[currentUid]) {
        const myData = roomData.playerRoles[currentUid];
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
            elimSelect.innerHTML = Object.entries(playerUidMap)
              .filter(([uid]) => uid !== currentUid)
              .map(([uid, p]) => `<option value="${uid}">${p.name}</option>`)
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

        const votingInstructionEl = document.getElementById("votingInstruction");
        if (votingInstructionEl) {
          const qc = roomData.settings && roomData.settings.questionCount
            ? roomData.settings.questionCount
            : 1;
          const word = getQuestionWord(qc);
          votingInstructionEl.textContent = `Herkes birbirine ${word} soru sorduktan sonra oylamaya başlayınız...`;
        }

        // Oylama durumu
        const hasRequested =
          roomData.voteRequests && roomData.voteRequests[currentUid];
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
          roomData.votes && roomData.votes[currentUid] ? true : false;
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
          voteCountListEl.innerHTML = Object.entries(playerUidMap)
            .map(([uid, p]) => `<li>${p.name}: ${counts[uid] || 0}</li>`)
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
              const votedName =
                playerUidMap[roomData.voteResult.voted]?.name ||
                roomData.voteResult.voted;
              showResultOverlay(
                roomData.voteResult.isSpy,
                votedName
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
