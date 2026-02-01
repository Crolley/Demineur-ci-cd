export function createBoard(rows, cols, minesCount) {
    const board = [];

    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < cols; j++) {
            board[i][j] = {
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            };
        }
    }

    let minesPlaced = 0;
    while (minesPlaced < minesCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        if (!board[row][col].isMine) {
            board[row][col].isMine = true;
            minesPlaced++;
        }
    }

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (!board[i][j].isMine) {
                board[i][j].neighborMines = countNeighborMines(board, i, j);
            }
        }
    }

    return board;
}

export function countNeighborMines(board, row, col) {
    let count = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            const r = row + i;
            const c = col + j;
            if (
                r >= 0 &&
                r < board.length &&
                c >= 0 &&
                c < board[0].length &&
                board[r][c].isMine
            ) {
                count++;
            }
        }
    }
    return count;
}

export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
