# Contributing to HTML CSS JavaScript Games

Thank you for your interest in contributing to this collection of 50 browser-based games! New games and improvements to existing ones are both welcome.

## Getting Started

1. **Fork** this repository
2. **Clone** your fork: `git clone https://github.com/YOUR-USERNAME/html-css-javascript-games.git`
3. Browse the game folders for inspiration or pick an existing game to improve

## How to Contribute

### Adding a New Game

1. Create a new folder: `51-Your-Game-Name/`
2. Include at minimum:
   - `index.html` — Game entry point
   - `style.css` — Game styling
   - `script.js` — Game logic
   - `README.md` — Brief description, controls, and screenshot
3. Keep the game **self-contained** — no external build tools required
4. The game must run by simply opening `index.html` in a browser

### Improving an Existing Game

- Fix bugs or broken mechanics
- Improve responsive design for mobile
- Add keyboard/touch controls
- Enhance visual effects or animations
- Improve accessibility (ARIA labels, focus management)

## Code Style

- Use **vanilla HTML, CSS, and JavaScript** only — no frameworks or build tools
- Keep code **readable** with descriptive variable names
- Add comments for complex game logic
- Use `const` and `let` — avoid `var`
- Keep CSS organized and use meaningful class names

## Pull Request Process

1. Branch naming: `game/your-game-name` or `fix/game-name-bug`
2. One game or fix per PR
3. Test in Chrome, Firefox, and on mobile
4. Include a **screenshot or GIF** of the game in action
5. Update the main README if adding a new game

### Commit Format

- `feat: add word search puzzle game (#51)`
- `fix: correct collision detection in Pac-Man`
- `style: improve Tetris mobile responsiveness`

---

Happy gaming! 🎮