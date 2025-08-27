console.log('main.js yüklendi');

// Basit HTML kaçış yardımcısı
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (ch) =>
    ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[ch])
  );
}

// Bu betikten önce window.gameLogic global olarak yüklenir

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
                  const safeLocations = myData.allLocations
                    .map(escapeHtml)
                    .join(", ");
                  roleMessageEl.innerHTML =
                    `🎭 Sen <b>SAHTEKAR</b>sın! Konumu bilmiyorsun.<br>` +
                    `Olası konumlar: ${safeLocations}`;
                } else {
                  const safeLocation = escapeHtml(myData.location);
                  const safeRole = escapeHtml(myData.role);
                  roleMessageEl.innerHTML =
                    `📍 Konum: <b>${safeLocation}</b><br>` +
                    `🎭 Rolün: <b>${safeRole}</b>`;
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
let gameEnded = false;

  function showResultOverlay(isSpy, name, role, location) {
    const overlay = document.getElementById("resultOverlay");
    const cls = isSpy ? "impostor-animation" : "innocent-animation";
    const msgDiv = document.createElement("div");
    msgDiv.className = "result-message";
    if (isSpy) {
      msgDiv.textContent = `${name} sahtekar çıktı!`;
    } else {
      let innocentText = `${name} ajandı.`;
      if (role) {
        innocentText += ` Rolü: ${role}`;
        if (location) {
          innocentText += ` (Konum: ${location})`;
        }
      }
      msgDiv.textContent = innocentText;
    }
    overlay.innerHTML = "";
    overlay.appendChild(msgDiv);
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

  function showSpyWinOverlay(spyIds) {
    const overlay = document.getElementById("resultOverlay");
    const names = (spyIds || [])
      .map((id) => playerUidMap[id]?.name)
      .filter((n) => n && currentPlayers.includes(n))
      .join(", ");
    gameEnded = true;
    overlay.innerHTML = "";
    const msgDiv = document.createElement("div");
    msgDiv.className = "result-message";
    msgDiv.append("Sahtekar");
    if (names) {
      msgDiv.appendChild(document.createElement("br"));
      const span = document.createElement("span");
      span.className = "impostor-name";
      span.textContent = names;
      msgDiv.appendChild(span);
    }
    msgDiv.append(" kazandı! Oyun Bitti...");
    overlay.appendChild(msgDiv);
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
        document.getElementById("playerJoin").classList.remove("hidden");
        document.getElementById("roomInfo").classList.add("hidden");
        document.getElementById("playerRoleInfo").classList.add("hidden");
        finish();
      }
    }, 3000); // overlay 3 saniye sonra kapanır
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
    window.gameLogic.listenPlayers(roomCode, (playerNames, playersObj) => {
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
      const roomData = snapshot.val();
      const leaveBtn = document.getElementById("leaveRoomBtn");
      const exitBtn = document.getElementById("backToHomeBtn");
        if (
          roomData &&
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
          const safeLocations = myData.allLocations
            .map(escapeHtml)
            .join(", ");
          roleMessageEl.innerHTML =
            `🎭 Sen <b>SAHTEKAR</b>sın! Konumu bilmiyorsun.<br>` +
            `Olası konumlar: ${safeLocations}`;
        } else {
          const safeLocation = escapeHtml(myData.location);
          const safeRole = escapeHtml(myData.role);
          roleMessageEl.innerHTML =
            `📍 Konum: <b>${safeLocation}</b><br>` +
            `🎭 Rolün: <b>${safeRole}</b>`;
        }

        const votingInstructionEl = document.getElementById("votingInstruction");
        if (votingInstructionEl) {
          votingInstructionEl.textContent =
            "Her tur tek kelimelik ipucu verin. Hazır olduğunuzda oylamayı başlatabilirsiniz.";
        }

        // Oylama durumu
        const isVotingPhase =
          roomData.phase === "voting" || roomData.votingStarted;
        const hasRequested =
          roomData.voteRequests && roomData.voteRequests[currentUid];
        document
          .getElementById("startVotingBtn")
          .classList.toggle("hidden", isVotingPhase);

        const waitingEl = document.getElementById("waitingVoteStart");
        if (hasRequested && !isVotingPhase) {
          waitingEl.classList.remove("hidden");
        } else {
          waitingEl.classList.add("hidden");
        }

        const hasVoted =
          roomData.votes && roomData.votes[currentUid] ? true : false;
        document
          .getElementById("votingSection")
          .classList.toggle("hidden", !isVotingPhase || hasVoted);

        const liveCountsEl = document.getElementById("liveVoteCounts");
        const voteCountListEl = document.getElementById("voteCountList");
        if (isVotingPhase) {
          liveCountsEl.classList.remove("hidden");
          voteCountListEl.innerHTML = Object.entries(playerUidMap)
            .map(
              ([uid, p]) =>
                `<li>${escapeHtml(p.name)}: ${counts[uid] || 0}</li>`
            )
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
                votedName,
                roomData.voteResult.role,
                roomData.voteResult.location
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

  const startGameBtn = document.getElementById("startGameBtn");
  if (startGameBtn) {
    startGameBtn.classList.toggle("hidden", !isCreator);
  }
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
const saveSettingsBtn = document.getElementById("saveSettingsBtn");

async function buildSettings() {
  const playerCount = parseInt(document.getElementById("playerCount").value);
  const spyCount = parseInt(document.getElementById("spyCount").value);
  const gameType = document.getElementById("gameType").value;
  let categoryName = null;
  if (gameType === "category") {
    const c = document.getElementById("categoryName").value.trim();
    if (c) categoryName = c;
  }
  const poolSize = parseInt(document.getElementById("poolSize").value);
  const voteAnytime = document.getElementById("voteAnytime").checked;
  const creatorUid = await window.gameLogic.getUid();
  return {
    playerCount,
    spyCount,
    gameType,
    categoryName,
    poolSize,
    voteAnytime,
    clueMode: "tek-kelime",
    creatorUid,
  };
}

saveSettingsBtn.addEventListener("click", async () => {
  const settings = await buildSettings();
  try {
    await window.gameLogic.saveSettings(settings);
  } catch (err) {
    alert(err.message || err);
  }
});
createRoomBtn.addEventListener("click", async () => {
  const creatorName = document.getElementById("creatorName").value.trim();
  if (hasInvalidChars(creatorName)) {
    alert("İsminizde geçersiz karakter (. # $ [ ] /) kullanılamaz.");
    return;
  }

  const settings = await buildSettings();
  if (!creatorName || isNaN(settings.playerCount) || isNaN(settings.spyCount)) {
    alert("Lütfen tüm alanları doldurun.");
    return;
  }

  createRoomBtn.disabled = true;
  createRoomLoading.classList.remove("hidden");
  try {
    const roomCode = await window.gameLogic.createRoom({
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

document.getElementById("startGameBtn").addEventListener("click", async (e) => {
  if (!currentRoomCode) {
    alert("Oda kodu bulunamadı!");
    return;
  }
  const btn = e.currentTarget;
  btn.disabled = true;
  try {
    await window.gameLogic.startGame(currentRoomCode);
  } catch (error) {
    alert("Oyunu başlatırken bir hata oluştu: " + (error.message || error));
  } finally {
    btn.disabled = false;
  }
});

document.getElementById("startVotingBtn").addEventListener("click", () => {
  window.gameLogic.startVote(currentRoomCode, currentUid);
});

// Oy ver
document.getElementById("submitVoteBtn").addEventListener("click", () => {
  const target = document.getElementById("voteSelect").value;
  if (target) {
    window.gameLogic.submitVote(currentRoomCode, currentUid, target);
    document.getElementById("votingSection").classList.add("hidden");
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
