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
            this.render();
        });
    }
    
    /**
     * Handle canvas click/tap
     */
    handleCanvasClick(event) {
        if (!this.canSelect) return;
        
        const clickX = event.offsetX;
        const clickY = event.offsetY;
        
        // Check if a cup was clicked
        for (let i = 0; i < this.cups.length; i++) {
            if (this.cups[i].containsPoint({ x: clickX, y: clickY })) {
                this.selectCup(i);
                break;
            }
        }
    }
    
    /**
     * Process player's cup selection
     */
    async selectCup(index) {
        if (!this.canSelect) return;
        
        this.canSelect = false;
        
        // Reveal the selected cup
        await this.animation.revealCup(this.cups[index]);
        
        // Check if the player guessed correctly
        const correct = index === this.coinIndex;
        
        // Show all cups after a delay
        setTimeout(async () => {
            // Show all cups to reveal the correct one
            for (let i = 0; i < this.cups.length; i++) {
                if (i !== index) {
                    await this.animation.revealCup(this.cups[i]);
                }
            }
            
            // Update score
            if (correct) {
                this.consecutiveWins++;
                
                // Apply combo bonus if applicable
                const multiplier = (this.consecutiveWins >= 3) ? CONFIG.COMBO_MULTIPLIER : 1;
                const points = Math.round(CONFIG.POINTS_PER_WIN * multiplier);
                
                this.score += points;
                this.updateScoreDisplay();
                
                // Show success message
                this.showMessage(`Correct! +${points} points`, '#28a745');
            } else {
                this.consecutiveWins = 0;
                this.showMessage('Wrong! Try again', '#dc3545');
            }
            
            // Allow restart after a short delay
            setTimeout(() => {
                document.getElementById('start-btn').textContent = 'Play Again';
                document.getElementById('start-btn').disabled = false;
                this.gameActive = false;
            }, 2000);
            
        }, 1000);
    }
    
    /**
     * Start new game
     */
    async startGame() {
        // Hide any previous messages
        this.hideMessage();
        
        // Reset game state
        this.gameActive = true;
        this.canSelect = false;
        document.getElementById('start-btn').disabled = true;
        
        // Get difficulty level
        this.difficulty = parseInt(document.getElementById('difficulty').value);
        document.getElementById('level').textContent = `Level: ${this.difficulty}`;
        
        // Clear existing cups
        this.cups = [];
        
        // Hide all cups (in case there are any)
        await this.animation.hideAllCups();
        
        // Set difficulty in animation module
        this.animation.setDifficulty(this.difficulty);
        
        // Create cups based on difficulty
        const numCups = CONFIG.DIFFICULTY[this.difficulty].NUM_CUPS;
        this.createCups(numCups);
        
        // Randomly decide which cup has the coin
        this.coinIndex = Math.floor(Math.random() * numCups);
        this.cups[this.coinIndex].hasCoin = true;
        
        // Show all cups initially
        for (let i = 0; i < this.cups.length; i++) {
            await this.animation.revealCup(this.cups[i]);
        }
        
        // Show which cup has the coin
        this.showMessage('Remember which cup has the coin!', '#007bff');
        
        // Wait for player to see the coin
        setTimeout(async () => {
            // Hide message
            this.hideMessage();
            
            // Hide cups
            await this.animation.hideAllCups();
            
            // Short pause before shuffling
            setTimeout(async () => {
                // Start shuffling
                await this.animation.startShuffle();
                
                // Short pause after shuffling
                setTimeout(() => {
                    // Allow player to select
                    this.canSelect = true;
                    this.showMessage('Which cup has the coin?', '#007bff');
                }, CONFIG.PAUSE_AFTER_SHUFFLE);
                
            }, CONFIG.PAUSE_BEFORE_SHUFFLE);
            
        }, CONFIG.SHOW_COIN_TIME);
    }
    
    /**
     * Create cups with initial positions
     */
    createCups(numCups) {
        // Clear existing cups
        this.cups = [];
        
        const cupWidth = CONFIG.CUP.WIDTH;
        const cupHeight = CONFIG.CUP.HEIGHT;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        // Calculate total width needed for cups
        const totalWidth = numCups * cupWidth + (numCups - 1) * 20; // 20px spacing
        
        // Calculate starting position (centered)
        let startX = (canvasWidth - totalWidth) / 2 + cupWidth / 2;
        const y = canvasHeight / 2;
        
        // Create cups in a row
        for (let i = 0; i < numCups; i++) {
            const x = startX + i * (cupWidth + 20);
            const cup = new Cup(x, y);
            this.cups.push(cup);
        }
        
        // Update animation module with new cups
        this.animation.cups = this.cups;
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
            messageElement.style.padding = '10px 20px';
            messageElement.style.borderRadius = '20px';
            messageElement.style.fontWeight = 'bold';
            messageElement.style.textAlign = 'center';
            messageElement.style.zIndex = '10';
            messageElement.style.transition = 'opacity 0.3s';
            messageElement.style.opacity = '0';
            document.querySelector('.game-area').appendChild(messageElement);
        }
        
        messageElement.textContent = text;
        messageElement.style.backgroundColor = color;
        messageElement.style.color = 'white';
        
        // Fade in
        setTimeout(() => {
            messageElement.style.opacity = '1';
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
        
        // Draw all cups
        for (let i = 0; i < this.cups.length; i++) {
            this.cups[i].draw(this.ctx);
        }
        
        // Continue animation loop
        requestAnimationFrame(this.render.bind(this));
    }
    
    /**
     * Start the game loop
     */
    start() {
        // Start render loop
        this.render();
    }
} 