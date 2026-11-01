const boxEls = document.querySelectorAll('.box');
const statusEl = document.querySelector('.status');
const restartBtnEl = document.querySelector('.restartBtn');
const resetScoreBtnEl = document.querySelector('.resetScoreBtn');
const modeAiBtn = document.getElementById('mode-ai');
const modePvpBtn = document.getElementById('mode-pvp');
const labelO = document.getElementById('label-o');
const scoreXEl = document.getElementById('score-x');
const scoreOEl = document.getElementById('score-o');
const scoreTiesEl = document.getElementById('score-ties');

const x = "<img src='X-Player.png' alt='X'>";
const o = "<img src='O-Player.png' alt='O'>";

// Total Win Possibilities
const winConditions = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

let options = ["", "", "", "", "", "", "", "", ""];
let player = "X";
let running = false;
let gameMode = "ai"; // "ai" or "pvp"
let scores = {
  x: parseInt(localStorage.getItem("ttt_score_x")) || 0,
  o: parseInt(localStorage.getItem("ttt_score_o")) || 0,
  ties: parseInt(localStorage.getItem("ttt_score_ties")) || 0
};

function updateScoreboard() {
  scoreXEl.textContent = scores.x;
  scoreOEl.textContent = scores.o;
  scoreTiesEl.textContent = scores.ties;
  localStorage.setItem("ttt_score_x", scores.x);
  localStorage.setItem("ttt_score_o", scores.o);
  localStorage.setItem("ttt_score_ties", scores.ties);
}

function init() {
  boxEls.forEach(box => box.addEventListener('click', boxClick));
  restartBtnEl.addEventListener('click', restartGame);
  resetScoreBtnEl.addEventListener('click', resetScores);

  modeAiBtn.addEventListener('click', () => setMode('ai'));
  modePvpBtn.addEventListener('click', () => setMode('pvp'));

  updateScoreboard();
  restartGame();
}

function setMode(mode) {
  gameMode = mode;
  if (mode === 'ai') {
    modeAiBtn.classList.add('active');
    modePvpBtn.classList.remove('active');
    labelO.textContent = "AI (O)";
  } else {
    modePvpBtn.classList.add('active');
    modeAiBtn.classList.remove('active');
    labelO.textContent = "Player O";
  }
  restartGame();
}

function resetScores() {
  scores = { x: 0, o: 0, ties: 0 };
  updateScoreboard();
}

function boxClick(e) {
  const index = e.target.dataset.index;
  if (options[index] !== "" || !running) {
    return;
  }

  // Prevent human clicking when AI is thinking
  if (gameMode === "ai" && player === "O") {
    return;
  }

  makeMove(index, player);

  if (running && gameMode === "ai" && player === "O") {
    statusEl.textContent = `AI is thinking... 🤔`;
    setTimeout(makeAiMove, 250);
  }
}

function makeMove(index, currPlayer) {
  options[index] = currPlayer;
  boxEls[index].innerHTML = currPlayer === "X" ? x : o;
  checkWinner();
}

function makeAiMove() {
  if (!running) return;

  const bestMoveIndex = getBestMove(options);
  if (bestMoveIndex !== -1) {
    makeMove(bestMoveIndex, "O");
  }
}

// Minimax algorithm for unbeatable AI
function getBestMove(board) {
  // Opening move optimization: take center or corners immediately
  const availableMoves = board
    .map((val, idx) => (val === "" ? idx : null))
    .filter(val => val !== null);

  if (availableMoves.length === 8 && board[4] === "") return 4;

  let bestScore = -Infinity;
  let move = -1;

  for (let i = 0; i < availableMoves.length; i++) {
    const idx = availableMoves[i];
    board[idx] = "O";
    const score = minimax(board, 0, false, -Infinity, Infinity);
    board[idx] = "";
    if (score > bestScore) {
      bestScore = score;
      move = idx;
    }
  }

  return move !== -1 ? move : availableMoves[0];
}

function checkTerminalState(board) {
  for (let i = 0; i < winConditions.length; i++) {
    const [a, b, c] = winConditions[i];
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a]; // "X" or "O"
    }
  }
  if (!board.includes("")) return "tie";
  return null;
}

function minimax(board, depth, isMaximizing, alpha, beta) {
  const winner = checkTerminalState(board);
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (winner === "tie") return 0;

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O";
        const evalScore = minimax(board, depth + 1, false, alpha, beta);
        board[i] = "";
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";
        const evalScore = minimax(board, depth + 1, true, alpha, beta);
        board[i] = "";
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
    }
    return minEval;
  }
}

function changePlayer() {
  player = player === "X" ? "O" : "X";
  const displayName = gameMode === "ai" && player === "O" ? "AI" : player;
  statusEl.textContent = `Now "${displayName}" Turn`;
  statusEl.style.color = "black";
}

function restartGame() {
  options = ["", "", "", "", "", "", "", "", ""];
  player = "X";
  running = true;
  statusEl.textContent = `Now "X" Turn`;
  statusEl.style.color = "black";
  restartBtnEl.textContent = "Restart 🔁";

  boxEls.forEach(box => {
    box.innerHTML = "";
    box.classList.remove('win');
  });
}

function checkWinner() {
  let isWon = false;
  let winningIndices = [];

  for (let i = 0; i < winConditions.length; i++) {
    const [a, b, c] = winConditions[i];
    if (options[a] && options[a] === options[b] && options[b] === options[c]) {
      isWon = true;
      winningIndices = [a, b, c];
      break;
    }
  }

  if (isWon) {
    winningIndices.forEach(idx => boxEls[idx].classList.add('win'));
    const winnerName = (gameMode === "ai" && player === "O") ? "AI" : `Player ${player}`;
    statusEl.textContent = `Hurrah...! ${winnerName} Won! 🕺`;
    statusEl.style.color = "green";
    restartBtnEl.textContent = "Play Again 😉";
    running = false;

    if (player === "X") scores.x++;
    else scores.o++;
    updateScoreboard();
  } else if (!options.includes("")) {
    statusEl.textContent = `Oops..! Game Draw..! 🤝`;
    statusEl.style.color = "red";
    restartBtnEl.textContent = "Play Again 😉";
    running = false;
    scores.ties++;
    updateScoreboard();
  } else {
    changePlayer();
  }
}

init();
