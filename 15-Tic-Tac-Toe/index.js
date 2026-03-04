const boxEls=document.querySelectorAll('.box');
const statusEl=document.querySelector('.status');
const restartBtnEl=document.querySelector('.restartBtn');
let x="<img src='X-Player.png'>";
let o="<img src='O-Player.png'>";

// Total Win Possibilities
const win=[
  [0,1,2],
  [3,4,5],
  [6,7,8],
  [0,3,6],
  [1,4,7],
  [2,5,8],
  [0,4,8],
  [2,4,6]
];

// Initial Condition all the boxes are empty.
let options=["","","","","","","","",""];
// Image of X or O to place in a box.
let currentPlayer=x;
// Text of X or O to place in the status.
let player="X";
let running=false;
init();

// Initially it adds click event to every box. as if we click on any of the box then it calls the boxClick function.
function init(){
  boxEls.forEach(box=>box.addEventListener('click',boxClick));
  restartBtnEl.addEventListener('click',restartGame);
  statusEl.textContent=`Now "${player}" Turn`;
  running=true;
}


function boxClick(e){
    // it takes the index value of the clicked box
  const index=e.target.dataset.index;
    //  if the box is not empty or running is false then it simply returns
  if(options[index]!="" || !running){
    return;
  }
    // otherwise, the box and boxIndex is given as arguments to the updateBox function.
  updateBox(e.target,index);
    // after updating it checks for win condition by calling checkWinner function.
  checkWinner();
}

// update the empty box to a X or O image and also updates the status.
function updateBox(box,index){
  options[index]=player;
  box.innerHTML=currentPlayer;
}

// This function is used to change the player (i.e if player=X then player=O, or If player=O then player=X)
function changePlayer(){
    player=(player=='X') ? "O" :"X";
    currentPlayer=(currentPlayer==x) ? o :x;
    statusEl.textContent=`Now "${player}" Turn`;
    statusEl.style.color = "black"
}

// this function resets all the variable to initial condition.
function restartGame(){
    options=["","","","","","","","",""];
    currentPlayer=x;
    player="X";
    running=true;
    statusEl.textContent=`Now "${player}" Turn`;
    statusEl.style.color = "black"
    restartBtnEl.textContent = "Restart 🔁"
  
    boxEls.forEach(box=>{
        box.innerHTML="";
        box.classList.remove('win');
    });
  }

// Checks winner
function checkWinner(){
  let isWon=false;
    // checks all the possibilities of wins which we have given in an win array.
  for(let i=0;i<win.length;i++){
    const condition=win[i]; 
    const box1=options[condition[0]]; 
    const box2=options[condition[1]]; 
    const box3=options[condition[2]]; 
    if(box1=="" || box2=="" || box3==""){
      continue;
    }
    // if any of win condition is true then this adds win class to that boxes and isWon turns to true.s
    if(box1==box2 && box2==box3){
      isWon=true;
      boxEls[condition[0]].classList.add('win');
      boxEls[condition[1]].classList.add('win');
      boxEls[condition[2]].classList.add('win');
    }
  }

    // if win then this will execute. 
  if(isWon){
    statusEl.textContent=`Hurrah...! "${player}" Won the game🕺`;
    statusEl.style.color = "green"
    restartBtnEl.textContent = "Play Again 😉"
    running=false;
    // if the game is draw then this executes.
  }else if(!options.includes("")){
    statusEl.textContent=`Oops..! Game Draw..!`;
    statusEl.style.color = "red"
    restartBtnEl.textContent = "Play Again 😉"
    running=false;
    // else the player will change to continue the game.
  }else{
    changePlayer();
  }
}