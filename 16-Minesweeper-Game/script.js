const rows = 8;
const columns = 8;
const minesCount = 10;

let board = [];
let minesLocation = [];
let tilesClicked = 0;
let flagEnabled = false;
let gameOver = false;
let gameStarted = false;
let flagsPlaced = 0;
let timer = 0;
let timerInterval = null;

const boardEl = document.getElementById("board");
const minesDisplay = document.getElementById("mines-display");
const timerDisplay = document.getElementById("timer-display");
const resetBtn = document.getElementById("reset-button");
const flagBtn = document.getElementById("flag-button");

window.onload = function () {
  resetBtn.addEventListener("click", resetGame);
  flagBtn.addEventListener("click", toggleFlagMode);
  resetGame();
};

function toggleFlagMode() {
  flagEnabled = !flagEnabled;
  flagBtn.classList.toggle("active", flagEnabled);
  flagBtn.innerText = flagEnabled ? "🚩 Flag Mode: ON" : "🚩 Flag Mode: OFF";
}

function updateDisplays() {
  const remaining = Math.max(0, minesCount - flagsPlaced);
  minesDisplay.innerText = String(remaining).padStart(3, "0");
  timerDisplay.innerText = String(Math.min(999, timer)).padStart(3, "0");
}

function startTimer() {
  clearInterval(timerInterval);
  timer = 0;
  updateDisplays();
  timerInterval = setInterval(() => {
    timer++;
    updateDisplays();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

function setMines(safeRow, safeCol) {
  minesLocation = [];
  let minesLeft = minesCount;

  while (minesLeft > 0) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * columns);
    const id = `${r}-${c}`;

    // First-click safety: don't place mine on clicked cell or immediate neighbors
    const isSafeZone = Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1;

    if (!isSafeZone && !minesLocation.includes(id)) {
      minesLocation.push(id);
      minesLeft--;
    }
  }
}

function resetGame() {
  stopTimer();
  boardEl.innerHTML = "";
  board = [];
  minesLocation = [];
  tilesClicked = 0;
  flagsPlaced = 0;
  gameOver = false;
  gameStarted = false;
  resetBtn.innerText = "😊";
  updateDisplays();

  // Populate board
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < columns; c++) {
      const tile = document.createElement("div");
      tile.id = `${r}-${c}`;
      tile.dataset.row = r;
      tile.dataset.col = c;

      tile.addEventListener("click", () => clickTile(tile));
      tile.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        toggleTileFlag(tile);
      });

      boardEl.appendChild(tile);
      row.push(tile);
    }
    board.push(row);
  }
}

function toggleTileFlag(tile) {
  if (gameOver || tile.classList.contains("tile-clicked")) return;

  if (tile.innerText === "") {
    tile.innerText = "🚩";
    flagsPlaced++;
  } else if (tile.innerText === "🚩") {
    tile.innerText = "";
    flagsPlaced--;
  }
  updateDisplays();
}

function clickTile(tile) {
  if (gameOver || tile.classList.contains("tile-clicked")) return;

  // If in mobile flag mode
  if (flagEnabled) {
    toggleTileFlag(tile);
    return;
  }

  // Can't click flagged tiles
  if (tile.innerText === "🚩") return;

  const r = parseInt(tile.dataset.row);
  const c = parseInt(tile.dataset.col);

  // First click guarantees safety & starts timer
  if (!gameStarted) {
    gameStarted = true;
    startTimer();
    setMines(r, c);
  }

  // Hit a mine!
  if (minesLocation.includes(tile.id)) {
    gameOver = true;
    stopTimer();
    resetBtn.innerText = "😵";
    revealMines(tile.id);
    return;
  }

  checkMine(r, c);
}

function revealMines(detonatedId) {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const tile = board[r][c];
      if (minesLocation.includes(tile.id)) {
        tile.innerText = "💣";
        tile.style.backgroundColor = tile.id === detonatedId ? "#ef4444" : "#fca5a5";
      } else if (tile.innerText === "🚩") {
        // Flagged wrong cell
        tile.innerText = "❌";
      }
    }
  }
}

function checkMine(r, c) {
  if (r < 0 || r >= rows || c < 0 || c >= columns) return;
  const tile = board[r][c];
  if (tile.classList.contains("tile-clicked") || tile.innerText === "🚩") return;

  tile.classList.add("tile-clicked");
  tilesClicked++;

  let minesFound = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr !== 0 || dc !== 0) {
        minesFound += checkTile(r + dr, c + dc);
      }
    }
  }

  if (minesFound > 0) {
    tile.innerText = minesFound;
    tile.classList.add(`x${minesFound}`);
  } else {
    tile.innerText = "";
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr !== 0 || dc !== 0) {
          checkMine(r + dr, c + dc);
        }
      }
    }
  }

  // Check victory condition
  if (tilesClicked === rows * columns - minesCount) {
    gameOver = true;
    stopTimer();
    resetBtn.innerText = "😎";
    minesDisplay.innerText = "000";

    // Auto flag remaining mines
    minesLocation.forEach(id => {
      const [mr, mc] = id.split("-").map(Number);
      board[mr][mc].innerText = "🚩";
    });
  }
}

function checkTile(r, c) {
  if (r < 0 || r >= rows || c < 0 || c >= columns) return 0;
  return minesLocation.includes(`${r}-${c}`) ? 1 : 0;
}
