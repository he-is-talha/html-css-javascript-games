const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");
const FPS = 45;
const jump_amount = -8.5;
const max_fall_speed = 9.5;
const acceleration = 0.55;
const pipe_speed = -2.5;

let game_mode = "prestart"; // "prestart", "running", "paused", "over"
let time_game_last_running;
let bottom_bar_offset = 0;
let pipes = [];
let liveScore = 0;
let soundEnabled = true;

// High score tracking
let highScore = parseInt(localStorage.getItem("flappy_high_score")) || 0;

// Embedded self-contained SVG Data URIs (no external HTTP dependencies, works completely offline & on HTTPS)
const SVG_BIRD = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="34" height="26" viewBox="0 0 34 26"><ellipse cx="16" cy="13" rx="14" ry="11" fill="%23facc15" stroke="%23854d0e" stroke-width="2"/><ellipse cx="10" cy="15" rx="7" ry="5" fill="%23ffffff" stroke="%23854d0e" stroke-width="1.5"/><circle cx="23" cy="9" r="4.5" fill="%23ffffff" stroke="%23000000" stroke-width="1.5"/><circle cx="24.5" cy="9" r="2" fill="%23000000"/><path d="M 24 13 L 33 16 L 24 19 Z" fill="%23ea580c" stroke="%239a3412" stroke-width="1.5"/></svg>`;

const SVG_PIPE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="52" height="320" viewBox="0 0 52 320"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="%2322c55e"/><stop offset="30%" stop-color="%2386efac"/><stop offset="70%" stop-color="%2316a34a"/><stop offset="100%" stop-color="%2314532d"/></linearGradient></defs><rect x="4" y="24" width="44" height="296" fill="url(%23g)" stroke="%2314532d" stroke-width="2"/><rect x="1" y="0" width="50" height="24" rx="3" fill="url(%23g)" stroke="%2314532d" stroke-width="2"/></svg>`;

