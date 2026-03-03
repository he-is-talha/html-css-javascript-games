const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 16; // 28 * 16 = 448, 31 * 16 = 496
const corridorScale = 1.25; // corridor (where Pac-Man moves) is 1.25x wider
const corridorTile = Math.round(tileSize * corridorScale); // 20
const wallSize = tileSize; // walls stay 16px
const cols = 28;
const rows = 31;

canvas.width = cols * corridorTile;
canvas.height = rows * corridorTile;

const scoreEl = document.getElementById("score");
const livesEl = document.getElementById("lives");
const restartBtn = document.getElementById("restartBtn");

// 0: empty, 1: wall, 2: pellet, 3: power pellet
// Simple Pac-Man inspired layout (not 100% original map)
const levelLayout = [
  "1111111111111111111111111111",
  "1222222222112222222222222221",
  "1211112112112112112111112121",
  "1311112112112112112111112131",
  "1222222222222222222222222221",
  "1211112111112111112111112121",
  "1222222112222222211222222221",
  "1111112112111112112111111111",
  "0000012112110002112110000000",
  "1111112112111112112111111111",
  "1222222222222112222222222221",
  "1211112111112111112111112121",
  "1222212222222222222222122221",
  "1111212111110001111122111111",
  "0000212110000000000122110000",
  "1111212110111111101122111111",
  "1222222220222222202222222221",
  "1211112112111112112111112121",
  "1222222112222222211222222221",
  "1111112112111112112111111111",
  "0000012112110002112110000000",
  "1111112112111112112111111111",
  "1222222222222222222222222221",
  "1211112111112111112111112121",
  "1311112222222112222222112131",
  "1222222111112111111122222221",
  "1111112112222222212111111111",
  "1222222222112222112222222221",
  "1211111112112112111111112121",
  "1222222222222222222222222221",
  "1111111111111111111111111111",
];

let map = [];
let pelletsRemaining = 0;

const pacman = {
  x: 1, // start bottom-left
  y: 29,
  dirX: 0,
  dirY: 0,
  nextDirX: 0,
  nextDirY: 0,
  speed: 8, // tiles per second
  radius: tileSize * 0.6,
};

const ghosts = [
  { x: 13, y: 14, dirX: 1, dirY: 0, color: "#ff4b4b" },
  { x: 14, y: 14, dirX: -1, dirY: 0, color: "#4bc6ff" },
];

let score = 0;
let lives = 3;
let gameOver = false;
let lastTime = 0;

function initMap() {
  map = [];
  pelletsRemaining = 0;
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      let val = Number(levelLayout[r][c]);
      if (val === 2 || val === 3) pelletsRemaining++;
      row.push(val);
    }
    map.push(row);
  }
}

function resetEntities() {
  pacman.x = 1;
  pacman.y = 29;
  pacman.dirX = 0;
  pacman.dirY = 0;
  pacman.nextDirX = 0;
  pacman.nextDirY = 0;

  ghosts[0].x = 13;
  ghosts[0].y = 14;
  ghosts[0].dirX = 1;
  ghosts[0].dirY = 0;

  ghosts[1].x = 14;
  ghosts[1].y = 14;
  ghosts[1].dirX = -1;
  ghosts[1].dirY = 0;
}

function restartGame() {
  score = 0;
  lives = 3;
  gameOver = false;
  initMap();
  resetEntities();
  updateUI();
}

function updateUI() {
  scoreEl.textContent = score;
  livesEl.textContent = lives;
}

function isWall(col, row) {
  if (row < 0 || row >= rows || col < 0 || col >= cols) return true;
  return map[row][col] === 1;
}

function trySetDirection(dx, dy) {
  pacman.nextDirX = dx;
  pacman.nextDirY = dy;
}

function handleInput() {
  const centerCol = Math.round(pacman.x);
  const centerRow = Math.round(pacman.y);

  const offsetX = Math.abs(pacman.x - centerCol);
  const offsetY = Math.abs(pacman.y - centerRow);

  // Allow direction change when reasonably aligned, or when stopped so first keypress works
  const aligned = offsetX < 0.35 && offsetY < 0.35;
  const stopped = pacman.dirX === 0 && pacman.dirY === 0;

  if (aligned || stopped) {
    const targetCol = centerCol + pacman.nextDirX;
    const targetRow = centerRow + pacman.nextDirY;
    if (!isWall(targetCol, targetRow)) {
      pacman.dirX = pacman.nextDirX;
      pacman.dirY = pacman.nextDirY;
    }
  }
}

function movePacman(deltaSeconds) {
  handleInput();

  const speedPerFrame = pacman.speed * deltaSeconds;
  let newX = pacman.x + pacman.dirX * speedPerFrame;
  let newY = pacman.y + pacman.dirY * speedPerFrame;

  // Tunnel wrap
  if (newX < 0) newX = cols - 1;
  if (newX > cols - 1) newX = 0;

  const nextCol = Math.round(newX);
  const nextRow = Math.round(newY);

  if (isWall(nextCol, nextRow)) {
    // Block movement into wall; snap back to the corridor tile (the one we're in)
    const dx = pacman.dirX;
    const dy = pacman.dirY;
    pacman.dirX = 0;
    pacman.dirY = 0;
    pacman.x = nextCol - dx;
    pacman.y = nextRow - dy;
    return;
  }

  pacman.x = newX;
  pacman.y = newY;

  // Eat pellets
  const col = Math.round(pacman.x);
  const row = Math.round(pacman.y);
  if (map[row] && (map[row][col] === 2 || map[row][col] === 3)) {
    if (map[row][col] === 2) score += 10;
    if (map[row][col] === 3) score += 50;
    map[row][col] = 0;
    pelletsRemaining--;
    updateUI();

    if (pelletsRemaining <= 0) {
      gameOver = true;
      setTimeout(() => alert("You cleared the maze! 🎉"), 100);
    }
  }
}

