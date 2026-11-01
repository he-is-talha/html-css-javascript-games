/**
 * Word Search Puzzle Game
 * Vanilla JavaScript Implementation
 */

const GRID_SIZE = 10;

const CATEGORIES = {
  webdev: {
    name: 'Web Development',
    words: ['HTML', 'CSS', 'REACT', 'NODE', 'BROWSER', 'SCRIPT', 'STYLE', 'DOM', 'FLEXBOX', 'ASYNC']
  },
  tech: {
    name: 'Tech & Computing',
    words: ['PYTHON', 'LINUX', 'DOCKER', 'GITHUB', 'SERVER', 'BINARY', 'DATABASE', 'ROUTER', 'CLOUD', 'KERNEL']
  },
  animals: {
    name: 'Animals',
    words: ['TIGER', 'DOLPHIN', 'PENGUIN', 'EAGLE', 'GIRAFFE', 'CHEETAH', 'OCTOPUS', 'PANDA', 'KOALA', 'FALCON']
  },
  space: {
    name: 'Space & Astronomy',
    words: ['GALAXY', 'NEBULA', 'PLANET', 'COMET', 'ORBIT', 'ASTEROID', 'METEOR', 'ECLIPSE', 'COSMOS', 'CRATER']
  }
};

// Game State
let currentCategory = 'webdev';
let activeWords = [];
let grid = [];
let foundWords = new Set();
let isSelecting = false;
let startCell = null;
let currentSelection = [];
let timerInterval = null;
let secondsElapsed = 0;
let score = 0;
let hintsRemaining = 3;
let soundEnabled = true;

// Audio context (Web Audio API synthesizer - no external files needed)
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
    if (type === 'select') {
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'found') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'win') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();
        o.connect(g);
        g.connect(audioCtx.destination);
        o.frequency.setValueAtTime(freq, now + idx * 0.12);
        g.gain.setValueAtTime(0.15, now + idx * 0.12);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.3);
        o.start(now + idx * 0.12);
        o.stop(now + idx * 0.12 + 0.3);
      });
    }
  } catch (e) {
    // Audio context fallback
  }
}

// DOM Elements
const gridEl = document.getElementById('word-grid');
const wordListEl = document.getElementById('word-list');
const foundCountEl = document.getElementById('found-count');
const timerEl = document.getElementById('timer');
const scoreEl = document.getElementById('score');
const categorySelect = document.getElementById('category-select');
const btnNewGame = document.getElementById('btn-new-game');
const btnHint = document.getElementById('btn-hint');
const hintCountEl = document.getElementById('hint-count');
const btnSound = document.getElementById('btn-sound');
const victoryModal = document.getElementById('victory-modal');
const finalTimeEl = document.getElementById('final-time');
const finalScoreEl = document.getElementById('final-score');
const btnPlayAgain = document.getElementById('btn-play-again');

// Grid Generation
function initializeGrid() {
  grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
  activeWords = [...CATEGORIES[currentCategory].words];
  foundWords.clear();
  hintsRemaining = 3;
  hintCountEl.textContent = hintsRemaining;

  // Directions: [rowDelta, colDelta]
  const directions = [
    [0, 1],   // horizontal forward
    [0, -1],  // horizontal backward
    [1, 0],   // vertical downward
    [-1, 0],  // vertical upward
    [1, 1],   // diagonal down-right
    [-1, -1], // diagonal up-left
    [1, -1],  // diagonal down-left
    [-1, 1]   // diagonal up-right
  ];

  // Place each word into the grid
  activeWords.forEach((word) => {
    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 150) {
      attempts++;
      const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
      const startR = Math.floor(Math.random() * GRID_SIZE);
      const startC = Math.floor(Math.random() * GRID_SIZE);

      const endR = startR + (word.length - 1) * dr;
      const endC = startC + (word.length - 1) * dc;

      if (endR >= 0 && endR < GRID_SIZE && endC >= 0 && endC < GRID_SIZE) {
        // Check if word can fit without conflicting existing letters
        let canFit = true;
        for (let i = 0; i < word.length; i++) {
          const r = startR + i * dr;
          const c = startC + i * dc;
          if (grid[r][c] !== '' && grid[r][c] !== word[i]) {
            canFit = false;
            break;
          }
        }

        if (canFit) {
          for (let i = 0; i < word.length; i++) {
            grid[startR + i * dr][startC + i * dc] = word[i];
          }
          placed = true;
        }
      }
    }
  });

  // Fill remaining blanks with random letters A-Z
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === '') {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  renderGrid();
  renderWordList();
  updateStats();
  startTimer();
}

function renderGrid() {
  gridEl.innerHTML = '';
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = document.createElement('div');
      cell.classList.add('grid-cell');
      cell.textContent = grid[r][c];
      cell.dataset.row = r;
      cell.dataset.col = c;
      gridEl.appendChild(cell);
    }
  }
}

function renderWordList() {
  wordListEl.innerHTML = '';
  activeWords.forEach((word) => {
    const li = document.createElement('li');
    li.classList.add('word-item');
    li.dataset.word = word;
    li.textContent = word;
    if (foundWords.has(word)) {
      li.classList.add('found');
    }
    wordListEl.appendChild(li);
  });
}

function updateStats() {
  foundCountEl.textContent = `${foundWords.size} / ${activeWords.length}`;
  scoreEl.textContent = score;
}

