// Sudoku solver and validator
// This module handles solving and validating Sudoku puzzles

// Solve a Sudoku puzzle using backtracking
export function solveSudoku(board) {
    // Find an empty cell
    const emptyCell = findEmptyCell(board);
    
    // If no empty cell is found, the puzzle is solved
    if (!emptyCell) return true;
    
    const { row, col } = emptyCell;
    
    // Try each number 1-9
    for (let num = 1; num <= 9; num++) {
        // Check if this number is valid in this position
        if (validateSudoku(board, row, col, num)) {
            // Place the number
            board[row][col] = num;
            
            // Recursively try to solve the rest of the puzzle
            if (solveSudoku(board)) {
                return true;
            }
            
            // If placing this number didn't lead to a solution, backtrack
            board[row][col] = 0;
        }
    }
    
    // No solution was found with any number 1-9
    return false;
}

// Count the number of solutions a Sudoku puzzle has
export function countSolutions(board) {
    // Make a copy of the board to avoid modifying the original
    const boardCopy = board.map(row => [...row]);
    
    // Use a counter object so it can be passed by reference
    const counter = { count: 0 };
    
    // Call the recursive function
    countSolutionsRecursive(boardCopy, counter);
    
    return counter.count;
}

// Recursive helper function to count solutions
function countSolutionsRecursive(board, counter, limit = 2) {
    // Find an empty cell
    const emptyCell = findEmptyCell(board);
    
    // If no empty cell is found, we've found a solution
    if (!emptyCell) {
        counter.count++;
        return;
    }
    
    // Stop if we've reached the solution limit
    if (counter.count >= limit) return;
    
    const { row, col } = emptyCell;
    
    // Try each number 1-9
    for (let num = 1; num <= 9; num++) {
        if (validateSudoku(board, row, col, num)) {
            board[row][col] = num;
            
            countSolutionsRecursive(board, counter, limit);
            
            // Stop early if we've reached the limit
            if (counter.count >= limit) return;
            
            // Backtrack
            board[row][col] = 0;
        }
    }
}

// Find an empty cell in the board
function findEmptyCell(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                return { row, col };
            }
        }
    }
    return null; // No empty cell found
}

// Check if a number is valid in the given position
export function validateSudoku(board, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) {
            return false;
        }
    }
    
    // Check column
    for (let y = 0; y < 9; y++) {
        if (board[y][col] === num) {
            return false;
        }
    }
    
    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            if (board[boxRow + y][boxCol + x] === num) {
                return false;
            }
        }
    }
    
    // The number is valid
    return true;
}

// Validate the entire board
export function isBoardValid(board) {
    // Check rows
    for (let row = 0; row < 9; row++) {
        if (!isRowValid(board, row)) return false;
    }
    
    // Check columns
    for (let col = 0; col < 9; col++) {
        if (!isColumnValid(board, col)) return false;
    }
    
    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < 9; boxRow += 3) {
        for (let boxCol = 0; boxCol < 9; boxCol += 3) {
            if (!isBoxValid(board, boxRow, boxCol)) return false;
        }
    }
    
    return true;
}

// Check if a row is valid
function isRowValid(board, row) {
    const seen = new Set();
    for (let col = 0; col < 9; col++) {
        const value = board[row][col];
        if (value !== 0) {
            if (seen.has(value)) return false;
            seen.add(value);
        }
    }
    return true;
}

// Check if a column is valid
function isColumnValid(board, col) {
    const seen = new Set();
    for (let row = 0; row < 9; row++) {
        const value = board[row][col];
        if (value !== 0) {
            if (seen.has(value)) return false;
            seen.add(value);
        }
    }
    return true;
}

// Check if a 3x3 box is valid
function isBoxValid(board, startRow, startCol) {
    const seen = new Set();
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            const value = board[startRow + row][startCol + col];
            if (value !== 0) {
                if (seen.has(value)) return false;
                seen.add(value);
            }
        }
    }
    return true;
}