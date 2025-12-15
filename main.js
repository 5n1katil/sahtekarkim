import { gameLogic, POOLS } from './gameLogic.js';
import { escapeHtml, hasInvalidChars } from './utils.js';

console.log('main.js yüklendi');

const MIN_PLAYERS = 3;
const DEFAULT_PLAYER_COUNT = 20; // Eski güvenlik kurallarıyla uyum için oyuncu sayısını varsayılanla gönder

function getSpyUids(spies) {
  if (Array.isArray(spies)) return spies;
  if (spies && typeof spies === "object") return Object.keys(spies);
  return [];
}

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
let voteCountdownInterval = null;
let guessCountdownInterval = null;
if (window.auth && typeof window.auth.onAuthStateChanged === "function") {
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
} else {
  console.warn("Firebase Auth yüklenmedi, temel arayüz başlatılıyor");
  showSetupJoin();
}
let lastVoteResult = null;
let gameEnded = false;
let lastGuessEvent = null;
let lastVotingState = null;
let parityHandled = false;
let lastRoomStatus = null;
let lastVotingFinalizedAt = null;
let votingCleanupTimeout = null;
let lastGuessOptionsKey = null;
let lastGuessSelection = null;
let lastRoundId = null;

function isCurrentRoundPayload(roomData, payload) {
  if (!payload) return true;
  const roomRoundId = roomData?.roundId;
  const payloadRoundId = payload.roundId;
  if (roomRoundId && payloadRoundId && roomRoundId !== payloadRoundId) {
    return false;
  }
  return true;
}

