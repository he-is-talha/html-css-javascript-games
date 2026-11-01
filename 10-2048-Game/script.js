document.addEventListener("DOMContentLoaded", () => {
  const gridDisplay = document.querySelector(".grid");
  const scoreDisplay = document.getElementById("score");
  const bestScoreDisplay = document.getElementById("best-score");
  const resultDisplay = document.getElementById("result");
  const restartBtn = document.getElementById("btn-restart");

  const width = 4;
  let squares = [];
  let score = 0;
  let bestScore = parseInt(localStorage.getItem("2048_best_score")) || 0;
  bestScoreDisplay.innerText = bestScore;

  function createBoard() {
    gridDisplay.innerHTML = "";
    squares = [];
    for (let i = 0; i < width * width; i++) {
      const square = document.createElement("div");
      square.innerHTML = "";
      gridDisplay.appendChild(square);
      squares.push(square);
    }
    generate();
    generate();
    updateTileStyles();
  }

  function generate() {
    const emptyIndices = squares
      .map((sq, idx) => (sq.innerHTML === "" || sq.innerHTML === "0" ? idx : null))
      .filter((val) => val !== null);

    if (emptyIndices.length > 0) {
      const randomIdx = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
      squares[randomIdx].innerHTML = Math.random() < 0.9 ? 2 : 4;
    }
  }

  function getBoardState() {
    return squares.map((sq) => parseInt(sq.innerHTML) || 0);
  }

  function setBoardState(state) {
    for (let i = 0; i < squares.length; i++) {
      squares[i].innerHTML = state[i] === 0 ? "" : state[i];
    }
  }

  function slideAndCombineRow(row) {
    let filtered = row.filter((num) => num !== 0);
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        score += filtered[i];
        filtered.splice(i + 1, 1);
      }
    }
    while (filtered.length < 4) {
      filtered.push(0);
    }
    return filtered;
  }

  function moveLeft() {
    for (let i = 0; i < 16; i += 4) {
      const row = [
        parseInt(squares[i].innerHTML) || 0,
        parseInt(squares[i + 1].innerHTML) || 0,
        parseInt(squares[i + 2].innerHTML) || 0,
        parseInt(squares[i + 3].innerHTML) || 0
      ];
      const newRow = slideAndCombineRow(row);
      for (let j = 0; j < 4; j++) {
        squares[i + j].innerHTML = newRow[j] === 0 ? "" : newRow[j];
      }
    }
  }

  function moveRight() {
    for (let i = 0; i < 16; i += 4) {
      const row = [
        parseInt(squares[i + 3].innerHTML) || 0,
        parseInt(squares[i + 2].innerHTML) || 0,
        parseInt(squares[i + 1].innerHTML) || 0,
        parseInt(squares[i].innerHTML) || 0
      ];
      const newRow = slideAndCombineRow(row);
      for (let j = 0; j < 4; j++) {
        squares[i + 3 - j].innerHTML = newRow[j] === 0 ? "" : newRow[j];
      }
    }
  }

  function moveUp() {
    for (let c = 0; c < 4; c++) {
      const col = [
        parseInt(squares[c].innerHTML) || 0,
        parseInt(squares[c + 4].innerHTML) || 0,
        parseInt(squares[c + 8].innerHTML) || 0,
        parseInt(squares[c + 12].innerHTML) || 0
      ];
      const newCol = slideAndCombineRow(col);
      for (let r = 0; r < 4; r++) {
        squares[c + r * 4].innerHTML = newCol[r] === 0 ? "" : newCol[r];
      }
    }
  }

  function moveDown() {
    for (let c = 0; c < 4; c++) {
      const col = [
        parseInt(squares[c + 12].innerHTML) || 0,
        parseInt(squares[c + 8].innerHTML) || 0,
        parseInt(squares[c + 4].innerHTML) || 0,
        parseInt(squares[c].innerHTML) || 0
      ];
      const newCol = slideAndCombineRow(col);
      for (let r = 0; r < 4; r++) {
        squares[c + (3 - r) * 4].innerHTML = newCol[r] === 0 ? "" : newCol[r];
      }
    }
  }

  function handleMove(directionFn) {
    const beforeState = getBoardState();
    directionFn();
    const afterState = getBoardState();

    const changed = beforeState.some((val, idx) => val !== afterState[idx]);
    if (changed) {
      generate();
      updateScore();
      updateTileStyles();
      checkForWin();
      checkForGameOver();
    }
  }

  function updateScore() {
    scoreDisplay.innerText = score;
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("2048_best_score", bestScore);
      bestScoreDisplay.innerText = bestScore;
    }
  }

  function checkForWin() {
    for (let i = 0; i < squares.length; i++) {
      if (squares[i].innerHTML === "2048") {
        resultDisplay.innerHTML = "🎉 <b>You WIN!</b> Keep going for higher score!";
        break;
      }
    }
  }

  // Accurate Game Over Detection: No empty cells AND no adjacent matching tiles
  function checkForGameOver() {
    const board = getBoardState();

    // Check if any empty cell exists
    if (board.includes(0)) return;

    // Check horizontal neighbors
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[r * 4 + c] === board[r * 4 + c + 1]) return;
      }
    }

    // Check vertical neighbors
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 3; r++) {
        if (board[r * 4 + c] === board[(r + 1) * 4 + c]) return;
      }
    }

    // No valid moves left
    resultDisplay.innerHTML = "Game Over! <b>No moves left.</b>";
  }

  function updateTileStyles() {
    const colors = {
      "": { bg: "#cdc1b4", color: "#776e65" },
      0: { bg: "#cdc1b4", color: "#776e65" },
      2: { bg: "#eee4da", color: "#776e65" },
      4: { bg: "#ede0c8", color: "#776e65" },
      8: { bg: "#f2b179", color: "#f9f6f2" },
      16: { bg: "#f59563", color: "#f9f6f2" },
      32: { bg: "#f67c5f", color: "#f9f6f2" },
      64: { bg: "#f65e3b", color: "#f9f6f2" },
      128: { bg: "#edcf72", color: "#f9f6f2", font: "38px" },
      256: { bg: "#edcc61", color: "#f9f6f2", font: "38px" },
      512: { bg: "#edc850", color: "#f9f6f2", font: "38px" },
      1024: { bg: "#edc53f", color: "#f9f6f2", font: "30px" },
      2048: { bg: "#edc22e", color: "#f9f6f2", font: "30px" }
    };

    squares.forEach((sq) => {
      const val = sq.innerHTML.trim();
      const style = colors[val] || { bg: "#3c3a32", color: "#f9f6f2", font: "26px" };
      sq.style.backgroundColor = style.bg;
      sq.style.color = style.color;
      if (style.font) {
        sq.style.fontSize = style.font;
      } else {
        sq.style.fontSize = "";
      }
    });
  }

  // Keyboard Navigation
  function control(e) {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      e.preventDefault();
      handleMove(moveLeft);
    } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      e.preventDefault();
      handleMove(moveRight);
    } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
      e.preventDefault();
      handleMove(moveUp);
    } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
      e.preventDefault();
      handleMove(moveDown);
    }
  }
  document.addEventListener("keydown", control);

  // Mobile Touch Swipe Detection
  let touchStartX = 0;
  let touchStartY = 0;

  gridDisplay.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }, { passive: true });

  gridDisplay.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 25) {
      if (dx > 0) handleMove(moveRight);
      else handleMove(moveLeft);
    } else if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 25) {
      if (dy > 0) handleMove(moveDown);
      else handleMove(moveUp);
    }
  }, { passive: true });

  // Restart Button
  restartBtn.addEventListener("click", () => {
    score = 0;
    scoreDisplay.innerText = score;
    resultDisplay.innerHTML = "Join the numbers and get to the <b>2048</b> tile!";
    createBoard();
  });

  createBoard();
});
