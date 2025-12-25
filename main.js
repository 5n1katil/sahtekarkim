import { gameLogic, getServerNow, POOLS } from './gameLogic.js';
import {
  escapeHtml,
  getActivePlayers,
  hasInvalidChars,
  isPlayerAlive,
  resolveRoleName,
} from './utils.js';

console.log('main.js yüklendi');

// Rollup edilen çıktılarda global bir temizleyici beklenebiliyor; henüz tanımlı
// değilse oylama akışının tamamen durmasına yol açan ReferenceError'ları
// engellemek için güvenli bir varsayılan oluşturuyoruz.
if (typeof window.cleanupListener !== "function") {
  window.cleanupListener = () => {};
}

const MIN_PLAYERS = 3;
const DEFAULT_PLAYER_COUNT = 20; // Eski güvenlik kurallarıyla uyum için oyuncu sayısını varsayılanla gönder

function resolveGamePhase(roomData) {
  return roomData?.game?.phase || roomData?.phase;
}

function isCurrentPlayerEligible(roomData) {
  const isEliminated =
    roomData?.eliminated && roomData.eliminated[currentUid];
  const playerEntry = roomData?.players?.[currentUid];
  return !isEliminated && isPlayerAlive(playerEntry);
}

function resolveVotes(roomData) {
  return roomData?.voting?.votes || roomData?.votes || {};
}

function getExpectedVoterIds(expectedVotersMap) {
  if (!expectedVotersMap || typeof expectedVotersMap !== "object") return [];
  return Object.keys(expectedVotersMap);
}

function buildExpectedVoterList(expectedVotersMap, snapshot) {
  const ids = getExpectedVoterIds(expectedVotersMap);
  if (!ids.length) return [];
  if (snapshot?.order?.length) {
    const ordered = snapshot.order.filter((uid) => expectedVotersMap?.[uid]);
    const remaining = ids.filter((uid) => !ordered.includes(uid));
    return [...ordered, ...remaining];
  }
  return ids;
}

function getSpyUids(spies) {
  if (Array.isArray(spies)) return spies;
  if (spies && typeof spies === "object") return Object.keys(spies);
  return [];
}

function clearStoragePreservePromo() {
  const promoDismissedFlag = localStorage.getItem("promoModalDismissed");
  localStorage.removeItem("roomCode");
  localStorage.removeItem("playerName");
  localStorage.removeItem("isCreator");
  localStorage.clear();
  if (promoDismissedFlag) {
    localStorage.setItem("promoModalDismissed", promoDismissedFlag);
  }
}

