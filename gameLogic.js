// Oda kodu üretici
function generateRoomCode(length = 5) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
}

// Oda oluşturma
function createRoom(creatorName, playerCount, spyCount, useRoles, questionCount, guessCount, canEliminate) {
  const roomCode = generateRoomCode();
  const now = Date.now();
  const roomData = {
    code: roomCode,
    createdAt: now,
    players: [creatorName],
    settings: {
      playerCount, spyCount, useRoles, questionCount, guessCount, canEliminate
    }
  };
  window.db.ref("rooms/" + roomCode).set(roomData);
  return roomCode;
}

// Katılma
function joinRoom(joinName, roomCode, callback) {
  const ref = window.db.ref("rooms/" + roomCode);
  ref.once("value").then(snapshot => {
    if (!snapshot.exists()) return callback("Oda bulunamadı.");
    const players = snapshot.val().players || [];
    if (players.includes(joinName)) return callback("Bu isim zaten kullanılıyor.");
    players.push(joinName);
    ref.child("players").set(players).then(() => callback(null, players));
  });
}

// Çıkış
function leaveRoom(roomCode, playerName) {
  const ref = window.db.ref("rooms/" + roomCode + "/players");
  ref.once("value").then(snapshot => {
    const updatedPlayers = (snapshot.val() || []).filter(name => name !== playerName);
    ref.set(updatedPlayers);
  });
}

// Oyun başlatma (roller dağıtılır)
function startGame(roomCode, settings) {
  window.db.ref("rooms/" + roomCode).once("value").then(snapshot => {
    const room = snapshot.val();
    if (!room) return;
    const players = room.players || [];
    if (players.length < 2) return alert("En az 2 oyuncu gerekli.");
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    const spies = shuffled.slice(0, settings.spyCount);
    const location = settings.locations[Math.floor(Math.random() * settings.locations.length)];
    const assignments = {};
    players.forEach(name => {
      const isSpy = spies.includes(name);
      assignments[name] = {
        role: isSpy ? "spy" : "normal",
        location: isSpy ? null : location,
        character: !isSpy && settings.useRoles ? settings.roles[Math.floor(Math.random() * settings.roles.length)] : null
      };
    });
    window.db.ref("rooms/" + roomCode + "/assignments").set(assignments);
  });
}

window.gameLogic = { generateRoomCode, createRoom, joinRoom, leaveRoom, startGame };
