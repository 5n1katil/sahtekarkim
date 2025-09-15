import { gameLogic, POOLS } from './gameLogic.js';
import { escapeHtml, hasInvalidChars } from './utils.js';

console.log('main.js yüklendi');

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
    localStorage.clear();
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

  function showResultOverlay(
    isSpy,
    name,
    role,
    location,
    spyWin = false,
    spyNames = "",
    votedUid,
    lastSpy = false
  ) {
    const overlay = document.getElementById("resultOverlay");
    if (!overlay) {
      console.error("resultOverlay element not found");
      return;
    }
    const isEliminatedPlayer = currentUid === votedUid;
    const cls = isSpy || spyWin ? "impostor-animation" : "innocent-animation";
    const msgDiv = document.createElement("div");
    msgDiv.className = "result-message";
    overlay.innerHTML = "";
    const actionsEl = document.getElementById("gameActions");
    if (isSpy && lastSpy) {
      const safeName = escapeHtml(name || "");
      msgDiv.textContent = `Sahtekar ${safeName} yakalandı! Oyunu masumlar kazandı...`;
      actionsEl?.classList.add("hidden");
    } else if (isSpy && !lastSpy) {
      const safeName = escapeHtml(name || "");
      msgDiv.textContent = `Sahtekar ${safeName} yakalandı, oyun devam ediyor...`;
      actionsEl?.classList.remove("hidden");
    } else if (spyWin) {
      const safeName = escapeHtml(name || "");
      const spies = escapeHtml(spyNames || "");
      msgDiv.textContent = `${safeName} masumdu... Oyun bitti! Sahtekar ${spies} kazandı.`;
      actionsEl?.classList.add("hidden");
    } else if (isEliminatedPlayer) {
      msgDiv.textContent = "Elendin, oyun devam ediyor...";
    } else {
      const safeName = escapeHtml(name || "");
      msgDiv.textContent = `${safeName} masumdu.`;
    }
    overlay.appendChild(msgDiv);
    overlay.classList.remove(
      "hidden",
      "impostor-animation",
      "innocent-animation"
    );
    overlay.classList.add(cls);

    if ((isSpy && lastSpy) || spyWin) {
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

  function showSpyWinOverlay(spyIds, guessed, guessWord) {
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
      const safeGuess = escapeHtml(guessed);
      const word = guessWord || "konumu";

      if (safeGuess) {
        const playerNames = names ? `(${names}) ` : "";
        msgDiv.textContent = `Sahtekar ${playerNames}${word} ${safeGuess} olarak doğru tahmin etti ve oyunu kazandı`;
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

  function showSpyFailOverlay(spyIds, guessWord, guessValue) {
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
    const word = guessWord || "konumu";
    const nameText = names ? `${names} ` : "";
    const safeGuess = escapeHtml(guessValue || "");
    // İmpostor'un yanlış tahmini durumunda sadece "konumu" veya "rolü" bilgisini göster
    msgDiv.textContent = `Sahtekar ${nameText}${word} ${safeGuess} olarak yanlış tahmin etti ve oyunu masumlar kazandı!`;
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

      const selectEl = document.getElementById("voteSelect");
      if (selectEl) {
        selectEl.innerHTML = Object.entries(playerUidMap)
          .filter(([uid]) => uid !== currentUid)
          .map(
            ([uid, p]) =>
              `<option value="${uid}">${escapeHtml(p.name)}</option>`
          )
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
        const selectEl = document.getElementById("voteSelect");
        if (selectEl) {
          selectEl.innerHTML = Object.entries(playerUidMap)
            .filter(([uid]) => uid !== currentUid)
            .map(
              ([uid, p]) => `<option value="${uid}">${escapeHtml(p.name)}</option>`
            )
            .join("");
        }
      }
      const leaveBtn = document.getElementById("leaveRoomBtn");
      const exitBtn = document.getElementById("backToHomeBtn");
        if (
          roomData &&
          (roomData.spyParityWin ||
            (roomData.status === "finished" && roomData.winner === "spy"))
        ) {
          const guessed =
            roomData.lastGuess && roomData.lastGuess.correct
              ? roomData.lastGuess.guess
              : null;
          const guessWord =
            roomData.settings?.gameType === "category" ? "rolü" : "konumu";
          if (!parityHandled) {
            showSpyWinOverlay(roomData.spies, guessed, guessWord);
          }
          window.db.ref(`rooms/${roomCode}/spyParityWin`).remove();
          return;
        }
        if (
          roomData &&
          roomData.status === "finished" &&
          roomData.winner === "innocent"
        ) {
          const guessWord =
            roomData.settings?.gameType === "category" ? "rolü" : "konumu";
          showSpyFailOverlay(
            roomData.spies,
            guessWord,
            roomData.lastGuess?.guess
          );
          return;
        }
        if (!roomData || (roomData.status !== "started" && !roomData.voteResult)) {
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
          if (submitVoteBtn) submitVoteBtn.disabled = !!hasVoted;
          const votePendingMsg = document.getElementById("votePendingMsg");
          if (votePendingMsg) {
            votePendingMsg.classList.toggle(
              "hidden",
              !(hasVoted && !roomData.voteResult)
            );
          }
          lastVotingState = votingStateKey;
        }

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
            const key = JSON.stringify(roomData.voteResult);
            if (key !== lastVoteResult) {
              lastVoteResult = key;
              const votedUid = roomData.voteResult.voted;
              const votedName =
                playerUidMap[votedUid]?.name || votedUid;
              const remaining = Object.keys(roomData.players || {}).filter(
                (uid) => uid !== votedUid
              );
              const activeSpies = (roomData.spies || []).filter((id) =>
                remaining.includes(id)
              );
              const lastSpy =
                roomData.voteResult.isSpy && activeSpies.length === 0;
              let spyWin = false;
              let spyNames = "";
              if (!roomData.voteResult.isSpy) {
                const innocentCount = remaining.length - activeSpies.length;
                if (innocentCount <= 1) {
                  spyWin = true;
                  spyNames = activeSpies
                    .map((id) => playerUidMap[id]?.name)
                    .filter(Boolean)
                    .join(", ");
                }
              }
              showResultOverlay(
                roomData.voteResult.isSpy,
                votedName,
                roomData.voteResult.role,
                roomData.voteResult.location,
                spyWin,
                spyNames,
                votedUid,
                lastSpy
              );
            }
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

      const playerCountEl = document.getElementById("playerCount");
      const spyCountEl = document.getElementById("spyCount");
      const spyGuessCountEl = document.getElementById("spyGuessCount");
      const poolSizeEl = document.getElementById("poolSize");
      const voteAnytimeEl = document.getElementById("voteAnytime");

      if (saved.playerCount) playerCountEl.value = saved.playerCount;
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
        isNaN(settings.playerCount) ||
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
      localStorage.clear();
      location.reload();
    });
  });

  document.getElementById("startGameBtn").addEventListener("click", async (e) => {
    if (!currentRoomCode) {
      alert("Oda kodu bulunamadı!");
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

  // Oy ver
  document.getElementById("submitVoteBtn").addEventListener("click", () => {
    const target = document.getElementById("voteSelect").value;
    if (target) {
      const btn = document.getElementById("submitVoteBtn");
      if (btn) btn.disabled = true;
      const msg = document.getElementById("votePendingMsg");
      if (msg) msg.classList.remove("hidden");
      gameLogic.submitVote(currentRoomCode, currentUid, target);
    }
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
        localStorage.clear();
        location.reload();
      });
    } else {
      localStorage.clear();
      location.reload();
    }
  });
}

document.addEventListener("DOMContentLoaded", initUI);

async function buildSettings() {
  const playerCount = parseInt(document.getElementById("playerCount").value);
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
