// Storage module
// Handles loading and saving game statistics to localStorage

// Default stats structure
const DEFAULT_STATS = {
    puzzlesSolved: 0,
    bestTime: null,  // in milliseconds
    totalTime: 0,    // total time spent solving puzzles
    avgTime: 0       // average time per puzzle
};

// Load stats from localStorage
export function loadStats() {
    try {
        const savedStats = localStorage.getItem('sudoku_stats');
        if (savedStats) {
            return JSON.parse(savedStats);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
    
    // Return default stats if nothing is saved or there's an error
    return { ...DEFAULT_STATS };
}

// Save stats to localStorage
export function saveStats(stats) {
    try {
        localStorage.setItem('sudoku_stats', JSON.stringify(stats));
    } catch (error) {
        console.error('Error saving stats:', error);
    }
}

// Reset stats to defaults
export function resetStats() {
    saveStats({ ...DEFAULT_STATS });
}

// Save game state to localStorage
export function saveGameState(gameState) {
    try {
        localStorage.setItem('sudoku_game_state', JSON.stringify({
            board: gameState.board,
            solution: gameState.solution,
            difficulty: gameState.difficulty,
            elapsedTime: gameState.elapsedTime,
            hintsUsed: gameState.hintsUsed
        }));
    } catch (error) {
        console.error('Error saving game state:', error);
    }
}

// Load game state from localStorage
export function loadGameState() {
    try {
        const savedState = localStorage.getItem('sudoku_game_state');
        if (savedState) {
            return JSON.parse(savedState);
        }
    } catch (error) {
        console.error('Error loading game state:', error);
    }
    
    return null;
}

// Clear saved game state
export function clearGameState() {
    localStorage.removeItem('sudoku_game_state');
}