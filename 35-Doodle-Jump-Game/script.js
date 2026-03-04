(function () {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  if (!ctx.roundRect) {
    ctx.roundRect = function (x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      this.beginPath();
      this.moveTo(x + r, y);
      this.lineTo(x + w - r, y);
      this.quadraticCurveTo(x + w, y, x + w, y + r);
      this.lineTo(x + w, y + h - r);
      this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      this.lineTo(x + r, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - r);
      this.lineTo(x, y + r);
      this.quadraticCurveTo(x, y, x + r, y);
    };
  }
  const scoreEl = document.getElementById("scoreEl");
  const highScoreEl = document.getElementById("highScoreEl");
  const startOverlay = document.getElementById("startOverlay");
  const gameOverOverlay = document.getElementById("gameOverOverlay");
  const startBtn = document.getElementById("startBtn");
  const restartBtn = document.getElementById("restartBtn");
  const finalScoreEl = document.getElementById("finalScoreEl");
  const btnLeft = document.getElementById("btnLeft");
  const btnRight = document.getElementById("btnRight");

  const CANVAS_WIDTH = 480;
  const CANVAS_HEIGHT = 600;
  const GRAVITY = 0.45;
  const JUMP_FORCE = -12;
  const MOVE_SPEED = 5;
  const PLATFORM_MIN_WIDTH = 60;
  const PLATFORM_MAX_WIDTH = 120;
  const PLATFORM_HEIGHT = 14;
  const PLATFORM_GAP_MIN = 50;
  const PLATFORM_GAP_MAX = 120;
  const PLAYER_WIDTH = 36;
  const PLAYER_HEIGHT = 40;
  const CAMERA_LEAD = 0.4;

  let animationId = null;
  let player = null;
  let platforms = [];
  let cameraY = 0;
  let startCameraY = 0;
  let score = 0;
  let highScore = parseInt(localStorage.getItem("doodle-high-score") || "0", 10);
  let gameRunning = false;
  let keys = { left: false, right: false };
  let time = 0;

  function setPixelRatio() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = CANVAS_WIDTH * dpr;
    canvas.height = CANVAS_HEIGHT * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    ctx.scale(dpr, dpr);
  }

  function createPlatform(x, y, width, type) {
    return {
      x,
      y,
      width,
      height: PLATFORM_HEIGHT,
      type: type || "normal",
      moveDir: type === "moving" ? (Math.random() > 0.5 ? 1 : -1) : 0,
      moveRange: type === "moving" ? 40 + Math.random() * 40 : 0,
      startX: x,
    };
  }

  function initPlatforms() {
    platforms = [];
    let y = CANVAS_HEIGHT - 80;
    for (let i = 0; i < 10; i++) {
      const width =
        PLATFORM_MIN_WIDTH + Math.random() * (PLATFORM_MAX_WIDTH - PLATFORM_MIN_WIDTH);
      let x = Math.random() * (CANVAS_WIDTH - width);
      let type = "normal";
      if (i === 0) {
        x = (CANVAS_WIDTH - width) / 2;
      } else {
        const typeRand = Math.random();
        if (typeRand < 0.15) type = "break";
        else if (typeRand < 0.35) type = "moving";
      }
      platforms.push(createPlatform(x, y, width, type));
      y -= PLATFORM_GAP_MIN + Math.random() * (PLATFORM_GAP_MAX - PLATFORM_GAP_MIN);
    }
  }

  function addPlatformsAbove(topY) {
    let lastY = platforms.length ? Math.min(...platforms.map((p) => p.y)) : topY;
    while (lastY > topY - CANVAS_HEIGHT - 200) {
      lastY -= PLATFORM_GAP_MIN + Math.random() * (PLATFORM_GAP_MAX - PLATFORM_GAP_MIN);
      const width =
        PLATFORM_MIN_WIDTH + Math.random() * (PLATFORM_MAX_WIDTH - PLATFORM_MIN_WIDTH);
      const x = Math.random() * (CANVAS_WIDTH - width);
      const typeRand = Math.random();
      let type = "normal";
      if (typeRand < 0.12) type = "break";
      else if (typeRand < 0.32) type = "moving";
      platforms.push(createPlatform(x, lastY, width, type));
    }
  }

  function resetGame() {
    cameraY = 0;
    score = 0;
    time = 0;
    keys.left = false;
    keys.right = false;
    if (btnLeft) btnLeft.classList.remove("active");
    if (btnRight) btnRight.classList.remove("active");
    initPlatforms();
    const firstPlatform = platforms[0];
    player = {
      x: (CANVAS_WIDTH - PLAYER_WIDTH) / 2,
      y: firstPlatform.y - PLAYER_HEIGHT - 2,
      vx: 0,
      vy: 0,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
    };
    startCameraY = player.y - CANVAS_HEIGHT * CAMERA_LEAD;
    gameRunning = true;
    scoreEl.textContent = "0";
    highScoreEl.textContent = highScore;
  }

  function drawPlayer(screenY) {
    const x = player.x;
    const y = player.y - cameraY;
    if (y < -PLAYER_HEIGHT - 20 || y > CANVAS_HEIGHT + 20) return;

    ctx.save();
    ctx.translate(x + PLAYER_WIDTH / 2, y + PLAYER_HEIGHT / 2);
    if (keys.left) ctx.scale(-1, 1);
    ctx.translate(-(x + PLAYER_WIDTH / 2), -(y + PLAYER_HEIGHT / 2));

    ctx.fillStyle = "#2d3436";
    ctx.beginPath();
    ctx.roundRect(x, y, PLAYER_WIDTH, PLAYER_HEIGHT, 8);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x + 12, y + 14, 6, 0, Math.PI * 2);
    ctx.arc(x + PLAYER_WIDTH - 12, y + 14, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#2d3436";
    ctx.beginPath();
    ctx.arc(x + 12, y + 14, 3, 0, Math.PI * 2);
    ctx.arc(x + PLAYER_WIDTH - 12, y + 14, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawPlatform(p) {
    const y = p.y - cameraY;
    if (y < -PLATFORM_HEIGHT - 20 || y > CANVAS_HEIGHT + 50) return;

    const x = p.x;
    const w = p.width;
    const h = p.height;

    if (p.type === "normal") {
      ctx.fillStyle = "#6bcb77";
      ctx.strokeStyle = "#4ade80";
    } else if (p.type === "break") {
      ctx.fillStyle = "#c9a959";
      ctx.strokeStyle = "#b8860b";
    } else {
      ctx.fillStyle = "#4d96ff";
      ctx.strokeStyle = "#6eb5ff";
    }

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.stroke();
  }

  function gameOver() {
    gameRunning = false;
    if (animationId) cancelAnimationFrame(animationId);
    finalScoreEl.textContent = score;
    gameOverOverlay.classList.remove("hidden");
  }

  function gameLoop() {
    if (!gameRunning) return;

    time++;
    const dt = 1;

    if (keys.left) player.vx = -MOVE_SPEED;
    else if (keys.right) player.vx = MOVE_SPEED;
    else player.vx *= 0.85;
    player.x += player.vx;
    player.x = Math.max(0, Math.min(CANVAS_WIDTH - player.width, player.x));
    player.vy += GRAVITY;
    player.y += player.vy;

    for (let i = platforms.length - 1; i >= 0; i--) {
      const p = platforms[i];
      if (p.type === "moving") {
        p.x = p.startX + Math.sin((time + p.startX) * 0.03) * p.moveRange * p.moveDir;
        p.x = Math.max(0, Math.min(CANVAS_WIDTH - p.width, p.x));
      }

      const py = p.y - cameraY;
      if (py > CANVAS_HEIGHT + 100) {
        platforms.splice(i, 1);
        continue;
      }

      const playerBottom = player.y + player.height;
      const platformTop = p.y;
      const overlapX =
        player.x + player.width > p.x && player.x < p.x + p.width;
      if (
        overlapX &&
        playerBottom >= platformTop - 2 &&
        playerBottom <= platformTop + 12 &&
        player.vy >= 0
      ) {
        player.vy = JUMP_FORCE;
        player.y = platformTop - player.height - 1;
        if (p.type === "break") platforms.splice(i, 1);
      }
    }

    const targetCameraY = player.y - CANVAS_HEIGHT * CAMERA_LEAD;
    if (targetCameraY < cameraY) {
      cameraY = targetCameraY;
      const newScore = Math.max(0, Math.floor((startCameraY - cameraY) / 8));
      if (newScore > score) {
        score = newScore;
        scoreEl.textContent = score;
        if (score > highScore) {
          highScore = score;
          highScoreEl.textContent = highScore;
          localStorage.setItem("doodle-high-score", String(highScore));
        }
      }
      addPlatformsAbove(cameraY);
    }

    if (player.y - cameraY > CANVAS_HEIGHT + 50) {
      gameOver();
      return;
    }

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    platforms.forEach(drawPlatform);
    drawPlayer();

    animationId = requestAnimationFrame(gameLoop);
  }

  function startGame() {
    startOverlay.classList.add("hidden");
    gameOverOverlay.classList.add("hidden");
    resetGame();
    gameLoop();
  }

  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", startGame);

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = true;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = true;
    if (e.key === " ") e.preventDefault();
  });

  document.addEventListener("keyup", function (e) {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keys.left = false;
    if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") keys.right = false;
  });

  function setKeyLeft(value) {
    keys.left = value;
    if (btnLeft) btnLeft.classList.toggle("active", value);
  }
  function setKeyRight(value) {
    keys.right = value;
    if (btnRight) btnRight.classList.toggle("active", value);
  }
  if (btnLeft) {
    btnLeft.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      setKeyLeft(true);
    });
    btnLeft.addEventListener("pointerup", function () { setKeyLeft(false); });
    btnLeft.addEventListener("pointerleave", function () { setKeyLeft(false); });
  }
  if (btnRight) {
    btnRight.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      setKeyRight(true);
    });
    btnRight.addEventListener("pointerup", function () { setKeyRight(false); });
    btnRight.addEventListener("pointerleave", function () { setKeyRight(false); });
  }

  canvas.addEventListener("click", function () {
    if (gameRunning) return;
    if (!startOverlay.classList.contains("hidden")) startGame();
  });

  window.addEventListener("resize", setPixelRatio);
  setPixelRatio();
  highScoreEl.textContent = highScore;
})();
