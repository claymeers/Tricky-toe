const helpers = (() => {
    const show = (element) => element.classList.remove('off');
    const hide = (element) => element.classList.add('off');

    const fade = (element) => element.classList.remove('active');
    const reveal = (element) => element.classList.add('active');
    return {show, hide, fade, reveal}
})()

const Player = (name, marker, score) => {
    return  { name, marker, score}
}

let you, foe, whoIsNext, isGameOver;
let boardState = [0, 1, 2, 3, 4, 5, 6, 7, 8]
let aiPlayer = 'o', huPlayer = 'x'

window.onload = start()

function start() {
    const namePage = document.querySelector('.names')
    const namePageInput = document.querySelector('.names input')
    const namePageSubmit = document.querySelector('.names .submit')

    const playerName = document.querySelectorAll('.game .name')
    const playerScore = document.querySelectorAll('.game .score')

    foe = Player('Gamora', 'o', 0)

    namePageSubmit.addEventListener('click', () => {
        you = Player(namePageInput.value, 'x', 0)
        playerName[0].textContent = you.name ? you.name : 'You'
        playerScore[0].textContent = you.score

        playerName[1].textContent = foe.name ? foe.name : 'Bot'
        playerScore[1].textContent = foe.score

        helpers.hide(namePage)
        helpers.show(gamePage)

        whoIsNext = you
    })

    isGameOver = false
}

const gamePage = document.querySelector('.game')
const winPage = document.querySelector('.popup')
let board = [];

const tiles = document.querySelectorAll('.square')
const playersScoreboard = document.querySelectorAll('.game .mask')

tiles.forEach((tile, id) => {
    tile.addEventListener('click', (e) => {
        if(!isGameOver) {
            e.target.textContent = whoIsNext.marker
            board.push(id)
            boardState[id] = whoIsNext.marker
            for (let i = 0; i < tiles.length; i++) {
                tiles[i].style.pointerEvents = 'none';
            }
            tile.style.pointerEvents = 'none'
            checkWinner(id)
            handleTurns()

            let randomTimeDelay = ((Math.random() *1500) + 200).toFixed();
            setTimeout(() => {
                bot()
                for (let i = 0; i < boardState.length; i++) {
                    if (typeof boardState[i] == 'number') {
                        tiles[i].style.pointerEvents = 'auto';
                    }
                }
            }, randomTimeDelay)
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

function bot() {
    if(!isGameOver) {
        // Choose a random tile available
        // let rdmTile = array[Math.floor(Math.random() * array.length)]

        // Choose the best tile with minimax algorithm
        let bestSpotId = minimax(boardState, aiPlayer).index

        tiles[bestSpotId].textContent = whoIsNext.marker
        board.push(bestSpotId)

        boardState[bestSpotId] = whoIsNext.marker

        tiles[bestSpotId].style.pointerEvents = 'none'
        checkWinner(bestSpotId)
        handleTurns()
    }
}

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
            isGameOver = true
            const winMsg = document.querySelector('.win')
            const cheersImg = document.querySelector('.cheers img')
            cheersImg.src = "Img/balance.png"
            winMsg.textContent = "It's a draw!"
            setTimeout(() => {
                helpers.hide(gamePage)
                helpers.show(winPage)
            }, 500)
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
    boardState = [0, 1, 2, 3, 4, 5, 6, 7, 8]
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

// Minimax algorithm
function minimax(reboard, player) {
    let availableSpots = checkAvailableSpot(reboard);
    
    if(winCheck(reboard, aiPlayer)) {
        return {score: 10};
    } else if(winCheck(reboard, huPlayer)) {
        return {score: -10};
    } else if(availableSpots.length == 0) {
        return {score: 0};
    }

    let moveBranchs = [] //Store every moves made in the tree

    // Loop in the tree and analyse each possibilty
    for (let i = 0; i < availableSpots.length; i++) {
        let move = {}

        move.index = reboard[availableSpots[i]]
        reboard[availableSpots[i]] = player;

        if(player == aiPlayer) {
            move.score = minimax(reboard, huPlayer).score;
        } else if(player == huPlayer) {
            move.score = minimax(reboard, aiPlayer).score;
        }

        reboard[availableSpots[i]] = move.index;
        moveBranchs.push(move)
    }

    // Get the best score and the best spot
    let bestMove ;
    if (player == aiPlayer) {
        let bestScore = -10000
        for (let i = 0; i < moveBranchs.length; i++) {
            if(moveBranchs[i].score > bestScore) {
                bestScore = moveBranchs[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 10000
        for (let i = 0; i < moveBranchs.length; i++) {
            if(moveBranchs[i].score < bestScore) {
                bestScore = moveBranchs[i].score;
                bestMove = i;
            }
        }
    }
    
    return moveBranchs[bestMove]
}

// Check available board spots
function checkAvailableSpot(board) {
    let availSpots = []
    for (let i = 0; i < board.length; i++) {
        if (typeof board[i] == 'number') {
            availSpots.push(i)
        }
    }
    return availSpots
}

// winCheck
function winCheck(board, player) {
    if (
        (board[0] == player && board[1] == player && board[2] == player) ||
        (board[3] == player && board[4] == player && board[5] == player) ||
        (board[6] == player && board[7] == player && board[8] == player) ||
        (board[0] == player && board[3] == player && board[6] == player) ||
        (board[1] == player && board[4] == player && board[7] == player) ||
        (board[2] == player && board[5] == player && board[8] == player) ||
        (board[0] == player && board[4] == player && board[8] == player) ||
        (board[2] == player && board[4] == player && board[6] == player)
    ) {
        return true;
    } else {
        return false;
    }
}