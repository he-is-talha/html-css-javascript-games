const imgEls = document.querySelectorAll("img");
const resultEl = document.querySelector(".result");
const userChoiceEl = document.querySelector(".user-choice");
const computerChoiceEl = document.querySelector(".computer-choice");
const userPointsEl = document.querySelector(".user-points");
const computerPointsEl = document.querySelector(".computer-points");

let userPoints= 0;
let computerPoints = 0;

imgEls.forEach((img) => {
  img.addEventListener("click", () => {
    const computerTurn = computerChoice();
    const result = gamePlay(img.id, computerTurn);
    userChoiceEl.textContent = img.id;
    computerChoiceEl.textContent = computerTurn;
    resultEl.textContent = result;
  });
});

// Computer randomly pick one choice from the given choices
function computerChoice() {
  const choices = ["rock", "paper", "scissor"];
  const randomChoice = Math.floor(Math.random() * choices.length);
  return choices[randomChoice];
}

// it return result by checking user and computer selection
function gamePlay(userSelection, computerSelection) {
  if (userSelection === computerSelection) {
    return "It is a tie..!";
  } else if (
    (userSelection === "rock" && computerSelection === "scissor") ||
    (userSelection === "paper" && computerSelection === "rock") ||
    (userSelection === "scissor" && computerSelection === "paper")
  ) {
    userPoints++;
    userPointsEl.textContent = userPoints;
    return "Hurrah! You win..! " + userSelection + " beats " + computerSelection;
  } else {
    computerPoints++;
    computerPointsEl.textContent = computerPoints;
    return "Oops! You lose...! " + computerSelection + " beats " + userSelection;
  }
}