function updateRoleDisplay(myData, settings) {
  const roleMessageEl = document.getElementById("roleMessage");
  const guessLabel = document.getElementById("guessLabel");
  const poolInfo = document.getElementById("poolInfo");
  const poolSummary = document.getElementById("poolSummary");
  const poolListEl = document.getElementById("poolList");
  const roleHintBlock = document.getElementById("roleHintBlock");
  const roleHintText = document.getElementById("roleHintText");
  const isCategory = settings?.gameType === "category";
  const poolLabel = isCategory
    ? "Sahtekarın gördüğü roller"
    : "Sahtekarın gördüğü konumlar";
  const roleHint = isCategory
    ? myData?.roleHint ??
      myData?.role?.roleHint ??
      myData?.role?.hint ??
      null
    : null;

  if (roleHintBlock) {
    roleHintBlock.classList.add("hidden");
  }
  if (roleHintText) {
    roleHintText.textContent = "";
  }

  const resolvedRole = myData?.roleName ?? myData?.role?.name ?? myData?.role;
  const displayName = typeof resolvedRole === "string" ? resolvedRole : "";
  const poolEntries = (myData?.allLocations || [])
    .map((item) => (item && typeof item === "object" ? item.name : item))
    .filter((item) => item !== undefined && item !== null && item !== "");

  if (
    myData &&
    displayName &&
    typeof displayName === "string" &&
    displayName.includes("Sahtekar")
  ) {
    const safeLocations = poolEntries.map(escapeHtml).join(", ");
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
  } else if (myData && displayName) {
    const safeLocation = escapeHtml(myData.location ?? "");
    const safeRole = escapeHtml(displayName);
    roleMessageEl.innerHTML =
      `📍 Konum: <b>${safeLocation}</b><br>` +
      `🎭 Rolün: <b>${safeRole}</b>`;
    poolSummary.textContent = poolLabel;
    poolListEl.textContent = poolEntries.map(escapeHtml).join(", ");
    poolInfo.classList.remove("hidden");

    if (roleHint && roleHintBlock && roleHintText) {
      roleHintText.textContent = roleHint;
      roleHintBlock.classList.remove("hidden");
    }
  } else {
    roleMessageEl.textContent = "Rol bilgisi bulunamadı.";
    poolInfo.classList.add("hidden");
    return;
  }
}

  function getResolvedVoteResult(roomData) {
    const votingResult = roomData.voting?.result;
    if (!isCurrentRoundPayload(roomData, votingResult)) return null;
    if (votingResult) {
      if (votingResult.tie) return { tie: true };
      if (votingResult.eliminatedUid) {
        return {
          tie: false,
        voted: votingResult.eliminatedUid,
        isSpy: !!votingResult.isSpy,
        role: votingResult.role,
        location: votingResult.location,
        remainingSpies: votingResult.remainingSpies,
          lastSpy: votingResult.lastSpy,
          roundId: votingResult.roundId,
        };
      }
    }
    if (!isCurrentRoundPayload(roomData, roomData.voteResult)) return null;
    return roomData.voteResult || null;
  }

  function buildVotingOutcomeMessage({
    eliminatedName,
    eliminatedIsImpostor,
    alivePlayersCount,
    aliveImpostorsCount,
    spyNames = [],
  }) {
    const safeName = escapeHtml(eliminatedName || "");
    const normalizedSpyNames = uniqueNames(
      (spyNames || []).map((name) => sanitizeName(name))
    ).filter(Boolean);
    const impostorWinnersText = formatSpyWinnersText(normalizedSpyNames);

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
          message: `Oylama sonucunda ${safeName} elendi. Elenen kişi masumdu — oyunu ${impostorWinnersText} kazandı!`,
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
    const resolvedResult = getResolvedVoteResult(roomData);
    if (!resolvedResult || resolvedResult.tie) return false;
    if (!isCurrentRoundPayload(roomData, resolvedResult)) return false;

    const key = JSON.stringify(resolvedResult);
    if (key === lastVoteResult) return true;
    lastVoteResult = key;

    const votedUid = resolvedResult.voted;
    const votedName = playerUidMap[votedUid]?.name || votedUid;
    const remaining = Object.keys(roomData.players || {}).filter(
      (uid) => uid !== votedUid
    );
    const activeSpies = getSpyUids(roomData.spies).filter((id) =>
      remaining.includes(id)
    );
    const alivePlayersCount = remaining.length;
    const aliveImpostorsCount = activeSpies.length;

    showResultOverlay(
      {
        eliminatedIsImpostor: resolvedResult.isSpy,
        eliminatedName: votedName,
        alivePlayersCount,
        aliveImpostorsCount,
        votedUid,
      },
      roomData
    );

    return true;
  }

  function showResultOverlay(
    {
      eliminatedIsImpostor,
      eliminatedName,
      alivePlayersCount,
      aliveImpostorsCount,
      votedUid,
    },
    roomData
  ) {
    const outcome = buildVotingOutcomeMessage({
      eliminatedName,
      eliminatedIsImpostor,
      alivePlayersCount,
      aliveImpostorsCount,
      spyNames: getSpyNames(roomData, roomData?.players),
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
    const spyInfo = getSpyInfo(roomData);
    const resolvedMessage = resolveGameOverMessage(
      roomData,
      outcome.message,
      spyInfo
    );
    msgDiv.textContent = resolvedMessage;
    appendSpyNamesLine(msgDiv, roomData, {
      spyInfo,
      primaryMessage: resolvedMessage,
    });
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
    if (!isCurrentRoundPayload(roomData, finalGuess)) return null;
    const hasGuessValue =
      finalGuess.guessedRole || finalGuess.guessedLocation || finalGuess.guess;
    if (hasGuessValue) {
      return finalGuess;
    }

    const guessEntry = roomData?.lastGuess;
    if (!isCurrentRoundPayload(roomData, guessEntry)) return rawFinalGuess;
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

  function getGameOverInfo(roomData) {
    const gameOver = roomData?.gameOver;
    if (!gameOver || !gameOver.finalizedAt) return null;
    if (!isCurrentRoundPayload(roomData, gameOver)) return null;

    const spies = Array.isArray(gameOver.spies)
      ? gameOver.spies.filter((s) => s?.uid && s?.name)
      : [];

    return { ...gameOver, spies };
  }

  function buildSpyNames(spies, players = {}) {
    const names = (spies || []).map((s) => {
      const uid = s?.uid ?? s;
      const rawName =
        (uid && players?.[uid]?.name) ||
        (typeof s === "object" ? s?.name : null) ||
        (typeof uid === "string" ? uid : null);
      return sanitizeName(rawName);
    });

    return uniqueNames(names).filter(Boolean);
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function sanitizeName(name) {
    if (typeof name !== "string") return name;
    const trimmed = name.trim();
    if (!trimmed) return null;
    const cleaned = trimmed.replace(/^[()]+|[()]+$/g, "").trim();
    return cleaned || null;
  }

  function uniqueNames(names) {
    const seen = new Set();
    return names.filter((name) => {
      if (!name) return false;
      const key = typeof name === "string" ? name.toLowerCase() : name;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function formatSpyWinnersText(spyNames) {
    const cleaned = uniqueNames(
      (spyNames || []).map((name) => sanitizeName(name))
    ).filter(Boolean);

    if (cleaned.length === 1) {
      return `sahtekar ${cleaned[0]}`;
    }

    if (cleaned.length > 1) {
      const lastName = cleaned[cleaned.length - 1];
      const leading = cleaned.slice(0, -1);
      const joined = leading.length
        ? `${leading.join(", ")} ve ${lastName}`
        : lastName;
      return `sahtekarlar ${joined}`;
    }

    return "sahtekarlar";
  }

  function formatSpyLabel(spyNames) {
    const count = Array.isArray(spyNames) ? spyNames.length : 0;
    return count <= 1 ? "Sahtekar" : "Sahtekarlar";
  }

  function formatSpyIntro(spyInfo) {
    const spyNames = Array.isArray(spyInfo)
      ? spyInfo
      : Array.isArray(spyInfo?.spyNames)
        ? spyInfo.spyNames
        : [];
    const label = formatSpyLabel(spyNames);
    const namesText = spyNames.join(", ");
    return namesText ? `${label} ${namesText}` : label;
  }

  function normalizeSpyLabel(message, spyInfo) {
    if (!message || !spyInfo?.hasNames) return message;

    const replacement = formatSpyIntro(spyInfo);
    const patterns = [
      /Sahtekar\(\s*lar\s*\)\s*\([^)]*\)/g,
      /Sahtekarlar\s*\([^)]*\)/g,
      /Sahtekar\(\s*lar\s*\)/g,
    ];

    const replaced = patterns.reduce(
      (msg, pattern) => msg.replace(pattern, replacement),
      message
    );

    return replaced.replace(/\(\s*\)/g, "").replace(/\s{2,}/g, " ").trim();
  }

  function resolveGameOverMessage(roomData, fallbackMessage, spyInfo) {
    const gameOver = getGameOverInfo(roomData);
    if (gameOver?.message) {
      return gameOver.message;
    }
    return normalizeSpyLabel(fallbackMessage, spyInfo);
  }

  function appendGuessDetails(msgDiv, lines) {
    lines.forEach((line) => {
      const detail = document.createElement("div");
      detail.innerHTML = line;
      msgDiv.appendChild(detail);
    });
  }

  function getSpyNames(roomState, players) {
    const state = roomState || {};
    const playerMap = players || state.players || {};
    const spiesSource =
      state.spies ??
      state.spyUids ??
      (Array.isArray(state.spiesSnapshot?.spies)
        ? state.spiesSnapshot.spies
        : null);

    if (Array.isArray(spiesSource)) {
      return buildSpyNames(spiesSource, playerMap);
    }

    const spyIds = getSpyUids(spiesSource);
    if (spyIds.length > 0) {
      return buildSpyNames(spyIds, playerMap);
    }

    return [];
  }

  function getSpyInfo(roomData) {
    const spyNames = getSpyNames(roomData, roomData?.players);
    const spiesLabel = spyNames.length ? spyNames.join(", ") : "—";
    const spyLabel = formatSpyLabel(spyNames);

    return {
      spyNames,
      spiesLabel,
      spyLabel,
      hasNames: spyNames.length > 0,
    };
  }

  function appendSpyNamesLine(msgDiv, roomData, options = {}) {
    const spyInfo = options.spyInfo || getSpyInfo(roomData);
    const primaryMessage = options.primaryMessage || msgDiv?.textContent || "";
    const hasSnapshot =
      !!roomData?.spiesSnapshot &&
      isCurrentRoundPayload(roomData, roomData.spiesSnapshot);
    const alreadyHasNames =
      spyInfo.hasNames && primaryMessage.includes(spyInfo.spiesLabel);
    if (!hasSnapshot || alreadyHasNames) return;

    const spyLine = document.createElement("div");
    spyLine.className = "spy-reveal";
    const label = spyInfo.spyLabel || formatSpyLabel(spyInfo.spyNames);
    spyLine.textContent = `${label}: ${spyInfo.spiesLabel}`;
    msgDiv.appendChild(spyLine);
  }

  function showSpyWinOverlay(roomData, finalGuess, gameType, actualAnswer) {
    const overlay = document.getElementById("resultOverlay");
    if (!overlay) {
      console.error("resultOverlay element not found");
      return;
    }
    const spyInfo = getSpyInfo(roomData);
    gameEnded = true;
    overlay.innerHTML = "";
    const msgDiv = document.createElement("div");
    msgDiv.className = "result-message";
    const guessWord = gameType === "category" ? "rolü" : "konumu";
    const guessedValue =
      finalGuess?.guessedRole || finalGuess?.guessedLocation || finalGuess?.guess;

    const spyIntro = formatSpyIntro(spyInfo);

    const fallbackMessage = guessedValue
      ? `${spyIntro} ${guessWord} ${guessedValue} olarak doğru tahmin etti ve oyunu kazandı!`
      : spyInfo.hasNames
        ? `${spyIntro} kazandı! Oyun Bitti...`
        : "Sahtekar(lar) kazandı! Oyun Bitti...";

    msgDiv.textContent = resolveGameOverMessage(
      roomData,
      fallbackMessage,
      spyInfo
    );
    appendSpyNamesLine(msgDiv, roomData, {
      spyInfo,
      primaryMessage: msgDiv.textContent,
    });
    const resolvedActualAnswer =
      actualAnswer || finalGuess?.actualRole || finalGuess?.actualLocation;
    const detailLines = buildGuessDetails(
      finalGuess,
      resolvedActualAnswer || actualAnswer,
      gameType
    );
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

  function showSpyFailOverlay(roomData, finalGuess, gameType, actualAnswer) {
    const overlay = document.getElementById("resultOverlay");
    if (!overlay) {
      console.error("resultOverlay element not found");
      return;
    }
    const spyInfo = getSpyInfo(roomData);
    gameEnded = true;
    overlay.innerHTML = "";
    const msgDiv = document.createElement("div");
    msgDiv.className = "result-message";
    const guessWord = gameType === "category" ? "rolü" : "konumu";
    const actualWord = gameType === "category" ? "rol" : "konum";
    const guessedValue =
      finalGuess?.guessedRole || finalGuess?.guessedLocation || finalGuess?.guess;
    const resolvedActualAnswer =
      actualAnswer || finalGuess?.actualRole || finalGuess?.actualLocation;
    const spyIntro = formatSpyIntro(spyInfo);
    const guessDetail = guessedValue
      ? `${guessWord} ${guessedValue} olarak`
      : `${guessWord} olarak`;
    const fallbackMessage = resolvedActualAnswer
      ? `${spyIntro} ${guessDetail} yanlış tahmin etti. Doğru ${actualWord} ${resolvedActualAnswer} idi ve oyunu masumlar kazandı!`
      : `${spyIntro} ${guessDetail} yanlış tahmin etti ve oyunu masumlar kazandı!`;
    msgDiv.textContent = resolveGameOverMessage(
      roomData,
      fallbackMessage,
      spyInfo
    );
    appendSpyNamesLine(msgDiv, roomData, {
      spyInfo,
      primaryMessage: msgDiv.textContent,
    });
    const detailLines = buildGuessDetails(
      finalGuess,
      resolvedActualAnswer,
      gameType
    );
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
    const snapshot = roomData?.voting?.snapshot;
    if (snapshot?.order?.length) {
      voteCandidatesSnapshot = snapshot.order
        .map((uid) => ({
          uid,
          name:
            snapshot.names?.[uid] ||
            roomData?.players?.[uid]?.name ||
            playerUidMap[uid]?.name ||
            uid,
        }))
        .filter((p) => p.uid && p.uid !== currentUid);
      renderVoteOptions(voteCandidatesSnapshot);
      return;
    }
    const legacySnapshot = roomData?.voting?.snapshotPlayers;
    const source = legacySnapshot && legacySnapshot.length
      ? legacySnapshot.reduce((acc, p) => {
          if (p?.uid) acc[p.uid] = { name: p.name };
          return acc;
        }, {})
      : roomData?.players || playerUidMap;
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

  function resetLocalRoundState() {
    gameEnded = false;
    parityHandled = false;
    wasEliminated = false;
    lastVoteResult = null;
    lastGuessEvent = null;
    lastVotingState = null;
    lastVotingFinalizedAt = null;
    voteCandidatesSnapshot = null;
    selectedVoteUid = null;
    selectedVoteName = null;
    lastGuessOptionsKey = null;
    lastGuessSelection = null;
    clearInterval(voteCountdownInterval);
    voteCountdownInterval = null;
    clearInterval(guessCountdownInterval);
    guessCountdownInterval = null;

    const overlay = document.getElementById("resultOverlay");
    if (overlay) {
      overlay.classList.add("hidden");
      overlay.classList.remove("impostor-animation", "innocent-animation");
      overlay.innerHTML = "";
    }
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
      const currentRoundId = roomData?.roundId || null;
      const roundChanged =
        currentRoundId && lastRoundId && currentRoundId !== lastRoundId;
      const roundResetNeeded =
        !currentRoundId && lastRoundId && roomData?.status === "waiting";
      if (roundChanged || roundResetNeeded) {
        resetLocalRoundState();
      }
      lastRoundId = currentRoundId;

      const currentVotingResult = isCurrentRoundPayload(
        roomData,
        roomData?.voting?.result
      )
        ? roomData?.voting?.result
        : null;
      const currentVoteResult = isCurrentRoundPayload(
        roomData,
        roomData?.voteResult
      )
        ? roomData?.voteResult
        : null;
      const currentGuessState = isCurrentRoundPayload(roomData, roomData?.guess)
        ? roomData?.guess
        : null;
      const currentLastGuess = isCurrentRoundPayload(
        roomData,
        roomData?.lastGuess
      )
        ? roomData?.lastGuess
        : null;
      const roundSafeGameOver = getGameOverInfo(roomData);

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
        const roleHintBlock = document.getElementById("roleHintBlock");
        const roleHintText = document.getElementById("roleHintText");
        if (roleMessageEl) roleMessageEl.innerHTML = "";
        if (poolSummary) poolSummary.textContent = "";
        if (poolListEl) poolListEl.textContent = "";
        if (roleHintText) roleHintText.textContent = "";
        roleHintBlock?.classList.add("hidden");
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
            roundSafeGameOver?.finalGuess || currentLastGuess?.finalGuess || null,
            roomData
          );
          const actualAnswer = getActualAnswer(roomData);
          const gameType = roomData.settings?.gameType;
          if (!parityHandled) {
            showSpyWinOverlay(roomData, finalGuess, gameType, actualAnswer);
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
            roundSafeGameOver?.finalGuess || currentLastGuess?.finalGuess || null,
            roomData
          );
          const actualAnswer = getActualAnswer(roomData);
          const gameType = roomData.settings?.gameType;
          showSpyFailOverlay(roomData, finalGuess, gameType, actualAnswer);
          return;
        }
        if (!roomData || roomData.status !== "started") {
          document.getElementById("gameActions").classList.add("hidden");
          leaveBtn?.classList.remove("hidden");
          exitBtn?.classList.remove("hidden");
          lastGuessOptionsKey = null;
          lastGuessSelection = null;
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
          const roleDisplay = myData.role?.name ?? myData.role;
          const isSpy =
            roleDisplay &&
            typeof roleDisplay === "string" &&
            roleDisplay.includes("Sahtekar");
          if (isSpy && guessesLeft > 0) {
            const guessSection = document.getElementById("guessSection");
            guessSection.classList.remove("hidden");
            const guessSelect = document.getElementById("guessSelect");
            const locations = myData.allLocations || [];
            const displayLocations = locations
              .map((loc) => (loc && typeof loc === "object" ? loc.name : loc))
              .filter((loc) => loc !== undefined && loc !== null && loc !== "");
            const locationsKey = JSON.stringify(displayLocations);
            const previousSelection = guessSelect.value || lastGuessSelection;

            if (locationsKey !== lastGuessOptionsKey) {
              guessSelect.innerHTML = displayLocations
                .map(
                  (loc) =>
                    `<option value="${escapeHtml(loc)}">${escapeHtml(loc)}</option>`
                )
                .join("");
              lastGuessOptionsKey = locationsKey;
            }

            const selectionToRestore = displayLocations.includes(previousSelection)
              ? previousSelection
              : guessSelect.value;
            if (selectionToRestore) {
              guessSelect.value = selectionToRestore;
            }
            if (!guessSelect.value && guessSelect.options.length > 0) {
              guessSelect.value = guessSelect.options[0].value;
            }
            lastGuessSelection = guessSelect.value || null;
          } else {
            document.getElementById("guessSection").classList.add("hidden");
            lastGuessOptionsKey = null;
            lastGuessSelection = null;
          }
        } else {
          document.getElementById("guessSection").classList.add("hidden");
          lastGuessOptionsKey = null;
          lastGuessSelection = null;
        }

        const votingInstructionEl = document.getElementById("votingInstruction");
        if (votingInstructionEl) {
          votingInstructionEl.textContent =
            "Her tur en az 1 tek kelimelik ipucu verin. Hazır olduğunuzda oylamayı başlatabilirsiniz.";
        }

        // Oylama durumu
        const isVotingPhase =
          roomData.phase === "voting" ||
          roomData.votingStarted === true ||
          roomData.voting?.active;

        if (roomData.voting?.active || roomData.votingStarted) {
          lockVoteCandidates(roomData);
        } else {
          unlockVoteCandidates();
          resetVoteSelection();
        }

        const votingStateKey = JSON.stringify({
          votingStarted: roomData.votingStarted,
          votingActive: roomData.voting?.active,
          votes: roomData.votes,
        });
        if (votingStateKey !== lastVotingState) {
          const votingSection = document.getElementById("votingSection");
          const hasVoted = roomData.votes && roomData.votes[currentUid];
          const hasResult = currentVotingResult?.finalizedAt || currentVoteResult;
          const shouldShowVoting = roomData.voting?.active && !hasVoted && !hasResult;
          if (votingSection) {
            votingSection.classList.toggle("hidden", !shouldShowVoting);
          }
          const submitVoteBtn = document.getElementById("submitVoteBtn");
          if (submitVoteBtn)
            submitVoteBtn.disabled = !!hasVoted || !selectedVoteUid;
          const votePendingMsg = document.getElementById("votePendingMsg");
          if (votePendingMsg) {
            votePendingMsg.classList.toggle("hidden", !(hasVoted && !hasResult));
          }
          if (!roomData.voting?.active || hasVoted) {
            const confirmArea = document.getElementById("voteConfirmArea");
            confirmArea?.classList.add("hidden");
          }
          lastVotingState = votingStateKey;
        }

        updateSelectedVoteName();

        const voteCountdownEl = document.getElementById("voteCountdown");
        const votingEndsAt = roomData.voting?.endsAt;
        const votingFinalized = currentVotingResult?.finalizedAt || currentVoteResult;
        const shouldShowCountdown =
          roomData.voting?.active && votingEndsAt && !votingFinalized;

        if (shouldShowCountdown && voteCountdownEl) {
          const updateCountdown = () => {
            const remainingMs = Math.max(0, votingEndsAt - Date.now());
            const seconds = Math.ceil(remainingMs / 1000);
            const padded = String(Math.max(0, seconds)).padStart(2, "0");
            voteCountdownEl.textContent = `Oylama bitiyor: 00:${padded}`;
            voteCountdownEl.classList.toggle("hidden", false);
            if (remainingMs <= 0) {
              clearInterval(voteCountdownInterval);
              voteCountdownInterval = null;
              gameLogic.finalizeVoting(currentRoomCode);
            }
          };
          clearInterval(voteCountdownInterval);
          updateCountdown();
          voteCountdownInterval = setInterval(updateCountdown, 1000);
        } else {
          clearInterval(voteCountdownInterval);
          voteCountdownInterval = null;
          voteCountdownEl?.classList.add("hidden");
        }

        const guessState = currentGuessState;
        const shouldShowGuessCountdown =
          guessState?.spyUid === currentUid &&
          guessState.endsAt &&
          !currentLastGuess &&
          roomData.status !== "finished";
        if (shouldShowGuessCountdown && voteCountdownEl) {
          const updateGuessCountdown = () => {
            const remainingMs = Math.max(0, guessState.endsAt - Date.now());
            const seconds = Math.ceil(remainingMs / 1000);
            const padded = String(Math.max(0, seconds)).padStart(2, "0");
            voteCountdownEl.textContent = `Tahmin süresi: 00:${padded}`;
            voteCountdownEl.classList.toggle("hidden", false);
            if (remainingMs <= 0) {
              clearInterval(guessCountdownInterval);
              guessCountdownInterval = null;
              gameLogic.finalizeGuessTimeout(currentRoomCode);
            }
          };
          clearInterval(guessCountdownInterval);
          updateGuessCountdown();
          guessCountdownInterval = setInterval(updateGuessCountdown, 1000);
        } else {
          clearInterval(guessCountdownInterval);
          guessCountdownInterval = null;
        }

        const startBtn = document.getElementById("startVotingBtn");
        const waitingEl = document.getElementById("waitingVoteStart");
        const voteRequests = roomData.voteStartRequests || {};
        const alivePlayers = Object.entries(roomData.playerRoles || {}).map(
          ([uid]) => ({
            uid,
            name:
              roomData.players?.[uid]?.name || playerUidMap[uid]?.name || uid,
          })
        );
        const aliveUids = alivePlayers.map((p) => p.uid);
        const playersCount = alivePlayers.length;
        const requestCount = Object.keys(voteRequests).filter((uid) =>
          aliveUids.includes(uid)
        ).length;
        const hasRequested = !!voteRequests[currentUid];
        const threshold = Math.ceil(playersCount / 2);
        const isWaiting =
          !roomData.voting?.active &&
          !roomData.votingStarted &&
          hasRequested &&
          requestCount < threshold;

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

        const hasActiveVoting = roomData.voting?.active;
        const votingHasResult = currentVotingResult?.finalizedAt || currentVoteResult;

        if (!hasActiveVoting || votingHasResult) {
          liveVoteCounts?.classList.add("hidden");
          if (voteCountList) voteCountList.innerHTML = "";
        } else {
          liveVoteCounts?.classList.remove("hidden");
          const tally = {};
          Object.values(roomData.votes || {}).forEach((uid) => {
            tally[uid] = (tally[uid] || 0) + 1;
          });
          const snapshot = roomData.voting?.snapshot;
          const playerMap = snapshot?.names
            ? snapshot.order.map((uid) => ({
                uid,
                name: snapshot.names[uid] || playerUidMap[uid]?.name || uid,
              }))
            : (roomData.voting?.snapshotPlayers || []).map((p) => ({
                uid: p.uid,
                name: p.name,
              }))
            .filter((p) => p.uid) || [];

          const fallbackPlayers = !playerMap.length
            ? Object.entries(roomData.players || playerUidMap || {}).map(
                ([uid, p]) => ({ uid, name: p?.name || uid })
              )
            : playerMap;

          const ranked = fallbackPlayers.map((p) => ({
            uid: p.uid,
            name: p.name,
            count: tally[p.uid] || 0,
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

        const resolvedVoteResult = getResolvedVoteResult(roomData);

        if (resolvedVoteResult) {
          if (resolvedVoteResult.tie) {
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

        if (currentLastGuess) {
          const guessKey = JSON.stringify(currentLastGuess);
          if (guessKey !== lastGuessEvent) {
            lastGuessEvent = guessKey;
            const guessWord =
              roomData.settings?.gameType === "category" ? "rolü" : "konumu";
            const isSpyGuess = currentLastGuess.spy === currentUid;
            const msg = isSpyGuess
              ? `Yanlış tahmin ettin! ${guessWord} ${currentLastGuess.guess}. Kalan tahmin hakkı: ${currentLastGuess.guessesLeft}`
              : `Sahtekar ${guessWord} ${currentLastGuess.guess} tahmin etti ama yanıldı. Kalan tahmin hakkı: ${currentLastGuess.guessesLeft}`;
            alert(msg);
          }
        } else {
          lastGuessEvent = null;
        }

        const votingResult = currentVotingResult;
        const allAlivePlayers = Object.keys(roomData.playerRoles || {});
        const voteCount = Object.keys(roomData.votes || {}).filter((voter) =>
          allAlivePlayers.includes(voter)
        ).length;
        const shouldFinalizeByCount =
          isCreator &&
          roomData.voting?.active &&
          allAlivePlayers.length > 0 &&
          voteCount === allAlivePlayers.length &&
          !votingResult?.finalizedAt;
        const shouldFinalizeByTimeout =
          isCreator &&
          roomData.voting?.active &&
          roomData.voting.endsAt &&
          Date.now() >= roomData.voting.endsAt &&
          !votingResult?.finalizedAt;

        if (shouldFinalizeByCount || shouldFinalizeByTimeout) {
          gameLogic.finalizeVoting(currentRoomCode);
        }

        const finalizedAt = votingResult?.finalizedAt;
        const shouldScheduleCleanup =
          finalizedAt &&
          !roomData.voting?.active &&
          roomData.status === "started" &&
          !currentGuessState;
        if (shouldScheduleCleanup && finalizedAt !== lastVotingFinalizedAt) {
          lastVotingFinalizedAt = finalizedAt;
          if (votingCleanupTimeout) clearTimeout(votingCleanupTimeout);
          votingCleanupTimeout = setTimeout(() => {
            gameLogic.resetVotingState(currentRoomCode);
          }, 4000);
        } else if (!finalizedAt) {
          lastVotingFinalizedAt = null;
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

  const updateCategoryVisibility = () => {
    const show = gameTypeSelect?.value === "category";
    categoryLabel?.classList.toggle("hidden", !show);
    categorySelect?.classList.toggle("hidden", !show);
  };

  gameTypeSelect?.addEventListener("change", updateCategoryVisibility);
  updateCategoryVisibility();

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
    const guessSelect = document.getElementById("guessSelect");
    const guess = guessSelect ? guessSelect.value : "";
    if (guessSelect) {
      lastGuessSelection = guessSelect.value || lastGuessSelection;
    }
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
