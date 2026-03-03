(function () {
  "use strict";

  // Clues to leave per level (more clues = easier)
  const LEVEL_CLUES = {
    easy: { min: 42, max: 45 },
    medium: { min: 32, max: 36 },
    hard: { min: 25, max: 28 },
  };

  const LEVEL_LABELS = { easy: "Easy", medium: "Medium", hard: "Hard" };

  let state = {
    level: "easy",
    solution: null,   // 9x9 full grid
    puzzle: null,     // 9x9 with null for empty cells
    given: null,      // 9x9 boolean: true if cell was given
    selectedCell: null,
    startTime: null,
    timerId: null,
    cells: [],        // flat array of DOM elements
  };

  const levelScreen = document.getElementById("levelScreen");
  const gameScreen = document.getElementById("gameScreen");
  const boardEl = document.getElementById("board");
  const timerEl = document.getElementById("timer");
  const levelBadge = document.getElementById("levelBadge");
  const winOverlay = document.getElementById("winOverlay");
  const winTimeEl = document.getElementById("winTime");

  function createEmptyGrid() {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
  }

  function isValid(grid, row, col, num) {
    for (let c = 0; c < 9; c++) if (grid[row][c] === num) return false;
    for (let r = 0; r < 9; r++) if (grid[r][col] === num) return false;
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++)
      for (let c = bc; c < bc + 3; c++)
        if (grid[r][c] === num) return false;
    return true;
  }

  function solve(grid) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] !== 0) continue;
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        for (const num of nums) {
          if (!isValid(grid, r, c, num)) continue;
          grid[r][c] = num;
          if (solve(grid)) return true;
          grid[r][c] = 0;
        }
        return false;
      }
    }
    return true;
  }

  function generateFullGrid() {
    const grid = createEmptyGrid();
    solve(grid);
    return grid;
  }

  function getShuffledIndices() {
    const indices = [];
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++) indices.push({ r, c });
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }

  function createPuzzle(level) {
    const solution = generateFullGrid();
    const { min, max } = LEVEL_CLUES[level];
    const cluesCount = min + Math.floor(Math.random() * (max - min + 1));
    const toRemove = 81 - cluesCount;
    const puzzle = solution.map((row) => row.slice());
    const given = puzzle.map((row) => row.map(() => false));
    const indices = getShuffledIndices();
    for (let k = 0; k < toRemove; k++) {
      const { r, c } = indices[k];
      puzzle[r][c] = null;
      given[r][c] = false;
    }
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (puzzle[r][c] !== null) given[r][c] = true;
    return { solution, puzzle, given };
  }

  function flatIndex(r, c) {
    return r * 9 + c;
  }

  function updateCellUI(index, value, isError, isSameNumber) {
    const cell = state.cells[index];
    if (!cell) return;
    const r = Math.floor(index / 9), c = index % 9;
    const isGiven = state.given[r][c];
    cell.textContent = value !== null && value !== "" ? value : "";
    cell.classList.remove("user", "given", "error", "same-number");
    if (isGiven) cell.classList.add("given");
    else cell.classList.add("user");
    if (isError) cell.classList.add("error");
    if (isSameNumber) cell.classList.add("same-number");
  }

  function getCurrentGrid() {
    const grid = state.puzzle.map((row) => row.slice());
    for (let i = 0; i < 81; i++) {
      const r = Math.floor(i / 9), c = i % 9;
      if (state.given[r][c]) continue;
      const val = state.cells[i] && state.cells[i].textContent.trim();
      grid[r][c] = val === "" ? null : parseInt(val, 10);
    }
    return grid;
  }

  function getConflicts(grid, row, col) {
    const num = grid[row][col];
    if (num == null || isNaN(num) || num < 1 || num > 9) return { error: false, same: [] };
    const same = [];
    for (let c = 0; c < 9; c++) {
      if (c !== col && grid[row][c] === num) same.push(flatIndex(row, c));
    }
    for (let r = 0; r < 9; r++) {
      if (r !== row && grid[r][col] === num) same.push(flatIndex(r, col));
    }
    const br = Math.floor(row / 3) * 3, bc = Math.floor(col / 3) * 3;
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        if ((r !== row || c !== col) && grid[r][c] === num)
          same.push(flatIndex(r, c));
      }
    }
    return { error: same.length > 0, same };
  }

  function refreshBoardHighlights() {
    const grid = getCurrentGrid();
    for (let i = 0; i < 81; i++) {
      const r = Math.floor(i / 9), c = i % 9;
      const { error, same } = getConflicts(grid, r, c);
      const val = grid[r][c];
      updateCellUI(i, val !== null ? String(val) : "", error, same.length > 0);
    }
  }

  function isComplete() {
    const grid = getCurrentGrid();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] == null) return false;
        const { error } = getConflicts(grid, r, c);
        if (error) return false;
      }
    }
    return true;
  }

  function checkWin() {
    if (!isComplete()) return;
    stopTimer();
    winTimeEl.textContent = "Time: " + timerEl.textContent;
    winOverlay.classList.remove("hidden");
  }

  function buildBoard() {
    boardEl.innerHTML = "";
    state.cells = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        cell.dataset.r = r;
        cell.dataset.c = c;
        const val = state.puzzle[r][c];
        if (state.given[r][c]) {
          cell.textContent = val;
          cell.classList.add("given");
        } else {
          cell.classList.add("user");
        }
        cell.addEventListener("click", () => selectCell(r, c));
        boardEl.appendChild(cell);
        state.cells.push(cell);
      }
    }
  }

  function selectCell(r, c) {
    if (state.given[r][c]) return;
    state.cells.forEach((cell) => cell.classList.remove("selected"));
    state.selectedCell = { r, c };
    state.cells[flatIndex(r, c)].classList.add("selected");
  }

  function setCellValue(r, c, num) {
    if (state.given[r][c]) return;
    const i = flatIndex(r, c);
    state.cells[i].textContent = num === 0 ? "" : num;
    refreshBoardHighlights();
    checkWin();
  }

  function startTimer() {
    state.startTime = Date.now();
    state.timerId = setInterval(() => {
      const sec = Math.floor((Date.now() - state.startTime) / 1000);
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      timerEl.textContent = m + ":" + (s < 10 ? "0" : "") + s;
    }, 1000);
  }

  function stopTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
  }

  function startGame(level) {
    state.level = level;
    const { solution, puzzle, given } = createPuzzle(level);
    state.solution = solution;
    state.puzzle = puzzle;
    state.given = given;
    state.selectedCell = null;
    stopTimer();
    timerEl.textContent = "0:00";
    levelBadge.textContent = LEVEL_LABELS[level];
    winOverlay.classList.add("hidden");
    buildBoard();
    refreshBoardHighlights();
    startTimer();
  }

  function showGame() {
    levelScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
  }

  function showLevelSelect() {
    gameScreen.classList.add("hidden");
    levelScreen.classList.remove("hidden");
    winOverlay.classList.add("hidden");
  }

  document.querySelectorAll(".level-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const level = btn.dataset.level;
      startGame(level);
      showGame();
    });
  });

  document.getElementById("newGameBtn").addEventListener("click", () => {
    startGame(state.level);
  });

  document.getElementById("changeLevelBtn").addEventListener("click", () => {
    stopTimer();
    showLevelSelect();
  });

  document.getElementById("playAgainBtn").addEventListener("click", () => {
    winOverlay.classList.add("hidden");
    startGame(state.level);
  });

  document.getElementById("numberPad").addEventListener("click", (e) => {
    const btn = e.target.closest(".num-btn");
    if (!btn || !state.selectedCell) return;
    const num = parseInt(btn.dataset.num, 10);
    setCellValue(state.selectedCell.r, state.selectedCell.c, num);
  });

  document.addEventListener("keydown", (e) => {
    if (!state.selectedCell) return;
    const r = state.selectedCell.r, c = state.selectedCell.c;
    if (e.key >= "1" && e.key <= "9") {
      setCellValue(r, c, parseInt(e.key, 10));
      e.preventDefault();
    } else if (e.key === "Backspace" || e.key === "Delete") {
      setCellValue(r, c, 0);
      e.preventDefault();
    } else if (e.key === "ArrowUp" && r > 0) {
      selectCell(r - 1, c);
      e.preventDefault();
    } else if (e.key === "ArrowDown" && r < 8) {
      selectCell(r + 1, c);
      e.preventDefault();
    } else if (e.key === "ArrowLeft" && c > 0) {
      selectCell(r, c - 1);
      e.preventDefault();
    } else if (e.key === "ArrowRight" && c < 8) {
      selectCell(r, c + 1);
      e.preventDefault();
    }
  });
})();
