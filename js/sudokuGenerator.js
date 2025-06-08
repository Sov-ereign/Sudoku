// Sudoku puzzle generator
// This module handles generating valid Sudoku puzzles with unique solutions

// Import the sudoku solver to validate puzzles
import { solveSudoku, countSolutions } from './sudokuSolver.js';

// Generate a Sudoku puzzle with a unique solution
export function generateSudoku(difficulty = 'medium') {
    // Generate a full solved Sudoku board
    const solution = generateFullSudoku();
    
    // Create a copy of the solution to remove numbers from
    const puzzle = solution.map(row => [...row]);
    
    // Remove numbers based on difficulty to create the puzzle
    const cellsToRemove = getDifficultySettings(difficulty);
    removeNumbers(puzzle, cellsToRemove);
    
    return { puzzle, solution };
}

// Generate a full valid Sudoku grid
function generateFullSudoku() {
    // Create an empty 9x9 grid
    const grid = Array(9).fill().map(() => Array(9).fill(0));
    
    // Fill the diagonal 3x3 boxes first (these can be filled independently)
    fillDiagonalBoxes(grid);
    
    // Solve the rest of the grid
    solveSudoku(grid);
    
    return grid;
}

// Fill the diagonal 3x3 boxes
function fillDiagonalBoxes(grid) {
    // Fill the three diagonal boxes (top-left, middle, bottom-right)
    for (let boxIndex = 0; boxIndex < 3; boxIndex++) {
        fillBox(grid, boxIndex * 3, boxIndex * 3);
    }
}

// Fill a 3x3 box with random numbers 1-9
function fillBox(grid, startRow, startCol) {
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    
    let index = 0;
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            grid[startRow + row][startCol + col] = numbers[index++];
        }
    }
}

// Remove numbers from the grid to create a puzzle
function removeNumbers(grid, numbersToRemove) {
    // Create a list of all cell positions
    const positions = [];
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            positions.push({ row, col });
        }
    }
    
    // Shuffle the positions for random removal
    const shuffledPositions = shuffleArray(positions);
    
    // Track how many cells we've successfully removed
    let removed = 0;
    
    // Try to remove numbers while ensuring a unique solution
    for (const pos of shuffledPositions) {
        const { row, col } = pos;
        
        // Skip if already empty
        if (grid[row][col] === 0) continue;
        
        // Remember the value before removing
        const value = grid[row][col];
        
        // Try removing the number
        grid[row][col] = 0;
        
        // Check if the puzzle still has a unique solution
        const solutionCount = countSolutions(grid);
        
        // If more than one solution, put the number back
        if (solutionCount !== 1) {
            grid[row][col] = value;
        } else {
            removed++;
            
            // Stop if we've removed enough numbers
            if (removed >= numbersToRemove) {
                break;
            }
        }
    }
}

// Get difficulty settings (number of cells to remove)
function getDifficultySettings(difficulty) {
    switch (difficulty) {
        case 'easy':
            return 35; // 46 clues remain (out of 81)
        case 'medium':
            return 45; // 36 clues remain
        case 'hard':
            return 52; // 29 clues remain
        default:
            return 45; // Default to medium
    }
}

// Utility function to shuffle an array
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}