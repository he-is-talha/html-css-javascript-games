const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");
const overlay = document.getElementById("game-overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayMsg = document.getElementById("overlay-msg");
const overlayScore = document.getElementById("overlay-score");
const overlayBest = document.getElementById("overlay-best");
const btnRestart = document.getElementById("btn-restart");

let gameOver = false;
let isPaused = false;
let foodX, foodY;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let lastVelocityX = 0, lastVelocityY = 0; // Tracks the velocity actually applied on the last tick
let snakeBody = [];
let setIntervalId = null;
let score = 0;

// High score from local storage
let highScore = parseInt(localStorage.getItem("high-score")) || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

const updateFoodPosition = () => {
  let valid = false;
  while (!valid) {
    foodX = Math.floor(Math.random() * 30) + 1;
    foodY = Math.floor(Math.random() * 30) + 1;
    // Ensure food doesn't spawn on top of the snake body
    valid = !snakeBody.some(segment => segment[0] === foodY && segment[1] === foodX);
  }
};

const handleGameOver = () => {
  clearInterval(setIntervalId);
  gameOver = true;
  overlayTitle.innerText = "Game Over!";
  overlayMsg.innerText = "You crashed!";
  overlayScore.innerText = score;
  overlayBest.innerText = highScore;
  overlay.classList.remove("hidden");
};

const togglePause = () => {
  if (gameOver) return;
  isPaused = !isPaused;
  if (isPaused) {
    overlayTitle.innerText = "Paused";
    overlayMsg.innerText = "Press Space or 'Play Again' to resume.";
    overlayScore.innerText = score;
    overlayBest.innerText = highScore;
    overlay.classList.remove("hidden");
  } else {
    overlay.classList.add("hidden");
  }
};

const resetGame = () => {
  gameOver = false;
  isPaused = false;
  overlay.classList.add("hidden");
  score = 0;
  snakeX = 5;
  snakeY = 5;
  velocityX = 0;
  velocityY = 0;
  lastVelocityX = 0;
  lastVelocityY = 0;
  snakeBody = [];
  scoreElement.innerText = `Score: ${score}`;
  updateFoodPosition();
  clearInterval(setIntervalId);
  setIntervalId = setInterval(initGame, 100);
};

btnRestart.addEventListener("click", () => {
  if (isPaused) {
    togglePause();
  } else {
    resetGame();
  }
});

const changeDirection = (e) => {
  const key = e.key || e;

  if (key === " " || key === "Space" || key === "p" || key === "P") {
    togglePause();
    return;
  }

  if (isPaused || gameOver) return;

  // Up: ArrowUp or 'w' / 'W' (prevent 180-deg reversal against last executed velocity)
  if ((key === "ArrowUp" || key === "w" || key === "W") && lastVelocityY !== 1) {
    velocityX = 0;
    velocityY = -1;
  }
  // Down: ArrowDown or 's' / 'S'
  else if ((key === "ArrowDown" || key === "s" || key === "S") && lastVelocityY !== -1) {
    velocityX = 0;
    velocityY = 1;
  }
  // Left: ArrowLeft or 'a' / 'A'
  else if ((key === "ArrowLeft" || key === "a" || key === "A") && lastVelocityX !== 1) {
    velocityX = -1;
    velocityY = 0;
  }
  // Right: ArrowRight or 'd' / 'D'
  else if ((key === "ArrowRight" || key === "d" || key === "D") && lastVelocityX !== -1) {
    velocityX = 1;
    velocityY = 0;
  }
};

// On-screen bottom arrow buttons
controls.forEach(button => {
  button.addEventListener("click", () => changeDirection({ key: button.dataset.key }));
});

// Mobile touch swipe gesture detection on the board
let touchStartX = 0;
let touchStartY = 0;

playBoard.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

playBoard.addEventListener("touchend", (e) => {
  const touchEndX = e.changedTouches[0].screenX;
  const touchEndY = e.changedTouches[0].screenY;
  const dx = touchEndX - touchStartX;
  const dy = touchEndY - touchStartY;

  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 25) {
    // Horizontal swipe
    changeDirection(dx > 0 ? "ArrowRight" : "ArrowLeft");
  } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 25) {
    // Vertical swipe
    changeDirection(dy > 0 ? "ArrowDown" : "ArrowUp");
  }
}, { passive: true });

const initGame = () => {
  if (gameOver || isPaused) return;

  // If game hasn't started moving yet
  if (velocityX === 0 && velocityY === 0) {
    let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;
    html += `<div class="head" style="grid-area: ${snakeY} / ${snakeX}"></div>`;
    playBoard.innerHTML = html;
    return;
  }

  // Update last applied velocities
  lastVelocityX = velocityX;
  lastVelocityY = velocityY;

  let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

  // Checking if snake reached food
  if (snakeX === foodX && snakeY === foodY) {
    updateFoodPosition();
    snakeBody.push([foodY, foodX]);
    score++;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("high-score", highScore);
      highScoreElement.innerText = `High Score: ${highScore}`;
    }
    scoreElement.innerText = `Score: ${score}`;
  }

  // Update head position
  snakeX += velocityX;
  snakeY += velocityY;

  // Move body forward
  for (let i = snakeBody.length - 1; i > 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
  }
  snakeBody[0] = [snakeY, snakeX];

  // Wall collision check
  if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
    return handleGameOver();
  }

  // Render snake and check self-collision
  for (let i = 0; i < snakeBody.length; i++) {
    const isHead = (i === 0);
    html += `<div class="${isHead ? 'head' : 'body-segment'}" style="grid-area: ${snakeBody[i][0]} / ${snakeBody[i][1]}"></div>`;

    // Self-collision (head collides with any body segment)
    if (i !== 0 && snakeBody[0][0] === snakeBody[i][0] && snakeBody[0][1] === snakeBody[i][1]) {
      return handleGameOver();
    }
  }

  playBoard.innerHTML = html;
};

updateFoodPosition();
setIntervalId = setInterval(initGame, 100);
document.addEventListener("keydown", changeDirection);