function showEliminationOverlay(roomCode) {
  const overlay = document.getElementById("resultOverlay");
  const actions = document.getElementById("gameActions");
  if (!overlay) return;

  overlay.innerHTML = "";
  const message = document.createElement("div");
  message.className = "result-message";
  message.textContent = "Elendin! Oyun devam ediyor...";
  overlay.appendChild(message);

  const closeOverlay = () => {
    overlay.classList.add("hidden");
    overlay.classList.remove("impostor-animation", "innocent-animation");
    actions?.classList.add("hidden");
  };

  if (isCreator) {
    const actionBtn = document.createElement("button");
    actionBtn.classList.add("overlay-btn");
    actionBtn.textContent = "Yeniden oyna";
    actionBtn.addEventListener("click", () => {
      closeOverlay();
      gameLogic.restartGame(roomCode);
    });
    overlay.appendChild(actionBtn);
  } else {
    actions?.classList.add("hidden");
  }

  const leaveBtn = document.createElement("button");
  leaveBtn.classList.add("overlay-btn");
  leaveBtn.textContent = "Odadan Çık";
  leaveBtn.addEventListener("click", () => {
    handleRoomGone("elimination exit", {
      redirectToHome: true,
      noticeText: null,
      requireElimination: true,
    });
  });
  overlay.appendChild(leaveBtn);

  overlay.classList.remove("hidden", "impostor-animation", "innocent-animation");
  actions?.classList.add("hidden");
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
let roomValueRef = null;
let roomValueCallback = null;
let roomValueUnsubscribe = null;
let roomMissingTimeoutId = null;
let roomMissingCounter = 0;
let lastTieRestartAt = 0;
const authReadyPromise = window.authReady || Promise.resolve();
let reconnectNotice = null;
let gameLogicRoomUnsub = null;
let gameLogicPlayersUnsub = null;

function showConnectionNotice(message, tone = "info") {
  const banner = document.getElementById("connectionBanner");
  if (!banner) return;
  reconnectNotice = { message, tone };
  banner.textContent = message;
  banner.classList.remove("hidden", "warning", "info");
  if (tone === "warning") {
    banner.classList.add("warning");
  } else {
    banner.classList.add("info");
  }
}

function clearConnectionNotice(messageToKeep) {
  if (messageToKeep && reconnectNotice?.message !== messageToKeep) return;
  reconnectNotice = null;
  const banner = document.getElementById("connectionBanner");
  if (!banner) return;
  banner.textContent = "";
  banner.classList.add("hidden");
  banner.classList.remove("warning", "info");
}

function clearRoomValueListener() {
  if (roomValueUnsubscribe) {
    roomValueUnsubscribe();
  }
  roomValueRef = null;
  roomValueCallback = null;
  roomValueUnsubscribe = null;
}

async function safeCheckRoomExists(roomRef) {
  try {
    const snapshot = await roomRef.get();
    return { exists: snapshot.exists(), snapshot };
  } catch (error) {
    console.error("[ROOM GET FAILED - NON-BLOCKING]", error);
    return { exists: true, error };
  }
}

async function handleConfirmedRoomMissing(expectedRoomCode, options = {}) {
  const roomCode = expectedRoomCode || currentRoomCode;
  if (expectedRoomCode && expectedRoomCode !== currentRoomCode) {
    return;
  }

  if (!options.confirmedByGet && roomCode) {
    const { exists } = await safeCheckRoomExists(window.db.ref(`rooms/${roomCode}`));
    if (exists) return;
  }

  handleRoomGone("confirmed missing");
}

if (window.auth && typeof window.auth.onAuthStateChanged === "function") {
  showConnectionNotice("Oturum doğrulanıyor...");

  authReadyPromise
    .catch((err) => {
      console.error("Auth persistence hazırlanamadı", err);
      showConnectionNotice(
        "Bağlantı sorunu yaşandı, yeniden deniyoruz...",
        "warning"
      );
    })
    .finally(() => {
      window.auth.onAuthStateChanged(async (user) => {
        currentUid = user ? user.uid : null;

        if (!user) {
          showConnectionNotice(
            "Oturum açılamadı. Lütfen tekrar deneyin.",
            "warning"
          );
          showSetupJoin();
          return;
        }

        currentRoomCode = localStorage.getItem("roomCode") || null;
        currentPlayerName = localStorage.getItem("playerName") || null;
        isCreator = localStorage.getItem("isCreator") === "true";

        if (currentRoomCode && currentPlayerName) {
          const roomRef = window.db.ref("rooms/" + currentRoomCode);
          showConnectionNotice("Odaya bağlanılıyor...");
          try {
            const snapshot = await roomRef.get();
            if (!snapshot.exists()) {
              await handleConfirmedRoomMissing(currentRoomCode);
              return;
            }

            const roomData = snapshot.val();
            const uid = user.uid;
            const players = roomData?.players || {};
            let resolvedUid = uid;

            if (!players[uid] && currentPlayerName) {
              const previousUid = Object.keys(players).find(
                (key) => players[key]?.name === currentPlayerName
              );

              if (previousUid) {
                showConnectionNotice("Yeniden bağlanılıyor...");
                const previousPlayer = players[previousUid] || {};
                const updates = {};
                const normalizedPlayer = {
                  ...previousPlayer,
                  name: currentPlayerName,
                  isCreator,
                };

                updates[`rooms/${currentRoomCode}/players/${uid}`] = normalizedPlayer;
                updates[`rooms/${currentRoomCode}/players/${previousUid}`] = null;

                if (roomData.playerRoles?.[previousUid]) {
                  updates[`rooms/${currentRoomCode}/playerRoles/${uid}`] =
                    roomData.playerRoles[previousUid];
                  updates[`rooms/${currentRoomCode}/playerRoles/${previousUid}`] = null;
                }

                try {
                  await window.db.ref().update(updates);
                  resolvedUid = uid;
                } catch (moveErr) {
                  console.warn("Eski oyuncu kaydı taşınamadı", moveErr);
                  showConnectionNotice(
                    "Yeniden bağlanılamadı, lütfen tekrar katılmayı deneyin.",
                    "warning"
                  );
                  showSetupJoin();
                  return;
                }
              } else {
                showConnectionNotice(
                  "Oyuncu kaydın bulunamadı, lütfen yeniden katıl.",
                  "warning"
                );
                showSetupJoin();
                return;
              }
            }

            showRoomUI(currentRoomCode, currentPlayerName, isCreator);
            listenPlayersAndRoom(currentRoomCode);
            if (typeof gameLogicRoomUnsub === "function") {
              gameLogicRoomUnsub();
            }
            gameLogicRoomUnsub = gameLogic.listenRoom(currentRoomCode);
            clearConnectionNotice();

            if (
              roomData?.eliminated &&
              roomData.eliminated[resolvedUid] &&
              roomData.status !== "finished"
            ) {
              wasEliminated = true;
              showEliminationOverlay(currentRoomCode);
              return;
            }

            const playerRef = window.db.ref(
              `rooms/${currentRoomCode}/players/${resolvedUid}`
            );
            if (
              typeof currentPlayerName === "string" &&
              currentPlayerName.trim() !== ""
            ) {
              playerRef
                .update({ name: currentPlayerName, isCreator })
                .catch((err) =>
                  console.error("Oyuncu kaydı güncellenemedi", err)
                );
            } else {
              console.error(
                "Geçersiz veya boş oyuncu adı, veritabanı güncellemesi atlandı."
              );
            }

            if (
              roomData &&
              roomData.status === "started" &&
              roomData.playerRoles &&
              roomData.playerRoles[resolvedUid]
            ) {
              document.getElementById("leaveRoomBtn")?.classList.add("hidden");
              document
                .getElementById("backToHomeBtn")
                ?.classList.remove("hidden");
              const myData = roomData.playerRoles[resolvedUid];
              document.getElementById("roomInfo").classList.add("hidden");
              document.getElementById("playerRoleInfo").classList.remove("hidden");
              updateRoleDisplay(myData, roomData.settings);
            }
          } catch (error) {
            console.error("Oda bilgisi alınamadı", error);
            showConnectionNotice(
              "Odaya bağlanırken sorun oluştu, lütfen tekrar deneyin.",
              "warning"
            );
            showSetupJoin();
          }
        } else {
          clearConnectionNotice();
          showSetupJoin();
        }
      });
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
let lastRoundNumber = null;
let endRoundTriggeredForRound = null;
let hasRequestedStart = false;
let latestRoomData = null;

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

  function normalizeVotingResult(rawResult) {
    if (!rawResult) return null;
    if (rawResult.tie) {
      return { tie: true, roundId: rawResult.roundId };
    }
    const eliminatedUid = rawResult.eliminatedUid || rawResult.voted;
    if (!eliminatedUid) return null;
    return {
      tie: false,
      voted: eliminatedUid,
      eliminatedUid,
      eliminatedName: rawResult.eliminatedName,
      isSpy: !!rawResult.isSpy,
      role: rawResult.role,
      location: rawResult.location,
      remainingSpies: rawResult.remainingSpies,
      lastSpy: rawResult.lastSpy,
      roundId: rawResult.roundId,
    };
  }

  function getResolvedVoteResult(roomData) {
    const votingResult = roomData.voting?.result;
    if (isCurrentRoundPayload(roomData, votingResult)) {
      const normalizedVotingResult = normalizeVotingResult(votingResult);
      if (normalizedVotingResult) return normalizedVotingResult;
    }
    if (!isCurrentRoundPayload(roomData, roomData.voteResult)) return null;
    return normalizeVotingResult(roomData.voteResult) || null;
  }

  function getRoundKey(roomData) {
    if (!roomData) return "default";
    if (roomData.roundId) return `id:${roomData.roundId}`;
    if (roomData.round) return `num:${roomData.round}`;
    return "default";
  }

  function triggerEndRoundIfNeeded(roomData, resolvedResult) {
    if (!roomData || !resolvedResult || resolvedResult.tie) return false;
    const gamePhase = resolveGamePhase(roomData);
    if (
      roomData?.voting?.status === "in_progress" ||
      gamePhase === "voting" ||
      gamePhase === "results"
    ) {
      return false;
    }
    const roundKey = getRoundKey(roomData);
    const alreadyTriggered = endRoundTriggeredForRound === roundKey;
    if (alreadyTriggered) return true;

    const eliminatedUid = resolvedResult.voted || resolvedResult.eliminatedUid;
    const isGameOngoing = roomData.status === "started";
    if (!eliminatedUid || !isGameOngoing) return false;

    endRoundTriggeredForRound = roundKey;
    gameLogic.endRound(currentRoomCode);
    return true;
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

  function resolveEliminatedName(
    resolvedResult,
    roomData,
    votedUid,
    fallbackName
  ) {
    if (resolvedResult?.eliminatedName) return resolvedResult.eliminatedName;
    if (roomData?.voting?.result?.eliminatedName) {
      return roomData.voting.result.eliminatedName;
    }
    const snapshotName = roomData?.voting?.snapshot?.names?.[votedUid];
    if (snapshotName) return snapshotName;
    const eliminatedRecordName = roomData?.eliminated?.[votedUid]?.name;
    if (eliminatedRecordName) return eliminatedRecordName;
    if (fallbackName) return fallbackName;
    const mappedName =
      playerUidMap[votedUid]?.name || roomData?.players?.[votedUid]?.name;
    if (mappedName) return mappedName;
    const rosterSources = [
      ...(roomData?.voting?.snapshotPlayers || []),
      ...(roomData?.voting?.roster || []),
    ];
    const rosterMatch = rosterSources.find((p) => p?.uid === votedUid);
    if (rosterMatch?.name) return rosterMatch.name;
    return votedUid;
  }

  function buildVoteOutcomeContext(roomData, resolvedResult) {
    if (!roomData || !resolvedResult || resolvedResult.tie) return null;

    const votedUid = resolvedResult.voted || resolvedResult.eliminatedUid;
    if (!votedUid) return null;

    const votedName = resolveEliminatedName(
      resolvedResult,
      roomData,
      votedUid,
      playerUidMap[votedUid]?.name
    );
    const remaining = Object.entries(roomData.players || {})
      .filter(([uid, p]) => uid !== votedUid && isPlayerAlive(p))
      .map(([uid]) => uid);
    const activeSpies = getSpyUids(roomData.spies).filter((id) =>
      remaining.includes(id)
    );
    const alivePlayersCount = remaining.length;
    const aliveImpostorsCount = activeSpies.length;

    const outcome = buildVotingOutcomeMessage({
      eliminatedName: votedName,
      eliminatedIsImpostor: resolvedResult.isSpy,
      alivePlayersCount,
      aliveImpostorsCount,
      spyNames: getSpyNames(roomData, roomData?.players),
    });

    return {
      votedUid,
      votedName,
      alivePlayersCount,
      aliveImpostorsCount,
      outcome,
    };
  }

  function renderVoteResultOverlay(
    roomData,
    resolvedResult,
    outcomeContext
  ) {
    const resolvedResultToRender =
      resolvedResult ||
      getResolvedVoteResult(roomData) ||
      (roomData?.voting?.status === "resolved"
        ? normalizeVotingResult(roomData?.voting?.result)
        : null);
    const allowResolvedStatusFallback =
      roomData?.voting?.status === "resolved" && roomData?.voting?.result;
    if (!resolvedResultToRender || resolvedResultToRender.tie) return false;
    if (
      !isCurrentRoundPayload(roomData, resolvedResultToRender) &&
      !allowResolvedStatusFallback
    ) {
      return false;
    }

    const context =
      outcomeContext ||
      buildVoteOutcomeContext(roomData, resolvedResultToRender);
    if (!context) return false;
    const renderKey = JSON.stringify({
      result: resolvedResultToRender,
      context,
      continueAcks: roomData?.voting?.continueAcks || null,
      phase: resolveGamePhase(roomData),
    });
    if (renderKey === lastVoteResult) return true;
    lastVoteResult = renderKey;

    showResultOverlay(
      {
        eliminatedIsImpostor: resolvedResultToRender.isSpy,
        eliminatedName: context.votedName,
        alivePlayersCount: context.alivePlayersCount,
        aliveImpostorsCount: context.aliveImpostorsCount,
        votedUid: context.votedUid,
      },
      roomData,
      resolvedResultToRender,
      context.outcome
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
    roomData,
    resolvedResult,
    precomputedOutcome
  ) {
    const resolvedEliminatedName = resolveEliminatedName(
      resolvedResult,
      roomData,
      votedUid,
      eliminatedName
    );
    const outcome =
      precomputedOutcome ||
      buildVotingOutcomeMessage({
        eliminatedName: resolvedEliminatedName,
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
    const currentPhase = resolveGamePhase(roomData);
    const normalizedResultForOverlay =
      normalizeVotingResult(resolvedResult) ||
      normalizeVotingResult(roomData?.voting?.result) ||
      normalizeVotingResult(roomData?.voteResult);
    const eliminatedUidFromResult =
      votedUid ||
      normalizedResultForOverlay?.eliminatedUid ||
      normalizedResultForOverlay?.voted;
    const alivePlayers = getActivePlayers(roomData.playerRoles, roomData.players);
    const aliveUids = alivePlayers.map((p) => p.uid);
    const filteredAliveUids = eliminatedUidFromResult
      ? aliveUids.filter((uid) => uid !== eliminatedUidFromResult)
      : aliveUids;
    const isAliveCurrentPlayer = filteredAliveUids.includes(currentUid);
    const continueAcks = roomData?.voting?.continueAcks || {};
    const ackCount = filteredAliveUids.filter((uid) => continueAcks[uid]).length;
    const hasAcked = !!continueAcks[currentUid];
    const isEliminatedPlayer =
      currentUid === eliminatedUidFromResult || !isAliveCurrentPlayer;
    const isResultsPhase = currentPhase === "results";
    const waitingText =
      filteredAliveUids.length > 0
        ? `Devam için onay bekleniyor (${ackCount}/${filteredAliveUids.length})`
        : null;
    const cls = outcome.impostorVictory
      ? "impostor-animation"
      : "innocent-animation";
    const msgDiv = document.createElement("div");
    msgDiv.className = "result-message";
    overlay.innerHTML = "";
    const actionsEl = document.getElementById("gameActions");
    const spyInfo = getSpyInfo(roomData);
    const resolvedMessage =
      isResultsPhase && !isAliveCurrentPlayer
        ? "Elendin! Oyun devam ediyor."
        : resolveGameOverMessage(roomData, outcome.message, spyInfo);
    msgDiv.textContent = resolvedMessage;
    if (!(isResultsPhase && !isAliveCurrentPlayer)) {
      appendSpyNamesLine(msgDiv, roomData, {
        spyInfo,
        primaryMessage: resolvedMessage,
      });
    }
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

    const shouldShowEliminationOverlay =
      currentPhase !== "results" &&
      isEliminatedPlayer &&
      !outcome.gameEnded &&
      alivePlayersCount > 2 &&
      !outcome.impostorVictory;

    if (shouldShowEliminationOverlay) {
      showEliminationOverlay(currentRoomCode);
      return;
    }

    if (outcome.gameEnded) {
      let restartBtn;
      if (isCreator) {
        restartBtn = document.createElement("button");
        restartBtn.id = "restartBtn";
        restartBtn.classList.add("overlay-btn");
        restartBtn.textContent = "Oyunu yeniden başlat";
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
          handleRestart(restartBtn, hideOverlay);
        });
      }

      exitBtn.addEventListener("click", () => {
        hideOverlay();
        Promise.resolve(gameLogic.leaveRoom(currentRoomCode))
          .catch((error) => {
            console.error("[gameEnded overlay] leaveRoom failed", error);
          })
          .finally(() => {
            handleRoomGone("manual exit");
          });
      });
    } else if (isResultsPhase) {
      if (waitingText) {
        const info = document.createElement("div");
        info.className = "result-subtext";
        info.textContent = waitingText;
        overlay.appendChild(info);
      }

      if (isCreator) {
        const restartBtn = document.createElement("button");
        restartBtn.id = "restartBtn";
        restartBtn.classList.add("overlay-btn");
        restartBtn.textContent = "Oyunu yeniden başlat";
        overlay.appendChild(restartBtn);
        restartBtn.addEventListener("click", () => {
          handleRestart(restartBtn);
        });
      }

      const shouldShowContinueButton =
        isAliveCurrentPlayer && eliminatedUidFromResult !== currentUid;
      if (shouldShowContinueButton) {
        const btn = document.createElement("button");
        btn.id = "continueBtn";
        btn.classList.add("overlay-btn");
        btn.textContent = hasAcked ? "Onay gönderildi" : "Devam et";
        btn.disabled = hasAcked;
        overlay.appendChild(btn);
        btn.addEventListener("click", () => {
          btn.disabled = true;
          btn.textContent = "Onay gönderildi";
          gameLogic.continueAfterResults(currentRoomCode, currentUid);
        });
      }

      const exitBtn = document.createElement("button");
      exitBtn.id = "exitBtn";
      exitBtn.classList.add("overlay-btn");
      exitBtn.textContent = "Odadan ayrıl";
      overlay.appendChild(exitBtn);

      exitBtn.addEventListener("click", () => {
        overlay.classList.add("hidden");
        overlay.classList.remove("impostor-animation", "innocent-animation");
        Promise.resolve(gameLogic.leaveRoom(currentRoomCode))
          .catch((error) => {
            console.error("[results overlay] leaveRoom failed", error);
          })
          .finally(() => {
            handleRoomGone("manual exit");
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
        if (currentRoomCode && currentUid && window.db) {
          window.db
            .ref(`rooms/${currentRoomCode}/ui/${currentUid}`)
            .update({ screen: "playing" })
            .catch((err) =>
              console.error("Kullanıcı ekran durumu güncellenemedi:", err)
            );
        }
      });
    }
  }

  function resolveAnswerValue(value, gameType) {
    if (value === undefined || value === null) return null;
    if (gameType === "category") {
      return resolveRoleName(value);
    }
    return typeof value === "string" ? value : String(value);
  }

  function getActualAnswer(roomData) {
    const isCategory = roomData?.settings?.gameType === "category";
    const roles = roomData?.playerRoles || {};
    for (const uid in roles) {
      const role = roles[uid];
      if (role && !role.isSpy) {
        const actualValue = isCategory ? role?.role : role?.location;
        return resolveAnswerValue(actualValue, roomData?.settings?.gameType);
      }
    }
    return null;
  }

  function buildGuessDetails(finalGuess, actualAnswer, gameType) {
    const isCategory = gameType === "category";
    const guessedValue =
      finalGuess?.guessedRole || finalGuess?.guessedLocation || finalGuess?.guess;
    const resolvedActualAnswer = resolveAnswerValue(actualAnswer, gameType);
    const lines = [];

    const hasGuess = Boolean(guessedValue);
    if (hasGuess) {
      const guessedLabel = isCategory
        ? "Sahtekarın tahmin ettiği rol:"
        : "Sahtekarın tahmin ettiği konum:";
      lines.push(`${guessedLabel} ${escapeHtml(String(guessedValue))}`);

      if (finalGuess?.isCorrect) {
        lines.push("Doğru tahmin!");
      } else if (resolvedActualAnswer) {
        const actualLabel = isCategory ? "Doğru rol:" : "Doğru konum:";
        lines.push(`${actualLabel} ${escapeHtml(resolvedActualAnswer)}`);
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
    if (Array.isArray(state.spiesSnapshot?.spies)) {
      return buildSpyNames(state.spiesSnapshot.spies, playerMap);
    }

    const spiesSource = state.spies ?? state.spyUids;

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
        handleRestart(restartBtn, hideOverlay);
      });
    }
    exitBtn.addEventListener("click", () => {
      hideOverlay();
      Promise.resolve(gameLogic.leaveRoom(currentRoomCode))
        .catch((error) => {
          console.error("[spyWin overlay] leaveRoom failed", error);
        })
        .finally(() => {
          handleRoomGone("manual exit");
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
    const resolvedActualAnswer = resolveAnswerValue(
      actualAnswer || finalGuess?.actualRole || finalGuess?.actualLocation,
      gameType
    );
    const spyIntro = formatSpyIntro(spyInfo);
    const guessDetail = guessedValue
      ? `${guessWord} ${escapeHtml(String(guessedValue))} olarak`
      : `${guessWord} olarak`;

    const fallbackMessage = resolvedActualAnswer
      ? `${spyIntro} ${guessDetail} yanlış tahmin etti. Doğru ${actualWord} ${escapeHtml(
          resolvedActualAnswer
        )} idi ve oyunu masumlar kazandı!`
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

    overlay.classList.remove("hidden", "impostor-animation", "innocent-animation");
    overlay.classList.add("innocent-animation");

    const hideOverlay = () => {
      overlay.classList.add("hidden");
      overlay.classList.remove("impostor-animation", "innocent-animation");
    };

    if (restartBtn) {
      restartBtn.addEventListener("click", () => {
        handleRestart(restartBtn, hideOverlay);
      });
    }

    exitBtn.addEventListener("click", () => {
      hideOverlay();
      Promise.resolve(gameLogic.leaveRoom(currentRoomCode))
        .catch((error) => {
          console.error("[spyFail overlay] leaveRoom failed", error);
        })
        .finally(() => {
          handleRoomGone("manual exit");
        });
    });
  }

  /** ------------------------
   *  ODA OLUŞTUR
   * ------------------------ */
  function updatePlayerList(playersObj) {
    const listEl = document.getElementById("playerList");
    const countEl = document.getElementById("playerCountDisplay");
    if (!listEl || !countEl) return;

    const aliveEntries = Object.values(playersObj || {}).filter(isPlayerAlive);
    const validPlayers = aliveEntries
      .map((p) => p?.name || "")
      .filter((p) => p && p.trim() !== "");
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
      .filter(
        ([uid, player]) =>
          uid !== currentUid && isPlayerAlive(player)
      )
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
    const expectedVotersMap = roomData?.voting?.expectedVoters;
    const expectedVoters = buildExpectedVoterList(
      expectedVotersMap,
      snapshot
    );
    const hasExpectedVoters = expectedVoters.length > 0;
    const forceExpectedTargets =
      roomData?.voting?.status === "in_progress" ||
      resolveGamePhase(roomData) === "voting";
    const playerEntries = roomData?.players || playerUidMap || {};
    const snapshotPlayers = roomData?.voting?.snapshotPlayers || [];
    const snapshotPlayerMap = snapshotPlayers.reduce((acc, p) => {
      if (p?.uid) acc[p.uid] = p;
      return acc;
    }, {});

    const buildCandidateFromUid = (uid) => {
      if (!uid || uid === currentUid) return null;
      const playerEntry = playerEntries[uid];
      if (playerEntry && !isPlayerAlive(playerEntry)) return null;
      const name =
        snapshot?.names?.[uid] ||
        snapshotPlayerMap[uid]?.name ||
        playerEntry?.name ||
        playerUidMap[uid]?.name ||
        uid;
      return { uid, name };
    };

    if (hasExpectedVoters || forceExpectedTargets) {
      voteCandidatesSnapshot = expectedVoters
        .map((uid) => buildCandidateFromUid(uid))
        .filter(Boolean);
      renderVoteOptions(voteCandidatesSnapshot);
      return;
    }

    if (snapshot?.order?.length) {
      voteCandidatesSnapshot = snapshot.order
        .map((uid) => ({
          uid,
          name:
            snapshot.names?.[uid] ||
            snapshotPlayerMap[uid]?.name ||
            roomData?.players?.[uid]?.name ||
            playerUidMap[uid]?.name ||
            uid,
        }))
        .filter((p) => {
          if (!p.uid || p.uid === currentUid) return false;
          const playerEntry = playerEntries[p.uid];
          return !playerEntry || isPlayerAlive(playerEntry);
        });
      renderVoteOptions(voteCandidatesSnapshot);
      return;
    }
    const legacySnapshot = roomData?.voting?.snapshotPlayers;
    const source = legacySnapshot && legacySnapshot.length
      ? legacySnapshot.reduce((acc, p) => {
          if (p?.uid) acc[p.uid] = { name: p.name, status: p.status };
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
    lastVoteResult = null;
    lastGuessEvent = null;
    lastVotingState = null;
    lastVotingFinalizedAt = null;
    voteCandidatesSnapshot = null;
    selectedVoteUid = null;
    selectedVoteName = null;
    lastGuessOptionsKey = null;
    lastGuessSelection = null;
    endRoundTriggeredForRound = null;
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

  function handleRestart(restartBtn, hideOverlay) {
    if (restartBtn) {
      restartBtn.disabled = true;
    }

    if (typeof hideOverlay === "function") {
      hideOverlay();
    }

    resetLocalRoundState();
    gameLogic.restartGame(currentRoomCode);
  }

  function handleRoomGone(reason, options = {}) {
    const {
      noticeText = "Oda kapatıldı veya silindi.",
      noticeTone = "warning",
      redirectToHome = false,
      requireElimination = false,
    } = options;

    const isEliminationFlow =
      wasEliminated ||
      (latestRoomData?.eliminated && latestRoomData.eliminated[currentUid]);

    if (requireElimination && !isEliminationFlow) {
      return;
    }

    if (roomMissingTimeoutId) {
      clearTimeout(roomMissingTimeoutId);
      roomMissingTimeoutId = null;
    }
    clearRoomValueListener();
    if (typeof gameLogicRoomUnsub === "function") {
      gameLogicRoomUnsub();
    }
    if (typeof gameLogicPlayersUnsub === "function") {
      gameLogicPlayersUnsub();
    }
    gameLogicRoomUnsub = null;
    gameLogicPlayersUnsub = null;

    clearInterval(voteCountdownInterval);
    voteCountdownInterval = null;
    clearInterval(guessCountdownInterval);
    guessCountdownInterval = null;
    if (votingCleanupTimeout) {
      clearTimeout(votingCleanupTimeout);
      votingCleanupTimeout = null;
    }

    resetLocalRoundState();
    clearStoragePreservePromo();
    currentRoomCode = null;
    currentPlayerName = null;
    isCreator = false;
    roomMissingCounter = 0;
    latestRoomData = null;

    if (noticeText) {
      showConnectionNotice(noticeText, noticeTone);
    }

    if (redirectToHome) {
      window.location.replace("./index.html");
      return;
    }

    showSetupJoin();
  }

  /** ------------------------
   *  ODA & OYUNCULARI DİNLE
   * ------------------------ */
  function listenPlayersAndRoom(roomCode) {
    if (typeof gameLogicPlayersUnsub === "function") {
      gameLogicPlayersUnsub();
    }
    // Oyuncu listesi
    gameLogicPlayersUnsub = gameLogic.listenPlayers(roomCode, (playerNames, playersObj) => {
      // İsim dizisini kullanarak UI'da oyuncu listesini ve oyuncu sayısını güncelle
      updatePlayerList(playersObj);

      // Ham oyuncu nesnesini eşleştirme ve açılır menüyü doldurma için kullan
      playerUidMap = playersObj || {};

      // Geçerli oyuncuların (isimler) filtrelenmiş bir dizisini tut
      currentPlayers = Object.values(playersObj || {})
        .filter(isPlayerAlive)
        .map((p) => p?.name)
        .filter((p) => p && p.trim() !== "");

      const candidates = voteCandidatesSnapshot || buildVoteCandidates(playerUidMap);
      renderVoteOptions(candidates);
      updateSelectedVoteName();
    });

    if (roomMissingTimeoutId) {
      clearTimeout(roomMissingTimeoutId);
      roomMissingTimeoutId = null;
    }
    clearRoomValueListener();

    const roomRef = window.db.ref("rooms/" + roomCode);
    roomValueRef = roomRef;
    roomMissingCounter = 0;

    const roomErrorCallback = (error) => {
      console.error("[ROOM LISTEN FAILED - NON-BLOCKING]", error);
      showConnectionNotice(
        "Odaya erişilemiyor, yeniden bağlanılıyor...",
        "warning"
      );
    };

    roomValueCallback = async (snapshot) => {
      if (!snapshot.exists() || snapshot.val() === null) {
        handleRoomGone("room snapshot missing");
        return;
      }

      roomMissingCounter = 0;
      if (roomMissingTimeoutId) {
        clearTimeout(roomMissingTimeoutId);
        roomMissingTimeoutId = null;
      }
      clearConnectionNotice();

      try {
        const resultEl = document.getElementById("voteResults");
        const outcomeEl = document.getElementById("voteOutcome");
        const roomData = snapshot.val();
        latestRoomData = roomData;
        const prevStatus = lastRoomStatus;
        lastRoomStatus = roomData ? roomData.status : null;
        const currentRoundId = roomData?.roundId || null;
        const currentRoundNumber = roomData?.round ?? null;
        const roundIdChanged =
          currentRoundId !== null &&
          lastRoundId !== null &&
          currentRoundId !== lastRoundId;
        const roundNumberChanged =
          currentRoundNumber !== null &&
          lastRoundNumber !== null &&
          currentRoundNumber !== lastRoundNumber;
        const roundChanged = roundIdChanged || roundNumberChanged;
        const roundResetNeeded =
          roomData?.status === "waiting" &&
          ((currentRoundId === null && lastRoundId !== null) ||
            (currentRoundNumber === null && lastRoundNumber !== null));
        if (roundChanged || roundResetNeeded) {
          resetLocalRoundState();
        }
        lastRoundId = currentRoundId;
        lastRoundNumber = currentRoundNumber;

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

        const resolvedVoteResult = getResolvedVoteResult(roomData);
        const votingResultFallback =
          !resolvedVoteResult &&
          roomData?.voting?.status === "resolved" &&
          roomData?.voting?.result
            ? normalizeVotingResult(roomData.voting.result)
            : null;
        const activeVoteResult = resolvedVoteResult || votingResultFallback;
        const resolvedResultForOutcome =
          activeVoteResult ||
          resolvedVoteResult ||
          (roomData?.voting?.status === "resolved"
            ? normalizeVotingResult(roomData?.voting?.result)
            : null);
      const voteOutcomeContext = buildVoteOutcomeContext(
        roomData,
        activeVoteResult
      );
      const resolvedOutcomeContext =
        voteOutcomeContext ||
        (resolvedResultForOutcome
          ? buildVoteOutcomeContext(roomData, resolvedResultForOutcome)
          : null);
      const voteEndsGame =
        !!voteOutcomeContext &&
        (voteOutcomeContext.outcome?.gameEnded ||
          voteOutcomeContext.outcome?.impostorVictory);

      const canCurrentPlayerVote = isCurrentPlayerEligible(roomData);
      const isEliminatedPlayer =
        (roomData?.eliminated && roomData.eliminated[currentUid]) ||
        roomData?.players?.[currentUid]?.status === "eliminated";
      const isGameFinished =
        roomData?.status === "finished" || roomData?.spyParityWin;
      const isPlayerAliveForActions = isCurrentPlayerEligible(roomData);

      const shouldShowEliminationOverlay =
        isEliminatedPlayer && !isGameFinished && !voteEndsGame;

      if (shouldShowEliminationOverlay) {
        wasEliminated = true;
        showEliminationOverlay(roomCode);
        return;
      } else if (isEliminatedPlayer) {
        wasEliminated = true;
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
            .update({ name: currentPlayerName, isCreator });
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
            .filter(isPlayerAlive)
            .map((p) => p.name)
            .filter((p) => p && p.trim() !== "");
          updatePlayerList(playerUidMap);
          const candidates = voteCandidatesSnapshot || buildVoteCandidates(playerUidMap);
          renderVoteOptions(candidates);
          updateSelectedVoteName();
        }
      const leaveBtn = document.getElementById("leaveRoomBtn");
      const exitBtn = document.getElementById("backToHomeBtn");
        const resolvedPhase = resolveGamePhase(roomData);
        const resolvedWinner = roomData?.winner;

        if (
          roomData &&
          resolvedPhase === "ended" &&
          (resolvedWinner === "spy" || resolvedWinner === "spies")
        ) {
          const resolvedSpyVoteResult = getResolvedVoteResult(roomData);
          const resolvedSpyVoteFallback =
            !resolvedSpyVoteResult &&
            roomData?.voting?.status === "resolved" &&
            roomData?.voting?.result
              ? normalizeVotingResult(roomData.voting.result)
              : null;
          const activeVoteResult =
            resolvedSpyVoteResult || resolvedSpyVoteFallback || null;

          if (activeVoteResult && !activeVoteResult.tie) {
            const voteOutcomeContext = buildVoteOutcomeContext(
              roomData,
              activeVoteResult
            );
            const handledByVote = renderVoteResultOverlay(
              roomData,
              activeVoteResult,
              voteOutcomeContext
            );
            if (handledByVote) return;
          }

          const finalGuess = normalizeFinalGuess(
            roundSafeGameOver?.finalGuess || currentLastGuess?.finalGuess || null,
            roomData
          );
          const actualAnswer = getActualAnswer(roomData);
          const gameType = roomData.settings?.gameType;
          if (!parityHandled) {
            parityHandled = true;
            showSpyWinOverlay(roomData, finalGuess, gameType, actualAnswer);
          }
          if (isCreator) {
            window.db.ref(`rooms/${roomCode}/spyParityWin`).remove();
          }
          return;
        }
        if (
          roomData &&
          resolvedPhase === "ended" &&
          (resolvedWinner === "innocent" || resolvedWinner === "innocents")
        ) {
          const handledByVote = renderVoteResultOverlay(
            roomData,
            activeVoteResult,
            voteOutcomeContext
          );
          if (handledByVote) return;

          const finalGuess = normalizeFinalGuess(
            roundSafeGameOver?.finalGuess || currentLastGuess?.finalGuess || null,
            roomData
          );
          const actualAnswer = getActualAnswer(roomData);
          const gameType = roomData.settings?.gameType;
          if (!parityHandled) {
            parityHandled = true;
            showSpyFailOverlay(roomData, finalGuess, gameType, actualAnswer);
          }
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
        const currentPhase = resolveGamePhase(roomData);
        const overlayEl = document.getElementById("resultOverlay");
        const shouldHideResultOverlay =
          overlayEl &&
          currentPhase !== "results" &&
          roomData.status === "started" &&
          !roundSafeGameOver;
        if (shouldHideResultOverlay) {
          overlayEl.classList.add("hidden");
          overlayEl.classList.remove("impostor-animation", "innocent-animation");
        }
        const isVotingPhase =
          currentPhase === "voting" ||
          roomData.votingStarted === true ||
          roomData.voting?.status === "in_progress";

        if (roomData.voting?.status === "in_progress" || roomData.votingStarted) {
          lockVoteCandidates(roomData);
        } else {
          unlockVoteCandidates();
          resetVoteSelection();
        }

        const votingStateKey = JSON.stringify({
          votingStarted: roomData.votingStarted,
          votingStatus: roomData.voting?.status,
          votes: roomData.voting?.votes,
        });
        if (votingStateKey !== lastVotingState) {
          const votingSection = document.getElementById("votingSection");
          const hasVoted =
            roomData.voting?.votes && roomData.voting.votes[currentUid];
          const hasResult = currentVotingResult?.finalizedAt || currentVoteResult;
          const shouldShowVoting =
            roomData.voting?.status === "in_progress" &&
            canCurrentPlayerVote &&
            !hasVoted &&
            !hasResult;
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
          if (roomData.voting?.status !== "in_progress" || hasVoted) {
            const confirmArea = document.getElementById("voteConfirmArea");
            confirmArea?.classList.add("hidden");
          }
          lastVotingState = votingStateKey;
        }

        updateSelectedVoteName();

        const voteCountdownEl = document.getElementById("voteCountdown");
        const votingEndsAt = roomData.voting?.endsAt;
        const votingFinalized = currentVotingResult?.finalizedAt || currentVoteResult;
        const isVotingCountdownActive =
          roomData.voting?.status === "in_progress" && !votingFinalized;

        const stopVoteCountdown = (hide = true) => {
          clearInterval(voteCountdownInterval);
          voteCountdownInterval = null;
          if (hide) {
            voteCountdownEl?.classList.add("hidden");
          }
        };

        if (isVotingCountdownActive) {
          const updateCountdown = () => {
            const remaining =
              (votingEndsAt ?? 0) - (getServerNow() || Date.now());
            const remainingMs = Math.max(0, remaining);
            if (voteCountdownEl) {
              const seconds = Math.ceil(remainingMs / 1000);
              const padded = String(Math.max(0, seconds)).padStart(2, "0");
              voteCountdownEl.textContent = `Oylama bitiyor: 00:${padded}`;
              voteCountdownEl.classList.toggle("hidden", false);
            }
            if (remaining <= 0) {
              if (voteCountdownEl) {
                voteCountdownEl.textContent = "Oylama bitiyor: 00:00";
                voteCountdownEl.classList.toggle("hidden", false);
              }
              stopVoteCountdown(false);
              gameLogic.finalizeVoting(currentRoomCode, "time_up");
              return false;
            }
            return true;
          };

          stopVoteCountdown(false);
          const shouldContinue = updateCountdown();
          if (shouldContinue) {
            voteCountdownInterval = setInterval(() => {
              const stillActive = updateCountdown();
              if (!stillActive) {
                stopVoteCountdown(false);
              }
            }, 1000);
          }
        } else {
          stopVoteCountdown();
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
        const votingStatus = roomData.voting?.status || "idle";
        const startedBy = roomData.voting?.startedBy || {};
        const alivePlayers = getActivePlayers(
          roomData.playerRoles,
          roomData.players
        ).map((p) => ({
          ...p,
          name: p.name || playerUidMap[p.uid]?.name || p.uid,
        }));
        const aliveUids = alivePlayers.map((p) => p.uid);
        const startedCount = aliveUids.filter((uid) => startedBy[uid]).length;
        const aliveCount = aliveUids.length;
        const threshold = Math.floor(aliveCount / 2) + 1;
        const isCurrentAlive = aliveUids.includes(currentUid);

        const hasStartedByCurrent = !!startedBy[currentUid];
        if (hasStartedByCurrent) {
          hasRequestedStart = true;
        } else if (hasRequestedStart && votingStatus === "idle" && startedCount === 0) {
          hasRequestedStart = false;
        }

        const hasJoinedStart = hasStartedByCurrent || hasRequestedStart;
        const waitingForMajority =
          canCurrentPlayerVote &&
          isCurrentAlive &&
          votingStatus !== "in_progress" &&
          startedCount < threshold;

        if (startBtn) {
          const shouldHideStart =
            votingStatus === "in_progress" || !canCurrentPlayerVote || !isCurrentAlive;
          startBtn.classList.toggle("hidden", shouldHideStart);
          startBtn.disabled = shouldHideStart || hasJoinedStart;
          startBtn.textContent = hasJoinedStart
            ? "Katıldınız"
            : "Oylamayı Başlat";
        }
        if (waitingEl) {
          const shouldShowWaiting = waitingForMajority;
          waitingEl.classList.toggle(
            "hidden",
            !shouldShowWaiting || votingStatus === "in_progress"
          );
          if (shouldShowWaiting && votingStatus !== "in_progress") {
            const prefix = hasJoinedStart
              ? "Oylamaya katıldınız. Oylamanın başlaması için diğer oyuncular bekleniyor... (Çoğunluk sağlandığında oylama başlar!)"
              : "Oylamanın başlaması için çoğunluk bekleniyor...";
            waitingEl.textContent =
              `${prefix} Başlatma isteği: ${startedCount} / ${aliveCount} (Gerekli: ${threshold})`;
          }
        }
        if (votingInstructionEl) {
          if (!canCurrentPlayerVote || hasJoinedStart || votingStatus === "in_progress") {
            votingInstructionEl.classList.add("hidden");
          } else {
            votingInstructionEl.classList.remove("hidden");
            votingInstructionEl.textContent =
              "Her tur tek kelimelik ipucu verin. Hazır olduğunuzda oylamayı başlatabilirsiniz.";
          }
        }

        const liveVoteCounts = document.getElementById("liveVoteCounts");
        const voteCountList = document.getElementById("voteCountList");

        const hasActiveVoting = roomData.voting?.status === "in_progress";
        const votingHasResult = currentVotingResult?.finalizedAt || currentVoteResult;

        if (!hasActiveVoting || votingHasResult) {
          liveVoteCounts?.classList.add("hidden");
          if (voteCountList) voteCountList.innerHTML = "";
        } else {
          liveVoteCounts?.classList.remove("hidden");
          const tally = {};
          const alivePlayerList = getActivePlayers(
            roomData.playerRoles,
            roomData.players
          );
          const aliveUids = new Set(alivePlayerList.map((p) => p.uid));
          Object.entries(roomData.voting?.votes || {}).forEach(
            ([voter, uid]) => {
              if (!aliveUids.has(voter) || !aliveUids.has(uid)) return;
              tally[uid] = (tally[uid] || 0) + 1;
            }
          );
          const snapshot = roomData.voting?.snapshot;
          const playerMap = snapshot?.names
            ? snapshot.order.map((uid) => ({
                uid,
                name: snapshot.names[uid] || playerUidMap[uid]?.name || uid,
              }))
            : (roomData.voting?.snapshotPlayers || [])
                .map((p) => ({
                  uid: p.uid,
                  name: p.name,
                }))
                .filter((p) => p.uid) || [];

          const filteredSnapshotPlayers = playerMap.filter((p) =>
            aliveUids.has(p.uid)
          );

        const fallbackPlayers = !filteredSnapshotPlayers.length
          ? Object.entries(roomData.players || playerUidMap || {})
              .filter(([, p]) => isPlayerAlive(p))
              .map(([uid, p]) => ({ uid, name: p?.name || uid }))
          : filteredSnapshotPlayers;

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

        const hasElimination =
          activeVoteResult &&
          !activeVoteResult.tie &&
          (activeVoteResult.voted || activeVoteResult.eliminatedUid);
        const endRoundTriggered = triggerEndRoundIfNeeded(
          roomData,
          activeVoteResult
        );
        const nextRoundBtn = document.getElementById("nextRoundBtn");
        const shouldShowNextRound =
          isPlayerAliveForActions &&
          (roomData?.voting?.status === "resolved" ||
            currentPhase === "results");
        nextRoundBtn?.classList.toggle("hidden", !shouldShowNextRound);

        const shouldShowVoteOutcome =
          roomData?.voting?.status === "resolved" ||
          currentPhase === "results";
        const fallbackOutcomeMessage = resolvedOutcomeContext?.outcome?.message;

        if (activeVoteResult) {
          if (activeVoteResult.tie) {
            resultEl.classList.remove("hidden");
            outcomeEl.textContent = "Oylar eşit! Oylama yeniden başlayacak.";
            document.getElementById("nextRoundBtn").classList.add("hidden");
            if (isCreator) {
              const now = getServerNow();
              if (!lastTieRestartAt || now - lastTieRestartAt > 2000) {
                lastTieRestartAt = now;
                gameLogic.restartVotingAfterTie(roomCode);
              }
            }
          } else {
            renderVoteResultOverlay(roomData, activeVoteResult, voteOutcomeContext);
            resultEl.classList.add("hidden");
          }
        } else if (shouldShowVoteOutcome) {
          resultEl.classList.remove("hidden");
          if (outcomeEl) {
            outcomeEl.textContent =
              fallbackOutcomeMessage || "Oylama sonucu hazırlanıyor...";
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
        const votingVotes = resolveVotes(roomData) || {};
        const expectedVoters = getExpectedVoterIds(
          roomData?.voting?.expectedVoters
        );
        const expectedVoterSet = new Set(expectedVoters);
        const expectedVoterCount = expectedVoters.length;
        const voteCount = expectedVoters.reduce((count, voterUid) => {
          const target = votingVotes[voterUid];
          return count + (expectedVoterSet.has(target) ? 1 : 0);
        }, 0);
        const currentServerNow = getServerNow() || Date.now();
        const shouldFinalizeByCount =
          roomData.voting?.status === "in_progress" &&
          expectedVoterCount > 0 &&
          voteCount === expectedVoterCount &&
          !votingResult?.finalizedAt;
        const shouldFinalizeByTimeout =
          roomData.voting?.status === "in_progress" &&
          typeof roomData.voting.endsAt === "number" &&
          currentServerNow >= roomData.voting.endsAt &&
          !votingResult?.finalizedAt;

        if (shouldFinalizeByCount) {
          gameLogic.finalizeVoting(currentRoomCode, "all_voted");
        } else if (shouldFinalizeByTimeout) {
          gameLogic.finalizeVoting(currentRoomCode, "time_up");
        }

        const finalizedAt = votingResult?.finalizedAt;
        const shouldScheduleCleanup =
          finalizedAt &&
          roomData.voting?.status !== "in_progress" &&
          roomData.status === "started" &&
          currentPhase !== "results" &&
          !currentGuessState &&
          (!hasElimination || endRoundTriggered);
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
    } catch (err) {
      console.error("[ROOM LISTENER CRASH]", err);
    }
    };

    roomRef.on("value", roomValueCallback, roomErrorCallback);
    roomValueUnsubscribe = () => roomRef.off("value", roomValueCallback);
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

// Export for use in other modules (e.g., cleanup when a room disappears)
window.showSetupJoin = showSetupJoin;

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
      if (typeof gameLogicRoomUnsub === "function") {
        gameLogicRoomUnsub();
      }
      gameLogicRoomUnsub = gameLogic.listenRoom(roomCode);
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
      if (typeof gameLogicRoomUnsub === "function") {
        gameLogicRoomUnsub();
      }
      gameLogicRoomUnsub = gameLogic.listenRoom(joinCode);
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

    Promise.resolve(action)
      .catch((error) => {
        console.error("[leaveRoomBtn] room action failed", error);
      })
      .finally(() => {
        handleRoomGone("manual exit");
        window.location.replace("./index.html");
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

  document.getElementById("startVotingBtn").addEventListener("click", (e) => {
    const btn = e.currentTarget;
    hasRequestedStart = true;
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Katıldınız";
    }
    const startVotePromise = gameLogic.startVote(currentRoomCode, currentUid);
    Promise.resolve(startVotePromise).catch((error) => {
      console.error("[startVotingBtn] startVote error", error);
      hasRequestedStart = false;
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Oylamayı Başlat";
      }
    });
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
    const roomData = latestRoomData;
    const currentPhase = resolveGamePhase(roomData);
    const isAliveForNextRound = roomData ? isCurrentPlayerEligible(roomData) : true;
    if (currentPhase === "results" && isAliveForNextRound) {
      gameLogic.continueAfterResults(currentRoomCode, currentUid);
    } else if (isCreator && roomData && !isAliveForNextRound) {
      gameLogic.restartGame(currentRoomCode);
    } else {
      gameLogic.nextRound(currentRoomCode);
    }
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

    const action = roomCode
      ? isCreator
        ? gameLogic.deleteRoom(roomCode)
        : playerName
        ? gameLogic.leaveRoom(roomCode)
        : Promise.resolve()
      : Promise.resolve();

    Promise.resolve(action)
      .catch((error) => {
        console.error("[backToHomeBtn] room action failed", error);
      })
      .finally(() => {
        handleRoomGone("manual exit");
        window.location.replace("./index.html");
      });
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