function moveGhost(ghost, deltaSeconds) {
  const speed = 6 * deltaSeconds;
  let newX = ghost.x + ghost.dirX * speed;
  let newY = ghost.y + ghost.dirY * speed;

  const nextCol = Math.round(newX);
  const nextRow = Math.round(newY);

  if (isWall(nextCol, nextRow)) {
    // choose a new random direction (no 180° turn)
    const dirs = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
    const currentOppX = -ghost.dirX;
    const currentOppY = -ghost.dirY;

    const valid = dirs.filter(
      (d) => !(d.x === currentOppX && d.y === currentOppY)
    );
    const choice = valid[Math.floor(Math.random() * valid.length)];
    ghost.dirX = choice.x;
    ghost.dirY = choice.y;
    return;
  }

  ghost.x = newX;
  ghost.y = newY;

  // Tunnel wrap
  if (ghost.x < 0) ghost.x = cols - 1;
  if (ghost.x > cols - 1) ghost.x = 0;
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function checkCollisions() {
  for (const ghost of ghosts) {
    if (distance(ghost, pacman) < 0.7) {
      lives--;
      updateUI();
      if (lives <= 0) {
        gameOver = true;
        setTimeout(() => alert("Game Over!"), 100);
      }
      resetEntities();
      break;
    }
  }
}

function drawMap() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = map[r][c];
      const x = c * corridorTile;
      const y = r * corridorTile;

      if (val === 1) {
        // Wall: draw at same size (wallSize), centered in the wider corridor cell
        const wallX = x + (corridorTile - wallSize) / 2;
        const wallY = y + (corridorTile - wallSize) / 2;
        ctx.fillStyle = "#001b4d";
        ctx.fillRect(wallX, wallY, wallSize, wallSize);
        ctx.strokeStyle = "#0ff";
        ctx.lineWidth = 2;
        ctx.strokeRect(wallX + 2, wallY + 2, wallSize - 4, wallSize - 4);
      } else {
        ctx.fillStyle = "#000016";
        ctx.fillRect(x, y, corridorTile, corridorTile);

        if (val === 2) {
          ctx.fillStyle = "#ffd966";
          ctx.beginPath();
          ctx.arc(
            x + corridorTile / 2,
            y + corridorTile / 2,
            2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        } else if (val === 3) {
          ctx.fillStyle = "#ffd966";
          ctx.beginPath();
          ctx.arc(
            x + corridorTile / 2,
            y + corridorTile / 2,
            4,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }
  }
}

function drawPacman() {
  // Draw centered in the corridor cell (corridorTile)
  const px = pacman.x * corridorTile + corridorTile / 2;
  const py = pacman.y * corridorTile + corridorTile / 2;

  const angleOffset =
    pacman.dirX === 1
      ? 0
      : pacman.dirX === -1
      ? Math.PI
      : pacman.dirY === -1
      ? -Math.PI / 2
      : pacman.dirY === 1
      ? Math.PI / 2
      : 0;

  const mouthOpen = 0.3;

  ctx.fillStyle = "#ffd966";
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.arc(
    px,
    py,
    corridorTile * 0.6,
    angleOffset + mouthOpen,
    angleOffset + Math.PI * 2 - mouthOpen
  );
  ctx.closePath();
  ctx.fill();
}

function drawGhost(ghost) {
  // Draw centered on the ghost's tile so they don't appear half on wall
  const gx = (Math.round(ghost.x) * corridorTile) + corridorTile / 2;
  const gy = (Math.round(ghost.y) * corridorTile) + corridorTile / 2;
  const r = corridorTile * 0.6;

  ctx.fillStyle = ghost.color;
  ctx.beginPath();
  ctx.arc(gx, gy, r, Math.PI, 0);
  ctx.lineTo(gx + r, gy + r);
  ctx.lineTo(gx - r, gy + r);
  ctx.closePath();
  ctx.fill();

  // eyes
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(gx - r / 3, gy - r / 4, r / 4, 0, Math.PI * 2);
  ctx.arc(gx + r / 3, gy - r / 4, r / 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(gx - r / 3, gy - r / 4, r / 8, 0, Math.PI * 2);
  ctx.arc(gx + r / 3, gy - r / 4, r / 8, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMap();
  drawPacman();
  ghosts.forEach(drawGhost);
}

function loop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const delta = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  if (!gameOver) {
    movePacman(delta);
    ghosts.forEach((g) => moveGhost(g, delta));
    checkCollisions();
  }

  draw();
  requestAnimationFrame(loop);
}

document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
    case "w":
    case "W":
      e.preventDefault();
      trySetDirection(0, -1);
      break;
    case "ArrowDown":
    case "s":
    case "S":
      e.preventDefault();
      trySetDirection(0, 1);
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      e.preventDefault();
      trySetDirection(-1, 0);
      break;
    case "ArrowRight":
    case "d":
    case "D":
      e.preventDefault();
      trySetDirection(1, 0);
      break;
    default:
      break;
  }
});

restartBtn.addEventListener("click", () => {
  restartGame();
});

initMap();
resetEntities();
updateUI();
requestAnimationFrame(loop);

