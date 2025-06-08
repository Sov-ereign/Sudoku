import { generateSudoku } from './sudokuGenerator.js';
import { renderBoard, initializeBoard } from './gameUI.js';
import { validateSudoku, solveSudoku, isBoardValid } from './sudokuSolver.js';
import { loadStats, saveStats, resetStats } from './storage.js';

// Game state
let gameState = {
    board: null,
    solution: null,
    difficulty: 'medium',
    gameStarted: false,
    gameCompleted: false,
    hintsUsed: 0,
    startTime: null,
    timerInterval: null,
    elapsedTime: 0
};

// DOM elements
const boardElement = document.getElementById('sudoku-board');
const newGameBtn = document.getElementById('new-game-btn');
const checkBtn = document.getElementById('check-btn');
const resetBtn = document.getElementById('reset-btn');
const hintBtn = document.getElementById('hint-btn');
const difficultySelect = document.getElementById('difficulty');
const timerElement = document.getElementById('timer');
const resetStatsBtn = document.getElementById('reset-stats-btn');
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalIcon = document.getElementById('modal-icon');
const modalConfirm = document.getElementById('modal-confirm');
const modalCancel = document.getElementById('modal-cancel');
const closeModal = document.querySelector('.close-modal');

// Theme and font controls
const themeToggle = document.getElementById('theme-toggle');
const fontFamilySelect = document.getElementById('font-family');
const fontSizeSelect = document.getElementById('font-size');

const inputPuzzleBtn = document.getElementById('input-puzzle-btn');
const solveBtn = document.getElementById('solve-btn');
const cancelInputBtn = document.getElementById('cancel-input-btn');

let inputMode = false;

// Initialize the game
function initializeGame() {
    // Load saved stats
    updateStatsDisplay();
    
    // Event listeners
    newGameBtn.addEventListener('click', startNewGame);
    checkBtn.addEventListener('click', checkSolution);
    resetBtn.addEventListener('click', confirmReset);
    hintBtn.addEventListener('click', provideHint);
    difficultySelect.addEventListener('change', (e) => {
        gameState.difficulty = e.target.value;
        if (gameState.gameStarted) {
            confirmNewGame();
        }
    });
    resetStatsBtn.addEventListener('click', confirmResetStats);
    
    // Modal event listeners
    closeModal.addEventListener('click', () => hideModal());
    modalCancel.addEventListener('click', () => hideModal());
    
    // Start the first game
    startNewGame();

    // Load user preferences
    loadPreferences();

    if (inputPuzzleBtn && solveBtn && cancelInputBtn) {
        inputPuzzleBtn.addEventListener('click', () => {
            inputMode = true;
            // Show blank board
            const blankBoard = Array(9).fill(0).map(() => Array(9).fill(0));
            renderBoard(boardElement, blankBoard);
            applyBoardFont();
            // Hide other buttons, show solve/cancel
            newGameBtn.style.display = 'none';
            checkBtn.style.display = 'none';
            resetBtn.style.display = 'none';
            hintBtn.style.display = 'none';
            inputPuzzleBtn.style.display = 'none';
            solveBtn.style.display = '';
            cancelInputBtn.style.display = '';
        });
        solveBtn.addEventListener('click', () => {
            // Read user input
            const userBoard = getCurrentBoardState();
            // Validate puzzle before solving
            if (!isValidInputPuzzle(userBoard)) {
                showModal({
                    title: 'Invalid Puzzle',
                    message: 'The puzzle you entered is invalid. Please check for duplicate numbers in rows, columns, or boxes and try again.',
                    icon: 'error',
                    confirmText: 'OK',
                    showCancel: false
                });
                return;
            }
            // Try to solve
            const solved = solveSudoku(userBoard);
            if (solved) {
                renderBoard(boardElement, userBoard);
                applyBoardFont();
                showModal({
                    title: 'Solved!',
                    message: 'Here is the solution to your puzzle.',
                    icon: 'success',
                    confirmText: 'OK',
                    showCancel: false
                });
            } else {
                showModal({
                    title: 'Unsolvable',
                    message: 'This puzzle cannot be solved. Please check your input.',
                    icon: 'error',
                    confirmText: 'OK',
                    showCancel: false
                });
            }
            // Restore normal UI
            inputMode = false;
            newGameBtn.style.display = '';
            checkBtn.style.display = '';
            resetBtn.style.display = '';
            hintBtn.style.display = '';
            inputPuzzleBtn.style.display = '';
            solveBtn.style.display = 'none';
            cancelInputBtn.style.display = 'none';
        });
        cancelInputBtn.addEventListener('click', () => {
            inputMode = false;
            startNewGame();
            newGameBtn.style.display = '';
            checkBtn.style.display = '';
            resetBtn.style.display = '';
            hintBtn.style.display = '';
            inputPuzzleBtn.style.display = '';
            solveBtn.style.display = 'none';
            cancelInputBtn.style.display = 'none';
        });
    }
}