const SVG_BOTTOM = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="660" height="40" viewBox="0 0 660 40"><rect width="660" height="40" fill="%23ded895"/><rect width="660" height="8" fill="%2322c55e"/><line x1="0" y1="8" x2="660" y2="8" stroke="%2315803d" stroke-width="2"/></svg>`;

// Web Audio API Synthesizer
let audioCtx = null;
function playSound(type) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === "flap") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === "point") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.setValueAtTime(880, now + 0.08); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === "hit") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.2);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {}
}

const btnSound = document.getElementById("btn-sound");
if (btnSound) {
  btnSound.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    btnSound.innerText = soundEnabled ? "🔊 Sound" : "🔇 Muted";
  });
}

function MySprite(img_url) {
  this.x = 0;
  this.y = 0;
  this.visible = true;
  this.velocity_x = 0;
  this.velocity_y = 0;
  this.MyImg = new Image();
  this.MyImg.src = img_url || "";
  this.angle = 0;
  this.flipV = false;
  this.flipH = false;
  this.passed = false;
}

MySprite.prototype.Do_Frame_Things = function () {
  ctx.save();
  const w = this.MyImg.width || 34;
  const h = this.MyImg.height || 26;
  ctx.translate(this.x + w / 2, this.y + h / 2);
  ctx.rotate((this.angle * Math.PI) / 180);
  if (this.flipV) ctx.scale(1, -1);
  if (this.flipH) ctx.scale(-1, 1);
  if (this.visible && this.MyImg.complete) {
    ctx.drawImage(this.MyImg, -w / 2, -h / 2);
  }
  this.x += this.velocity_x;
  this.y += this.velocity_y;
  ctx.restore();
};

function ImagesTouching(thing1, thing2) {
  if (!thing1.visible || !thing2.visible) return false;
  const w1 = thing1.MyImg.width || 34;
  const h1 = thing1.MyImg.height || 26;
  const w2 = thing2.MyImg.width || 52;
  const h2 = thing2.MyImg.height || 320;

  // Add a slight 4px padding so collision feels fair
  const pad = 4;
  if (
    thing1.x + pad >= thing2.x + w2 - pad ||
    thing1.x + w1 - pad <= thing2.x + pad
  )
    return false;
  if (
    thing1.y + pad >= thing2.y + h2 - pad ||
    thing1.y + h1 - pad <= thing2.y + pad
  )
    return false;
  return true;
}

function Got_Player_Input(MyEvent) {
  if (MyEvent.target && MyEvent.target.id === "btn-sound") return;

  if (MyEvent.type === "keydown") {
    if (MyEvent.key === "p" || MyEvent.key === "P") {
      if (game_mode === "running") {
        game_mode = "paused";
      } else if (game_mode === "paused") {
        game_mode = "running";
      }
      return;
    }
    // Only accept Space or ArrowUp to flap
    if (MyEvent.code !== "Space" && MyEvent.code !== "ArrowUp") return;
  }

  switch (game_mode) {
    case "prestart": {
      game_mode = "running";
      bird.velocity_y = jump_amount;
      playSound("flap");
      break;
    }
    case "running": {
      bird.velocity_y = jump_amount;
      playSound("flap");
      break;
    }
    case "over": {
      if (new Date() - time_game_last_running > 700) {
        reset_game();
        game_mode = "running";
        bird.velocity_y = jump_amount;
        playSound("flap");
      }
      break;
    }
  }
  if (MyEvent.preventDefault) MyEvent.preventDefault();
}

myCanvas.addEventListener("touchstart", Got_Player_Input, { passive: false });
myCanvas.addEventListener("mousedown", Got_Player_Input);
window.addEventListener("keydown", Got_Player_Input);

function make_bird_slow_and_fall() {
  if (bird.velocity_y < max_fall_speed) {
    bird.velocity_y += acceleration;
  }
  const birdHeight = bird.MyImg.height || 26;
  const groundLevel = myCanvas.height - 40; // 40px bottom ground

  if (bird.y + birdHeight >= groundLevel) {
    bird.y = groundLevel - birdHeight;
    bird.velocity_y = 0;
    if (game_mode === "running") {
      playSound("hit");
      game_mode = "over";
    }
  }
  if (bird.y < 0) {
    bird.y = 0;
    bird.velocity_y = 0;
  }
}

function add_pipe(x_pos, top_of_gap, gap_width) {
  const top_pipe = new MySprite(SVG_PIPE);
  top_pipe.x = x_pos;
  top_pipe.y = top_of_gap - 320;
  top_pipe.velocity_x = pipe_speed;
  top_pipe.flipV = true; // Lip points down
  pipes.push(top_pipe);

  const bottom_pipe = new MySprite(SVG_PIPE);
  bottom_pipe.x = x_pos;
  bottom_pipe.y = top_of_gap + gap_width;
  bottom_pipe.velocity_x = pipe_speed;
  bottom_pipe.flipV = false; // Lip points up
  pipes.push(bottom_pipe);
}

function make_bird_tilt_appropriately() {
  if (bird.velocity_y < 0) {
    bird.angle = -20;
  } else if (bird.angle < 70) {
    bird.angle += 3.5;
  }
}

function show_the_pipes() {
  for (let i = 0; i < pipes.length; i++) {
    pipes[i].Do_Frame_Things();

    // Check if bird passed pipe to increment score
    // Each pair has top and bottom pipe, we only score on the top pipe (even indices)
    if (i % 2 === 0 && !pipes[i].passed && pipes[i].x + 52 < bird.x) {
      pipes[i].passed = true;
      liveScore++;
      playSound("point");
      if (liveScore > highScore) {
        highScore = liveScore;
        localStorage.setItem("flappy_high_score", highScore);
      }
    }
  }

  // Recycle pipes that scrolled past screen
  if (pipes.length > 0 && pipes[0].x < -60) {
    pipes.splice(0, 2);
    // Add next pipe at end of queue
    const lastX = pipes[pipes.length - 1].x;
    const randomGapY = Math.floor(Math.random() * 200) + 80;
    add_pipe(lastX + 240, randomGapY, 130);
  }
}

function check_for_end_game() {
  for (let i = 0; i < pipes.length; i++) {
    if (ImagesTouching(bird, pipes[i])) {
      playSound("hit");
      game_mode = "over";
      break;
    }
  }
}

function drawBackground() {
  // Charming sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, myCanvas.height);
  grad.addColorStop(0, "#38bdf8");
  grad.addColorStop(0.7, "#bae6fd");
  grad.addColorStop(1, "#f0fdf4");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, myCanvas.width, myCanvas.height);

  // Background clouds
  ctx.fillStyle = "rgba(255, 255, 255, 0.75)";
  ctx.beginPath();
  ctx.arc(120, 100, 30, 0, Math.PI * 2);
  ctx.arc(150, 90, 40, 0, Math.PI * 2);
  ctx.arc(180, 100, 30, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(420, 160, 25, 0, Math.PI * 2);
  ctx.arc(445, 150, 35, 0, Math.PI * 2);
  ctx.arc(470, 160, 25, 0, Math.PI * 2);
  ctx.fill();
}

function display_intro_instructions() {
  ctx.font = "bold 26px Pacifico, cursive";
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 4;
  ctx.textAlign = "center";
  ctx.strokeText("Flap to Start!", myCanvas.width / 2, myCanvas.height / 3);
  ctx.fillText("Flap to Start!", myCanvas.width / 2, myCanvas.height / 3);

  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.strokeText("Click, Tap or Press Space", myCanvas.width / 2, myCanvas.height / 3 + 45);
  ctx.fillText("Click, Tap or Press Space", myCanvas.width / 2, myCanvas.height / 3 + 45);

  ctx.font = "bold 16px sans-serif";
  ctx.fillText(`Best: ${highScore}`, myCanvas.width / 2, myCanvas.height / 3 + 85);
}

function display_live_score() {
  ctx.font = "bold 42px sans-serif";
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 5;
  ctx.textAlign = "center";
  ctx.strokeText(liveScore, myCanvas.width / 2, 70);
  ctx.fillText(liveScore, myCanvas.width / 2, 70);
}

function display_game_over() {
  ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
  ctx.fillRect(0, 0, myCanvas.width, myCanvas.height);

  ctx.font = "bold 38px Pacifico, cursive";
  ctx.fillStyle = "#ef4444";
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  ctx.textAlign = "center";
  ctx.strokeText("Game Over!", myCanvas.width / 2, 140);
  ctx.fillText("Game Over!", myCanvas.width / 2, 140);

  ctx.font = "bold 24px sans-serif";
  ctx.fillStyle = "#facc15";
  ctx.fillText(`Score: ${liveScore}`, myCanvas.width / 2, 200);

  ctx.fillStyle = "#ffffff";
  ctx.fillText(`High Score: ${highScore}`, myCanvas.width / 2, 240);

  ctx.font = "18px sans-serif";
  ctx.fillStyle = "#cbd5e1";
  ctx.fillText("Tap, Click or Press Space to Play Again", myCanvas.width / 2, 310);
}

function display_paused() {
  ctx.fillStyle = "rgba(15, 23, 42, 0.6)";
  ctx.fillRect(0, 0, myCanvas.width, myCanvas.height);

  ctx.font = "bold 36px Pacifico, cursive";
  ctx.fillStyle = "#f8fafc";
  ctx.textAlign = "center";
  ctx.fillText("Game Paused", myCanvas.width / 2, myCanvas.height / 2);
  ctx.font = "18px sans-serif";
  ctx.fillText("Press 'P' to Resume", myCanvas.width / 2, myCanvas.height / 2 + 45);
}

function display_bar_running_along_bottom() {
  if (bottom_bar_offset < -24) bottom_bar_offset = 0;
  if (bottom_bar.complete) {
    ctx.drawImage(bottom_bar, bottom_bar_offset, myCanvas.height - 40);
  }
}

function reset_game() {
  bird.x = myCanvas.width / 4;
  bird.y = myCanvas.height / 2;
  bird.angle = 0;
  bird.velocity_y = 0;
  pipes = [];
  liveScore = 0;
  add_all_my_pipes();
}

function add_all_my_pipes() {
  let startX = 420;
  for (let i = 0; i < 4; i++) {
    const randomGapY = Math.floor(Math.random() * 180) + 90;
    add_pipe(startX + i * 220, randomGapY, 130);
  }
}

const bottom_bar = new Image();
bottom_bar.src = SVG_BOTTOM;

const bird = new MySprite(SVG_BIRD);
bird.x = myCanvas.width / 4;
bird.y = myCanvas.height / 2;

add_all_my_pipes();

function Do_a_Frame() {
  drawBackground();

  switch (game_mode) {
    case "prestart": {
      display_intro_instructions();
      bird.Do_Frame_Things();
      display_bar_running_along_bottom();
      break;
    }
    case "running": {
      time_game_last_running = new Date();
      bottom_bar_offset += pipe_speed;
      show_the_pipes();
      bird.Do_Frame_Things();
      make_bird_tilt_appropriately();
      make_bird_slow_and_fall();
      check_for_end_game();
      display_bar_running_along_bottom();
      display_live_score();
      break;
    }
    case "paused": {
      show_the_pipes();
      bird.Do_Frame_Things();
      display_bar_running_along_bottom();
      display_paused();
      break;
    }
    case "over": {
      make_bird_slow_and_fall();
      show_the_pipes();
      bird.Do_Frame_Things();
      display_bar_running_along_bottom();
      display_game_over();
      break;
    }
  }
}

setInterval(Do_a_Frame, 1000 / FPS);
