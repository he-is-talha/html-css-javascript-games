(function () {
  "use strict";

  const SUITS = ["♠", "♥", "♦", "♣"];
  const SUIT_NAMES = ["spades", "hearts", "diamonds", "clubs"];
  const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]; // A=1, J=11, Q=12, K=13
  const RANK_DISPLAY = { 1: "A", 10: "10", 11: "J", 12: "Q", 13: "K" };

  const DIFFICULTY = {
    easy: { drawCount: 1, undos: -1, hints: true },
    medium: { drawCount: 1, undos: 5, hints: true },
    hard: { drawCount: 3, undos: 0, hints: false },
  };

  let state = {
    level: "easy",
    tableau: [[], [], [], [], [], [], []],
    foundations: [[], [], [], []],
    stock: [],
    waste: [],
    drawCount: 1,
    undosLeft: -1,
    undoStack: [],
    selectedCard: null,
    selectedFrom: null,
    wasteRevealIndex: 0,
  };

  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => el.querySelectorAll(sel);

  function isRed(suitIndex) {
    return suitIndex === 1 || suitIndex === 2;
  }

  function createDeck() {
    const deck = [];
    for (let s = 0; s < 4; s++) {
      for (let r of RANKS) {
        deck.push({ suit: s, rank: r, faceUp: false });
      }
    }
    return shuffle(deck);
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function deal() {
    const deck = createDeck();
    state.tableau = [[], [], [], [], [], [], []];
    state.foundations = [[], [], [], []];
    state.stock = [];
    state.waste = [];
    state.undoStack = [];
    state.selectedCard = null;
    state.selectedFrom = null;
    state.wasteRevealIndex = 0;

    const cfg = DIFFICULTY[state.level];
    state.drawCount = cfg.drawCount;
    state.undosLeft = cfg.undos === -1 ? 999 : cfg.undos;

    let idx = 0;
    for (let col = 0; col < 7; col++) {
      for (let i = 0; i <= col; i++) {
        const card = deck[idx++];
        card.faceUp = i === col;
        state.tableau[col].push(card);
      }
    }
    while (idx < 52) state.stock.push(deck[idx++]);
  }

  function cardEl(card, opts = {}) {
    const div = document.createElement("div");
    div.className = "card-wrapper";
    const inner = document.createElement("div");
    inner.className = "card " + (card.faceUp ? "face-up" : "face-down") + " " + (isRed(card.suit) ? "red" : "black");
    inner.dataset.suit = card.suit;
    inner.dataset.rank = card.rank;
    if (opts.draggable) {
      inner.draggable = true;
      inner.addEventListener("dragstart", handleDragStart);
      inner.addEventListener("dragend", handleDragEnd);
    }
    inner.addEventListener("click", (e) => handleCardClick(e, card, opts.from));
    const rankStr = card.faceUp ? (RANK_DISPLAY[card.rank] || String(card.rank)) : "";
    const suitStr = card.faceUp ? SUITS[card.suit] : "";
    const cornerTL = document.createElement("span");
    cornerTL.className = "card-corner card-corner-tl";
    cornerTL.innerHTML = `<span class="card-rank">${rankStr}</span><span class="card-suit">${suitStr}</span>`;
    const cornerBR = document.createElement("span");
    cornerBR.className = "card-corner card-corner-br";
    cornerBR.setAttribute("aria-hidden", "true");
    cornerBR.innerHTML = `<span class="card-rank">${rankStr}</span><span class="card-suit">${suitStr}</span>`;
    inner.appendChild(cornerTL);
    inner.appendChild(cornerBR);
    div.appendChild(inner);
    div._card = card;
    return div;
  }

  function render() {
    const foundationsEl = $("#foundations");
    const tableauEl = $("#tableau");
    const stockEl = $("#stock");
    const wasteEl = $("#waste");

    foundationsEl.innerHTML = "";
    for (let i = 0; i < 4; i++) {
      const slot = document.createElement("div");
      slot.className = "foundation-slot";
      slot.dataset.index = i;
      slot.addEventListener("click", () => handleFoundationClick(i));
      const pile = state.foundations[i];
      if (pile.length > 0) {
        const top = pile[pile.length - 1];
        slot.appendChild(cardEl(top, { from: { type: "foundation", index: i }, draggable: true }));
      }
      foundationsEl.appendChild(slot);
    }

    tableauEl.innerHTML = "";
    for (let c = 0; c < 7; c++) {
      const colEl = document.createElement("div");
      colEl.className = "tableau-column";
      colEl.dataset.column = c;
      colEl.addEventListener("click", (e) => {
        if (!state.selectedCard || e.target.closest(".card")) return;
        const colIdx = parseInt(colEl.dataset.column, 10);
        const to = { type: "tableau", column: colIdx };
        if (doMove(state.selectedFrom, state.selectedCard, to)) {
          state.selectedCard = null;
          state.selectedFrom = null;
          render();
          updateUndoButton();
          checkWin();
        }
      });
      const col = state.tableau[c];
      col.forEach((card, i) => {
        const wrapper = cardEl(card, {
          from: { type: "tableau", column: c, index: i },
          draggable: card.faceUp,
        });
        colEl.appendChild(wrapper);
      });
      tableauEl.appendChild(colEl);
    }

    stockEl.innerHTML = "";
    if (state.stock.length > 0) {
      const back = document.createElement("div");
      back.className = "card-wrapper";
      const inner = document.createElement("div");
      inner.className = "card face-down";
      inner.textContent = "";
      back.appendChild(inner);
      stockEl.appendChild(back);
      stockEl.onclick = drawFromStock;
    }

    wasteEl.innerHTML = "";
    const wasteCards = state.waste.slice(state.wasteRevealIndex);
    wasteCards.forEach((card, i) => {
      const wrapper = cardEl(card, {
        from: { type: "waste", index: state.waste.length - 1 - i },
        draggable: true,
      });
      wasteEl.appendChild(wrapper);
    });
  }

  function drawFromStock() {
    if (state.stock.length === 0) {
      state.stock = state.waste.reverse();
      state.waste = [];
      state.wasteRevealIndex = 0;
      pushUndo({ type: "recycle" });
    } else {
      const count = Math.min(state.drawCount, state.stock.length);
      const drawn = state.stock.splice(-count);
      drawn.forEach(c => (c.faceUp = true));
      state.waste.push(...drawn);
      state.wasteRevealIndex = Math.max(0, state.waste.length - state.drawCount);
      pushUndo({ type: "draw", cards: drawn });
    }
    render();
  }

  function pushUndo(entry) {
    state.undoStack.push(entry);
    if (state.undosLeft !== 999) state.undosLeft = Math.max(0, state.undosLeft - 1);
  }

  function undo() {
    if (state.undoStack.length === 0) return;
    const entry = state.undoStack.pop();
    if (!entry) return;
    if (state.undosLeft !== 999) state.undosLeft++;
    if (entry.type === "draw") {
      const cards = entry.cards;
      state.waste.splice(state.waste.length - cards.length, cards.length);
      cards.reverse().forEach(c => (c.faceUp = false));
      state.stock.push(...cards);
      state.wasteRevealIndex = Math.max(0, state.waste.length - state.drawCount);
    } else if (entry.type === "recycle") {
      const cards = state.stock.splice(0);
      cards.forEach(c => (c.faceUp = true));
      state.waste = cards.reverse();
      state.wasteRevealIndex = Math.max(0, state.waste.length - state.drawCount);
    } else if (entry.type === "move") {
      const { from, to, cards: cardCount } = entry;
      let moved = [];
      if (to.type === "foundation") {
        moved = state.foundations[to.index].splice(-1);
      } else {
        moved = state.tableau[to.column].splice(-cardCount);
      }
      if (from.type === "foundation") {
        state.foundations[from.index].push(...moved);
      } else if (from.type === "waste") {
        state.waste.push(...moved);
      } else {
        state.tableau[from.column].splice(from.index, 0, ...moved);
        const col = state.tableau[from.column];
        if (col.length > 0 && !col[col.length - 1].faceUp) col[col.length - 1].faceUp = true;
      }
    }
    render();
    updateUndoButton();
  }

  function canPlaceOnFoundation(card, foundIndex) {
    const pile = state.foundations[foundIndex];
    if (pile.length === 0) return card.rank === 1;
    const top = pile[pile.length - 1];
    return top.suit === card.suit && top.rank === card.rank - 1;
  }

  function canPlaceOnTableau(card, colIndex) {
    const col = state.tableau[colIndex];
    if (col.length === 0) return card.rank === 13;
    const top = col[col.length - 1];
    return top.faceUp && isRed(card.suit) !== isRed(top.suit) && top.rank === card.rank + 1;
  }

  function getTopCard(from) {
    if (from.type === "foundation") {
      const pile = state.foundations[from.index];
      return pile.length > 0 ? pile[pile.length - 1] : null;
    }
    if (from.type === "tableau") {
      const col = state.tableau[from.column];
      return col.length > 0 ? col[col.length - 1] : null;
    }
    if (from.type === "waste") return state.waste.length > 0 ? state.waste[state.waste.length - 1] : null;
    return null;
  }

  function getCardsToMove(from, card) {
    if (from.type === "foundation" || from.type === "waste") return [card];
    const col = state.tableau[from.column];
    const idx = col.findIndex(c => c === card);
    if (idx === -1) return [];
    return col.slice(idx);
  }

  function moveCards(from, cards, to) {
    if (to.type === "foundation") {
      if (cards.length !== 1) return false;
      if (!canPlaceOnFoundation(cards[0], to.index)) return false;
      removeCardsFrom(from, cards);
      state.foundations[to.index].push(cards[0]);
    } else {
      const col = state.tableau[to.column];
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const canPlace = col.length === 0 ? card.rank === 13 : (col[col.length - 1].faceUp && isRed(card.suit) !== isRed(col[col.length - 1].suit) && col[col.length - 1].rank === card.rank + 1);
        if (!canPlace) return false;
        removeCardsFrom(i === 0 ? from : null, [card]);
        if (i === 0 && from.type === "tableau") {
          state.tableau[from.column].splice(state.tableau[from.column].indexOf(card), 1);
        }
        col.push(card);
      }
      if (from.type === "tableau") {
        const colFrom = state.tableau[from.column];
        const startIdx = colFrom.indexOf(cards[0]);
        colFrom.splice(startIdx, cards.length);
        if (colFrom.length > 0 && !colFrom[colFrom.length - 1].faceUp) colFrom[colFrom.length - 1].faceUp = true;
      }
    }
    pushUndo({ type: "move", from: JSON.parse(JSON.stringify(from)), to: JSON.parse(JSON.stringify(to)), cards: cards.length });
    return true;
  }

  function removeCardsFrom(from, cards) {
    if (!from) return;
    if (from.type === "foundation") state.foundations[from.index].pop();
    else if (from.type === "waste") state.waste.pop();
  }

  function doMove(from, card, to) {
    const cards = getCardsToMove(from, card);
    if (cards.length === 0) return false;
    if (to.type === "foundation") {
      if (cards.length > 1) return false;
      if (!canPlaceOnFoundation(card, to.index)) return false;
      if (from.type === "tableau") state.tableau[from.column].splice(state.tableau[from.column].indexOf(card), 1);
      else if (from.type === "waste") state.waste.pop();
      else if (from.type === "foundation") state.foundations[from.index].pop();
      state.foundations[to.index].push(card);
    } else {
      const col = state.tableau[to.column];
      const valid = col.length === 0 ? card.rank === 13 : (col[col.length - 1].faceUp && isRed(card.suit) !== isRed(col[col.length - 1].suit) && col[col.length - 1].rank === card.rank + 1);
      if (!valid) return false;
      if (from.type === "tableau") {
        const colFrom = state.tableau[from.column];
        const idx = colFrom.indexOf(card);
        const moved = colFrom.splice(idx, colFrom.length - idx);
        moved.forEach(c => col.push(c));
        if (colFrom.length > 0 && !colFrom[colFrom.length - 1].faceUp) colFrom[colFrom.length - 1].faceUp = true;
      } else if (from.type === "waste") {
        state.waste.pop();
        col.push(card);
      } else if (from.type === "foundation") {
        state.foundations[from.index].pop();
        col.push(card);
      }
    }
    pushUndo({ type: "move", from: JSON.parse(JSON.stringify(from)), to: JSON.parse(JSON.stringify(to)), cards: cards.length });
    return true;
  }

  function handleCardClick(e, card, from) {
    e.stopPropagation();
    if (!card.faceUp) return;
    if (state.selectedCard) {
      const destCol = from.type === "tableau" ? from.column : null;
      if (destCol !== null) {
        const to = { type: "tableau", column: destCol };
        if (doMove(state.selectedFrom, state.selectedCard, to)) {
          state.selectedCard = null;
          state.selectedFrom = null;
          render();
          updateUndoButton();
          checkWin();
          return;
        }
      }
      state.selectedCard = null;
      state.selectedFrom = null;
      render();
      return;
    }
    state.selectedCard = card;
    state.selectedFrom = from;
    render();
    const el = document.querySelector(`.card[data-suit="${card.suit}"][data-rank="${card.rank}"]`);
    if (el) el.classList.add("selected");
  }

  function handleFoundationClick(foundIndex) {
    if (!state.selectedCard) return;
    const to = { type: "foundation", index: foundIndex };
    if (doMove(state.selectedFrom, state.selectedCard, to)) {
      state.selectedCard = null;
      state.selectedFrom = null;
      render();
      updateUndoButton();
      checkWin();
    } else {
      state.selectedCard = null;
      state.selectedFrom = null;
      render();
    }
  }

  function findHint() {
    const wasteTop = state.waste.length > 0 ? state.waste[state.waste.length - 1] : null;
    for (let f = 0; f < 4; f++) {
      if (wasteTop && canPlaceOnFoundation(wasteTop, f)) return { from: { type: "waste" }, card: wasteTop };
      const pile = state.foundations[f];
      if (pile.length > 0) {
        const card = pile[pile.length - 1];
        for (let c = 0; c < 7; c++) {
          const col = state.tableau[c];
          if (col.length === 0 && card.rank === 13) continue;
          if (col.length > 0 && col[col.length - 1].faceUp && isRed(card.suit) !== isRed(col[col.length - 1].suit) && col[col.length - 1].rank === card.rank + 1)
            return { from: { type: "foundation", index: f }, card };
        }
      }
    }
    for (let c = 0; c < 7; c++) {
      const col = state.tableau[c];
      for (let i = col.length - 1; i >= 0; i--) {
        if (!col[i].faceUp) break;
        const card = col[i];
        for (let f = 0; f < 4; f++) {
          if (canPlaceOnFoundation(card, f)) return { from: { type: "tableau", column: c, index: i }, card };
        }
        for (let c2 = 0; c2 < 7; c2++) {
          if (c2 === c) continue;
          if (canPlaceOnTableau(card, c2)) return { from: { type: "tableau", column: c, index: i }, card };
        }
      }
    }
    if (wasteTop) {
      for (let c = 0; c < 7; c++) {
        if (canPlaceOnTableau(wasteTop, c)) return { from: { type: "waste" }, card: wasteTop };
      }
    }
    return null;
  }

  function showHint() {
    const hint = findHint();
    if (!hint) return;
    state.selectedCard = hint.card;
    state.selectedFrom = hint.from;
    render();
    const el = document.querySelector(`.card[data-suit="${hint.card.suit}"][data-rank="${hint.card.rank}"]`);
    if (el) {
      el.classList.add("selected", "hint");
      setTimeout(() => el.classList.remove("hint"), 1200);
    }
  }

  let dragSrc = null;

  function handleDragStart(e) {
    const cardEl = e.target.closest(".card");
    if (!cardEl || !cardEl.classList.contains("face-up")) return;
    const suit = parseInt(cardEl.dataset.suit, 10);
    const rank = parseInt(cardEl.dataset.rank, 10);
    let card = null;
    let from = null;
    for (const col of state.tableau) {
      const idx = col.findIndex(c => c.suit === suit && c.rank === rank);
      if (idx !== -1) {
        card = col[idx];
        from = { type: "tableau", column: state.tableau.indexOf(col), index: idx };
        break;
      }
    }
    if (!card && state.waste.length > 0 && state.waste[state.waste.length - 1].suit === suit && state.waste[state.waste.length - 1].rank === rank) {
      card = state.waste[state.waste.length - 1];
      from = { type: "waste" };
    }
    if (!card && state.foundations.some((p, i) => p.length > 0 && p[p.length - 1].suit === suit && p[p.length - 1].rank === rank)) {
      const fi = state.foundations.findIndex(p => p.length > 0 && p[p.length - 1].suit === suit && p[p.length - 1].rank === rank);
      card = state.foundations[fi][state.foundations[fi].length - 1];
      from = { type: "foundation", index: fi };
    }
    if (!card) return;
    dragSrc = { card, from };
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
    cardEl.classList.add("dragging");
  }

  function handleDragEnd(e) {
    e.target.closest(".card")?.classList.remove("dragging");
    dragSrc = null;
  }

  function initDragDrop() {
    $("#tableau").addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });
    $("#tableau").addEventListener("drop", (e) => {
      e.preventDefault();
      if (!dragSrc) return;
      const colEl = e.target.closest(".tableau-column");
      if (!colEl) return;
      const colIdx = parseInt(colEl.dataset.column, 10);
      if (doMove(dragSrc.from, dragSrc.card, { type: "tableau", column: colIdx })) {
        render();
        updateUndoButton();
        checkWin();
      }
      dragSrc = null;
    });
    $("#foundations").addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });
    $("#foundations").addEventListener("drop", (e) => {
      e.preventDefault();
      if (!dragSrc) return;
      const slot = e.target.closest(".foundation-slot");
      if (!slot) return;
      const idx = parseInt(slot.dataset.index, 10);
      if (doMove(dragSrc.from, dragSrc.card, { type: "foundation", index: idx })) {
        render();
        updateUndoButton();
        checkWin();
      }
      dragSrc = null;
    });
  }

  function checkWin() {
    const total = state.foundations.reduce((s, p) => s + p.length, 0);
    if (total === 52) {
      $("#winOverlay").classList.remove("hidden");
    }
  }

  function updateUndoButton() {
    const btn = $("#undoBtn");
    const countEl = $("#undoCount");
    const cfg = DIFFICULTY[state.level];
    if (cfg.undos === 0) {
      btn.style.display = "none";
      return;
    }
    btn.style.display = "";
    btn.disabled = state.undoStack.length === 0 || (state.undosLeft !== 999 && state.undosLeft === 0);
    countEl.textContent = cfg.undos === -1 ? "" : `(${state.undosLeft})`;
  }

  function startGame(level) {
    state.level = level;
    $("#levelScreen").classList.add("hidden");
    $("#gameScreen").classList.remove("hidden");
    $("#levelBadge").textContent = level.charAt(0).toUpperCase() + level.slice(1);
    const cfg = DIFFICULTY[level];
    $("#hintBtn").style.display = cfg.hints ? "" : "none";
    deal();
    render();
    updateUndoButton();
    initDragDrop();
  }

  function goToLevelScreen() {
    $("#gameScreen").classList.add("hidden");
    $("#winOverlay").classList.add("hidden");
    $("#levelScreen").classList.remove("hidden");
  }

  document.addEventListener("DOMContentLoaded", () => {
    $$(".level-btn").forEach((btn) => {
      btn.addEventListener("click", () => startGame(btn.dataset.level));
    });
    $("#newGameBtn").addEventListener("click", () => {
      deal();
      render();
      updateUndoButton();
    });
    $("#changeLevelBtn").addEventListener("click", goToLevelScreen);
    $("#undoBtn").addEventListener("click", undo);
    $("#hintBtn").addEventListener("click", showHint);
    $("#playAgainBtn").addEventListener("click", () => {
      $("#winOverlay").classList.add("hidden");
      deal();
      render();
      updateUndoButton();
    });
    $("#changeLevelFromWinBtn").addEventListener("click", () => {
      $("#winOverlay").classList.add("hidden");
      goToLevelScreen();
    });
  });
})();
