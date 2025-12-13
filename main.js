import { gameLogic, POOLS } from './gameLogic.js';
import { escapeHtml, hasInvalidChars } from './utils.js';

console.log('main.js yüklendi');

const MIN_PLAYERS = 3;
const DEFAULT_PLAYER_COUNT = 20; // Eski güvenlik kurallarıyla uyum için oyuncu sayısını varsayılanla gönder

function clearStoragePreservePromo() {
  const promoDismissedFlag = localStorage.getItem("promoModalDismissed");
  localStorage.clear();
  if (promoDismissedFlag) {
    localStorage.setItem("promoModalDismissed", promoDismissedFlag);
  }
}

// Kullanıcının anonim şekilde doğrulandığından emin ol
if (window.auth && !window.auth.currentUser) {
  window.auth.signInAnonymously().catch((err) => {
    console.error("Anonim giriş hatası:", err);
  });
}
// Sayfa yenilendiğinde oyun bilgilerini koru, yeni oturumda sıfırla
try {
  const nav = performance.getEntriesByType("navigation")[0];
  const isReload = nav ? nav.type === "reload" : performance.navigation.type === 1;
  if (!isReload) {
    clearStoragePreservePromo();
  }
} catch (err) {
  console.warn("Gezinme performans kontrolü başarısız oldu:", err);
}

let currentRoomCode = localStorage.getItem("roomCode") || null;
let currentPlayerName = localStorage.getItem("playerName") || null;
let isCreator = localStorage.getItem("isCreator") === "true";
let currentPlayers = [];
let playerUidMap = {};
let currentUid = null;
let wasEliminated = false;
let voteCandidatesSnapshot = null;
let selectedVoteUid = null;
let selectedVoteName = null;
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
            clearStoragePreservePromo();
            currentRoomCode = null;
            currentPlayerName = null;
            isCreator = false;
            showSetupJoin();
            return;
          }

          const roomData = roomSnap.val();
          const uid = user.uid;

          if (
            roomData?.eliminated &&
            roomData.eliminated[uid] &&
            roomData.status !== "finished"
          ) {
            wasEliminated = true;
            showRoomUI(currentRoomCode, currentPlayerName, isCreator);
            const overlay = document.getElementById("resultOverlay");
            if (overlay) {
              overlay.innerHTML =
                "<div class='result-message'>Elendin! Oyun devam ediyor...</div>";
              overlay.classList.remove(
                "hidden",
                "impostor-animation",
                "innocent-animation"
              );
            }
            document.getElementById("gameActions")?.classList.add("hidden");
            listenPlayersAndRoom(currentRoomCode);
            gameLogic.listenRoom(currentRoomCode);
            return;
          }

          const playerRef = window.db.ref(
            `rooms/${currentRoomCode}/players/${uid}`
          );
          if (
            typeof currentPlayerName === "string" &&
            currentPlayerName.trim() !== ""
          ) {
            playerRef.set({ name: currentPlayerName, isCreator });
          } else {
            console.error(
              "Geçersiz veya boş oyuncu adı, veritabanı güncellemesi atlandı."
            );
          }

          showRoomUI(currentRoomCode, currentPlayerName, isCreator);
          listenPlayersAndRoom(currentRoomCode);
          gameLogic.listenRoom(currentRoomCode);

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
                updateRoleDisplay(myData, roomData.settings);
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
let gameEnded = false;
let lastGuessEvent = null;
let lastVotingState = null;
let parityHandled = false;
let lastRoomStatus = null;