// Timer
function startTimer() {
  clearInterval(timerInterval);
  secondsElapsed = 0;
  timerEl.textContent = '00:00';
  timerInterval = setInterval(() => {
    secondsElapsed++;
    const mins = String(Math.floor(secondsElapsed / 60)).padStart(2, '0');
    const secs = String(secondsElapsed % 60).padStart(2, '0');
    timerEl.textContent = `${mins}:${secs}`;
  }, 1000);
}

// Selection & Drag handling
function getLineOfCells(r1, c1, r2, c2) {
  const dr = r2 - r1;
  const dc = c2 - c1;
  const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
  const stepC = dc === 0 ? 0 : dc / Math.abs(dc);

  // Must be strictly horizontal, vertical, or 45-degree diagonal
  if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
    const cells = [];
    const len = Math.max(Math.abs(dr), Math.abs(dc));
    for (let i = 0; i <= len; i++) {
      cells.push({ r: r1 + i * stepR, c: c1 + i * stepC });
    }
    return cells;
  }
  return [];
}

function handleSelectionStart(r, c) {
  isSelecting = true;
  startCell = { r, c };
  updateSelection(r, c);
  playSound('select');
}

function updateSelection(r, c) {
  if (!isSelecting || !startCell) return;
  const cells = getLineOfCells(startCell.r, startCell.c, r, c);
  if (cells.length > 0) {
    clearSelectionStyles();
    currentSelection = cells;
    currentSelection.forEach(({ r: cr, c: cc }) => {
      const cellEl = gridEl.querySelector(`[data-row="${cr}"][data-col="${cc}"]`);
      if (cellEl) cellEl.classList.add('selected');
    });
  }
}

function clearSelectionStyles() {
  gridEl.querySelectorAll('.grid-cell.selected').forEach((el) => el.classList.remove('selected'));
}

function handleSelectionEnd() {
  if (!isSelecting) return;
  isSelecting = false;

  if (currentSelection.length > 0) {
    const formedWord = currentSelection.map(({ r, c }) => grid[r][c]).join('');
    const reversedWord = formedWord.split('').reverse().join('');

    let match = null;
    if (activeWords.includes(formedWord) && !foundWords.has(formedWord)) {
      match = formedWord;
    } else if (activeWords.includes(reversedWord) && !foundWords.has(reversedWord)) {
      match = reversedWord;
    }

    if (match) {
      foundWords.add(match);
      score += match.length * 10 + Math.max(0, 50 - secondsElapsed);
      playSound('found');

      // Mark cells permanently as found
      currentSelection.forEach(({ r, c }) => {
        const cellEl = gridEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        if (cellEl) {
          cellEl.classList.remove('selected');
          cellEl.classList.add('found');
        }
      });

      // Update word list item
      const wordItem = wordListEl.querySelector(`[data-word="${match}"]`);
      if (wordItem) wordItem.classList.add('found');

      updateStats();

      // Check Victory
      if (foundWords.size === activeWords.length) {
        clearInterval(timerInterval);
        setTimeout(showVictory, 400);
      }
    }
  }

  clearSelectionStyles();
  currentSelection = [];
  startCell = null;
}

function showVictory() {
  playSound('win');
  finalTimeEl.textContent = timerEl.textContent;
  finalScoreEl.textContent = score;
  victoryModal.classList.remove('hidden');
}

// Pointer & Touch Events
gridEl.addEventListener('mousedown', (e) => {
  const cell = e.target.closest('.grid-cell');
  if (cell) {
    handleSelectionStart(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
  }
});

gridEl.addEventListener('mouseover', (e) => {
  if (isSelecting) {
    const cell = e.target.closest('.grid-cell');
    if (cell) {
      updateSelection(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
    }
  }
});

window.addEventListener('mouseup', handleSelectionEnd);

// Touch support for mobile devices
gridEl.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  const cell = target ? target.closest('.grid-cell') : null;
  if (cell) {
    handleSelectionStart(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
  }
  e.preventDefault();
}, { passive: false });

gridEl.addEventListener('touchmove', (e) => {
  if (!isSelecting) return;
  const touch = e.touches[0];
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  const cell = target ? target.closest('.grid-cell') : null;
  if (cell) {
    updateSelection(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
  }
  e.preventDefault();
}, { passive: false });

window.addEventListener('touchend', handleSelectionEnd);

// Hints Feature
btnHint.addEventListener('click', () => {
  if (hintsRemaining <= 0) return;
  const remaining = activeWords.filter((w) => !foundWords.has(w));
  if (remaining.length === 0) return;

  const targetWord = remaining[Math.floor(Math.random() * remaining.length)];
  const firstLetter = targetWord[0];

  // Find occurrences of first letter in grid
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === firstLetter) {
        const cellEl = gridEl.querySelector(`[data-row="${r}"][data-col="${c}"]`);
        if (cellEl && !cellEl.classList.contains('found')) {
          cellEl.classList.add('hinted');
          setTimeout(() => cellEl.classList.remove('hinted'), 3000);
          hintsRemaining--;
          hintCountEl.textContent = hintsRemaining;
          return;
        }
      }
    }
  }
});

// Category Switcher
categorySelect.addEventListener('change', (e) => {
  currentCategory = e.target.value;
  score = 0;
  initializeGrid();
});

// New Game & Reset
btnNewGame.addEventListener('click', () => {
  score = 0;
  initializeGrid();
});

btnPlayAgain.addEventListener('click', () => {
  victoryModal.classList.add('hidden');
  score = 0;
  initializeGrid();
});

// Sound Toggle
btnSound.addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  btnSound.innerHTML = soundEnabled
    ? '<i class="fa-solid fa-volume-high"></i>'
    : '<i class="fa-solid fa-volume-xmark"></i>';
});

// Initial boot
initializeGrid();
