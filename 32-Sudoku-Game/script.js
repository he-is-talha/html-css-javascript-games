(function () {
  "use strict";

  // Level: grid size, box dimensions, and clue count range
  // Easy: no box/region check (row + column only); Medium/Hard: full Sudoku with boxes
  const LEVEL_CONFIG = {
    easy:   { size: 4, boxRows: 2, boxCols: 2, cluesMin: 8,  cluesMax: 10, checkBox: false },
    medium: { size: 6, boxRows: 2, boxCols: 3, cluesMin: 18, cluesMax: 22, checkBox: true },
    hard:   { size: 9, boxRows: 3, boxCols: 3, cluesMin: 25, cluesMax: 28, checkBox: true },
  };

  const LEVEL_LABELS = { easy: "Easy (4×4)", medium: "Medium (6×6)", hard: "Hard (9×9)" };

  let state = {
    level: "easy",
    size: 4,
    boxRows: 2,
    boxCols: 2,
    checkBox: false,  // easy: row+column only; medium/hard: also box
    solution: null,
    puzzle: null,
    given: null,
    selectedCell: null,
    startTime: null,
    timerId: null,
    cells: [],
  };

  const levelScreen = document.getElementById("levelScreen");
  const gameScreen = document.getElementById("gameScreen");
  const boardEl = document.getElementById("board");
  const timerEl = document.getElementById("timer");
  const levelBadge = document.getElementById("levelBadge");
  const winOverlay = document.getElementById("winOverlay");
  const winTimeEl = document.getElementById("winTime");
  const numberPadEl = document.getElementById("numberPad");

  function createEmptyGrid(size) {
    return Array.from({ length: size }, () => Array(size).fill(0));
  }

  function isValid(grid, row, col, num, size, boxRows, boxCols, checkBox) {
    for (let c = 0; c < size; c++) if (grid[row][c] === num) return false;
    for (let r = 0; r < size; r++) if (grid[r][col] === num) return false;
    if (checkBox && boxRows > 0 && boxCols > 0) {
      const br = Math.floor(row / boxRows) * boxRows;
      const bc = Math.floor(col / boxCols) * boxCols;
      for (let r = br; r < br + boxRows; r++)
        for (let c = bc; c < bc + boxCols; c++)
          if (grid[r][c] === num) return false;
    }
    return true;
  }

  function solve(grid, size, boxRows, boxCols, checkBox) {
    const maxNum = size;
    const nums = Array.from({ length: maxNum }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (grid[r][c] !== 0) continue;
        for (const num of nums) {
          if (!isValid(grid, r, c, num, size, boxRows, boxCols, checkBox)) continue;
          grid[r][c] = num;
          if (solve(grid, size, boxRows, boxCols, checkBox)) return true;
          grid[r][c] = 0;
        }
        return false;
      }
    }
    return true;
  }

  function generateFullGrid(size, boxRows, boxCols, checkBox) {
    const grid = createEmptyGrid(size);
    solve(grid, size, boxRows, boxCols, checkBox);
    return grid;
  }

  function getShuffledIndices(size) {
    const indices = [];
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++) indices.push({ r, c });
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  }

  function createPuzzle(level) {
    const { size, boxRows, boxCols, cluesMin, cluesMax, checkBox } = LEVEL_CONFIG[level];
    const solution = generateFullGrid(size, boxRows, boxCols, checkBox);
    const cluesCount = cluesMin + Math.floor(Math.random() * (cluesMax - cluesMin + 1));
    const total = size * size;
    const toRemove = total - cluesCount;
    const puzzle = solution.map((row) => row.slice());
    const given = puzzle.map((row) => row.map(() => false));
    const indices = getShuffledIndices(size);
    for (let k = 0; k < toRemove; k++) {
      const { r, c } = indices[k];
      puzzle[r][c] = null;
      given[r][c] = false;
    }
    for (let r = 0; r < size; r++)
      for (let c = 0; c < size; c++)
        if (puzzle[r][c] !== null) given[r][c] = true;
    return { solution, puzzle, given };
  }

  function flatIndex(r, c) {
    return r * state.size + c;
  }

  function updateCellUI(index, value, isError, isSameNumber) {
    const cell = state.cells[index];
    if (!cell) return;
    const r = Math.floor(index / state.size), c = index % state.size;
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
    const total = state.size * state.size;
    for (let i = 0; i < total; i++) {
      const r = Math.floor(i / state.size), c = i % state.size;
      if (state.given[r][c]) continue;
      const val = state.cells[i] && state.cells[i].textContent.trim();
      grid[r][c] = val === "" ? null : parseInt(val, 10);
    }
    return grid;
  }

  function getConflicts(grid, row, col) {
    const num = grid[row][col];
    const maxNum = state.size;
    if (num == null || isNaN(num) || num < 1 || num > maxNum) return { error: false, same: [] };
    const same = [];
    for (let c = 0; c < state.size; c++) {
      if (c !== col && grid[row][c] === num) same.push(flatIndex(row, c));
    }
    for (let r = 0; r < state.size; r++) {
      if (r !== row && grid[r][col] === num) same.push(flatIndex(r, col));
    }
    if (state.checkBox && state.boxRows > 0 && state.boxCols > 0) {
      const br = Math.floor(row / state.boxRows) * state.boxRows;
      const bc = Math.floor(col / state.boxCols) * state.boxCols;
      for (let r = br; r < br + state.boxRows; r++) {
        for (let c = bc; c < bc + state.boxCols; c++) {
          if ((r !== row || c !== col) && grid[r][c] === num)
            same.push(flatIndex(r, c));
        }
      }
    }
    return { error: same.length > 0, same };
  }

  function refreshBoardHighlights() {
    const grid = getCurrentGrid();
    const total = state.size * state.size;
    for (let i = 0; i < total; i++) {
      const r = Math.floor(i / state.size), c = i % state.size;
      const { error, same } = getConflicts(grid, r, c);
      const val = grid[r][c];
      updateCellUI(i, val !== null ? String(val) : "", error, same.length > 0);
    }
  }

  function isComplete() {
    const grid = getCurrentGrid();
    for (let r = 0; r < state.size; r++) {
      for (let c = 0; c < state.size; c++) {
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
    const { size, boxRows, boxCols } = state;
    boardEl.innerHTML = "";
    boardEl.className = "board board-" + size;
    boardEl.style.gridTemplateColumns = "repeat(" + size + ", 1fr)";
    boardEl.style.gridTemplateRows = "repeat(" + size + ", 1fr)";
    state.cells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement("div");
        cell.className = "cell";
        const edgeRight = (c + 1) % boxCols === 0;
        const edgeBottom = (r + 1) % boxRows === 0;
        if (edgeRight) cell.classList.add("cell-edge-r");
        if (edgeBottom) cell.classList.add("cell-edge-b");
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

  function updateNumberPad() {
    const size = state.size;
    const buttons = numberPadEl.querySelectorAll(".num-btn[data-num]");
    buttons.forEach((btn) => {
      const num = parseInt(btn.dataset.num, 10);
      if (num === 0) {
        btn.style.display = ""; // Clear always visible
        return;
      }
      btn.style.display = num <= size ? "" : "none";
    });
    numberPadEl.style.gridTemplateColumns = size <= 4 ? "repeat(3, 1fr)" : "repeat(5, 1fr)";
  }

  function selectCell(r, c) {
    if (state.given[r][c]) return;
    state.cells.forEach((cell) => cell.classList.remove("selected"));
    state.selectedCell = { r, c };
    state.cells[flatIndex(r, c)].classList.add("selected");
  }

  function findNextSelectableCell(r, c, direction) {
    const size = state.size;
    if (direction === "up") {
      for (let nr = r - 1; nr >= 0; nr--) if (!state.given[nr][c]) return { r: nr, c };
    } else if (direction === "down") {
      for (let nr = r + 1; nr < size; nr++) if (!state.given[nr][c]) return { r: nr, c };
    } else if (direction === "left") {
      for (let nc = c - 1; nc >= 0; nc--) if (!state.given[r][nc]) return { r, c: nc };
    } else if (direction === "right") {
      for (let nc = c + 1; nc < size; nc++) if (!state.given[r][nc]) return { r, c: nc };
    }
    return null;
  }

  function setCellValue(r, c, num) {
    if (state.given[r][c]) return;
    const maxNum = state.size;
    if (num !== 0 && (num < 1 || num > maxNum)) return;
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
    const config = LEVEL_CONFIG[level];
    state.size = config.size;
    state.boxRows = config.boxRows;
    state.boxCols = config.boxCols;
    state.checkBox = config.checkBox;
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
    updateNumberPad();
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

  numberPadEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".num-btn");
    if (!btn || !state.selectedCell) return;
    const num = parseInt(btn.dataset.num, 10);
    setCellValue(state.selectedCell.r, state.selectedCell.c, num);
  });

  document.addEventListener("keydown", (e) => {
    if (!state.selectedCell) return;
    const r = state.selectedCell.r, c = state.selectedCell.c;
    const maxNum = state.size;
    if (e.key >= "1" && e.key <= "9") {
      const n = parseInt(e.key, 10);
      if (n <= maxNum) setCellValue(r, c, n);
      e.preventDefault();
    } else if (e.key === "Backspace" || e.key === "Delete") {
      setCellValue(r, c, 0);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      const next = findNextSelectableCell(r, c, "up");
      if (next) selectCell(next.r, next.c);
      e.preventDefault();
    } else if (e.key === "ArrowDown") {
      const next = findNextSelectableCell(r, c, "down");
      if (next) selectCell(next.r, next.c);
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      const next = findNextSelectableCell(r, c, "left");
      if (next) selectCell(next.r, next.c);
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      const next = findNextSelectableCell(r, c, "right");
      if (next) selectCell(next.r, next.c);
      e.preventDefault();
    }
  });
})();
