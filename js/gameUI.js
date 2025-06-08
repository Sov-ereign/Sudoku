// Game UI module
// Handles the rendering and interaction with the Sudoku board

// Render the Sudoku board
export function renderBoard(boardElement, board) {
    // Clear the board first
    boardElement.innerHTML = '';
    
    // Create cells for each position
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const value = board[row][col];
            const cell = createCell(row, col, value);
            
            // Add the cell to the board
            boardElement.appendChild(cell);
        }
    }
    
    // Set up keyboard navigation
    setupKeyboardNavigation(boardElement);
}

// Initialize the board with the starting puzzle
export function initializeBoard(boardElement, board) {
    const cells = boardElement.querySelectorAll('.sudoku-cell');
    
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const index = row * 9 + col;
            const value = board[row][col];
            
            // Get the cell
            const cell = cells[index];
            
            // Clear any existing classes
            cell.classList.remove('invalid');
            
            if (value === 0) {
                // Empty cell - make it an input if it isn't already
                if (cell.tagName !== 'INPUT') {
                    const input = createInputCell(row, col);
                    cell.parentNode.replaceChild(input, cell);
                } else {
                    // Just clear the value
                    cell.value = '';
                }
            } else {
                // Prefilled cell - make it a div if it isn't already
                if (cell.tagName !== 'DIV') {
                    const div = createFixedCell(row, col, value);
                    cell.parentNode.replaceChild(div, cell);
                } else {
                    // Just update the text
                    cell.textContent = value;
                }
            }
        }
    }
}

// Create a cell based on its value
function createCell(row, col, value) {
    if (value === 0) {
        return createInputCell(row, col);
    } else {
        return createFixedCell(row, col, value);
    }
}

// Create an input cell for empty spaces
function createInputCell(row, col) {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'sudoku-cell';
    input.dataset.row = row;
    input.dataset.col = col;
    input.maxLength = 1;
    
    // Add event listeners
    input.addEventListener('input', handleCellInput);
    input.addEventListener('focus', handleCellFocus);
    input.addEventListener('keydown', handleCellKeydown);
    
    return input;
}

// Create a fixed cell for prefilled numbers
function createFixedCell(row, col, value) {
    const div = document.createElement('div');
    div.className = 'sudoku-cell fixed';
    div.dataset.row = row;
    div.dataset.col = col;
    div.textContent = value;
    
    return div;
}

// Handle input in a cell
function handleCellInput(event) {
    const input = event.target;
    
    // Only allow numbers 1-9
    const value = input.value;
    
    if (value && (!/^[1-9]$/.test(value))) {
        input.value = '';
    }
    
    // Animate cell fill
    if (value) {
        input.classList.remove('cell-fill-animate');
        void input.offsetWidth; // force reflow for restart
        input.classList.add('cell-fill-animate');
        setTimeout(() => input.classList.remove('cell-fill-animate'), 400);
    }
    
    // Auto-advance to next cell
    if (value) {
        const nextCell = findNextEmptyCell(input);
        if (nextCell) {
            nextCell.focus();
        }
    }
}

// Handle cell focus
function handleCellFocus(event) {
    // Remove any invalid highlighting when focusing a cell
    event.target.classList.remove('invalid');
}

// Handle keyboard navigation
function handleCellKeydown(event) {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        
        const currentRow = parseInt(event.target.dataset.row);
        const currentCol = parseInt(event.target.dataset.col);
        
        let newRow = currentRow;
        let newCol = currentCol;
        
        // Calculate new position
        switch(event.key) {
            case 'ArrowUp':
                newRow = Math.max(0, currentRow - 1);
                break;
            case 'ArrowDown':
                newRow = Math.min(8, currentRow + 1);
                break;
            case 'ArrowLeft':
                newCol = Math.max(0, currentCol - 1);
                break;
            case 'ArrowRight':
                newCol = Math.min(8, currentCol + 1);
                break;
        }
        
        // Find the cell at the new position
        const boardElement = event.target.closest('.sudoku-board');
        const cells = boardElement.querySelectorAll('.sudoku-cell');
        const targetIndex = newRow * 9 + newCol;
        const targetCell = cells[targetIndex];
        
        // Focus the cell if it's an input
        if (targetCell.tagName === 'INPUT') {
            targetCell.focus();
        } else {
            // If it's a fixed cell, try to find the next input cell in the same direction
            const direction = event.key;
            findNextCellInDirection(boardElement, newRow, newCol, direction).focus();
        }
    }
}

// Find the next empty cell
function findNextEmptyCell(currentCell) {
    const boardElement = currentCell.closest('.sudoku-board');
    const cells = Array.from(boardElement.querySelectorAll('input.sudoku-cell'));
    
    // Find the index of the current cell
    const currentIndex = cells.indexOf(currentCell);
    
    // Look for the next input cell
    for (let i = currentIndex + 1; i < cells.length; i++) {
        return cells[i];
    }
    
    // If we reach here, there are no more empty cells
    return null;
}

// Find the next cell in a specific direction
function findNextCellInDirection(boardElement, row, col, direction) {
    const cells = boardElement.querySelectorAll('.sudoku-cell');
    
    // Keep moving in the specified direction until we find an input cell
    let newRow = row;
    let newCol = col;
    
    while (true) {
        // Move in the specified direction
        switch(direction) {
            case 'ArrowUp':
                newRow = Math.max(0, newRow - 1);
                break;
            case 'ArrowDown':
                newRow = Math.min(8, newRow + 1);
                break;
            case 'ArrowLeft':
                newCol = Math.max(0, newCol - 1);
                break;
            case 'ArrowRight':
                newCol = Math.min(8, newCol + 1);
                break;
        }
        
        // Check if we've reached the edge of the board
        if (newRow === 0 && direction === 'ArrowUp' ||
            newRow === 8 && direction === 'ArrowDown' ||
            newCol === 0 && direction === 'ArrowLeft' ||
            newCol === 8 && direction === 'ArrowRight') {
            
            // If at the edge, return the cell at this position regardless of type
            const edgeIndex = newRow * 9 + newCol;
            const edgeCell = cells[edgeIndex];
            
            return edgeCell.tagName === 'INPUT' ? edgeCell : document.activeElement;
        }
        
        // Get the cell at the new position
        const index = newRow * 9 + newCol;
        const cell = cells[index];
        
        // If it's an input cell, return it
        if (cell.tagName === 'INPUT') {
            return cell;
        }
    }
}

// Set up keyboard navigation for the entire board
function setupKeyboardNavigation(boardElement) {
    // Let the individual cell handlers handle navigation
}