function updateRoleDisplay(myData, settings) {
  const roleMessageEl = document.getElementById("roleMessage");
  const guessLabel = document.getElementById("guessLabel");
  const poolInfo = document.getElementById("poolInfo");
  const poolSummary = document.getElementById("poolSummary");
  const poolListEl = document.getElementById("poolList");
  const isCategory = settings?.gameType === "category";
  const poolLabel = isCategory
    ? "Sahtekarın gördüğü roller"
    : "Sahtekarın gördüğü konumlar";

  if (myData && myData.role && myData.role.includes("Sahtekar")) {
    const safeLocations = (myData.allLocations || [])
      .map(escapeHtml)
      .join(", ");
    roleMessageEl.innerHTML =
      `🎭 Sen <b>SAHTEKAR</b>sın! ${isCategory ? "Rolü" : "Konumu"} bilmiyorsun.<br>` +
      `${isCategory ? "Olası roller" : "Olası konumlar"}: ${safeLocations}`;
    if (guessLabel) {
      guessLabel.textContent = isCategory
        ? "Rolü tahmin et:"
        : "Konumu tahmin et:";
    }
    poolInfo.classList.add("hidden");
    return;
  } else if (myData && myData.role) {
    const safeLocation = escapeHtml(myData.location);
    const safeRole = escapeHtml(myData.role);
    roleMessageEl.innerHTML =
      `📍 Konum: <b>${safeLocation}</b><br>` +
      `🎭 Rolün: <b>${safeRole}</b>`;
    poolSummary.textContent = poolLabel;
    poolListEl.textContent = (myData.allLocations || [])
      .map(escapeHtml)
      .join(", ");
    poolInfo.classList.remove("hidden");
  } else {
    roleMessageEl.textContent = "Rol bilgisi bulunamadı.";
    poolInfo.classList.add("hidden");
    return;
  }
}

  function buildVotingOutcomeMessage({
    eliminatedName,
    eliminatedIsImpostor,
    alivePlayersCount,
    aliveImpostorsCount,
  }) {
    const safeName = escapeHtml(eliminatedName || "");

    if (eliminatedIsImpostor) {
      return {
        message: `Oylama sonucunda Sahtekar ${safeName} elendi ve oyunu masumlar kazandı!`,
        gameEnded: true,
        impostorVictory: false,
      };
    }

    if (alivePlayersCount > 2) {
      return {
        message: `Oylama sonucunda ${safeName} elendi. Elenen kişi masumdu — oyun devam ediyor.`,
        gameEnded: false,
        impostorVictory: false,
      };
    }

    if (alivePlayersCount === 2) {
      if (aliveImpostorsCount >= 1) {
        return {
          message: `Oylama sonucunda ${safeName} elendi. Elenen kişi masumdu — oyunu sahtekar(lar) kazandı!`,
          gameEnded: true,
          impostorVictory: true,
        };
      }

      return {
        message: `Oylama sonucunda ${safeName} elendi. Elenen kişi masumdu — oyunu masumlar kazandı!`,
        gameEnded: true,
        impostorVictory: false,
      };
    }

    return {
      message: `Oylama sonucunda ${safeName} elendi.`,
      gameEnded: false,
      impostorVictory: false,
    };
  }

  function renderVoteResultOverlay(roomData) {
    if (!roomData.voteResult || roomData.voteResult.tie) return false;

    const key = JSON.stringify(roomData.voteResult);
    if (key === lastVoteResult) return true;
    lastVoteResult = key;

    const votedUid = roomData.voteResult.voted;
    const votedName = playerUidMap[votedUid]?.name || votedUid;
    const remaining = Object.keys(roomData.players || {}).filter(
      (uid) => uid !== votedUid
    );
    const activeSpies = (roomData.spies || []).filter((id) =>
      remaining.includes(id)
    );
    const alivePlayersCount = remaining.length;
    const aliveImpostorsCount = activeSpies.length;

    showResultOverlay({
      eliminatedIsImpostor: roomData.voteResult.isSpy,
      eliminatedName: votedName,
      alivePlayersCount,
      aliveImpostorsCount,
      votedUid,
    });

    return true;
  }

  function showResultOverlay({
    eliminatedIsImpostor,
    eliminatedName,
    alivePlayersCount,
    aliveImpostorsCount,
    votedUid,
  }) {
    const outcome = buildVotingOutcomeMessage({
      eliminatedName,
      eliminatedIsImpostor,
      alivePlayersCount,
      aliveImpostorsCount,
    });
    const overlay = document.getElementById("resultOverlay");
    if (!overlay) {
      console.error("resultOverlay element not found");
      return;
    }
    const isEliminatedPlayer = currentUid === votedUid;
    const cls = outcome.impostorVictory
      ? "impostor-animation"
      : "innocent-animation";
    const msgDiv = document.createElement("div");
    msgDiv.className = "result-message";
    overlay.innerHTML = "";
    const actionsEl = document.getElementById("gameActions");
    msgDiv.textContent = outcome.message;
    if (outcome.gameEnded) {
      actionsEl?.classList.add("hidden");
    } else {
      actionsEl?.classList.remove("hidden");
    }
    overlay.appendChild(msgDiv);
    overlay.classList.remove(
      "hidden",
      "impostor-animation",
      "innocent-animation"
    );
    overlay.classList.add(cls);

    if (outcome.gameEnded) {
      let restartBtn;
      if (isCreator) {
        restartBtn = document.createElement("button");
        restartBtn.id = "restartBtn";
        restartBtn.classList.add("overlay-btn");
        restartBtn.textContent = "Yeniden oyna";
        overlay.appendChild(restartBtn);
      }
      const exitBtn = document.createElement("button");
      exitBtn.id = "exitBtn";
      exitBtn.classList.add("overlay-btn");
      exitBtn.textContent = "Odadan ayrıl";
      overlay.appendChild(exitBtn);

      const hideOverlay = () => {
        overlay.classList.add("hidden");
        overlay.classList.remove("impostor-animation", "innocent-animation");
      };

      if (restartBtn) {
        restartBtn.addEventListener("click", () => {
          hideOverlay();
          gameEnded = false;
          parityHandled = false;
          lastVoteResult = null;
          lastGuessEvent = null;
          restartBtn.disabled = true;
          gameLogic.restartGame(currentRoomCode);
        });
      }

      exitBtn.addEventListener("click", () => {
        hideOverlay();
        gameLogic.leaveRoom(currentRoomCode).finally(() => {
          showSetupJoin();
        });
      });
    } else if (!isEliminatedPlayer) {
      const btn = document.createElement("button");
      btn.id = "continueBtn";
      btn.classList.add("overlay-btn");
      btn.textContent = "Oyuna Devam Et";
      overlay.appendChild(btn);
      btn.addEventListener("click", () => {
        overlay.classList.add("hidden");
        overlay.classList.remove("impostor-animation", "innocent-animation");
        gameLogic.endRound(currentRoomCode);
      });
    }
  }

  function getActualAnswer(roomData) {
    const isCategory = roomData?.settings?.gameType === "category";
    const roles = roomData?.playerRoles || {};
    for (const uid in roles) {
      const role = roles[uid];
      if (role && !role.isSpy) {
        return isCategory ? role.role : role.location;
      }
    }
    return null;
  }

  function buildGuessDetails(finalGuess, actualAnswer, gameType) {
    const isCategory = gameType === "category";
    const guessedValue =
      finalGuess?.guessedRole || finalGuess?.guessedLocation || finalGuess?.guess;
    const lines = [];

    const hasGuess = Boolean(guessedValue);
    if (hasGuess) {
      const guessedLabel = isCategory
        ? "Sahtekarın tahmin ettiği rol:"
        : "Sahtekarın tahmin ettiği konum:";
      lines.push(`${guessedLabel} ${escapeHtml(guessedValue)}`);

      if (finalGuess?.isCorrect) {
        lines.push("Doğru tahmin!");
      } else if (actualAnswer) {
        const actualLabel = isCategory ? "Doğru rol:" : "Doğru konum:";
        lines.push(`${actualLabel} ${escapeHtml(actualAnswer)}`);
      }
    }

    return lines;
  }

  function normalizeFinalGuess(rawFinalGuess, roomData) {
    const finalGuess = rawFinalGuess || {};
    const hasGuessValue =
      finalGuess.guessedRole || finalGuess.guessedLocation || finalGuess.guess;
    if (hasGuessValue) {
      return finalGuess;
    }

    const guessEntry = roomData?.lastGuess;
    const guessValue = guessEntry?.guess;
    if (!guessValue) return rawFinalGuess;

    const isCategory = roomData?.settings?.gameType === "category";
    const normalized = { isCorrect: !!guessEntry?.correct };

    if (isCategory) {
      normalized.guessedRole = guessValue;
      normalized.actualRole = getActualAnswer(roomData);
    } else {
      normalized.guessedLocation = guessValue;
      normalized.actualLocation = getActualAnswer(roomData);
    }

    return normalized;
  }

  function appendGuessDetails(msgDiv, lines) {
    lines.forEach((line) => {
      const detail = document.createElement("div");
      detail.innerHTML = line;
      msgDiv.appendChild(detail);
    });
  }

  function showSpyWinOverlay(spyIds, finalGuess, gameType, actualAnswer) {
    const overlay = document.getElementById("resultOverlay");
    if (!overlay) {
      console.error("resultOverlay element not found");
      return;
    }
    const names = (spyIds || [])
      .map((id) => playerUidMap[id]?.name)
      .filter((n) => n && currentPlayers.includes(n))
      .join(", ");
    gameEnded = true;
    overlay.innerHTML = "";
    const msgDiv = document.createElement("div");
    msgDiv.className = "result-message";
    const guessWord = gameType === "category" ? "rolü" : "konumu";
    const guessedValue =
      finalGuess?.guessedRole || finalGuess?.guessedLocation || finalGuess?.guess;

    if (guessedValue) {
      const playerNames = names ? `(${names}) ` : "";
      msgDiv.textContent = `Sahtekar ${playerNames}${guessWord} ${guessedValue} olarak doğru tahmin etti ve oyunu kazandı`;
    } else {
      msgDiv.append("Sahtekar");
      if (names) {
        msgDiv.appendChild(document.createElement("br"));
        const span = document.createElement("span");
        span.className = "impostor-name";
        span.textContent = names;
        msgDiv.appendChild(span);
      }
      msgDiv.append(" kazandı! Oyun Bitti...");
    }

    const detailLines = buildGuessDetails(finalGuess, actualAnswer, gameType);
    appendGuessDetails(msgDiv, detailLines);
    overlay.appendChild(msgDiv);
    let restartBtn;
    if (isCreator) {
      restartBtn = document.createElement("button");
      restartBtn.id = "restartBtn";
      restartBtn.classList.add("overlay-btn");
      restartBtn.textContent = "Yeniden oyna";
      overlay.appendChild(restartBtn);
    }
    const exitBtn = document.createElement("button");
    exitBtn.id = "exitBtn";
    exitBtn.classList.add("overlay-btn");
    exitBtn.textContent = "Odadan ayrıl";
    overlay.appendChild(exitBtn);
    overlay.classList.remove(
      "hidden",
      "impostor-animation",
      "innocent-animation"
    );
    overlay.classList.add("impostor-animation");

    const hideOverlay = () => {
      overlay.classList.add("hidden");
      overlay.classList.remove("impostor-animation", "innocent-animation");
    };

    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        hideOverlay();
        gameEnded = false;
        parityHandled = false;
        lastVoteResult = null;
        lastGuessEvent = null;
        restartBtn.disabled = true;
        gameLogic.restartGame(currentRoomCode);
      });
    }

    exitBtn.addEventListener("click", () => {
      hideOverlay();
      gameLogic.leaveRoom(currentRoomCode).finally(() => {
        showSetupJoin();
      });
    });
  }

  function showSpyFailOverlay(spyIds, finalGuess, gameType, actualAnswer) {
    const overlay = document.getElementById("resultOverlay");
    if (!overlay) {
      console.error("resultOverlay element not found");
      return;
    }
    const names = (spyIds || [])
      .map((id) => playerUidMap[id]?.name)
      .filter((n) => n && currentPlayers.includes(n))
      .join(", ");
    gameEnded = true;
    overlay.innerHTML = "";
    const msgDiv = document.createElement("div");
    msgDiv.className = "result-message";
    const guessWord = gameType === "category" ? "rolü" : "konumu";
    const guessedValue =
      finalGuess?.guessedRole || finalGuess?.guessedLocation || finalGuess?.guess;
    const nameText = names ? `${names} ` : "";
    msgDiv.textContent = `Sahtekar ${nameText}${guessWord} ${guessedValue || ""} olarak yanlış tahmin etti ve oyunu masumlar kazandı!`;
    const detailLines = buildGuessDetails(finalGuess, actualAnswer, gameType);
    appendGuessDetails(msgDiv, detailLines);
    overlay.appendChild(msgDiv);
    let restartBtn;
    if (isCreator) {
      restartBtn = document.createElement("button");
      restartBtn.id = "restartBtn";
      restartBtn.classList.add("overlay-btn");
      restartBtn.textContent = "Yeniden oyna";
      overlay.appendChild(restartBtn);
    }
    const exitBtn = document.createElement("button");
    exitBtn.id = "exitBtn";
    exitBtn.classList.add("overlay-btn");
    exitBtn.textContent = "Odadan ayrıl";
    overlay.appendChild(exitBtn);
    overlay.classList.remove(
      "hidden",
      "impostor-animation",
      "innocent-animation"
    );
    overlay.classList.add("innocent-animation");

    const hideOverlay = () => {
      overlay.classList.add("hidden");
      overlay.classList.remove("impostor-animation", "innocent-animation");
    };

    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        hideOverlay();
        gameEnded = false;
        parityHandled = false;
        lastVoteResult = null;
        lastGuessEvent = null;
        restartBtn.disabled = true;
        gameLogic.restartGame(currentRoomCode);
      });
    }
    exitBtn.addEventListener("click", () => {
      hideOverlay();
      gameLogic.leaveRoom(currentRoomCode).finally(() => {
        showSetupJoin();
      });
    });
  }

  /** ------------------------
   *  ODA OLUŞTUR
   * ------------------------ */
  function updatePlayerList(players) {
    const listEl = document.getElementById("playerList");
    const countEl = document.getElementById("playerCountDisplay");
    if (!listEl || !countEl) return;

    const validPlayers = (players || []).filter((p) => p && p.trim() !== "");
    listEl.innerHTML = validPlayers
      .map((p) => `<li>${escapeHtml(p)}</li>`)
      .join("");
    countEl.textContent = validPlayers.length;

    updateStartButtonState(validPlayers.length);
  }

  function updateStartButtonState(joinedPlayerCount) {
    const startGameBtn = document.getElementById("startGameBtn");
    const warningEl = document.getElementById("startGameWarning");
    if (!startGameBtn) return;

    const hasEnoughPlayers = joinedPlayerCount >= MIN_PLAYERS;
    startGameBtn.disabled = !hasEnoughPlayers;
    startGameBtn.title = hasEnoughPlayers
      ? ""
      : "Oyunu başlatmak için en az 3 oyuncu gerekli.";

    if (warningEl) {
      const shouldShowWarning =
        !hasEnoughPlayers && isCreator && !startGameBtn.classList.contains("hidden");
      warningEl.classList.toggle("hidden", hasEnoughPlayers || !shouldShowWarning);
    }
  }

  function buildVoteCandidates(source) {
    return Object.entries(source || {})
      .filter(([uid]) => uid !== currentUid)
      .map(([uid, p]) => ({ uid, name: p?.name || uid }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  function renderVoteOptions(candidates) {
    const voteList = document.getElementById("voteList");
    const selectEl = document.getElementById("voteSelect");
    const items = candidates || [];

    if (voteList) {
      voteList.innerHTML = items
        .map(
          (p) =>
            `<li><button type="button" class="vote-option" data-uid="${p.uid}">${escapeHtml(
              p.name
            )}</button></li>`
        )
        .join("");
      if (selectedVoteUid) {
        voteList
          .querySelectorAll(".vote-option")
          .forEach((btn) =>
            btn.classList.toggle("active", btn.dataset.uid === selectedVoteUid)
          );
      }
    }

    if (selectEl) {
      selectEl.innerHTML = items
        .map((p) => `<option value="${p.uid}">${escapeHtml(p.name)}</option>`)
        .join("");
      if (selectedVoteUid) {
        selectEl.value = selectedVoteUid;
      }
    }
  }

  function lockVoteCandidates(roomData) {
    if (voteCandidatesSnapshot) return;
    const source = roomData?.players || playerUidMap;
    voteCandidatesSnapshot = buildVoteCandidates(source);
    renderVoteOptions(voteCandidatesSnapshot);
  }

  function unlockVoteCandidates() {
    voteCandidatesSnapshot = null;
    renderVoteOptions(buildVoteCandidates(playerUidMap));
  }

  function updateSelectedVoteName() {
    if (!selectedVoteUid) return;
    const latestName =
      playerUidMap[selectedVoteUid]?.name || selectedVoteName || selectedVoteUid;
    if (latestName !== selectedVoteName) {
      selectedVoteName = latestName;
      const selectedNameEl = document.getElementById("selectedPlayerName");
      if (selectedNameEl) selectedNameEl.textContent = selectedVoteName;
      const confirmArea = document.getElementById("voteConfirmArea");
      const confirmTextEl = document.getElementById("voteConfirmText");
      const isConfirmVisible =
        confirmArea && !confirmArea.classList.contains("hidden");
      if (confirmTextEl && isConfirmVisible) {
        confirmTextEl.textContent = `${selectedVoteName} kişisine oy veriyorsun. Onaylıyor musun?`;
      }
    }
  }

  function resetVoteSelection() {
    selectedVoteUid = null;
    selectedVoteName = null;
    const selectionCard = document.getElementById("voteSelectionCard");
    selectionCard?.classList.add("hidden");
    const confirmArea = document.getElementById("voteConfirmArea");
    confirmArea?.classList.add("hidden");
    const confirmBtn = document.getElementById("confirmVoteBtn");
    if (confirmBtn) confirmBtn.disabled = false;
    const submitVoteBtn = document.getElementById("submitVoteBtn");
    if (submitVoteBtn) submitVoteBtn.disabled = true;
    const voteList = document.getElementById("voteList");
    voteList
      ?.querySelectorAll(".vote-option")
      .forEach((btn) => btn.classList.remove("active"));
  }

  function setSelectedVote(uid, name) {
    selectedVoteUid = uid;
    selectedVoteName = name;
    const selectionCard = document.getElementById("voteSelectionCard");
    const selectedNameEl = document.getElementById("selectedPlayerName");
    if (selectedNameEl) selectedNameEl.textContent = selectedVoteName;
    selectionCard?.classList.remove("hidden");
    const submitVoteBtn = document.getElementById("submitVoteBtn");
    if (submitVoteBtn) submitVoteBtn.disabled = !selectedVoteUid;
    const confirmArea = document.getElementById("voteConfirmArea");
    confirmArea?.classList.add("hidden");
    const confirmBtn = document.getElementById("confirmVoteBtn");
    if (confirmBtn) confirmBtn.disabled = false;
  }

  function showVoteConfirmation() {
    if (!selectedVoteUid || !selectedVoteName) return;
    const confirmArea = document.getElementById("voteConfirmArea");
    const confirmText = document.getElementById("voteConfirmText");
    if (confirmText)
      confirmText.textContent = `${selectedVoteName} kişisine oy veriyorsun. Onaylıyor musun?`;
    confirmArea?.classList.remove("hidden");
  }

  /** ------------------------
   *  ODA & OYUNCULARI DİNLE
   * ------------------------ */
  function listenPlayersAndRoom(roomCode) {
    // Oyuncu listesi
    gameLogic.listenPlayers(roomCode, (playerNames, playersObj) => {
      // İsim dizisini kullanarak UI'da oyuncu listesini ve oyuncu sayısını güncelle
      updatePlayerList(playerNames);
      
      // Ham oyuncu nesnesini eşleştirme ve açılır menüyü doldurma için kullan
      playerUidMap = playersObj || {};

      // Geçerli oyuncuların (isimler) filtrelenmiş bir dizisini tut
      currentPlayers = (playerNames || []).filter((p) => p && p.trim() !== "");

      const candidates = voteCandidatesSnapshot || buildVoteCandidates(playerUidMap);
      renderVoteOptions(candidates);
      updateSelectedVoteName();
    });

    // Oda silinirse herkesi at (oyun bitmediyse)
    window.db.ref("rooms/" + roomCode).on("value", (snapshot) => {
      if (!snapshot.exists() && !gameEnded) {
        clearStoragePreservePromo();
        location.reload();
      }
    });

    // Oyun başlama durumunu canlı dinle
    window.db.ref("rooms/" + roomCode).on("value", (snapshot) => {
      const resultEl = document.getElementById("voteResults");
      const outcomeEl = document.getElementById("voteOutcome");
      const roomData = snapshot.val();
      const prevStatus = lastRoomStatus;
      lastRoomStatus = roomData ? roomData.status : null;

      if (
        roomData?.eliminated &&
        roomData.eliminated[currentUid] &&
        roomData.status !== "finished"
      ) {
        wasEliminated = true;
        const overlay = document.getElementById("resultOverlay");
        if (overlay) {
          overlay.innerHTML =
            "<div class='result-message'>Elendin! Oyun devam ediyor...</div>";
          overlay.classList.remove(
            "hidden",
            "impostor-animation",
            "innocent-animation"
          );
        }
        document.getElementById("gameActions")?.classList.add("hidden");
        return;
      } else if (
        wasEliminated &&
        prevStatus === "finished" &&
        (roomData?.status === "waiting" || roomData?.status === "started") &&
        (!roomData?.eliminated || !roomData.eliminated[currentUid])
      ) {
        wasEliminated = false;
        if (currentPlayerName) {
          window.db
            .ref(`rooms/${roomCode}/players/${currentUid}`)
            .set({ name: currentPlayerName, isCreator });
        }

        const overlay = document.getElementById("resultOverlay");
        if (overlay) {
          overlay.classList.add("hidden");
          overlay.classList.remove("impostor-animation", "innocent-animation");
          overlay.innerHTML = "";
        }

        const roleMessageEl = document.getElementById("roleMessage");
        const poolInfo = document.getElementById("poolInfo");
        const poolSummary = document.getElementById("poolSummary");
        const poolListEl = document.getElementById("poolList");
        if (roleMessageEl) roleMessageEl.innerHTML = "";
        if (poolSummary) poolSummary.textContent = "";
        if (poolListEl) poolListEl.textContent = "";
        poolInfo?.classList.add("hidden");

        if (
          roomData.status === "started" &&
          roomData.playerRoles &&
          roomData.playerRoles[currentUid]
        ) {
          updateRoleDisplay(roomData.playerRoles[currentUid], roomData.settings);
        }
      }
      if (
        roomData &&
        roomData.status === "started" &&
        prevStatus !== "started"
      ) {
        const overlay = document.getElementById("resultOverlay");
        if (overlay) {
          overlay.classList.add("hidden");
          overlay.classList.remove("impostor-animation", "innocent-animation");
        }
        gameEnded = false;
        lastVoteResult = null;
        lastGuessEvent = null;
        parityHandled = false;
      }
        if (roomData && roomData.players) {
          playerUidMap = roomData.players;
          currentPlayers = Object.values(playerUidMap)
            .map((p) => p.name)
            .filter((p) => p && p.trim() !== "");
          updatePlayerList(currentPlayers);
          const candidates = voteCandidatesSnapshot || buildVoteCandidates(playerUidMap);
          renderVoteOptions(candidates);
          updateSelectedVoteName();
        }
      const leaveBtn = document.getElementById("leaveRoomBtn");
      const exitBtn = document.getElementById("backToHomeBtn");
        if (
          roomData &&
          (roomData.spyParityWin ||
            (roomData.status === "finished" && roomData.winner === "spy"))
        ) {
          const finalGuess = normalizeFinalGuess(
            roomData.lastGuess?.finalGuess || null,
            roomData
          );
          const actualAnswer = getActualAnswer(roomData);
          const gameType = roomData.settings?.gameType;
          if (!parityHandled) {
            showSpyWinOverlay(roomData.spies, finalGuess, gameType, actualAnswer);
          }
          window.db.ref(`rooms/${roomCode}/spyParityWin`).remove();
          return;
        }
        if (
          roomData &&
          roomData.status === "finished" &&
          roomData.winner === "innocent"
        ) {
          const handledByVote = renderVoteResultOverlay(roomData);
          if (handledByVote) return;

          const finalGuess = normalizeFinalGuess(
            roomData.lastGuess?.finalGuess || null,
            roomData
          );
          const actualAnswer = getActualAnswer(roomData);
          const gameType = roomData.settings?.gameType;
          showSpyFailOverlay(roomData.spies, finalGuess, gameType, actualAnswer);
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

        document.getElementById("roomInfo").classList.add("hidden");
        document.getElementById("playerRoleInfo").classList.remove("hidden");
        document.getElementById("gameActions").classList.remove("hidden");

        if (roomData.status === "started" && prevStatus !== "started") {
          setTimeout(() => window.scrollTo(0, 0), 0);
        }

        updateRoleDisplay(myData, roomData.settings);

        if (myData && myData.role) {
          const guessesLeft = myData.guessesLeft ?? 0;
          const isSpy = myData.role.includes("Sahtekar");
          if (isSpy && guessesLeft > 0) {
            const guessSection = document.getElementById("guessSection");
            guessSection.classList.remove("hidden");
            const guessSelect = document.getElementById("guessSelect");
            guessSelect.innerHTML = myData.allLocations
              .map(
                (loc) => `<option value="${escapeHtml(loc)}">${escapeHtml(loc)}</option>`
              )
              .join("");
          } else {
            document.getElementById("guessSection").classList.add("hidden");
          }
        } else {
          document.getElementById("guessSection").classList.add("hidden");
        }

        const votingInstructionEl = document.getElementById("votingInstruction");
        if (votingInstructionEl) {
          votingInstructionEl.textContent =
            "Her tur en az 1 tek kelimelik ipucu verin. Hazır olduğunuzda oylamayı başlatabilirsiniz.";
        }

        // Oylama durumu
        const isVotingPhase =
          roomData.phase === "voting" || roomData.votingStarted === true;

        if (roomData.votingStarted) {
          lockVoteCandidates(roomData);
        } else {
          unlockVoteCandidates();
          resetVoteSelection();
        }

        const votingStateKey = JSON.stringify({
          votingStarted: roomData.votingStarted,
          votes: roomData.votes,
        });
        if (votingStateKey !== lastVotingState) {
          const votingSection = document.getElementById("votingSection");
          const hasVoted = roomData.votes && roomData.votes[currentUid];
          if (votingSection) {
            votingSection.classList.toggle(
              "hidden",
              !(roomData.votingStarted && !hasVoted)
            );
          }
          const submitVoteBtn = document.getElementById("submitVoteBtn");
          if (submitVoteBtn)
            submitVoteBtn.disabled = !!hasVoted || !selectedVoteUid;
          const votePendingMsg = document.getElementById("votePendingMsg");
          if (votePendingMsg) {
            votePendingMsg.classList.toggle(
              "hidden",
              !(hasVoted && !roomData.voteResult)
            );
          }
          if (!roomData.votingStarted || hasVoted) {
            const confirmArea = document.getElementById("voteConfirmArea");
            confirmArea?.classList.add("hidden");
          }
          lastVotingState = votingStateKey;
        }

        updateSelectedVoteName();

        const startBtn = document.getElementById("startVotingBtn");
        const waitingEl = document.getElementById("waitingVoteStart");
        const voteRequests = roomData.voteRequests || {};
        const playersCount = Object.keys(roomData.players || {}).length;
        const requestCount = Object.keys(voteRequests).length;
        const hasRequested = !!voteRequests[currentUid];
        const isWaiting =
          !roomData.votingStarted && hasRequested && requestCount < playersCount;

        if (startBtn) {
          startBtn.classList.toggle("hidden", isVotingPhase || isWaiting);
          startBtn.disabled = isWaiting;
        }
        if (waitingEl) {
          waitingEl.classList.toggle("hidden", !isWaiting);
          if (isWaiting) {
            waitingEl.textContent =
              "Oylamanın başlaması için diğer oyuncular bekleniyor...";
          }
        }
        if (votingInstructionEl) {
          if (!roomData.votingStarted && !hasRequested) {
            votingInstructionEl.classList.remove("hidden");
            votingInstructionEl.textContent =
              "Her tur tek kelimelik ipucu verin. Hazır olduğunuzda oylamayı başlatabilirsiniz.";
          } else {
            votingInstructionEl.classList.add("hidden");
          }
        }

        const liveVoteCounts = document.getElementById("liveVoteCounts");
        const voteCountList = document.getElementById("voteCountList");

        if (!roomData.votingStarted || roomData.voteResult) {
          liveVoteCounts?.classList.add("hidden");
          if (voteCountList) voteCountList.innerHTML = "";
        } else {
          liveVoteCounts?.classList.remove("hidden");
          const tally = {};
          Object.values(roomData.votes || {}).forEach((uid) => {
            tally[uid] = (tally[uid] || 0) + 1;
          });
          const playerMap = roomData.players || playerUidMap;
          const ranked = Object.entries(playerMap).map(([uid, p]) => ({
            uid,
            name: p.name,
            count: tally[uid] || 0,
          }));
          ranked.sort((a, b) => b.count - a.count);
          if (voteCountList) {
            voteCountList.innerHTML = ranked
              .map(
                (p, i) =>
                  `<li>${i + 1}) ${escapeHtml(p.name)} – ${p.count}</li>`
              )
              .join("");
          }
        }

        if (roomData.voteResult) {
          if (roomData.voteResult.tie) {
            resultEl.classList.remove("hidden");
            outcomeEl.textContent = "Oylar eşit! Oylama yeniden başlayacak.";
            document.getElementById("nextRoundBtn").classList.add("hidden");
          } else {
            renderVoteResultOverlay(roomData);
            resultEl.classList.add("hidden");
          }
        } else {
          resultEl.classList.add("hidden");
          lastVoteResult = null;
        }

        if (roomData.lastGuess) {
          const guessKey = JSON.stringify(roomData.lastGuess);
          if (guessKey !== lastGuessEvent) {
            lastGuessEvent = guessKey;
            const guessWord =
              roomData.settings?.gameType === "category" ? "rolü" : "konumu";
            const isSpyGuess = roomData.lastGuess.spy === currentUid;
            const msg = isSpyGuess
              ? `Yanlış tahmin ettin! ${guessWord} ${roomData.lastGuess.guess}. Kalan tahmin hakkı: ${roomData.lastGuess.guessesLeft}`
              : `Sahtekar ${guessWord} ${roomData.lastGuess.guess} tahmin etti ama yanıldı. Kalan tahmin hakkı: ${roomData.lastGuess.guessesLeft}`;
            alert(msg);
          }
        } else {
          lastGuessEvent = null;
        }

        if (
          isCreator &&
          roomData.votingStarted &&
          roomData.votes &&
          Object.keys(roomData.votes).length === currentPlayers.length &&
          !roomData.voteResult
        ) {
          gameLogic.tallyVotes(currentRoomCode);
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

  const startGameBtn = document.getElementById("startGameBtn");
  if (startGameBtn) {
    startGameBtn.classList.toggle("hidden", !isCreator);
  }
  document.getElementById("leaveRoomBtn").classList.remove("hidden");

  setTimeout(() => window.scrollTo(0, 0), 0);

}

function showSetupJoin() {
  document.getElementById("setup").classList.remove("hidden");
  document.getElementById("playerJoin").classList.remove("hidden");
  document.getElementById("roomInfo").classList.add("hidden");
  document.getElementById("playerRoleInfo").classList.add("hidden");
  document.getElementById("gameActions").classList.add("hidden");
}

/** ------------------------
 *  EVENT LISTENERS
 * ------------------------ */
function initUI() {
  const gameTypeSelect = document.getElementById("gameType");
  const categoryLabel = document.getElementById("categoryLabel");
  const categorySelect = document.getElementById("categoryName");

   if (categorySelect) {
    categorySelect.innerHTML = "";
    Object.keys(POOLS)
      .filter((key) => key !== "locations")
      .forEach((key) => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = key;
        categorySelect.appendChild(opt);
      });
  }

  gameTypeSelect.addEventListener("change", () => {
    const show = gameTypeSelect.value === "category";
    categoryLabel.classList.toggle("hidden", !show);
    categorySelect.classList.toggle("hidden", !show);
  });

  async function prefillSettings() {
    if (!gameLogic.loadSettings) return;
    try {
      const saved = await gameLogic.loadSettings();
      if (!saved) return;

      const spyCountEl = document.getElementById("spyCount");
      const spyGuessCountEl = document.getElementById("spyGuessCount");
      const poolSizeEl = document.getElementById("poolSize");
      const voteAnytimeEl = document.getElementById("voteAnytime");

      if (saved.spyCount) spyCountEl.value = saved.spyCount;
      if (saved.spyGuessLimit) spyGuessCountEl.value = saved.spyGuessLimit;
      if (saved.poolSize) poolSizeEl.value = saved.poolSize;
      if (typeof saved.voteAnytime !== "undefined")
        voteAnytimeEl.checked = saved.voteAnytime;

      if (saved.gameType) {
        gameTypeSelect.value = saved.gameType;
        const show = saved.gameType === "category";
        categoryLabel.classList.toggle("hidden", !show);
        categorySelect.classList.toggle("hidden", !show);
        if (show && saved.categoryName) {
          categorySelect.value = saved.categoryName;
        }
      }
    } catch (err) {
      console.warn("Ayarlar yüklenemedi:", err);
    }
  }

  prefillSettings();
  resetVoteSelection();

  const createRoomBtn = document.getElementById("createRoomBtn");
  const createRoomLoading = document.getElementById("createRoomLoading");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const joinRoomBtn = document.getElementById("joinRoomBtn");

  saveSettingsBtn.addEventListener("click", async () => {
    const settings = await buildSettings();
    try {
      await gameLogic.saveSettings(settings);
      alert("Ayarlar kaydedildi!");
    } catch (err) {
      alert(err.message || err);
    }
  });

  let createRoomRunning = false;
  async function handleCreateRoom() {
    if (createRoomRunning) return;
    createRoomRunning = true;

    const creatorName = document
      .getElementById("creatorName")
      .value.trim();
    if (hasInvalidChars(creatorName)) {
      alert("İsminizde geçersiz karakter (. # $ [ ] /) kullanılamaz.");
      createRoomRunning = false;
      return;
    }

    // Buton tepkisiz görünmesin diye yükleme başlamadan önce kapat
    createRoomBtn.disabled = true;
    createRoomLoading.classList.remove("hidden");

    try {
      const settings = await buildSettings();
      if (
        !creatorName ||
        isNaN(settings.spyCount) ||
        isNaN(settings.spyGuessLimit)
      ) {
        alert("Lütfen tüm alanları doldurun.");
        return;
      }

      const roomCode = await gameLogic.createRoom({
        creatorName,
        ...settings,
      });
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
      gameLogic.listenRoom(roomCode);
    } catch (err) {
      alert(err.message || err);
    } finally {
      createRoomRunning = false;
      createRoomBtn.disabled = false;
      createRoomLoading.classList.add("hidden");
    }
  }

  createRoomBtn.addEventListener("click", handleCreateRoom);
  createRoomBtn.addEventListener("pointerdown", handleCreateRoom);

  let joinRoomRunning = false;
  async function handleJoinRoom() {
    if (joinRoomRunning) return;
    joinRoomRunning = true;

    const joinName = document.getElementById("joinName").value.trim();
    const joinCode = document
      .getElementById("joinCode")
      .value.trim()
      .toUpperCase();

    if (hasInvalidChars(joinName)) {
      alert("İsminizde geçersiz karakter (. # $ [ ] /) kullanılamaz.");
      joinRoomRunning = false;
      return;
    }

    if (!joinName || !joinCode) {
      alert("Lütfen adınızı ve oda kodunu girin.");
      joinRoomRunning = false;
      return;
    }

    try {
      const players = await gameLogic.joinRoom(joinName, joinCode);

      currentRoomCode = joinCode;
      currentPlayerName = joinName;
      isCreator = false;

      localStorage.setItem("roomCode", currentRoomCode);
      localStorage.setItem("playerName", currentPlayerName);
      localStorage.setItem("isCreator", "false");

      showRoomUI(joinCode, joinName, false);
      listenPlayersAndRoom(joinCode);
      gameLogic.listenRoom(joinCode);
    } catch (err) {
      alert(err.message);
      return;
    } finally {
      joinRoomRunning = false;
    }
  }

  joinRoomBtn.addEventListener("click", handleJoinRoom);
  joinRoomBtn.addEventListener("pointerdown", handleJoinRoom);

  document.getElementById("leaveRoomBtn").addEventListener("click", () => {
    const action = isCreator
      ? gameLogic.deleteRoom(currentRoomCode)
      : gameLogic.leaveRoom(currentRoomCode);

    Promise.resolve(action).then(() => {
      clearStoragePreservePromo();
      location.reload();
    });
  });

  document.getElementById("startGameBtn").addEventListener("click", async (e) => {
    if (!currentRoomCode) {
      alert("Oda kodu bulunamadı!");
      return;
    }
    const joinedPlayerCount = currentPlayers.length;
    if (joinedPlayerCount < MIN_PLAYERS) {
      updateStartButtonState(joinedPlayerCount);
      alert("Oyunu başlatmak için en az 3 oyuncu gerekli.");
      return;
    }
    const btn = e.currentTarget;
    btn.disabled = true;
    try {
      await gameLogic.startGame(currentRoomCode);
    } catch (error) {
      alert("Oyunu başlatırken bir hata oluştu: " + (error.message || error));
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById("startVotingBtn").addEventListener("click", () => {
    gameLogic.startVote(currentRoomCode, currentUid);
  });

  const voteList = document.getElementById("voteList");
  if (voteList) {
    voteList.addEventListener("click", (event) => {
      const targetBtn = event.target.closest(".vote-option");
      if (!targetBtn) return;
      const { uid } = targetBtn.dataset;
      const candidates = voteCandidatesSnapshot || buildVoteCandidates(playerUidMap);
      const selected = candidates.find((c) => c.uid === uid);
      if (selected) {
        setSelectedVote(selected.uid, selected.name || selected.uid);
        voteList
          .querySelectorAll(".vote-option")
          .forEach((btn) => btn.classList.toggle("active", btn.dataset.uid === uid));
      }
    });
  }

  // Oy ver
  document.getElementById("submitVoteBtn").addEventListener("click", () => {
    if (!selectedVoteUid) {
      alert("Lütfen oy vereceğin kişiyi seç.");
      return;
    }

    showVoteConfirmation();
  });

  document.getElementById("confirmVoteBtn").addEventListener("click", () => {
    if (!selectedVoteUid) return;
    const btn = document.getElementById("submitVoteBtn");
    if (btn) btn.disabled = true;
    const confirmBtn = document.getElementById("confirmVoteBtn");
    if (confirmBtn) confirmBtn.disabled = true;
    const msg = document.getElementById("votePendingMsg");
    if (msg) msg.classList.remove("hidden");
    const confirmArea = document.getElementById("voteConfirmArea");
    confirmArea?.classList.add("hidden");
    gameLogic.submitVote(currentRoomCode, currentUid, selectedVoteUid);
  });

  document.getElementById("cancelVoteBtn").addEventListener("click", () => {
    const confirmArea = document.getElementById("voteConfirmArea");
    confirmArea?.classList.add("hidden");
    const confirmBtn = document.getElementById("confirmVoteBtn");
    if (confirmBtn) confirmBtn.disabled = false;
  });

    document.getElementById("submitGuessBtn").addEventListener("click", () => {
      const guess = document.getElementById("guessSelect").value;
      if (guess) {
      gameLogic.guessLocation(currentRoomCode, currentUid, guess);
    }
  });

  // Sonraki tur
  document.getElementById("nextRoundBtn").addEventListener("click", () => {
    gameLogic.nextRound(currentRoomCode);
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
        ? gameLogic.deleteRoom(roomCode)
        : playerName
        ? gameLogic.leaveRoom(roomCode)
        : Promise.resolve();
      Promise.resolve(action).then(() => {
        clearStoragePreservePromo();
        location.reload();
      });
    } else {
      clearStoragePreservePromo();
      location.reload();
    }
  });
}

document.addEventListener("DOMContentLoaded", initUI);

async function buildSettings() {
  const playerCount = DEFAULT_PLAYER_COUNT;
  const spyCount = parseInt(document.getElementById("spyCount").value);
  const spyGuessCount = parseInt(document.getElementById("spyGuessCount").value);
  const gameType = document.getElementById("gameType").value;
  let categoryName = null;
  if (gameType === "category") {
    const c = document.getElementById("categoryName").value.trim();
    if (c) categoryName = c;
  }
  const poolSize = parseInt(document.getElementById("poolSize").value);
  const voteAnytime = document.getElementById("voteAnytime").checked;
  const creatorUid = await gameLogic.getUid();
  return {
    playerCount,
    spyCount,
    gameType,
    categoryName,
    poolSize,
    voteAnytime,
    spyGuessLimit: spyGuessCount,
    clueMode: "tek-kelime",
    creatorUid,
  };
}