// Start a new game
function startNewGame() {
    stopTimer();
    
    // Generate a new puzzle based on difficulty
    const { puzzle, solution } = generateSudoku(gameState.difficulty);
    gameState.board = puzzle;
    gameState.solution = solution;
    gameState.gameStarted = true;
    gameState.gameCompleted = false;
    gameState.hintsUsed = 0;
    gameState.elapsedTime = 0;
    
    // Render the board
    renderBoard(boardElement, gameState.board);
    applyBoardFont();
    
    // Restore normal UI
    newGameBtn.style.display = '';
    checkBtn.style.display = '';
    resetBtn.style.display = '';
    hintBtn.style.display = '';
    inputPuzzleBtn.style.display = '';
    solveBtn.style.display = 'none';
    cancelInputBtn.style.display = 'none';
    
    // Start the timer
    startTimer();
    
    // Update UI
    updateButtonStates();
}

// Confirm starting a new game if one is in progress
function confirmNewGame() {
    showModal({
        title: 'Start New Game?',
        message: 'Are you sure you want to start a new game? Your current progress will be lost.',
        icon: 'warning',
        confirmText: 'New Game',
        cancelText: 'Cancel',
        onConfirm: startNewGame
    });
}

// Reset the current game
function resetGame() {
    if (!gameState.gameStarted) return;
    
    // Reset only user inputs, keeping original puzzle
    initializeBoard(boardElement, gameState.board);
    
    // Reset timer
    stopTimer();
    gameState.elapsedTime = 0;
    updateTimerDisplay();
    startTimer();
    
    gameState.gameCompleted = false;
    gameState.hintsUsed = 0;
    
    // Update UI
    updateButtonStates();
    
    hideModal();
}

// Confirm reset
function confirmReset() {
    showModal({
        title: 'Reset Game?',
        message: 'Are you sure you want to reset the game? Your progress will be lost.',
        icon: 'warning',
        confirmText: 'Reset',
        cancelText: 'Cancel',
        onConfirm: resetGame
    });
}

// Check the current solution
function checkSolution() {
    if (!gameState.gameStarted) return;
    
    const currentBoard = getCurrentBoardState();
    
    // Validate the solution (even if incomplete)
    const isValid = isBoardValid(currentBoard);
    
    if (isValid) {
        // Game completed successfully if board is full
        const isComplete = !currentBoard.flat().includes(0);
        if (isComplete) {
            gameState.gameCompleted = true;
            stopTimer();
            // Update stats
            const stats = loadStats();
            stats.puzzlesSolved += 1;
            // Update best time
            const currentTime = gameState.elapsedTime;
            if (!stats.bestTime || currentTime < stats.bestTime) {
                stats.bestTime = currentTime;
            }
            // Update total time and calculate average
            stats.totalTime += currentTime;
            stats.avgTime = stats.puzzlesSolved > 0 ? Math.floor(stats.totalTime / stats.puzzlesSolved) : 0;
            saveStats(stats);
            updateStatsDisplay();
            showModal({
                title: 'Congratulations!',
                message: `You've solved the puzzle in ${formatTime(currentTime)}!`,
                icon: 'success',
                confirmText: 'New Game',
                cancelText: 'Close',
                onConfirm: startNewGame
            });
        } else {
            showModal({
                title: 'Valid So Far!',
                message: 'All filled cells are valid. Keep going!',
                icon: 'success',
                confirmText: 'OK',
                showCancel: false
            });
        }
    } else {
        showModal({
            title: 'Incorrect Entries',
            message: 'There are errors in your solution. Incorrect cells have been highlighted.',
            icon: 'error',
            confirmText: 'OK',
            showCancel: false
        });
        // Highlight invalid cells
        highlightInvalidCells(currentBoard);
    }
}

