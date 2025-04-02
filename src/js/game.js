/**
 * Game Class
 * Manages game state, player input, and game flow
 */
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cups = [];
        this.animation = null;
        this.coinIndex = -1;
        this.gameActive = false;
        this.difficulty = 1;
        this.score = 0;
        this.consecutiveWins = 0;
        this.canSelect = false;
        this.selectionButtons = []; // Added to track selection buttons
        
        // Resize canvas to match displayed size
        this.resizeCanvas();
        
        // Initialize animation module
        this.animation = new Animation(this.cups, this.canvas);
        
        // Setup event listeners
        this.setupEventListeners();
    }
    
    /**
     * Make sure canvas dimensions match its display size
     */
    resizeCanvas() {
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;
        
        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
        }
    }
    
    /**
     * Set up input event handlers
     */
    setupEventListeners() {
        // Handle taps/clicks
        this.canvas.addEventListener('click', this.handleCanvasClick.bind(this));
        
        // Handle touch events for mobile
        this.canvas.addEventListener('touchstart', (event) => {
            event.preventDefault(); // Prevent scrolling
        });
        
        this.canvas.addEventListener('touchend', (event) => {
            event.preventDefault();
            if (event.changedTouches.length > 0) {
                const touch = event.changedTouches[0];
                const rect = this.canvas.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                
                this.handleCanvasClick({ offsetX: x, offsetY: y });
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            
            // Reposition buttons if they exist
            if (this.selectionButtons.length > 0 && this.canSelect) {
                this.repositionSelectionButtons();
            }
            
            this.render();
        });
    }
    
    /**
     * Handle canvas click/tap
     */
    handleCanvasClick(event) {
        // No longer needed for cup selection as we're using buttons instead
        // Kept for potential future interactions
    }
    
    /**
     * Process player's cup selection
     */
    async selectCup(index) {
        if (!this.canSelect) return;
        
        console.log(`Cup ${index + 1} selected, coin is under cup ${this.coinIndex + 1}`);
        this.canSelect = false;
        
        // Hide selection buttons
        this.hideSelectionButtons();
        
        // Reveal the selected cup
        this.cups[index].reveal();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if the player guessed correctly
        const correct = index === this.coinIndex;
        
        // Show result
        if (correct) {
            this.score += CONFIG.POINTS_PER_WIN;
            this.updateScoreDisplay();
            this.showMessage('Correct! +' + CONFIG.POINTS_PER_WIN + ' points', '#28a745');
            
            // Add a visual celebration effect
            this.showCelebration();
        } else {
            this.showMessage('Wrong! The coin was under cup ' + (this.coinIndex + 1), '#dc3545');
            
            // Reveal the correct cup
            this.cups[this.coinIndex].reveal();
        }
        
        // Allow restart after a short delay
        setTimeout(() => {
            document.getElementById('start-btn').textContent = 'Play Again';
            document.getElementById('start-btn').disabled = false;
            this.gameActive = false;
        }, 2000);
    }
    
    /**
     * Start new game
     */
    async startGame() {
        try {
            // Hide any previous messages
            this.hideMessage();
            
            // Reset game state
            this.gameActive = true;
            this.canSelect = false;
            document.getElementById('start-btn').disabled = true;
            document.getElementById('start-btn').textContent = 'Playing...';
            
            // Hide any existing selection buttons
            this.hideSelectionButtons();
            
            // Get difficulty level
            this.difficulty = parseInt(document.getElementById('difficulty').value);
            document.getElementById('level').textContent = `Level: ${this.difficulty}`;
            
            // Create cups based on difficulty
            const numCups = CONFIG.DIFFICULTY[this.difficulty].NUM_CUPS;
            this.createCups(numCups);
            
            // Randomly decide which cup has the coin
            this.coinIndex = Math.floor(Math.random() * numCups);
            this.cups[this.coinIndex].hasCoin = true;
            
            // Show all cups initially with coin visible
            for (let i = 0; i < this.cups.length; i++) {
                this.cups[i].reveal();
            }
            
            // Force a render to make sure cups and coin are drawn
            this.render();
            
            this.showMessage('Remember which cup has the coin!', '#007bff');
            
            // Wait for player to see the coin
            setTimeout(() => {
                // Hide message and cups
                this.hideMessage();
                for (let i = 0; i < this.cups.length; i++) {
                    this.cups[i].hide();
                }
                
                // Force render again to show cups lowered
                this.render();
                
                // Wait for cups to be hidden
                setTimeout(() => {
                    // Start the shuffle animation
                    // The simpleShuffle method will handle creating selection buttons when done
                    this.simpleShuffle();
                }, 500);
            }, 2000);
        } catch (error) {
            console.error("Error starting game:", error);
        }
    }
    
    /**
     * Simple cup shuffling
     */
    simpleShuffle() {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const padding = 50;
        const cupWidth = CONFIG.CUP.WIDTH;
        
        // Show shuffling message
        this.showMessage('Cups are shuffling!', '#ff9900');
        
        // Add a visual shuffle indicator
        this.showShuffleIndicator();
        
        // Force animation loop to start if it's not running
        if (!this._animationRunning) {
            this._animationRunning = true;
            this.render();
        }
        
        // Make very dramatic movements - more exaggerated positions
        // First, create an array of position patterns
        const patterns = [
            // Circle pattern
            (j, cupCount) => {
                const angle = (j * (2 * Math.PI / cupCount));
                const radius = canvasWidth * 0.35; // Larger radius
                return {
                    x: canvasWidth / 2 + Math.cos(angle) * radius,
                    y: canvasHeight / 2 + Math.sin(angle) * radius
                };
            },
            // Diagonal line
            (j, cupCount) => {
                const spacing = Math.min(canvasWidth, canvasHeight) * 0.8 / (cupCount + 1);
                return {
                    x: canvasWidth * 0.15 + j * spacing,
                    y: canvasHeight * 0.15 + j * spacing
                };
            },
            // Horizontal line with waves
            (j, cupCount) => {
                const spacing = canvasWidth * 0.7 / (cupCount + 1);
                return {
                    x: canvasWidth * 0.15 + j * spacing,
                    y: canvasHeight * 0.5 + Math.sin(j * Math.PI) * 80 // More vertical movement
                };
            },
            // Scattered positions
            (j, cupCount) => {
                return {
                    x: padding + cupWidth + Math.random() * (canvasWidth - cupWidth - padding * 3),
                    y: padding + cupWidth + Math.random() * (canvasHeight * 0.7 - padding * 2)
                };
            }
        ];
        
        // Determine number of steps based on difficulty
        const numMoves = 12 + this.difficulty * 4; // More moves for more animation time
        
        // Create a timeline of moves
        const timeline = [];
        
        // Add dramatic shuffle movements
        for (let i = 0; i < numMoves; i++) {
            // Select a pattern based on the current step
            const patternIndex = i % patterns.length;
            const pattern = patterns[patternIndex];
            
            // Generate positions for each cup
            const positions = [];
            for (let j = 0; j < this.cups.length; j++) {
                const pos = pattern(j, this.cups.length);
                
                // Ensure cups stay within bounds
                const x = Math.max(padding + cupWidth/2, Math.min(pos.x, canvasWidth - padding - cupWidth/2));
                const y = Math.max(padding + cupWidth/2, Math.min(pos.y, canvasHeight - padding - cupWidth/2));
                
                positions.push({ x, y });
            }
            
            // Randomize the cup positions to make it harder to track
            if (i > 2) { // Skip first few moves to show clear initial movement
                // Shuffle the positions array
                for (let j = positions.length - 1; j > 0; j--) {
                    const k = Math.floor(Math.random() * (j + 1));
                    [positions[j], positions[k]] = [positions[k], positions[j]];
                }
            }
            
            timeline.push(positions);
        }
        
        // Add final positions in a nice row
        const finalPositions = [];
        const spacing = canvasWidth / (this.cups.length + 1);
        for (let j = 0; j < this.cups.length; j++) {
            finalPositions.push({ 
                x: spacing * (j + 1), 
                y: canvasHeight / 2 
            });
        }
        timeline.push(finalPositions);
        
        // Move cups through each position in the timeline
        const totalDuration = 3000; // 3 seconds total animation
        const stepDuration = totalDuration / timeline.length;
        
        // Execute each move with a delay
        timeline.forEach((positions, i) => {
            setTimeout(() => {
                // Move each cup to its new position
                for (let j = 0; j < this.cups.length; j++) {
                    this.cups[j].moveTo(positions[j].x, positions[j].y);
                }
                
                // Update message halfway through
                if (i === Math.floor(timeline.length / 2)) {
                    this.showMessage('Keep your eyes on the cups!', '#ff9900');
                }
                
                // Update progress indicator
                this.updateShuffleProgress(i / (timeline.length - 1));
                
                // Show the selection buttons when animation is done
                if (i === timeline.length - 1) {
                    setTimeout(() => {
                        this.hideShuffleIndicator();
                        // Create selection buttons after final position is reached
                        setTimeout(() => {
                            this.createSelectionButtons();
                            this.canSelect = true;
                            this.showMessage('Which cup has the coin?', '#007bff');
                        }, 500);
                    }, stepDuration);
                }
            }, i * stepDuration);
        });
    }
    
    /**
     * Show shuffle progress indicator
     */
    showShuffleIndicator() {
        // Remove existing indicator if it exists
        this.hideShuffleIndicator();
        
        // Create container
        const gameArea = document.querySelector('.game-area');
        if (!gameArea) return;
        
        const indicator = document.createElement('div');
        indicator.id = 'shuffle-indicator';
        indicator.style.position = 'absolute';
        indicator.style.bottom = '20px';
        indicator.style.left = '50%';
        indicator.style.transform = 'translateX(-50%)';
        indicator.style.width = '60%';
        indicator.style.height = '10px';
        indicator.style.backgroundColor = 'rgba(255,255,255,0.3)';
        indicator.style.borderRadius = '5px';
        indicator.style.zIndex = '50';
        indicator.style.overflow = 'hidden';
        
        // Create progress bar
        const progress = document.createElement('div');
        progress.id = 'shuffle-progress';
        progress.style.width = '0%';
        progress.style.height = '100%';
        progress.style.backgroundColor = '#ff9900';
        progress.style.borderRadius = '5px';
        progress.style.transition = 'width 0.3s ease';
        
        indicator.appendChild(progress);
        gameArea.appendChild(indicator);
    }
    
    /**
     * Update shuffle progress indicator
     */
    updateShuffleProgress(percentage) {
        const progress = document.getElementById('shuffle-progress');
        if (progress) {
            progress.style.width = `${percentage * 100}%`;
        }
    }
    
    /**
     * Hide shuffle progress indicator
     */
    hideShuffleIndicator() {
        const indicator = document.getElementById('shuffle-indicator');
        if (indicator && indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }
    
    /**
     * Create cups with initial positions
     */
    createCups(numCups) {
        // Clear existing cups
        this.cups = [];
        
        const cupWidth = CONFIG.CUP.WIDTH;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Calculate starting position (centered)
        let startX = (canvasWidth - numCups * cupWidth - (numCups - 1) * 20) / 2 + cupWidth / 2;
        const y = canvasHeight / 2;
        
        // Create cups in a row
        for (let i = 0; i < numCups; i++) {
            const x = startX + i * (cupWidth + 20);
            const cup = new Cup(x, y);
            this.cups.push(cup);
        }
    }
    
    /**
     * Show message to the player
     */
    showMessage(text, color = '#333') {
        // Check if message element exists, create if not
        let messageElement = document.getElementById('game-message');
        
        if (!messageElement) {
            messageElement = document.createElement('div');
            messageElement.id = 'game-message';
            messageElement.style.position = 'absolute';
            messageElement.style.top = '30%';
            messageElement.style.left = '50%';
            messageElement.style.transform = 'translate(-50%, -50%)';
            messageElement.style.padding = '15px 25px';
            messageElement.style.borderRadius = '20px';
            messageElement.style.fontWeight = 'bold';
            messageElement.style.fontSize = '18px';
            messageElement.style.textAlign = 'center';
            messageElement.style.zIndex = '100';
            messageElement.style.transition = 'all 0.3s ease';
            messageElement.style.opacity = '0';
            messageElement.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
            messageElement.style.border = '2px solid rgba(255,255,255,0.5)';
            
            // Get the game area element
            const gameArea = document.querySelector('.game-area');
            if (gameArea) {
                gameArea.appendChild(messageElement);
            } else {
                // Fallback to body if game-area doesn't exist
                document.body.appendChild(messageElement);
            }
        }
        
        messageElement.textContent = text;
        messageElement.style.backgroundColor = color;
        messageElement.style.color = 'white';
        
        // Fade in with a slight bounce effect
        setTimeout(() => {
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translate(-50%, -50%) scale(1.1)';
            
            setTimeout(() => {
                messageElement.style.transform = 'translate(-50%, -50%) scale(1)';
            }, 150);
        }, 10);
    }
    
    /**
     * Hide message
     */
    hideMessage() {
        const messageElement = document.getElementById('game-message');
        if (messageElement) {
            messageElement.style.opacity = '0';
        }
    }
    
    /**
     * Update the score display
     */
    updateScoreDisplay() {
        document.getElementById('score').textContent = `Score: ${this.score}`;
        
        // Store high score
        const currentHighScore = localStorage.getItem('highScore') || 0;
        if (this.score > currentHighScore) {
            localStorage.setItem('highScore', this.score);
        }
    }
    
    /**
     * Game rendering loop
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Get current timestamp for delta calculation
        const now = performance.now();
        const deltaTime = now - (this._lastRenderTime || now);
        this._lastRenderTime = now;
        
        // Update all cups
        for (let i = 0; i < this.cups.length; i++) {
            this.cups[i].update(deltaTime);
        }
        
        // Draw all cups
        for (let i = 0; i < this.cups.length; i++) {
            this.cups[i].draw(this.ctx);
        }
        
        // Reposition selection buttons if they exist
        if (this.selectionButtons.length > 0 && this.canSelect) {
            this.repositionSelectionButtons();
        }
        
        // Continue animation loop
        this._animationRunning = true;
        requestAnimationFrame(this.render.bind(this));
    }
    
    /**
     * Create selection buttons for each cup
     */
    createSelectionButtons() {
        // Remove any existing buttons first
        this.hideSelectionButtons();
        
        // Get game area element
        const gameArea = document.querySelector('.game-area');
        if (!gameArea) return;
        
        // Create a button for each cup
        for (let i = 0; i < this.cups.length; i++) {
            const cup = this.cups[i];
            
            // Create button element
            const button = document.createElement('button');
            button.textContent = `Cup ${i+1}`;
            button.style.position = 'absolute';
            
            // Position button below the cup
            const buttonWidth = 80;
            button.style.left = `${cup.x - buttonWidth/2}px`;
            button.style.top = `${cup.y + 80}px`;
            button.style.width = `${buttonWidth}px`;
            
            // Style the button
            button.style.padding = '8px 12px';
            button.style.backgroundColor = '#4CAF50';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '4px';
            button.style.cursor = 'pointer';
            button.style.zIndex = '1000';
            button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            button.style.transition = 'all 0.2s ease';
            
            // Add hover effects
            button.onmouseover = function() {
                this.style.backgroundColor = '#45a049';
                this.style.transform = 'scale(1.05)';
            };
            button.onmouseout = function() {
                this.style.backgroundColor = '#4CAF50';
                this.style.transform = 'scale(1)';
            };
            
            // Add click event
            button.onclick = () => {
                if (this.canSelect) {
                    this.selectCup(i);
                }
            };
            
            // Add button to the game area
            gameArea.appendChild(button);
            
            // Keep track of button reference
            this.selectionButtons.push(button);
        }
    }
    
    /**
     * Remove all selection buttons
     */
    hideSelectionButtons() {
        this.selectionButtons.forEach(button => {
            if (button.parentNode) {
                button.parentNode.removeChild(button);
            }
        });
        this.selectionButtons = [];
    }
    
    /**
     * Reposition selection buttons after a window resize
     */
    repositionSelectionButtons() {
        const gameArea = document.querySelector('.game-area');
        if (!gameArea) return;
        
        // Update each button position
        for (let i = 0; i < this.cups.length && i < this.selectionButtons.length; i++) {
            const cup = this.cups[i];
            const button = this.selectionButtons[i];
            
            // Calculate position relative to the canvas
            const buttonWidth = 80; // Estimated button width
            const canvasRelativeX = cup.x - (buttonWidth / 2); // Center horizontally under cup
            const canvasRelativeY = cup.y + 100; // Position below cup
            
            button.style.left = `${canvasRelativeX}px`;
            button.style.top = `${canvasRelativeY}px`;
        }
    }
    
    /**
     * Show visual celebration for correct guess
     */
    showCelebration() {
        // Create particle effect container
        const gameArea = document.querySelector('.game-area');
        if (!gameArea) return;
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.width = '10px';
            particle.style.height = '10px';
            particle.style.borderRadius = '50%';
            particle.style.backgroundColor = this.getRandomColor();
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.zIndex = '5';
            
            // Add animation
            particle.style.animation = `particle-fade ${Math.random() * 1 + 1}s forwards`;
            
            // Add CSS animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes particle-fade {
                    0% { transform: translate(0, 0) scale(0); opacity: 0; }
                    50% { opacity: 1; }
                    100% { transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(1); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
            
            gameArea.appendChild(particle);
            
            // Remove after animation completes
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, 2000);
        }
    }
    
    /**
     * Get random bright color for particles
     */
    getRandomColor() {
        const colors = ['#FF5252', '#FF4081', '#E040FB', '#7C4DFF', '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41', '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * Start the game loop
     */
    start() {
        // Start render loop
        this.render();
    }
} 