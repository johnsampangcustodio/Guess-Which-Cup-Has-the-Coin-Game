/**
 * Main game implementation using Phaser
 */

// Initialize Phaser game when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    // Game configuration
    const gameConfig = {
        type: Phaser.AUTO,
        width: CONFIG.GAME.width,
        height: CONFIG.GAME.height,
        backgroundColor: CONFIG.GAME.backgroundColor,
        parent: CONFIG.GAME.parent,
        scene: [KawaiiCupGame],
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        }
    };
    
    // Create new game instance
    const game = new Phaser.Game(gameConfig);
});

/**
 * KawaiiCupGame Scene - Main game scene
 */
class KawaiiCupGame extends Phaser.Scene {
    constructor() {
        super('KawaiiCupGame');
        
        // Game state variables
        this.cups = [];
        this.coinIndex = -1;
        this.gameActive = false;
        this.difficulty = 1;
        this.score = 0;
        this.consecutiveWins = 0;
        this.canSelect = false;
    }
    
    /**
     * Load assets
     */
    preload() {
        // Preload any assets (none needed for this version as we draw everything)
        
        // Create loading screen
        const loadingText = this.add.text(
            this.cameras.main.width / 2, 
            this.cameras.main.height / 2, 
            'Loading...', 
            { 
                fontFamily: '"Baloo 2", cursive',
                fontSize: '24px',
                color: '#fa86c4'
            }
        ).setOrigin(0.5);
        
        // Add loading animation
        this.tweens.add({
            targets: loadingText,
            scale: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * Create the game
     */
    create() {
        // Create table/background
        this.createTable();
        
        // Initialize game message
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2 - 40;
        this.message = new KawaiiMessage(this, centerX, centerY);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize with welcome message
        this.message.show('Tap Start Game to play!', 0x9771a8);
    }
    
    /**
     * Create a cute table for the cups
     */
    createTable() {
        // Background decorations (polka dots)
        for (let i = 0; i < 15; i++) {
            const x = Phaser.Math.Between(20, this.cameras.main.width - 20);
            const y = Phaser.Math.Between(20, this.cameras.main.height - 20);
            const size = Phaser.Math.Between(3, 8);
            
            const dot = this.add.circle(x, y, size, 0xffd1ec, 0.4);
            
            // Add a little scale animation
            this.tweens.add({
                targets: dot,
                scale: 1.3,
                duration: Phaser.Math.Between(1500, 3000),
                yoyo: true,
                repeat: -1,
                ease: 'Sine.InOut',
                delay: Phaser.Math.Between(0, 1000)
            });
        }
        
        // Table surface
        const tableWidth = this.cameras.main.width - 40;
        const tableHeight = 30;
        const tableY = this.cameras.main.height - tableHeight/2 - 20;
        
        // Table top
        this.add.rectangle(
            this.cameras.main.width / 2,
            tableY,
            tableWidth,
            tableHeight,
            CONFIG.COLORS.TABLE
        ).setStrokeStyle(3, CONFIG.COLORS.CUP_SECONDARY);
        
        // Table shadow
        this.add.ellipse(
            this.cameras.main.width / 2,
            tableY + tableHeight/2 + 5,
            tableWidth - 30,
            15,
            0x000000,
            0.1
        );
        
        // Decorative elements
        // Small hearts
        for (let i = 0; i < 3; i++) {
            const heartX = 40 + i * (tableWidth / 3);
            const heart = this.add.image(heartX, tableY, 'heart');
            // If no heart image, create a simple one
            if (!heart.texture.key) {
                const heartGraphic = this.add.graphics();
                heartGraphic.fillStyle(CONFIG.COLORS.FACE_BLUSH, 0.6);
                heartGraphic.fillCircle(-4, -4, 5);
                heartGraphic.fillCircle(4, -4, 5);
                // Triangle for bottom of heart
                heartGraphic.fillTriangle(-8, -2, 8, -2, 0, 8);
                heartGraphic.generateTexture('heart', 20, 20);
                heartGraphic.destroy();
                
                // Create heart with new texture
                this.add.image(heartX, tableY, 'heart').setScale(0.6);
            }
        }
    }
    
    /**
     * Set up event listeners for UI controls
     */
    setupEventListeners() {
        // Get UI elements
        const startButton = document.getElementById('start-btn');
        const difficultySelect = document.getElementById('difficulty');
        
        // Start button
        startButton.addEventListener('click', () => {
            if (!this.gameActive) {
                // Get the difficulty level
                this.difficulty = parseInt(difficultySelect.value);
                
                // Start the game
                this.startGame();
                
                // Update button text
                startButton.textContent = 'Playing...';
                startButton.disabled = true;
            }
        });
        
        // Difficulty select
        difficultySelect.addEventListener('change', () => {
            const level = parseInt(difficultySelect.value);
            document.getElementById('level').textContent = `Level: ${level}`;
        });
        
        // Check for high score
        const highScore = localStorage.getItem('highScore');
        if (highScore) {
            // Show high score
            const scoreElement = document.getElementById('score');
            scoreElement.innerHTML = `Score: 0 <span style="font-size: 0.8em; opacity: 0.7;">(Best: ${highScore})</span>`;
        }
    }
    
    /**
     * Start a new game
     */
    async startGame() {
        // Reset game state
        this.gameActive = true;
        this.canSelect = false;
        
        // Hide message
        this.message.hide();
        
        // Clear existing cups
        this.cleanUpCups();
        
        // Get settings for this difficulty level
        const diffSettings = CONFIG.DIFFICULTY[this.difficulty];
        
        // Create cups
        await this.createCups(diffSettings.NUM_CUPS, diffSettings.CUP_SCALE, diffSettings.CUP_SPACING);
        
        // Show coin under the correct cup
        await this.showInitialCoin();
        
        // Start shuffling after a delay
        this.time.delayedCall(CONFIG.SHOW_COIN_TIME, async () => {
            // Hide cups
            await this.hideCups();
            
            // Pause before shuffling
            this.time.delayedCall(CONFIG.PAUSE_BEFORE_SHUFFLE, async () => {
                // Shuffle cups
                await this.shuffleCups(diffSettings.NUM_SHUFFLES, diffSettings.SHUFFLE_SPEED);
                
                // Allow selection after shuffle
                this.time.delayedCall(CONFIG.PAUSE_AFTER_SHUFFLE, () => {
                    // Enable cup selection
                    this.canSelect = true;
                    
                    // Show message to select
                    this.message.show('Which cup has the coin?', 0x9771a8);
                    
                    // Make cups wobble slightly to indicate they're done moving
                    this.cups.forEach(cup => cup.wobble());
                });
            });
        });
    }
    
    /**
     * Create cups based on difficulty
     */
    async createCups(numCups, scale, spacing) {
        this.cups = [];
        
        // Calculate total width needed
        const totalWidth = (numCups - 1) * spacing;
        
        // Randomly choose which cup has the coin
        this.coinIndex = Phaser.Math.Between(0, numCups - 1);
        
        // Create cups in a row
        const centerX = this.cameras.main.width / 2;
        const y = this.cameras.main.height - 110;
        
        for (let i = 0; i < numCups; i++) {
            const x = centerX - totalWidth / 2 + i * spacing;
            const hasCoin = (i === this.coinIndex);
            
            // Create cup
            const cup = new KawaiiCup(this, x, y, hasCoin);
            cup.setScale(scale);
            
            // Add click/tap handler
            cup.on('pointerdown', () => {
                if (this.canSelect) {
                    this.selectCup(i);
                }
            });
            
            // Add hover effect
            cup.on('pointerover', () => {
                if (this.canSelect) {
                    cup.setHover(true);
                }
            });
            
            cup.on('pointerout', () => {
                cup.setHover(false);
            });
            
            this.cups.push(cup);
        }
    }
    
    /**
     * Show the coin under the correct cup initially
     */
    async showInitialCoin() {
        // Show message
        this.message.show('Remember which cup has the coin!', 0xfa86c4);
        
        // Lift all cups to show what's underneath
        const promises = this.cups.map(cup => {
            return new Promise(resolve => {
                // Add a slight delay between cups lifting
                this.time.delayedCall(200 + Phaser.Math.Between(0, 300), () => {
                    cup.lift();
                    
                    // Wait for animation to complete
                    this.time.delayedCall(CONFIG.ANIMATION.LIFT_DURATION + 100, resolve);
                });
            });
        });
        
        await Promise.all(promises);
    }
    
    /**
     * Hide all cups
     */
    async hideCups() {
        // Hide message
        this.message.hide();
        
        // Lower all cups
        const promises = this.cups.map(cup => {
            return new Promise(resolve => {
                cup.lower();
                
                // Wait for animation to complete
                this.time.delayedCall(CONFIG.ANIMATION.LOWER_DURATION + 100, resolve);
            });
        });
        
        await Promise.all(promises);
    }
    
    /**
     * Shuffle the cups
     */
    async shuffleCups(numShuffles, speed) {
        // Show message
        this.message.show('Cups are shuffling!', 0x9771a8);
        
        // Perform a series of cup swaps
        for (let i = 0; i < numShuffles; i++) {
            // Select two random cups to swap
            const idx1 = Phaser.Math.Between(0, this.cups.length - 1);
            let idx2;
            do {
                idx2 = Phaser.Math.Between(0, this.cups.length - 1);
            } while (idx2 === idx1);
            
            // Get the cups
            const cup1 = this.cups[idx1];
            const cup2 = this.cups[idx2];
            
            // Swap their positions
            const tempX = cup1.baseX;
            
            // Animate the swap
            await new Promise(resolve => {
                cup1.moveTo(cup2.baseX, cup1.baseY, speed);
                cup2.moveTo(tempX, cup2.baseY, speed);
                
                // Wait for animation to complete
                this.time.delayedCall(speed + 50, resolve);
            });
            
            // Update array order
            this.cups[idx1] = cup2;
            this.cups[idx2] = cup1;
            
            // If it's the coin cup, update the coin index
            if (this.coinIndex === idx1) {
                this.coinIndex = idx2;
            } else if (this.coinIndex === idx2) {
                this.coinIndex = idx1;
            }
        }
        
        // Hide the message
        this.message.hide();
    }
    
    /**
     * Handle cup selection
     */
    async selectCup(index) {
        if (!this.canSelect) return;
        
        // Disable further selection
        this.canSelect = false;
        
        // Hide message
        this.message.hide();
        
        // Get the selected cup
        const selectedCup = this.cups[index];
        
        // Check if player guessed correctly
        const correct = index === this.coinIndex;
        
        // Lift the selected cup
        selectedCup.lift();
        
        // Wait for animation to complete
        await new Promise(resolve => {
            this.time.delayedCall(CONFIG.ANIMATION.LIFT_DURATION + 200, resolve);
        });
        
        // Reveal the result
        if (correct) {
            // Increase consecutive wins
            this.consecutiveWins++;
            
            // Apply combo bonus if applicable
            const multiplier = (this.consecutiveWins >= 3) ? CONFIG.COMBO_MULTIPLIER : 1;
            const points = Math.round(CONFIG.POINTS_PER_WIN * multiplier);
            
            // Update score
            this.score += points;
            document.getElementById('score').textContent = `Score: ${this.score}`;
            
            // Show success message
            this.message.show(`Correct! +${points} points`, 0x28a745);
            
            // Store high score
            const currentHighScore = localStorage.getItem('highScore') || 0;
            if (this.score > currentHighScore) {
                localStorage.setItem('highScore', this.score);
            }
            
            // Add celebration effects
            this.addCelebrationEffects();
        } else {
            // Reset consecutive wins
            this.consecutiveWins = 0;
            
            // Show failure message
            this.message.show('Wrong! Try again', 0xdc3545);
        }
        
        // Show all cups after a delay
        this.time.delayedCall(1000, async () => {
            // Lift other cups to show all locations
            for (let i = 0; i < this.cups.length; i++) {
                if (i !== index) {
                    this.cups[i].lift();
                    
                    // Add small delay between lifting cups
                    await new Promise(resolve => {
                        this.time.delayedCall(150, resolve);
                    });
                }
            }
            
            // Enable restart after a delay
            this.time.delayedCall(1500, () => {
                const startButton = document.getElementById('start-btn');
                startButton.textContent = 'Play Again';
                startButton.disabled = false;
                this.gameActive = false;
            });
        });
    }
    
    /**
     * Add celebration effects when player wins
     */
    addCelebrationEffects() {
        // Create sparkles/confetti
        for (let i = 0; i < 30; i++) {
            const x = Phaser.Math.Between(50, this.cameras.main.width - 50);
            const y = Phaser.Math.Between(50, this.cameras.main.height - 50);
            const size = Phaser.Math.Between(3, 8);
            
            // Random particle color
            const colors = [0xffdf40, 0xfa86c4, 0xa5ffef, 0xff9bce, 0xd162a4];
            const color = Phaser.Utils.Array.GetRandom(colors);
            
            // Create particle
            const particle = this.add.star(x, y, 5, size / 3, size, color, 0.8);
            particle.setScale(0);
            
            // Particle animation
            this.tweens.add({
                targets: particle,
                scale: { from: 0, to: 1 },
                alpha: { from: 1, to: 0 },
                angle: Phaser.Math.Between(0, 360),
                y: particle.y + Phaser.Math.Between(50, 100),
                duration: Phaser.Math.Between(1000, 2000),
                ease: 'Cubic.Out',
                delay: Phaser.Math.Between(0, 500),
                onComplete: () => {
                    particle.destroy();
                }
            });
        }
    }
    
    /**
     * Clean up existing cups
     */
    cleanUpCups() {
        this.cups.forEach(cup => {
            cup.destroy();
        });
        this.cups = [];
    }
} 