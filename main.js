import './style.css'
import './node_modules/bootstrap/dist/css/bootstrap.css'
import './node_modules/bootstrap/dist/js/bootstrap.bundle'

const testConfigs = {
  noOverlay: true,
};

let currentPlayerX = true;
let gameOver = false;

function changeCurrPlayer() {
  currentPlayerX = !currentPlayerX;
}

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

const main = $('main')[0];
const boxHeight = '12vw';

//  has to be in seconds
const winAnimationDuration = '0.4s';
const winBoxDelay = '1s';

const winHandler = (function () {
  function processResizeListener(argFunction) {
    function createTimeoutCaller(argFunc) {
      let timeout = null;
      function callArgFunction() {
        if (timeout != null) {
          return;
        }
        setTimeout(() => {
          argFunc();
          timeout = null;
        }, 50);
      }
      return callArgFunction;
    }

    const timedArgFunction = createTimeoutCaller(argFunction);
    window.addEventListener('resize', timedArgFunction);

    timedArgFunction();
  }
  function horizontalHandler(ind) {
    /** Returns Number value */
    function calculateLeft() {
      return 50 - 1.25 * Number.parseInt(boxHeight, 3);
    }

    const bar = $('#horizontalWin')[0];
    bar.style.display = 'block';

    function alignHorizontalBar() {
      bar.style.setProperty('top', `calc(50% - ${Number.parseInt(boxHeight, 3) * (1 - ind)}vw )`, 'important')
      bar.style.setProperty('left', `${calculateLeft()}vw`, 'important');
    }

    processResizeListener(alignHorizontalBar);
  }

  function verticalHandler(ind) {
    const bar = $('#verticalWin')[0];
    bar.style.display = 'block';
    const mainCenter = main.offsetWidth / 2;
    const mainCenterVw = converter.inVw(mainCenter);

    const currPosition = mainCenterVw - (1 - ind) * Number.parseInt(boxHeight, 3);
    bar.style.setProperty('left', `${currPosition}vw`, 'important');
    // let boxHeightpx = converter.vwToPx(Number.parseInt(boxHeight))

    bar.style.setProperty('top',`calc(50% - ${Number.parseInt(boxHeight, 3) * 1.25}vw)`,'important')
  }

  function mainDiagonalHandler(){
    function calculateTop(){
      let boardCenter = main.offsetHeight/2   
      let val =boardCenter  -1.25* converter.vwToPx(Number.parseInt(boxHeight))
      console.log({val})
      return val
    }

    function calculateLeft(){
      let boardCenter = main.offsetWidth/2
      let val = boardCenter - 1.5 * converter.vwToPx(Number.parseInt(boxHeight))
      console.log({val})
      return val
    }
    console.log(calculateTop(),'calculateTop')

    let bar=$('#mainDiagonalWin')[0]
    bar.style.display='block'

    bar.style.setProperty('left',`calc(50% - ${Number.parseInt(boxHeight)*1.5}vw)`,'important')
    bar.style.setProperty('top',`calc(50% - ${Number.parseInt(boxHeight)*1.25}vw)`,'important')
  }

  function check(data){
    let win = false
    data.forEach((row,ind)=>{
      //check row win
      if (!row.includes('') && row.every((elem)=>{return elem==row[0]})){
        console.log('win by row')
        horizontalHandler(ind)
        win =  true
        return true;
      }

      //column win
      if (data.every((row)=>row[ind]!='' && row[ind]===data[0][ind])){
        console.log('win by column')
        verticalHandler(ind)

        win = true
      }
    })

    //win by main diaglonal
    if(data.every((row,i)=>row[i]!='' && row[i]==data[0][0])){
      mainDiagonalHandler()
      win= true
    }

    //win by second diaglonal
    if(data.every((row,i)=> row[2-i]!='' && row[2-i]===data[0][2])){
      console.log('win by second diagonal')
      win= true
    }

    if(win){
      console.log('------------------------------------------')
      gameOver = true
    }
    return win;
  }

  function handle(){

    //Leave time for winBarAnimation
    setTimeout(winBox.show,Number.parseInt(winAnimationDuration)+Number.parseInt(winBoxDelay)*1000)

    if(currentPlayerX){
      winBox.setText('Player X won the game')
    }else{
      winBox.setText('Player O won the game')
    }
  }




  return {horizontalHandler,verticalHandler,check,handle}
}())

