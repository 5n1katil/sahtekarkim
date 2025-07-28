// Firebase ayarları
const firebaseConfig = {
  apiKey: "AIzaSyBX_Tme2B-2g2Rtj53WBfgmZ5QsE0UN1Bw",
  authDomain: "detektif-c17bb.firebaseapp.com",
  projectId: "detektif-c17bb",
  storageBucket: "detektif-c17bb.appspot.com",
  messagingSenderId: "422256375848",
  appId: "1:422256375848:web:873b0a6372c992accf9d1d",
  databaseURL: "https://detektif-c17bb-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const setupDiv = document.getElementById("setup");
const roomInfoDiv = document.getElementById("roomInfo");
const playerJoinDiv = document.getElementById("playerJoin");
const roleInfoDiv = document.getElementById("playerRoleInfo");

const createRoomBtn = document.getElementById("createRoomBtn");
const joinRoomBtn = document.getElementById("joinRoomBtn");
const leaveRoomBtn = document.getElementById("leaveRoomBtn");
const startGameBtn = document.getElementById("startGameBtn");
const exitGameBtn = document.getElementById("exitGameBtn");

let currentRoomCode = localStorage.getItem("roomCode") || null;
let currentPlayerName = localStorage.getItem("playerName") || null;
let isCreator = localStorage.getItem("isCreator") === "true";
let roomRef = null;

const locations = ["Havalimanı", "Restoran", "Kütüphane", "Müze"];
const roles = ["Güvenlik", "Aşçı", "Kütüphaneci", "Sanatçı"];

// OYLAMA SİSTEMİ BİLEŞENLERİ
const voteStartBtn = document.createElement("button");
voteStartBtn.textContent = "Oylamayı Başlat";
voteStartBtn.className = "button";
voteStartBtn.onclick = () => {
  db.ref(`rooms/${currentRoomCode}/voteReady/${currentPlayerName}`).set(true);
};

const voteDiv = document.createElement("div");
voteDiv.id = "voteDiv";
voteDiv.style.marginTop = "20px";
voteDiv.style.display = "none";

const voteSelect = document.createElement("select");
voteSelect.id = "voteSelect";
voteSelect.className = "dropdown";
voteDiv.appendChild(voteSelect);

const voteBtn = document.createElement("button");
voteBtn.textContent = "Oy Ver";
voteBtn.className = "button";
voteBtn.onclick = () => {
  const selected = voteSelect.value;
  if (!selected) return alert("Lütfen bir oyuncu seçin.");
  db.ref(`rooms/${currentRoomCode}/votes/${currentPlayerName}`).set(selected);
  voteDiv.innerHTML = `<p>Oyunuzu ${selected} kişisine verdiniz.</p>`;
};
voteDiv.appendChild(voteBtn);

function listenRoom(code) {
  roomRef = db.ref("rooms/" + code);

  roomRef.child("players").on("value", snapshot => {
    const list = snapshot.val();
    const playerList = document.getElementById("playerList");
    playerList.innerHTML = "";
    if (list) list.forEach(name => {
      const li = document.createElement("li");
      li.textContent = name;
      playerList.appendChild(li);
    });
  });

  roomRef.child("assignments").on("value", snapshot => {
    const assignments = snapshot.val();
    if (assignments && currentPlayerName in assignments) {
      const { role, location, character } = assignments[currentPlayerName];
      roleInfoDiv.classList.remove("hidden");
      roomInfoDiv.classList.add("hidden");

      const roleMessage = document.getElementById("roleMessage");
      roleMessage.innerHTML = "";

      if (role === "spy") {
        roleMessage.innerHTML += `<div style="font-size: 1.8rem">Rolünüz: Sahtekar</div>`;
        roleMessage.innerHTML += `<div style="margin-top: 10px; font-size: 1.2rem">Tüm olası konumlar:</div>`;
        roleMessage.innerHTML += `<ul style="columns: 2; font-size: 1rem; padding-left: 20px">${locations.map(loc => `<li>${loc}</li>`).join('')}</ul>`;
      } else {
        roleMessage.innerHTML += `<div style="font-size: 1.8rem">Konum: ${location}</div>`;
        if (character) {
          roleMessage.innerHTML += `<div style="font-size: 1.8rem">Rolünüz: ${character}</div>`;
        }
      }

      const exitBtn = document.createElement("button");
      exitBtn.textContent = isCreator ? "Oyunu Bitir" : "Oyundan Çık";
      exitBtn.style.marginTop = "20px";
      exitBtn.onclick = () => {
        if (isCreator) {
          db.ref("rooms/" + currentRoomCode).remove();
        } else {
          leaveRoom();
        }
      };
      roleMessage.appendChild(exitBtn);
      roleMessage.appendChild(voteStartBtn);
      roleMessage.appendChild(voteDiv);
    }
  });

  roomRef.on("value", snapshot => {
    if (!snapshot.exists()) {
      alert("Oda kapatıldı.");
      localStorage.clear();
      location.reload();
    }
  });

  db.ref(`rooms/${currentRoomCode}/voteReady`).on("value", snap => {
    const ready = snap.val();
    if (ready && Object.keys(ready).length > 1) {
      voteDiv.style.display = "block";
      db.ref(`rooms/${currentRoomCode}/players`).once("value").then(psnap => {
        const players = psnap.val();
        voteSelect.innerHTML = "<option value='' disabled selected>Bir oyuncu seçin</option>";
        players.forEach(name => {
          if (name !== currentPlayerName) {
            const opt = document.createElement("option");
            opt.value = name;
            opt.textContent = name;
            voteSelect.appendChild(opt);
          }
        });
      });
    }
  });

  db.ref(`rooms/${currentRoomCode}/votes`).on("value", snap => {
    const votes = snap.val();
    if (!votes) return;
    db.ref(`rooms/${currentRoomCode}/players`).once("value").then(psnap => {
      const players = psnap.val();
      if (Object.keys(votes).length === players.length) {
        const counts = {};
        Object.values(votes).forEach(v => {
          counts[v] = (counts[v] || 0) + 1;
        });
        const max = Math.max(...Object.values(counts));
        const eliminated = Object.keys(counts).find(k => counts[k] === max);
        db.ref(`rooms/${currentRoomCode}/assignments/${eliminated}`).once("value").then(roleSnap => {
          const role = roleSnap.val().role;
          alert(`${eliminated} elendi. Rolü: ${role === "spy" ? "Sahtekar" : "Masum"}`);
          db.ref(`rooms/${currentRoomCode}/eliminated/${eliminated}`).set(role);
        });
      }
    });
  });
}

// Sahtekarın konumları görebilmesi için listenRoom içine liste eklendi.
