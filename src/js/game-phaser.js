/**
 * CUPS AND COINS
 * A kawaii cup-and-ball game created with Phaser 3
 */
class CupsAndCoinsGame {
    constructor() {
        this.gamePhaser = null;
        this.currentDifficulty = 'easy';
        this.score = 0;
        this.streak = 0;
        this.isGameOver = false;
        this.currentRound = 0;
        this.roundsPerGame = CONFIG.GAME.ROUNDS_PER_GAME;
        this.bgMusic = null;
        this.isInitialPreview = true;
        this.assetsLoaded = false;
        
        // Create loading overlay
        this.createLoadingOverlay();
        
        // Configure Phaser game
        this.initPhaser();
        
        // Set up UI event listeners
        this.setupEventListeners();
    }
    
    /**
     * Create a loading overlay that sits on top of the game
     */
    createLoadingOverlay() {
        // Create loading overlay container
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.style.position = 'absolute';
        loadingOverlay.style.top = '0';
        loadingOverlay.style.left = '0';
        loadingOverlay.style.width = '100%';
        loadingOverlay.style.height = '100%';
        loadingOverlay.style.backgroundColor = '#F1E7E7';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.flexDirection = 'column';
        loadingOverlay.style.justifyContent = 'center';
        loadingOverlay.style.alignItems = 'center';
        loadingOverlay.style.zIndex = '100';
        loadingOverlay.style.borderRadius = '15px';
        
        // Loading title
        const loadingTitle = document.createElement('h2');
        loadingTitle.textContent = 'LOADING GAME';
        loadingTitle.style.color = '#E69DB8';
        loadingTitle.style.fontFamily = '"Baloo 2", cursive';
        loadingTitle.style.marginBottom = '20px';
        
        // Add spinner animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
            
            .loading-item {
                animation: bounce 1.2s ease infinite;
                margin: 0 5px;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background-color: #E69DB8;
                display: inline-block;
            }
            
            .loading-item:nth-child(2) {
                animation-delay: 0.2s;
            }
            
            .loading-item:nth-child(3) {
                animation-delay: 0.4s;
            }
        `;
        document.head.appendChild(style);
        
        // Loading progress
        const progressContainer = document.createElement('div');
        progressContainer.style.width = '200px';
        progressContainer.style.height = '30px';
        progressContainer.style.backgroundColor = '#FFD0C7';
        progressContainer.style.borderRadius = '15px';
        progressContainer.style.margin = '20px 0';
        progressContainer.style.overflow = 'hidden';
        
        const progressBar = document.createElement('div');
        progressBar.id = 'loading-progress-bar';
        progressBar.style.width = '0%';
        progressBar.style.height = '100%';
        progressBar.style.backgroundColor = '#E69DB8';
        progressBar.style.transition = 'width 0.3s ease';
        
        // Loading status text
        const loadingStatus = document.createElement('div');
        loadingStatus.id = 'loading-status';
        loadingStatus.textContent = 'Preparing cups and coins...';
        loadingStatus.style.color = '#825765';
        loadingStatus.style.fontFamily = '"Baloo 2", cursive';
        loadingStatus.style.fontSize = '14px';
        loadingStatus.style.marginTop = '10px';
        
        // Bouncing dots
        const dotsContainer = document.createElement('div');
        dotsContainer.style.marginTop = '15px';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'loading-item';
            dotsContainer.appendChild(dot);
        }
        
        // Add elements to overlay
        progressContainer.appendChild(progressBar);
        loadingOverlay.appendChild(loadingTitle);
        loadingOverlay.appendChild(progressContainer);
        loadingOverlay.appendChild(loadingStatus);
        loadingOverlay.appendChild(dotsContainer);
        
        // Add overlay to game container immediately
        const gameContainer = document.getElementById('phaser-game');
        if (gameContainer) {
            gameContainer.style.position = 'relative';
            gameContainer.appendChild(loadingOverlay);
        } else {
            // If game container isn't ready yet, try once more after a short delay
            setTimeout(() => {
                const container = document.getElementById('phaser-game');
                if (container) {
                    container.style.position = 'relative';
                    container.appendChild(loadingOverlay);
                }
            }, 50);
        }
        
        // Store references
        this.loadingOverlay = loadingOverlay;
        this.progressBar = progressBar;
        this.loadingStatus = loadingStatus;
    }
    
    /**
     * Update loading progress
     */
    updateLoadingProgress(percent, status) {
        if (this.progressBar) {
            this.progressBar.style.width = `${percent}%`;
        }
        
        if (this.loadingStatus && status) {
            this.loadingStatus.textContent = status;
        }
    }
    
    /**
     * Hide loading overlay when game is ready
     */
    hideLoadingOverlay() {
        if (this.loadingOverlay) {
            // Fade out animation
            this.loadingOverlay.style.transition = 'opacity 0.5s ease';
            this.loadingOverlay.style.opacity = '0';
            
            // Remove after animation
            setTimeout(() => {
                if (this.loadingOverlay && this.loadingOverlay.parentNode) {
                    this.loadingOverlay.parentNode.removeChild(this.loadingOverlay);
                }
            }, 300); // Reduced from 500ms
        }
    }
    
    /**
     * Initialize Phaser game instance
     */
    initPhaser() {
        // Create Phaser game
        this.gameConfig = {
            type: Phaser.AUTO,
            width: CONFIG.GAME.width,
            height: CONFIG.GAME.height,
            backgroundColor: CONFIG.COLORS.TABLE,
            parent: 'phaser-game',
            scene: {
                preload: this.preload.bind(this),
                create: this.create.bind(this),
                update: this.update.bind(this)
            },
            audio: {
                disableWebAudio: false,
                noAudio: false
            },
            render: {
                pixelArt: false,
                antialias: true,
                roundPixels: false
            }
        };
        
        this.gamePhaser = new Phaser.Game(this.gameConfig);
    }
    
    /**
     * Set up UI event listeners
     */
    setupEventListeners() {
        // Listen for difficulty change
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            // Reset cups on difficulty change if game already started
            if (this.scene && this.isGameStarted) {
                this.resetCups();
            }
        });
        
        // Listen for new game button
        document.getElementById('new-game').addEventListener('click', () => {
            // Always allow starting the game, even if assets aren't fully loaded
            this.startNewGame();
            
            // Try to play music if it's loaded
            if (this.bgMusic) {
                this.playBackgroundMusic();
            }
        });
    }
    
    /**
     * Preload assets
     */
    preload() {
        this.scene = this.gamePhaser.scene.scenes[0];
        
        // Update loading progress
        this.updateLoadingProgress(20, "Loading game assets...");
        
        // Fast-track loading by not waiting for music
        this.scene.load.audio('bgMusic', 'src/media/bgMusic.mp3');
        
        // Mark music loading as optional - don't block game start
        this.scene.load.once('filecomplete-audio-bgMusic', () => {
            console.log("Music loaded successfully");
        });
        
        // Continue even if music fails to load
        this.scene.load.once('loaderror', (fileObj) => {
            console.warn("Asset failed to load:", fileObj.key);
            // Continue with game setup anyway
            this.updateLoadingProgress(80, "Setting up game...");
        });
        
        // Speed up by not waiting for all assets
        this.updateLoadingProgress(50, "Preparing game...");
    }
    
    /**
     * Create game objects
     */
    create() {
        console.log("Game scene created");
        this.updateLoadingProgress(80, "Setting up game...");
        
        // Set up game immediately without waiting for fonts
        this.setupGame();
        
        // Load fonts in background
        WebFont.load({
            google: {
                families: ['Baloo 2:400,600,700']
            },
            active: () => {
                console.log("Fonts loaded");
            },
            inactive: () => {
                console.warn("Fonts failed to load");
            }
        });
        
        try {
            // Create background music if possible
            this.bgMusic = this.scene.sound.add('bgMusic', {
                volume: 0.5,
                loop: true
            });
        } catch (error) {
            console.warn("Background music not available:", error);
        }
        
        // Mark game as loaded
        this.assetsLoaded = true;
        this.updateLoadingProgress(100, "Game Ready!");
        
        // Hide loading overlay after a very short delay
        setTimeout(() => {
            this.hideLoadingOverlay();
        }, 200); // Reduced from 1000ms
    }
    
    /**
     * Play background music with fade-in effect
     */
    playBackgroundMusic() {
        try {
            if (this.bgMusic && !this.bgMusic.isPlaying) {
                console.log("Playing background music");
                this.bgMusic.setVolume(0.5);
                this.bgMusic.play();
            }
        } catch (error) {
            console.warn("Error playing music:", error);
        }
    }
    
    /**
     * Update loop
     */
    update() {
        // Update cups for hover effects
        if (this.cups) {
            this.cups.forEach(cup => {
                const pointer = this.scene.input.activePointer;
                const isHovering = cup.getBounds().contains(pointer.x, pointer.y);
                
                // Only set hover when game is active and pointer is over the cup
                if (!this.isShuffling && !this.isGameOver && this.isGameStarted) {
                    cup.setHover(isHovering && pointer.isDown === false);
                } else {
                    cup.setHover(false);
                }
            });
        }
    }
    
    /**
     * Set up the main game elements
     */
    setupGame() {
        console.log("Setting up game elements");
        
        try {
            // Create UI elements
            this.createUI();
            
            // Create cups
            this.createCups();
            
            // Show welcome message
            this.updateMessageText('Welcome to CUPS AND COINS!', 0xE69DB8);
            
            // Set initial state
            this.isGameStarted = false;
            this.isShuffling = false;
            this.isGameOver = false;
            
            // Show preview if cups loaded successfully
            if (this.cups && this.cups.length > 0) {
                this.showCoinBriefly();
            }
        } catch (error) {
            console.error("Error setting up game:", error);
            this.updateLoadingProgress(100, "Error loading game. Try refreshing.");
        }
    }
    
    /**
     * Show coin briefly as a preview
     */
    showCoinBriefly() {
        console.log("Showing coin preview");
        
        // Find cup with coin
        const coinCup = this.cups.find(cup => cup.hasCoin);
        
        if (coinCup) {
            // Show message
            this.updateMessageText('Watch for the coin!', 0xE69DB8);
            
            // Lift to show coin
            coinCup.lift();
            
            // Lower after a moment
            this.scene.time.delayedCall(CONFIG.ANIMATION.SHOW_COIN_TIME, () => {
                coinCup.lower();
            });
        } else {
            console.error("No coin cup found during preview");
        }
    }
    
    /**
     * Create UI elements
     */
    createUI() {
        const width = this.gameConfig.width;
        const height = this.gameConfig.height;
        
        // Score text
        this.scoreText = this.scene.add.text(width - 10, 10, 'SCORE: 0', {
            fontFamily: '"Baloo 2", cursive',
            fontSize: '18px',
            color: '#825765',
            fontWeight: 'bold'
        }).setOrigin(1, 0);
        
        // Rounds text
        this.roundsText = this.scene.add.text(10, 10, 'ROUND: 0/' + this.roundsPerGame, {
            fontFamily: '"Baloo 2", cursive',
            fontSize: '18px',
            color: '#825765',
            fontWeight: 'bold'
        }).setOrigin(0, 0);
        
        // Game message
        this.message = new KawaiiMessage(this.scene, width/2, height - 35);
    }
    
    /**
     * Create cups based on difficulty
     */
    createCups() {
        console.log("Creating cups for difficulty:", this.currentDifficulty);
        const width = this.gameConfig.width;
        const height = this.gameConfig.height;
        
        // Clear existing cups if any
        if (this.cups) {
            this.cups.forEach(cup => cup.destroy());
        }
        
        // Create cups
        const diffSettings = CONFIG.DIFFICULTY[this.currentDifficulty];
        if (!diffSettings) {
            console.error("Invalid difficulty settings:", this.currentDifficulty);
            return;
        }
        
        const cupCount = diffSettings.CUP_COUNT;
        const cupSpacing = diffSettings.CUP_SPACING;
        
        this.cups = [];
        
        // Calculate total width of all cups
        const totalWidth = (cupCount - 1) * cupSpacing;
        
        // Random cup has coin
        const coinIndex = Phaser.Math.Between(0, cupCount - 1);
        
        // Create each cup
        for (let i = 0; i < cupCount; i++) {
            // Position cups evenly across the game width
            const x = width/2 - totalWidth/2 + i * cupSpacing;
            const y = height/2;
            
            // Create cup (only one has the coin)
            const hasCoin = i === coinIndex;
            const cup = new KawaiiCup(this.scene, x, y, hasCoin);
            
            // Add click handler
            cup.on('pointerdown', () => {
                this.onCupClick(cup);
            });
            
            this.cups.push(cup);
        }
    }
    
    /**
     * Reset cups for a new round
     */
    resetCups() {
        // Create new cups
        this.createCups();
    }
    
    /**
     * Start a new game
     */
    startNewGame() {
        console.log("Starting new game");
        // Reset game state
        this.isGameStarted = true;
        this.isGameOver = false;
        this.score = 0;
        this.streak = 0;
        this.currentRound = 0;
        
        // Update UI
        this.updateScoreText();
        this.updateRoundsText();
        
        // Start first round
        this.startNewRound();
    }
    
    /**
     * Start a new round
     */
    startNewRound() {
        console.log("Starting round:", this.currentRound + 1);
        // Increment round
        this.currentRound++;
        this.updateRoundsText();
        
        // Check if game is over based on rounds
        if (this.currentRound > this.roundsPerGame) {
            this.endGame();
            return;
        }
        
        // Create new cups
        this.createCups();
        
        // Show message
        this.updateMessageText('Round ' + this.currentRound + ' - Watch for the coin!', 0xE69DB8);
        
        // Get cup with coin
        const coinCup = this.cups.find(cup => cup.hasCoin);
        
        if (!coinCup) {
            console.error("No coin cup found in round", this.currentRound);
            return;
        }
        
        // Lift to show coin
        coinCup.lift();
        
        // Lower after a moment and start shuffling
        this.scene.time.delayedCall(CONFIG.ANIMATION.SHOW_COIN_TIME, () => {
            coinCup.lower();
            
            // Pause before shuffling
            this.scene.time.delayedCall(CONFIG.ANIMATION.PAUSE_BEFORE_SHUFFLE, () => {
                this.startShuffling();
            });
        });
    }
    
    /**
     * Shuffle the cups
     */
    startShuffling() {
        this.isShuffling = true;
        
        // Update message
        this.updateMessageText('Shuffling...', 0xE69DB8);
        
        // Get shuffle config
        const shuffleCount = CONFIG.DIFFICULTY[this.currentDifficulty].SHUFFLE_COUNT;
        const shuffleSpeed = CONFIG.DIFFICULTY[this.currentDifficulty].SHUFFLE_SPEED;
        
        // Run shuffle sequence
        this.runShuffleSequence(shuffleCount, shuffleSpeed, () => {
            // Pause after shuffling
            this.scene.time.delayedCall(CONFIG.ANIMATION.PAUSE_AFTER_SHUFFLE, () => {
                this.isShuffling = false;
                this.updateMessageText('Find the coin!', 0xE69DB8);
                
                // Wobble all cups to show shuffling is finished
                this.cups.forEach(cup => cup.wobble());
            });
        });
    }
    
    /**
     * Run a sequence of shuffles
     */
    runShuffleSequence(count, speed, onComplete) {
        let shufflesRemaining = count;
        
        const doNextShuffle = () => {
            if (shufflesRemaining <= 0) {
                onComplete();
                return;
            }
            
            // Swap two random cups
            this.swapRandomCups(speed, () => {
                shufflesRemaining--;
                doNextShuffle();
            });
        };
        
        doNextShuffle();
    }
    
    /**
     * Swap two random cups
     */
    swapRandomCups(speed, onComplete) {
        // Pick two different random cups
        const cupCount = this.cups.length;
        const idx1 = Phaser.Math.Between(0, cupCount - 1);
        let idx2 = Phaser.Math.Between(0, cupCount - 1);
        
        // Make sure they're different
        while (idx1 === idx2) {
            idx2 = Phaser.Math.Between(0, cupCount - 1);
        }
        
        const cup1 = this.cups[idx1];
        const cup2 = this.cups[idx2];
        
        // Store original positions
        const pos1 = { x: cup1.baseX, y: cup1.baseY };
        const pos2 = { x: cup2.baseX, y: cup2.baseY };
        
        // Move cups to each other's positions
        cup1.moveTo(pos2.x, pos2.y, speed);
        cup2.moveTo(pos1.x, pos1.y, speed);
        
        // Swap in the array as well
        this.cups[idx1] = cup2;
        this.cups[idx2] = cup1;
        
        // Call complete after the duration
        this.scene.time.delayedCall(speed, onComplete);
    }
    
    /**
     * Handle cup click
     */
    onCupClick(cup) {
        // Ignore clicks during shuffling, after game over, or before start
        if (this.isShuffling || this.isGameOver || !this.isGameStarted) {
            return;
        }
        
        // Lift the cup
        cup.lift();
        
        // Check if this cup has the coin
        if (cup.hasCoin) {
            // Correct guess!
            this.streak++;
            this.score += this.calculateScore();
            this.updateScoreText();
            
            // Show success message
            this.updateMessageText('You found it! +' + this.calculateScore() + ' points', 0x45a854);
            
            // Wait before next round
            this.scene.time.delayedCall(1500, () => {
                // Lower all cups
                this.cups.forEach(c => c.lower());
                
                // Start next round
                this.scene.time.delayedCall(500, () => {
                    this.startNewRound();
                });
            });
        } else {
            // Wrong guess!
            this.streak = 0;
            
            // Show failure message
            this.updateMessageText('Wrong cup! Try again.', 0xa85754);
            
            // Lower after a moment
            this.scene.time.delayedCall(1000, () => {
                cup.lower();
            });
        }
    }
    
    /**
     * End the game
     */
    endGame() {
        this.isGameOver = true;
        
        // Show game over message
        this.updateMessageText('Game Over! Final Score: ' + this.score, 0xE69DB8);
        
        // Lift all cups to reveal the one with coin
        this.cups.forEach(cup => cup.lift());
        
        // Fade out music
        if (this.bgMusic && this.bgMusic.isPlaying) {
            this.scene.tweens.add({
                targets: this.bgMusic,
                volume: 0,
                duration: 2000,
                ease: 'Linear',
                onComplete: () => {
                    this.bgMusic.stop();
                }
            });
        }
    }
    
    /**
     * Calculate score based on difficulty and streak
     */
    calculateScore() {
        const difficultyMultiplier = {
            'easy': 1,
            'medium': 2,
            'hard': 3
        };
        
        // Base score + streak bonus
        const baseScore = 10;
        const streakBonus = Math.min(this.streak * 5, 20);
        const diffBonus = difficultyMultiplier[this.currentDifficulty];
        
        return baseScore + streakBonus * diffBonus;
    }
    
    /**
     * Update the score text
     */
    updateScoreText() {
        this.scoreText.setText('SCORE: ' + this.score);
    }
    
    /**
     * Update the rounds text
     */
    updateRoundsText() {
        this.roundsText.setText('ROUND: ' + this.currentRound + '/' + this.roundsPerGame);
    }
    
    /**
     * Update message text
     */
    updateMessageText(text, color) {
        this.message.show(text, color);
    }
} 