let overlay= (function(){
  let elem = $('.overlay')[0]

  /**Shows the darkoverlay if testConfig.noOverlay is false */
  function show(){
    elem.style.display=testConfigs.noOverlay ? 'none' : 'block'
  }
  return {show}
}())

let winBox = (function() {
  const winBoxElem = $('.win')[0];
  const winText = $('.win > p')[0];


  function show(){

    winBoxElem.style.display='block'
    winBoxElem.style.height='fit-content'
    let realHeight = window.getComputedStyle(winBoxElem).height
    winBoxElem.style.height='1px'

    //animation duration in seconds
    let animationDuration=0.5
    winBoxElem.style.transition='all '+animationDuration+'s'
    
    // let intervalCaller = setInterval(()=>{
    //   moveListeners.forEach((listener)=>{
    //     console.log('each listener is being called')
    //     listener()
    //   })
    // },1)

    // //Stop interval call once animation is finished
    // setTimeout(()=>{
    //   clearInterval(intervalCaller)
    // },animationDuration*1000)

    setTimeout(()=>{
      winBoxElem.style.height=realHeight
      winBoxElem.style.opacity='100%'
    },200)

    console.log(realHeight)
    overlay.show()
  }

  function setText(text){
      winText.textContent=text
  }

  return {show,setText}
}())

const board = (function() {
  let data= new Array(3)



  for(let i =0; i<=2;i++){
    data[i]= new Array(3).fill('')
  }

  /**Used to print values of objects */
  function parse(dict){
    return JSON.parse(JSON.stringify(dict))
  }
  function drawInitial() {
    let board = $('main')[0]
    const borderColor='#747474'

    //height and width of the boxes
    
   $(':root')[0].style.setProperty('--height',boxHeight);
    $(':root')[0].style.setProperty('--winAnimationDuration',winAnimationDuration);

    for (let i =0 ; i<=2;i++) {
      let rowElemStart =`<div class='d-flex' data-row-id=${i}>`
      let rowElemEnd ='</div>'
      let boardInsert=''
      boardInsert+=rowElemStart

      let rowBorders=['border-bottom','','border-top']
      for (let j =0;j<=2;j++){
        let columnBorders =['border-end','','border-start']
        let columnElem = `<div class="box ${columnBorders[j]} ${rowBorders[i]} border-3 icon d-flex align-items-center justify-content-center" data-id-row=${i} data-id-col=${j} style='--bs-border-color:${borderColor}'></div>`
        boardInsert+=columnElem
      }
      boardInsert+=rowElemEnd
      board.insertAdjacentHTML("beforeend",boardInsert)
    }

  }

  function alreadySet(row,col){
    if (data[row][col]!=""){
      return true
    }
    return false
  }
  function boardFilled(){
    return data.every((row)=>{
      return row.every((val)=>{
        return val!=""
      })
    })
  }


  function changeData(row,col){
    if(currentPlayerX){
      data[row][col]="X"
    }else{
      data[row][col]="O"
    }
  }

  function drawClick(elem){
    if(currentPlayerX){
      elem.textContent="X"
      elem.classList.add("playerX")
    }else{
      elem.textContent="O"
      elem.classList.add("playerO")
    }
  }

  function handleClick(row,col){
    if (alreadySet(row,col)|| gameOver){
      return
    }
    changeCurrPlayer()

    let elem = $(`div[data-id-row="${row}"][data-id-col="${col}"]`)[0]
    drawClick(elem)
    changeData(row,col)
    if(winHandler.check(data)){
      winHandler.handle()
      return
    }
    if(boardFilled()){
      winBox.show()
      winBox.setText("Draw")
    }

  }


  return {drawInitial,handleClick}
}())



board.drawInitial()



function clickCallback(e){
  let row = this.getAttribute("data-id-row")
  let col = this.getAttribute("data-id-col")
  board.handleClick(row,col)

}



$(".box").forEach(function(elem){
  elem.addEventListener("click",clickCallback)
})

$("button")[0].addEventListener("click",function(){
  window.location.reload()
})