// Highlight invalid cells
function highlightInvalidCells(board) {
    const cells = boardElement.querySelectorAll('.sudoku-cell');
    
    // Reset all cells
    cells.forEach(cell => {
        cell.classList.remove('invalid');
    });
    
    // Check each cell for validity
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const value = board[row][col];
            if (value !== 0) {
                // Check if this value conflicts with any other in row, column, or box
                const cellIndex = row * 9 + col;
                
                // Temporarily set this cell to 0 to check against other cells
                const originalValue = board[row][col];
                board[row][col] = 0;
                
                // Check if placing the value back would be valid
                if (!validateSudoku(board, row, col, originalValue)) {
                    cells[cellIndex].classList.add('invalid');
                }
                
                // Restore the value
                board[row][col] = originalValue;
            }
        }
    }
}

// Get the current state of the board from UI
function getCurrentBoardState() {
    const cells = boardElement.querySelectorAll('.sudoku-cell');
    const board = Array(9).fill().map(() => Array(9).fill(0));
    
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        const value = cell.tagName === 'INPUT' ? 
            (cell.value ? parseInt(cell.value, 10) : 0) : 
            parseInt(cell.textContent, 10);
        
        board[row][col] = isNaN(value) ? 0 : value;
    });
    
    return board;
}

// Provide a hint
function provideHint() {
    if (!gameState.gameStarted || gameState.gameCompleted) return;
    
    const currentBoard = getCurrentBoardState();
    
    // Find a random empty cell or incorrect cell
    const emptyCells = [];
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (currentBoard[row][col] === 0 || 
                currentBoard[row][col] !== gameState.solution[row][col]) {
                emptyCells.push({ row, col });
            }
        }
    }
    
    if (emptyCells.length === 0) {
        // No empty cells, puzzle might be complete but incorrect
        return;
    }
    
    // Select a random empty cell
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const { row, col } = randomCell;
    
    // Fill in the correct value
    const correctValue = gameState.solution[row][col];
    const cellIndex = row * 9 + col;
    const cell = boardElement.querySelectorAll('.sudoku-cell')[cellIndex];
    
    if (cell.tagName === 'INPUT') {
        cell.value = correctValue;
    } else {
        cell.textContent = correctValue;
    }
    
    // Highlight the cell briefly
    cell.classList.add('hint-highlight');
    setTimeout(() => {
        cell.classList.remove('hint-highlight');
    }, 1500);
    
    gameState.hintsUsed++;
}

// Timer functions
function startTimer() {
    gameState.startTime = Date.now() - gameState.elapsedTime;
    gameState.timerInterval = setInterval(updateTimer, 1000);
    updateTimerDisplay();
}

function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

