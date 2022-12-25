import './style.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle';

const testConfigs = {
  noOverlay: true,
};

let currentPlayerX = false;
let gameOver = false;

const converter = {
  inVw(width) {
    return (width / (window.innerWidth / 100));
  },
  inVh(height) {
    return (height / (window.innerHeight / 100));
  },
  vwToPx(vws) {
    return (vws / 100) * window.innerWidth;
  },
  vwToVh(vws) {
    return this.inVh(this.vwToPx(vws));
  },
};

function $(elem) {
  return document.querySelectorAll(elem);
}

function changeCurrPlayer() {
  currentPlayerX = !currentPlayerX;
  $('span#currentPlayer')[0].textContent = currentPlayerX ? 'X' : 'O';
}

const main = $('main')[0];
const boxHeight = '12vw';

//  has to be in seconds
const winAnimationDuration = '0.4s';
const winBoxDelay = '1s';

const overlay = (function () {
  const elem = $('.overlay')[0];

  /** Shows the darkoverlay if testConfig.noOverlay is false */
  function show() {
    elem.style.display = testConfigs.noOverlay ? 'none' : 'block';
  }
  return { show };
}());

const scoreBoard = (function () {
  const playerX = $('.player-x-scoreboard')[0];
  const playerO = $('.player-o-scoreboard')[0];
  const playerXName = playerX.querySelector('.playerX.name');
  const playerOName = playerO.querySelector('.playerO.name');

  function playAgainBtnCallback() {
    board.reset();
    reset();
  }

  function expand() {
    const oBoard = scoreBoard.playerO;
    const xBoard = scoreBoard.playerX;
    const { left } = oBoard.getBoundingClientRect();
    const { right } = xBoard.getBoundingClientRect();

    const expandableDiv = currentPlayerX ? playerXName : playerOName;

    // To animate
    const currentWidth = Number.parseFloat(window.getComputedStyle(expandableDiv).width);
    expandableDiv.style.width = `${currentWidth}px`;
    const transitionTimeSeconds = '3';
    expandableDiv.style.transition = `all ${transitionTimeSeconds}s`;
    // addBtn();

    setTimeout(() => {
      expandableDiv.style.position = 'absolute';

      if (currentPlayerX) {
        expandableDiv.style.right = `${window.innerWidth - right}px`;
      } else {
        expandableDiv.style.left = `${left}px`;
      }
      expandableDiv.style.width = `${right - left}px`;

      const textElem = expandableDiv.querySelector('p');
      setTimeout(() => {
        textElem.textContent = currentPlayerX ? 'Player X won' : 'Player O won';
      }, (transitionTimeSeconds * 1000) / 2);
      // addBtn();
      const btn = $('.btn-playAgain');
      btn.addEventListener('click', playAgainBtnCallback);
    }, 500);
  }

  function handleWin() {
    expand();
    const btn = $('.btn-playAgain')[0];
    btn.addEventListener('click', playAgainBtnCallback);
  }

  function animateWin() {
    expand();
  }

  function reset() {
    const expandableDiv = currentPlayerX ? playerXName : playerOName;
    expandableDiv.style.removeProperty('position');
    expandableDiv.style.removeProperty('left');
    expandableDiv.style.removeProperty('width');

    const textElem = expandableDiv.querySelector('p');
    textElem.textContent = currentPlayerX ? 'Player X' : 'Player O';
  }

  return {
    playerX, playerO, playerOName, playerXName, expand,
  };
}());

