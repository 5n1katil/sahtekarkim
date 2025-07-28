// gameLogic.js
// window.db, firebase.js dosyasından global olarak gelir!

function generateRoomCode(length = 5) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function createRoom(creatorName, playerCount, spyCount, useRoles, questionCount, guessCount, canEliminate) {
  const roomCode = generateRoomCode();
  const now = Date.now();

  const roomData = {
    code: roomCode,
    createdAt: now,
    players: [creatorName],
    settings: {
      playerCount,
      spyCount,
      useRoles,
      questionCount,
      guessCount,
      canEliminate
    }
  };

  window.db.ref("rooms/" + roomCode).set(roomData);
  return roomCode;
}

// ... (diğer fonksiyonlar aynı şekilde, hepsi window.db ile çalışmalı)

window.gameLogic = {
  generateRoomCode,
  createRoom,
  joinRoom,
  leaveRoom,
  startGame
};
