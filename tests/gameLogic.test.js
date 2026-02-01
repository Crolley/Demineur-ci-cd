import {
    createBoard,
    countNeighborMines,
    formatTime
} from '../src/gameLogic.js';

test('createBoard creates correct grid size', () => {
    const board = createBoard(5, 5, 5);
    expect(board.length).toBe(5);
    expect(board[0].length).toBe(5);
});

test('createBoard places correct number of mines', () => {
    const board = createBoard(5, 5, 5);
    const mines = board.flat().filter(c => c.isMine).length;
    expect(mines).toBe(5);
});

test('countNeighborMines works correctly', () => {
    const board = [
        [{ isMine: true }, { isMine: false }, { isMine: false }],
        [{ isMine: false }, { isMine: false }, { isMine: false }],
        [{ isMine: false }, { isMine: false }, { isMine: false }]
    ];
    expect(countNeighborMines(board, 1, 1)).toBe(1);
});

test('formatTime formats seconds correctly', () => {
    expect(formatTime(65)).toBe('1:05');
});
