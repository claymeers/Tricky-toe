// handle display change (page show off)
const helpers = (() => {
    const show = (element) => element.classList.remove('off');
    const hide = (element) => element.classList.add('off');

    const fade = (element) => element.classList.remove('active');
    const reveal = (element) => element.classList.add('active');
    return {show, hide, fade, reveal}
})()

// Player object
const Player = (name, marker, score) => {
    return  { name, marker, score}
}

let you , foe, opponent, whoIsNext;
const gamePage = document.querySelector('.game')
const winPage = document.querySelector('.popup')
let board = []; //to check tie!

window.onload = start()

function start() {
    const startPage = document.querySelector('.start')
    const friendBtn = document.querySelector('.friend')
    const aiBtn = document.querySelector('.ai')

    helpers.show(startPage)

    friendBtn.addEventListener('click', () => {
        selectOpponent('friend')     
    })

    aiBtn.addEventListener('click', () => {
        selectOpponent('ai')
    })

    const namePage = document.querySelector('.names')
    const namePageTxt = document.querySelector('.names h2')
    const namePageOpInput = document.querySelector('.names .opponent')
    const namePageInput = document.querySelectorAll('.names input')
    const namePageSubmit = document.querySelector('.names .submit')

    function selectOpponent(btn) {
        opponent = btn 
        helpers.hide(startPage)
        helpers.show(namePage)
        
        switch (btn) {
            case "friend":
                namePageTxt.textContent = "What are your names?";
                break;
            case "ai":
                namePageTxt.textContent = "What is your name?";
                helpers.hide(namePageOpInput)
        }
    }
            
    namePageSubmit.addEventListener('click', () => {
        setPlayer()
    })

    const playerName = document.querySelectorAll('.game .name')
    const playerScore = document.querySelectorAll('.game .score')

    function setPlayer() {
        helpers.hide(namePage)
        helpers.show(gamePage)

        you = Player(namePageInput[0].value, 'x', 0)
        playerName[0].textContent = you.name ? you.name : 'Player 1'
        playerScore[0].textContent = you.score

        switch (opponent) {
            case "friend":
                foe = Player(namePageInput[1].value, 'o', 0)
                playerName[1].textContent = foe.name ? foe.name : 'Player 2'
                playerScore[1].textContent = foe.score
                break;
            case "ai":
                foe = Player('Gamora', 'o', 0)
                playerName[1].textContent = foe.name
                playerScore[1].textContent = foe.score
        }       

        whoIsNext = you
    }
}

const playersScoreboard = document.querySelectorAll('.game .mask')
const tiles = document.querySelectorAll('.square')

tiles.forEach((tile, id) => {
    tile.addEventListener('click', (e) => {
        if(!isGameOver) {
            e.target.textContent = whoIsNext.marker
            board.push(id)
            tile.style.pointerEvents = 'none'
            checkWinner(id)
            handleTurns()

            if (opponent == 'ai') {
                // Doit changer de position pour aller en haut, when online
                for (let i = 0; i < tiles.length; i++) {
                    tiles[i].style.pointerEvents = 'none';
                }
                let randomTimeDelay = ((Math.random() *1500) + 200).toFixed();
                setTimeout(() => {
                    bot()
                    for (let i = 0; i < tiles.length; i++) {
                        tiles[i].style.pointerEvents = 'auto';
                    }
                }, randomTimeDelay)
            }
        }
    })
})

const handleTurns = () => {
    if (!isGameOver) {
        if (whoIsNext == you) {
            whoIsNext = foe
            helpers.fade(playersScoreboard[0])
            helpers.reveal(playersScoreboard[1])
        } else {
            whoIsNext = you
            helpers.fade(playersScoreboard[1])
            helpers.reveal(playersScoreboard[0])
        }
    }
}

const handleScore = () => {
    const playerScore = document.querySelectorAll('.game .score')
    if (whoIsNext == you) {
        playerScore[0].textContent = whoIsNext.score
    } else {
        playerScore[1].textContent = whoIsNext.score
    }
}

function bot() {
    if(!isGameOver) {
        let array = []
        for (let i = 0; i < tiles.length; i++) {
            if (tiles[i].textContent == '') {
                array.push(i)
            }
        }
        
        let rdmTile = array[Math.floor(Math.random() * array.length)]
        if (array.length > 0) {
            tiles[rdmTile].textContent = whoIsNext.marker
            board.push(rdmTile)
            tiles[rdmTile].style.pointerEvents = 'none'
            checkWinner(rdmTile)
            handleTurns()
        }
    }
}

let isGameOver = false;

function checkWinner(tileIndex) {
    const winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    const line = winConditions
                    .filter((combination) => combination.includes(tileIndex))
                        .filter((possibleCombination) => {
                            return possibleCombination.every((index) => tiles[index].textContent == whoIsNext.marker)
                        })
    const strike = line[0]
    if(strike) {
        for (let index = 0; index < strike.length; index++) {
            tiles[strike[index]].classList.add('line')
        }

        isGameOver = true

        for (let i = 0; i < tiles.length; i++) {
            tiles[i].style.pointerEvents = 'none';
        }

        whoIsNext.score += 1
        handleScore()

        const winner = document.querySelector('.winner')
        winner.textContent = whoIsNext.name
        setTimeout(() => {
            helpers.hide(gamePage)
            helpers.show(winPage)
        }, 500)
    } else {
        if (board.length == 9) {
            const winMsg = document.querySelector('.win')
            const cheersImg = document.querySelector('.cheers img')
            winMsg.textContent = "It's a draw!"
            cheersImg.src = "Img/balance.png"
            setTimeout(() => {
                helpers.hide(gamePage)
                helpers.show(winPage)
            }, 500)
        }
    }

    
}

const restartBtn = document.querySelector('.restart')
const newBtn = document.querySelector('.new')

restartBtn.onclick = ()=>{
    window.location.reload(); //reload the current page on replay button click
}

newBtn.onclick = ()=>{
    window.location.reload(); //reload the current page on replay button click
}


const againBtn = document.querySelector('.playAgain')

againBtn.addEventListener('click', () => {
    resetGame()
    helpers.show(gamePage)
    helpers.hide(winPage)
})

function resetGame() {
    whoIsNext = you
    helpers.fade(playersScoreboard[1])
    helpers.reveal(playersScoreboard[0])
    board = []
    isGameOver = false
    for (let i = 0; i < tiles.length; i++) {
        tiles[i].classList.remove('line')
        tiles[i].style.pointerEvents = 'auto';
        tiles[i].textContent = ''
    }
    setTimeout(() => {
        const winMsg = document.querySelector('.win')
        winMsg.innerHTML = `<span class="winner">Wade</span> wins !`
        const cheersImg = document.querySelector('.cheers img')
        cheersImg.src = "Img/confetti.png"
    }, 500)
}