const winBox = (function () {
  const winBoxElem = $('.win')[0];
  const winText = $('.win > p')[0];

  function show(draw) {
    winBoxElem.style.display = 'block';
    winBoxElem.style.height = 'fit-content';
    const realHeight = window.getComputedStyle(winBoxElem).height;
    winBoxElem.style.height = '1px';

    // animation duration in seconds
    const animationDuration = 0.5;
    winBoxElem.style.transition = `all ${animationDuration}s`;
    const playAgainBtn = winBoxElem.querySelector('button.btn');

    if (draw) {
      winBoxElem.style.background = 'var(--draw-color)';
      playAgainBtn.style.setProperty('background-color', 'var(--draw-btn-color)', 'important');
    } else if (currentPlayerX) {
      winBoxElem.style.background = 'var(--player-x-color)';
      playAgainBtn.style.setProperty('background-color', 'var(--player-x-btn-color)', 'important');
    } else {
      winBoxElem.style.background = 'var(--player-o-color)';
      playAgainBtn.style.setProperty('background-color', 'var(--player-o-btn-color)', 'important');
    }

    setTimeout(() => {
      winBoxElem.style.height = realHeight;
      winBoxElem.style.opacity = '100%';
    }, 200);

    overlay.show();
  }

  function hide() {
    winBoxElem.style.setProperty('display', 'none', 'important');
  }

  function setText(text) {
    winText.textContent = text;
  }

  return { show, setText, hide };
}());

const winHandler = (function () {
  function horizontalHandler(ind) {
    /** Returns Number value */
    function calculateLeft() {
      return 50 - 1.25 * Number.parseInt(boxHeight, 10);
    }

    const bar = $('#horizontalWin')[0];

    function alignHorizontalBar() {
      bar.style.setProperty('top', `calc(50% - ${Number.parseInt(boxHeight, 10) * (1 - ind)}vw )`, 'important');
      bar.style.setProperty('left', `${calculateLeft()}vw`, 'important');
    }
    alignHorizontalBar();
    bar.style.display = 'block';
  }

  function setWinBarColor() {
    const bars = $('.winbar');
    bars.forEach((bar) => {
      if (currentPlayerX) {
        bar.style.background = 'var(--player-x-color)';
      } else {
        bar.style.background = 'var(--player-o-color)';
      }
    });
  }

  function verticalHandler(ind) {
    const bar = $('#verticalWin')[0];
    const mainCenter = main.offsetWidth / 2;
    const mainCenterVw = converter.inVw(mainCenter);

    const currPosition = mainCenterVw - (1 - ind) * Number.parseInt(boxHeight, 10);
    bar.style.setProperty('left', `${currPosition}vw`, 'important');
    // let boxHeightpx = converter.vwToPx(Number.parseInt(boxHeight, 10))
    bar.style.setProperty('top', `calc(50% - ${Number.parseInt(boxHeight, 10) * 1.25}vw)`, 'important');
    bar.style.display = 'block';
  }

  function mainDiagonalHandler() {
    const bar = $('#mainDiagonalWin')[0];
    bar.style.setProperty('left', `calc(50% - ${Number.parseInt(boxHeight, 10) * 1.5}vw)`, 'important');
    bar.style.setProperty('top', `calc(50% - ${Number.parseInt(boxHeight, 10) * 1.25}vw)`, 'important');
    bar.style.display = 'block';
  }

  function secondDiagonalHandler() {
    const bar = $('#secondDiagonalWin')[0];
    bar.style.setProperty('left', `calc(50% + ${Number.parseInt(boxHeight, 10) * 1}vw)`, 'important');
    bar.style.setProperty('top', `calc(50% - ${Number.parseInt(boxHeight, 10) * 1.25}vw)`, 'important');
    bar.style.display = 'block';
  }
  // secondDiagonalHandler();

  function check(data) {
    let win = false;
    data.forEach((row, ind) => {
      //  We don't want to return true in each cases because a win might be in two scenerios at once

      // check row win
      if (!row.includes('') && row.every((elem) => elem === row[0])) {
        horizontalHandler(ind);
        win = true;
      }

      // column win
      if (data.every((row_) => row_[ind] !== '' && row_[ind] === data[0][ind])) {
        verticalHandler(ind);

        win = true;
      }
    });

    // win by main diaglonal
    if (data.every((row, i) => row[i] !== '' && row[i] === data[0][0])) {
      mainDiagonalHandler();
      win = true;
    }

    // win by second diaglonal
    if (data.every((row, i) => row[2 - i] !== '' && row[2 - i] === data[0][2])) {
      secondDiagonalHandler();
      win = true;
    }

    if (win) {
      console.log('------------------------------------------');
      gameOver = true;
    }
    return win;
  }

  function handle() {
    // Leave time for winBarAnimation
    // setTimeout(winBox.show, Number.parseInt(winAnimationDuration, 10)
    //  + Number.parseInt(winBoxDelay, 10) * 1000);

    if (currentPlayerX) {
      winBox.setText('Player X won the game');
      const playerXScore = $('.playerX.score')[0];
      playerXScore.textContent = Number.parseInt(playerXScore.textContent, 10) + 1;
    } else {
      winBox.setText('Player O won the game');
      const playerOScore = $('.playerO.score')[0];
      playerOScore.textContent = Number.parseInt(playerOScore.textContent, 10) + 1;
    }

    setWinBarColor();
    scoreBoard.expand();
  }

  return {
    horizontalHandler, verticalHandler, check, handle,
  };
}());

