console.log('main.js loaded');

// window.gameLogic is loaded globally before this script

// Ensure the user is authenticated anonymously
if (window.auth && !window.auth.currentUser) {
  window.auth.signInAnonymously().catch((err) => {
    console.error("Anonymous sign-in error:", err);
  });
}

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
// Preserve game info on refresh but reset when opening a new session
try {
  const nav = performance.getEntriesByType("navigation")[0];
  const isReload = nav ? nav.type === "reload" : performance.navigation.type === 1;
  if (!isReload) {
    localStorage.clear();
  }
} catch (err) {
  console.warn("Navigation performance check failed:", err);
}

let currentRoomCode = localStorage.getItem("roomCode") || null;
let currentPlayerName = localStorage.getItem("playerName") || null;
let isCreator = localStorage.getItem("isCreator") === "true";
let currentPlayers = [];
let playerUidMap = {};
let currentUid = null;
window.auth.onAuthStateChanged(async (user) => {
    currentUid = user ? user.uid : null;
    if (user) {
      currentRoomCode = localStorage.getItem("roomCode") || null;
      currentPlayerName = localStorage.getItem("playerName") || null;
      isCreator = localStorage.getItem("isCreator") === "true";

      if (currentRoomCode && currentPlayerName) {
        const roomRef = window.db.ref("rooms/" + currentRoomCode);
        roomRef.get().then((roomSnap) => {
          if (!roomSnap.exists()) {
            localStorage.clear();
            currentRoomCode = null;
            currentPlayerName = null;
            isCreator = false;
            showSetupJoin();
            return;
          }

          const uid = user.uid;
          const playerRef = window.db.ref(
            `rooms/${currentRoomCode}/players/${uid}`
          );
          playerRef.set({ name: currentPlayerName, isCreator });

          showRoomUI(currentRoomCode, currentPlayerName, isCreator);
          listenPlayersAndRoom(currentRoomCode);
          window.gameLogic.listenRoom(currentRoomCode);

          window.db
            .ref("rooms/" + currentRoomCode)
            .once("value", (snapshot) => {
              const roomData = snapshot.val();
              if (
                roomData &&
                roomData.status === "started" &&
                roomData.playerRoles &&
                roomData.playerRoles[currentUid]
              ) {
                document
                  .getElementById("leaveRoomBtn")
                  ?.classList.add("hidden");
                document
                  .getElementById("backToHomeBtn")
                  ?.classList.remove("hidden");
                const myData = roomData.playerRoles[currentUid];
                document
                  .getElementById("roomInfo")
                  .classList.add("hidden");
                document
                  .getElementById("playerRoleInfo")
                  .classList.remove("hidden");
                
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
        });
      } else {
        showSetupJoin();
      }
    } else {
      showSetupJoin();
    }
  });
  let lastVoteResult = null;
  let lastGuessResult = null;
  let gameEnded = false;

  function showResultOverlay(isSpy, name) {
    const overlay = document.getElementById("resultOverlay");
    const cls = isSpy ? "impostor-animation" : "innocent-animation";
    const message = isSpy
      ? `${name} sahtekar çıktı!`
      : `${name} ajandı.`;
    overlay.innerHTML = `<div class="result-message">${message}</div>`;
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
        location.href = "https://5n1katil.github.io/sahtekarkim/";
      } else {
          window.gameLogic.endRound(currentRoomCode);
      }
    }, 3000);
  }

  function showGuessOverlay(correct, location, guesser) {
    const overlay = document.getElementById("resultOverlay");
    const cls = correct ? "impostor-animation" : "innocent-animation";
    if (correct) gameEnded = true;
    const message = correct
      ? `Sahtekar kazandı! <span class="impostor-name">${guesser}</span> konumu '<strong>${location}</strong>' olarak<br> doğru tahmin etti.`
      : `${guesser} yanlış tahmin etti!<br> Konum '<strong>${location}</strong>'.<br> Ajanlar kazandı!`;
    overlay.innerHTML = `<div class="result-message">${message}</div>`;
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
          location.href = "https://5n1katil.github.io/sahtekarkim/";
        };
        if (isCreator) {
          window.gameLogic.deleteRoom(currentRoomCode).finally(finish);
        } else {
          finish();
        }
      } else {
        localStorage.clear();
        location.href = "https://5n1katil.github.io/sahtekarkim/";
      }
    }, delay);
  }

  function showGuessWarning(remaining) {
    const overlay = document.getElementById("resultOverlay");
    const message =
      "Bir sahtekar konumu tahmin etti ama bulamadı!" +
      (typeof remaining === "number" ? ` Kalan tahmin hakkı: ${remaining}.` : "");
    overlay.innerHTML = `<div class="result-message">${message}</div>`;
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
    const message =
      "Sahtekar" +
      (names ? `<br><span class="impostor-name">${names}</span>` : "") +
      " kazandı! Oyun Bitti...";
    overlay.innerHTML = `<div class="result-message">${message}</div>`;
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
        location.href = "https://5n1katil.github.io/sahtekarkim/";
      };
      if (isCreator) {
        window.gameLogic.deleteRoom(currentRoomCode).finally(finish);
      } else {
        finish();
      }
    }, 10000);
  }

  function showSetupJoin() {
    document.getElementById("setup").classList.remove("hidden");
    document.getElementById("playerJoin").classList.remove("hidden");
    document.getElementById("roomInfo").classList.add("hidden");
    document.getElementById("playerRoleInfo").classList.add("hidden");
  }

  /** ------------------------
   *  ODA OLUŞTUR
   * ------------------------ */
  const hasInvalidChars = (name) => /[.#$\[\]\/]/.test(name);
  function updatePlayerList(players) {
    const listEl = document.getElementById("playerList");
    const countEl = document.getElementById("playerCountDisplay");
    if (!listEl || !countEl) return;

    const validPlayers = (players || []).filter((p) => p && p.trim() !== "");
    listEl.innerHTML = validPlayers.map((p) => `<li>${p}</li>`).join("");
    countEl.textContent = validPlayers.length;
  }

  /** ------------------------
   *  ODA & OYUNCULARI DİNLE
   * ------------------------ */
  function listenPlayersAndRoom(roomCode) {
    // Oyuncu listesi
    window.gameLogic.listenPlayers(roomCode, (playerNames, playersObj) => {
      // Update player list in UI and player count using the names array
      updatePlayerList(playerNames);

      // Use the raw players object for mappings and dropdown population
      playerUidMap = playersObj || {};

      // Maintain a filtered array of current players (names)
      currentPlayers = (playerNames || []).filter((p) => p && p.trim() !== "");

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
        const message =
          reason === "vote" ? "Oylama sonucu elendin!" : "Sahtekar seni eledi!";
        overlay.innerHTML = `<div class="result-message">${message}</div>`;
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
  // UI güncelleme
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

/** ------------------------
 *  EVENT LISTENERS
 * ------------------------ */
const gameTypeSelect = document.getElementById("gameType");
const categoryLabel = document.getElementById("categoryLabel");
const categorySelect = document.getElementById("categoryName");

gameTypeSelect.addEventListener("change", () => {
  const show = gameTypeSelect.value === "category";
  categoryLabel.classList.toggle("hidden", !show);
  categorySelect.classList.toggle("hidden", !show);
});

const createRoomBtn = document.getElementById("createRoomBtn");
const createRoomLoading = document.getElementById("createRoomLoading");
createRoomBtn.addEventListener("click", async () => {
  console.log('createRoomBtn clicked');
  const creatorName = document.getElementById("creatorName").value.trim();
  if (hasInvalidChars(creatorName)) {
    alert("İsminizde geçersiz karakter (. # $ [ ] /) kullanılamaz.");
    return;
  }
  const playerCount = parseInt(document.getElementById("playerCount").value);
  const spyCount = parseInt(document.getElementById("spyCount").value);
  const gameType = document.getElementById("gameType").value;
  const categoryName = document.getElementById("categoryName").value;
  const poolSize = parseInt(document.getElementById("poolSize").value);
  const voteAnytime = document.getElementById("voteAnytime").checked;

  if (!creatorName || isNaN(playerCount) || isNaN(spyCount)) {
    alert("Lütfen tüm alanları doldurun.");
    return;
  }

  createRoomBtn.disabled = true;
  createRoomLoading.classList.remove("hidden");
  try {
    const roomCode = await window.gameLogic.createRoom(
      creatorName,
      playerCount,
      spyCount,
      gameType,
      categoryName,
      poolSize,
      voteAnytime
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
    window.gameLogic.listenRoom(roomCode);
  } catch (err) {
    alert(err.message || err);
  } finally {
    createRoomBtn.disabled = false;
    createRoomLoading.classList.add("hidden");
  }
});

document.getElementById("joinRoomBtn").addEventListener("click", async () => {
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
    const players = await window.gameLogic.joinRoom(joinName, joinCode);

    currentRoomCode = joinCode;
    currentPlayerName = joinName;
    isCreator = false;

    localStorage.setItem("roomCode", currentRoomCode);
    localStorage.setItem("playerName", currentPlayerName);
    localStorage.setItem("isCreator", "false");

    showRoomUI(joinCode, joinName, false);
    listenPlayersAndRoom(joinCode);
    window.gameLogic.listenRoom(joinCode);
  } catch (err) {
    alert(err.message);
    return;
  }
});

document.getElementById("leaveRoomBtn").addEventListener("click", () => {
  const action = isCreator
    ? window.gameLogic.deleteRoom(currentRoomCode)
    : window.gameLogic.leaveRoom(currentRoomCode);

  Promise.resolve(action).then(() => {
    localStorage.clear();
    location.reload();
  });
});

document.getElementById("startGameBtn").addEventListener("click", () => {
  const settings = {
    playerCount: parseInt(document.getElementById("playerCount").value),
    spyCount: parseInt(document.getElementById("spyCount").value),
    gameType: document.getElementById("gameType").value,
    categoryName: document.getElementById("categoryName").value,
    poolSize: parseInt(document.getElementById("poolSize").value),
    voteAnytime: document.getElementById("voteAnytime").checked,
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

// Rol bilgisini kopyalama
document.getElementById("copyRoleBtn").addEventListener("click", () => {
  const text = document.getElementById("roleMessage").innerText;
  navigator.clipboard
    .writeText(text)
    .then(() => alert("Rolünüz kopyalandı!"));
});

// Oyundan çık (ana ekrana dön)
document.getElementById("backToHomeBtn").addEventListener("click", () => {
  const roomCode = localStorage.getItem("roomCode");
  const playerName = localStorage.getItem("playerName");
  const isCreator = localStorage.getItem("isCreator") === "true";

  if (roomCode) {
    const action = isCreator
      ? window.gameLogic.deleteRoom(roomCode)
      : playerName
      ? window.gameLogic.leaveRoom(roomCode)
      : Promise.resolve();

    Promise.resolve(action).then(() => {
      localStorage.clear();
      location.reload();
    });
  } else {
    localStorage.clear();
    location.reload();
  }
});
