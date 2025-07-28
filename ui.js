// ui.js

// Arayüzü gösterme ve gizleme işlevleri
function showElement(id) {
  document.getElementById(id)?.classList.remove("hidden");
}

function hideElement(id) {
  document.getElementById(id)?.classList.add("hidden");
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setHTML(id, html) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

// Oda oluşturma veya katılma sonrası ortak UI güncellemeleri
function showRoomUI(roomCode, isCreator) {
  hideElement("setup");
  hideElement("playerJoin");
  showElement("roomInfo");

  setText("roomCode", roomCode);
  setText("roomTitle", isCreator ? "Oda başarıyla oluşturuldu!" : "Oyun odasına hoş geldiniz!");
  setText("roomInstructions", isCreator ? "Diğer oyuncular bu kodla giriş yapabilir." : "Oda kurucusunun oyunu başlatmasını bekleyin.");

  document.getElementById("startGameBtn")?.classList.toggle("hidden", !isCreator);
  showElement("leaveRoomBtn");
}

// Oyuncu listesi güncelleme
function updatePlayerList(players) {
  const playerList = document.getElementById("playerList");
  playerList.innerHTML = "";
  players.forEach(name => {
    const li = document.createElement("li");
    li.textContent = name;
    playerList.appendChild(li);
  });
}

// Rol görüntüleme ekranı oluşturma
function showRoleInfo(data, isCreator, onExit) {
  hideElement("roomInfo");
  showElement("playerRoleInfo");

  let html = "";

  if (data.role === "spy") {
    html += `<div style="font-size: 1.8rem">Rolünüz: Sahtekar</div>`;
    html += `<div style="margin-top: 10px">Tüm konumlar:</div>`;
    html += `<ul style="margin-top: 5px; font-size: 1rem">${data.allLocations.map(loc => `<li>${loc}</li>`).join("")}</ul>`;
  } else {
    html += `<div style="font-size: 1.8rem">Konum: ${data.location}</div>`;
    if (data.character) {
      html += `<div style="font-size: 1.8rem">Rolünüz: ${data.character}</div>`;
    }
  }

  html += `<button id="exitBtn" style="margin-top: 20px; padding: 10px 20px; font-size: 1rem; background-color: #6c63ff; color: #fff; border: none; border-radius: 10px; cursor: pointer;">${isCreator ? "Oyunu Bitir" : "Oyundan Çık"}</button>`;

  setHTML("roleMessage", html);

  document.getElementById("exitBtn")?.addEventListener("click", onExit);
}