const board = (function () {
  const data = new Array(3);

  function resetBoardData() {
    for (let i = 0; i <= 2; i++) {
      data[i] = new Array(3).fill('');
    }
  }

  /** Used to print values of objects */
  // function parse(dict) {
  //   return JSON.parse(JSON.stringify(dict));
  // }
  function drawInitial() {
    const boardElem = $('main')[0];
    const borderColor = '#747474';

    resetBoardData();

    // height and width of the boxes
    $(':root')[0].style.setProperty('--height', boxHeight);

    $(':root')[0].style.setProperty('--winAnimationDuration', winAnimationDuration);

    for (let i = 0; i <= 2; i++) {
      const rowElemStart = `<div class='d-flex' data-row-id=${i}>`;
      const rowElemEnd = '</div>';
      let boardInsert = '';
      boardInsert += rowElemStart;

      const rowBorders = ['border-bottom', '', 'border-top'];
      for (let j = 0; j <= 2; j++) {
        const columnBorders = ['border-end', '', 'border-start'];
        const columnElem = `<div class="box ${columnBorders[j]} ${rowBorders[i]} border-3 icon d-flex align-items-center justify-content-center" data-id-row=${i} data-id-col=${j} style='--bs-border-color:${borderColor}'></div>`;
        boardInsert += columnElem;
      }
      boardInsert += rowElemEnd;
      boardElem.insertAdjacentHTML('beforeend', boardInsert);
    }
  }

  function reset() {
    resetBoardData();
    winBox.hide();
    const winBars = $('.winbar');
    winBars.forEach((bar) => { bar.style.display = 'none'; });
    const boxes = $('.box');
    boxes.forEach((box) => {
      box.classList.remove('playerX');
      box.classList.remove('playerO');
      box.textContent = '';
    });
    gameOver = false;
  }

  function alreadySet(row, col) {
    if (data[row][col] !== '') {
      console.log('already set on ', row, col);
      return true;
    }
    return false;
  }
  function boardFilled() {
    return data.every((row) => row.every((val) => val !== ''));
  }

  function changeData(row, col) {
    if (currentPlayerX) {
      data[row][col] = 'X';
    } else {
      data[row][col] = 'O';
    }
  }

  function drawClick(elem) {
    if (currentPlayerX) {
      elem.textContent = 'X';
      elem.classList.add('playerX');
    } else {
      elem.textContent = 'O';
      elem.classList.add('playerO');
    }
  }

  function handleClick(row, col) {
    if (alreadySet(row, col) || gameOver) {
      return;
    }

    const elem = $(`div[data-id-row="${row}"][data-id-col="${col}"]`)[0];
    drawClick(elem);
    changeData(row, col);
    if (winHandler.check(data)) {
      winHandler.handle();
      return;
    }
    if (boardFilled()) {
      winBox.show(true);
      winBox.setText('Draw');
    }

    changeCurrPlayer();
  }

  return { drawInitial, handleClick, reset };
}());

board.drawInitial();

function clickCallback() {
  const row = this.getAttribute('data-id-row');
  const col = this.getAttribute('data-id-col');
  board.handleClick(row, col);
}

$('.box').forEach((elem) => {
  elem.addEventListener('click', clickCallback);
});

$('button')[0].addEventListener('click', () => {
  // window.location.reload();
  board.reset();
});