function updateTimer() {
    gameState.elapsedTime = Date.now() - gameState.startTime;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    timerElement.textContent = formatTime(gameState.elapsedTime);
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Stats functions
function updateStatsDisplay() {
    const stats = loadStats();
    document.getElementById('puzzles-solved').textContent = stats.puzzlesSolved;
    document.getElementById('best-time').textContent = stats.bestTime ? formatTime(stats.bestTime) : '--:--';
    document.getElementById('avg-time').textContent = stats.avgTime ? formatTime(stats.avgTime) : '--:--';
}

function confirmResetStats() {
    showModal({
        title: 'Reset Statistics?',
        message: 'Are you sure you want to reset all your statistics? This cannot be undone.',
        icon: 'warning',
        confirmText: 'Reset',
        cancelText: 'Cancel',
        onConfirm: () => {
            resetStats();
            updateStatsDisplay();
            hideModal();
        }
    });
}

// Update button states based on game state
function updateButtonStates() {
    checkBtn.disabled = !gameState.gameStarted || gameState.gameCompleted;
    resetBtn.disabled = !gameState.gameStarted || gameState.gameCompleted;
    hintBtn.disabled = !gameState.gameStarted || gameState.gameCompleted;
}

// Modal functions
function showModal({ title, message, icon = '', confirmText = 'OK', cancelText = 'Cancel', showCancel = true, onConfirm = null }) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    
    // Set icon
    modalIcon.className = 'modal-icon';
    if (icon) {
        modalIcon.classList.add(icon);
        
        // Add Font Awesome icon
        let iconClass = '';
        switch (icon) {
            case 'success': 
                iconClass = 'fa-solid fa-circle-check'; 
                break;
            case 'error': 
                iconClass = 'fa-solid fa-circle-xmark'; 
                break;
            case 'warning': 
                iconClass = 'fa-solid fa-triangle-exclamation'; 
                break;
            default: 
                iconClass = '';
        }
        
        modalIcon.innerHTML = iconClass ? `<i class="${iconClass}"></i>` : '';
    } else {
        modalIcon.innerHTML = '';
    }
    
    // Set button text
    modalConfirm.textContent = confirmText;
    modalCancel.textContent = cancelText;
    
    // Show/hide cancel button
    modalCancel.style.display = showCancel ? 'block' : 'none';
    
    // Set confirm action
    if (onConfirm) {
        modalConfirm.onclick = () => {
            onConfirm();
            hideModal();
        };
    } else {
        modalConfirm.onclick = hideModal;
    }
    
    // Show the modal
    modal.classList.add('show');
}

function hideModal() {
    modal.classList.remove('show');
}

// Apply theme from localStorage or default
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️ Theme';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.textContent = '🌙 Theme';
    }
}

function toggleTheme() {
    const isDark = document.body.classList.toggle('dark-mode');
    const theme = isDark ? 'dark' : 'light';
    localStorage.setItem('sudoku_theme', theme);
    applyTheme(theme);
}

// Font customization
function applyBoardFont() {
    const fontFamily = fontFamilySelect.value;
    const fontSize = fontSizeSelect.value;
    const board = document.querySelector('.sudoku-board');
    board.style.fontFamily = fontFamily;
    board.classList.add('custom-font');
    // Set font size on all cells
    const cells = board.querySelectorAll('.sudoku-cell');
    cells.forEach(cell => {
        cell.style.fontSize = fontSize;
    });
    localStorage.setItem('sudoku_font_family', fontFamily);
    localStorage.setItem('sudoku_font_size', fontSize);
}

function loadPreferences() {
    // Theme
    const savedTheme = localStorage.getItem('sudoku_theme') || 'light';
    applyTheme(savedTheme);
    // Font
    const savedFontFamily = localStorage.getItem('sudoku_font_family');
    const savedFontSize = localStorage.getItem('sudoku_font_size');
    if (savedFontFamily) fontFamilySelect.value = savedFontFamily;
    if (savedFontSize) fontSizeSelect.value = savedFontSize;
    applyBoardFont();
}

// Add event listeners for theme and font controls
if (themeToggle && fontFamilySelect && fontSizeSelect) {
    themeToggle.addEventListener('click', toggleTheme);
    fontFamilySelect.addEventListener('change', applyBoardFont);
    fontSizeSelect.addEventListener('change', applyBoardFont);
}

// Helper to check if a user-input puzzle is valid
function isValidInputPuzzle(board) {
    // Check for duplicates in rows, columns, and 3x3 boxes
    for (let i = 0; i < 9; i++) {
        const rowSet = new Set();
        const colSet = new Set();
        for (let j = 0; j < 9; j++) {
            // Row
            if (board[i][j] !== 0) {
                if (rowSet.has(board[i][j])) return false;
                rowSet.add(board[i][j]);
            }
            // Column
            if (board[j][i] !== 0) {
                if (colSet.has(board[j][i])) return false;
                colSet.add(board[j][i]);
            }
        }
    }
    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < 3; boxRow++) {
        for (let boxCol = 0; boxCol < 3; boxCol++) {
            const boxSet = new Set();
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const val = board[boxRow * 3 + i][boxCol * 3 + j];
                    if (val !== 0) {
                        if (boxSet.has(val)) return false;
                        boxSet.add(val);
                    }
                }
            }
        }
    }
    // At least one non-zero cell
    let hasValue = false;
    for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if (board[i][j] !== 0) hasValue = true;
    return hasValue;
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeGame);