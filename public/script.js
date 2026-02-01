// Configuration des difficultés
const difficulties = {
    easy: { rows: 9, cols: 9, mines: 10 },
    medium: { rows: 16, cols: 16, mines: 40 },
    hard: { rows: 16, cols: 30, mines: 99 }
};

// État du jeu
let currentDifficulty = 'easy';
let board = [];
let gameState = 'ready'; // ready, playing, won, lost
let revealedCount = 0;
let flaggedCount = 0;
let timer = 0;
let timerInterval = null;
let bestTimes = JSON.parse(localStorage.getItem('lol-minesweeper-times')) || {};

// Initialiser le jeu
function initGame() {
    gameState = 'ready';
    revealedCount = 0;
    flaggedCount = 0;
    timer = 0;
    clearInterval(timerInterval);
    updateTimer();
    
    const config = difficulties[currentDifficulty];
    board = createBoard(config.rows, config.cols, config.mines);
    renderBoard();
    updateMinesCount();
    updateBestTime();
}

// Créer le plateau
function createBoard(rows, cols, minesCount) {
    const newBoard = [];
    
    // Créer grille vide
    for (let i = 0; i < rows; i++) {
        newBoard[i] = [];
        for (let j = 0; j < cols; j++) {
            newBoard[i][j] = {
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            };
        }
    }
    
    // Placer mines
    let minesPlaced = 0;
    while (minesPlaced < minesCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        
        if (!newBoard[row][col].isMine) {
            newBoard[row][col].isMine = true;
            minesPlaced++;
        }
    }
    
    // Calculer nombres
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (!newBoard[i][j].isMine) {
                newBoard[i][j].neighborMines = countNeighborMines(newBoard, i, j);
            }
        }
    }
    
    return newBoard;
}

// Compter les mines voisines
function countNeighborMines(board, row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const newRow = row + i;
            const newCol = col + j;
            if (newRow >= 0 && newRow < board.length && 
                newCol >= 0 && newCol < board[0].length &&
                board[newRow][newCol].isMine) {
                count++;
            }
        }
    }
    return count;
}

// Afficher le plateau
function renderBoard() {
    const boardEl = document.getElementById('board');
    const config = difficulties[currentDifficulty];
    
    boardEl.style.gridTemplateColumns = `repeat(${config.cols}, 35px)`;
    boardEl.innerHTML = '';
    
    for (let i = 0; i < config.rows; i++) {
        for (let j = 0; j < config.cols; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            cell.addEventListener('click', () => handleCellClick(i, j));
            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleRightClick(i, j);
            });
            
            boardEl.appendChild(cell);
        }
    }
}

// Gérer clic gauche
function handleCellClick(row, col) {
    if (gameState === 'won' || gameState === 'lost') return;
    
    const cell = board[row][col];
    if (cell.isRevealed || cell.isFlagged) return;
    
    if (gameState === 'ready') {
        ensureSafeFirstClick(row, col);
        gameState = 'playing';
        startTimer();
    }
    
    if (cell.isMine) {
        gameOver(false);
        return;
    }
    
    revealCell(row, col);
    checkWin();
}

// Garantir premier clic sûr
function ensureSafeFirstClick(row, col) {
    const cell = board[row][col];
    
    if (cell.isMine || cell.neighborMines > 0) {
        const config = difficulties[currentDifficulty];
        board = createBoard(config.rows, config.cols, config.mines);
        
        if (board[row][col].isMine || board[row][col].neighborMines > 0) {
            ensureSafeFirstClick(row, col);
        }
    }
}

// Gérer clic droit
function handleRightClick(row, col) {
    if (gameState === 'won' || gameState === 'lost') return;
    
    const cell = board[row][col];
    if (cell.isRevealed) return;
    
    cell.isFlagged = !cell.isFlagged;
    flaggedCount += cell.isFlagged ? 1 : -1;
    
    updateCellDisplay(row, col);
    updateMinesCount();
    checkWin();
}

// Révéler une cellule
function revealCell(row, col) {
    const cell = board[row][col];
    if (cell.isRevealed || cell.isFlagged) return;
    
    cell.isRevealed = true;
    revealedCount++;
    updateCellDisplay(row, col);
    
    if (cell.neighborMines === 0) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < board.length && 
                    newCol >= 0 && newCol < board[0].length) {
                    revealCell(newRow, newCol);
                }
            }
        }
    }
}

// Mettre à jour l'affichage d'une cellule
function updateCellDisplay(row, col) {
    const cell = board[row][col];
    const cellEl = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    
    if (cell.isFlagged) {
        cellEl.className = 'cell flagged';
        cellEl.textContent = '🚩';
    } else if (cell.isRevealed) {
        cellEl.className = 'cell revealed';
        if (cell.isMine) {
            cellEl.classList.add('mine');
            cellEl.textContent = '💣';
        } else if (cell.neighborMines > 0) {
            cellEl.classList.add(`number-${cell.neighborMines}`);
            cellEl.textContent = cell.neighborMines;
        } else {
            cellEl.textContent = '';
        }
    } else {
        cellEl.className = 'cell';
        cellEl.textContent = '';
    }
}

// Vérifier victoire
function checkWin() {
    const config = difficulties[currentDifficulty];
    const totalCells = config.rows * config.cols;
    const nonMineCells = totalCells - config.mines;
    
    if (revealedCount === nonMineCells) {
        gameOver(true);
    }
}

// Fin de partie
function gameOver(won) {
    gameState = won ? 'won' : 'lost';
    clearInterval(timerInterval);
    
    // Révéler toutes les mines
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].isMine) {
                board[i][j].isRevealed = true;
                updateCellDisplay(i, j);
            }
        }
    }
    
    // Sauvegarder meilleur temps
    if (won) {
        const currentBest = bestTimes[currentDifficulty];
        if (!currentBest || timer < currentBest) {
            bestTimes[currentDifficulty] = timer;
            localStorage.setItem('lol-minesweeper-times', JSON.stringify(bestTimes));
            updateBestTime();
        }
    }
    
    setTimeout(() => showGameOverScreen(won), 500);
}

// Afficher écran de fin
function showGameOverScreen(won) {
    const overlay = document.createElement('div');
    overlay.className = 'game-over-overlay';
    
    const content = document.createElement('div');
    content.className = 'game-over-content';
    
    const title = document.createElement('div');
    title.className = `game-over-title ${won ? 'victory' : 'defeat'}`;
    title.textContent = won ? '🏆 VICTORY!' : '💀 DEFEAT!';
    
    const message = document.createElement('div');
    message.className = 'game-over-message';
    message.textContent = won ? 
        `You cleared the rift in ${formatTime(timer)}!` : 
        'A wild Teemo shroom appeared!';
    
    const btn = document.createElement('button');
    btn.className = 'action-btn';
    btn.textContent = '🔄 Play Again';
    btn.style.marginTop = '20px';
    btn.onclick = () => {
        document.body.removeChild(overlay);
        initGame();
    };
    
    content.appendChild(title);
    content.appendChild(message);
    content.appendChild(btn);
    overlay.appendChild(content);
    document.body.appendChild(overlay);
}

// Démarrer le timer
function startTimer() {
    timerInterval = setInterval(() => {
        timer++;
        updateTimer();
    }, 1000);
}

// Mettre à jour le timer
function updateTimer() {
    document.getElementById('timer').textContent = formatTime(timer);
}

// Mettre à jour le meilleur temps
function updateBestTime() {
    const best = bestTimes[currentDifficulty];
    document.getElementById('best-time').textContent = best ? formatTime(best) : '--:--';
}

// Formater le temps
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Mettre à jour le compteur de mines
function updateMinesCount() {
    const config = difficulties[currentDifficulty];
    document.getElementById('mines-count').textContent = config.mines - flaggedCount;
}

// Event listeners
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentDifficulty = btn.dataset.difficulty;
        initGame();
    });
});

document.getElementById('new-game').addEventListener('click', initGame);

// Initialisation
initGame();