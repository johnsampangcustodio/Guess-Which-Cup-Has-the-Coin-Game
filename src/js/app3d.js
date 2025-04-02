/**
 * Main application entry point for 3D version
 * Initialize the Three.js game and set up event listeners
 */
document.addEventListener('DOMContentLoaded', () => {
    // Get container element
    const container = document.getElementById('game-canvas');
    
    // Create game instance
    const game = new Game3D(container);
    
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
        // Prevent touch events from causing unintended window actions
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault(); // Prevent pinch zoom
            }
        }, { passive: false });
        
        // Prevent zooming on double tap for mobile Safari
        let lastTapTime = 0;
        document.addEventListener('touchend', (e) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;
            if (tapLength < 300 && tapLength > 0) {
                e.preventDefault(); // Prevent double-tap zoom
            }
            lastTapTime = currentTime;
        }, { passive: false });
        
        // Add iOS fullscreen optimizations
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            // Add scaling viewport for iPhone notch handling
            const meta = document.querySelector('meta[name="viewport"]');
            if (meta) {
                meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
            }
            
            // Scroll to hide address bar
            setTimeout(() => {
                window.scrollTo(0, 1);
            }, 100);
        }
    }
    
    // Add welcome message
    game.showMessage('Tap Start Game to play!', '#007bff');
}); 