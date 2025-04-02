/**
 * Main application entry point
 * Initialize game and set up event listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    // Get canvas element
    const canvas = document.getElementById('game-canvas');
    
    // Create game instance
    const game = new Game(canvas);
    
    // Start game loop
    game.start();
    
    // Set up button event listeners
    const startButton = document.getElementById('start-btn');
    startButton.addEventListener('click', () => {
        if (!game.gameActive) {
            game.startGame();
            startButton.textContent = 'Playing...';
        }
    });
    
    // Handle difficulty change
    const difficultySelect = document.getElementById('difficulty');
    difficultySelect.addEventListener('change', () => {
        const level = parseInt(difficultySelect.value);
        document.getElementById('level').textContent = `Level: ${level}`;
    });
    
    // Check for high score in local storage
    const highScore = localStorage.getItem('highScore');
    if (highScore) {
        // Show high score
        const scoreElement = document.getElementById('score');
        scoreElement.innerHTML = `Score: 0 <span style="font-size: 0.8em; opacity: 0.7;">(Best: ${highScore})</span>`;
    }
    
    // Mobile-specific optimizations
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        // Prevent pinch zoom
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });
        
        // Fullscreen mode for iOS
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            setTimeout(() => {
                window.scrollTo(0, 1);
            }, 100);
        }
    }
    
    // Add welcome message
    game.showMessage('Tap Start Game to play!', '#007bff');
}); 