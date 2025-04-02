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
        
        // Time tracking
        this.lastTime = 0;
        this._animationRunning = false;
        
        // Audio setup
        this.bgMusic = null;
        this.soundEffects = {};
        this.audioLoaded = false;
        this.isMuted = false;
        
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
        
        // Play select sound
        this.playSound('select');
        
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
            this.showMessage('YOU FOUND THE GEM! +' + CONFIG.POINTS_PER_WIN + ' POINTS', '#2E86C1');
            
            // Play success sound
            this.playSound('correct');
            
            // Add a visual celebration effect
            this.showCelebration();
        } else {
            this.showMessage('THE GEM WAS HIDING HERE', '#421C14');
            
            // Play wrong sound
            this.playSound('wrong');
            
            // Reveal the correct cup
            this.cups[this.coinIndex].reveal();
        }
        
        // Allow restart after a short delay
        setTimeout(() => {
            document.getElementById('start-btn').textContent = 'PLAY AGAIN';
            document.getElementById('start-btn').disabled = false;
            this.gameActive = false;
        }, 2000);
    }
    
    /**
     * Start new game
     */
    async startGame() {
        try {
            // Start background music if audio is loaded
            if (this.bgMusic && this.audioLoaded) {
                // For better user experience, we only need to play once when the 
                // user interacts with the game (autoplay restrictions)
                if (this.bgMusic.paused) {
                    console.log('Attempting to play background music');
                    const playPromise = this.bgMusic.play();
                    
                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => {
                                console.log('Background music started successfully');
                            })
                            .catch(error => {
                                console.warn('Error playing background music:', error);
                                // Don't let audio issues stop the game
                            });
                    }
                }
            }
            
            // Rest of the startGame method
            this.hideMessage();
            this.gameActive = true;
            this.canSelect = false;
            document.getElementById('start-btn').disabled = true;
            document.getElementById('start-btn').textContent = 'PLAYING...';
            this.hideSelectionButtons();
            this.difficulty = parseInt(document.getElementById('difficulty').value);
            document.getElementById('level').textContent = `LEVEL: ${this.difficulty}`;
            const numCups = CONFIG.DIFFICULTY[this.difficulty].NUM_CUPS;
            this.createCups(numCups);
            this.coinIndex = Math.floor(Math.random() * numCups);
            this.cups[this.coinIndex].hasCoin = true;
            
            // Show all cups initially with coin visible
            for (let i = 0; i < this.cups.length; i++) {
                this.cups[i].reveal();
            }
            
            // Force a render to make sure cups and coin are drawn
            this.render();
            
            this.showMessage('REMEMBER THE GEM LOCATION', '#421C14');
            
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
                    this.simpleShuffle();
                }, 500);
            }, 2000);
        } catch (error) {
            console.error("Error starting game:", error);
        }
    }
    
    /**
     * Simple cup shuffling with smooth movements
     */
    simpleShuffle() {
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const padding = 50;
        const cupWidth = CONFIG.CUP.WIDTH;
        
        // Play shuffle sound
        this.playSound('shuffle');
        
        // Show shuffling message
        this.showMessage('WATCH THE CUPS SHUFFLE', '#421C14');
        
        // Add a visual shuffle indicator
        this.showShuffleIndicator();
        
        // Force animation loop to start if it's not running
        if (!this._animationRunning) {
            this._animationRunning = true;
            this.render();
        }
        
        // Create movement patterns
        const patterns = [
            // Circle dance pattern
            (j, cupCount) => {
                const angle = (j * (2 * Math.PI / cupCount));
                const radius = canvasWidth * 0.3;
                return {
                    x: canvasWidth / 2 + Math.cos(angle) * radius,
                    y: canvasHeight / 2 + Math.sin(angle) * radius
                };
            },
            // Flower pattern - cups move in a flower shape
            (j, cupCount) => {
                const angle = (j * (2 * Math.PI / cupCount));
                const radius = canvasWidth * 0.25;
                // Flower pattern using sin to create "petals"
                const petalFactor = 0.3;
                return {
                    x: canvasWidth / 2 + Math.cos(angle) * (radius + Math.sin(angle * 5) * radius * petalFactor),
                    y: canvasHeight / 2 + Math.sin(angle) * (radius + Math.sin(angle * 5) * radius * petalFactor)
                };
            },
            // Wave pattern - cups move in a gentle wave
            (j, cupCount) => {
                const spacing = canvasWidth * 0.7 / (cupCount + 1);
                return {
                    x: canvasWidth * 0.15 + j * spacing,
                    y: canvasHeight * 0.5 + Math.sin(j * Math.PI) * 40
                };
            },
            // Carousel pattern - cups move in a carousel-like circle
            (j, cupCount) => {
                const angle = (j * (2 * Math.PI / cupCount));
                const radius = canvasWidth * 0.25;
                return {
                    x: canvasWidth / 2 + Math.cos(angle) * radius,
                    y: canvasHeight / 2 + Math.sin(angle) * radius * 0.5 // Flatter circle
                };
            }
        ];
        
        // Add some specific animations
        const specialPatterns = [
            // All cups gather in the center then spread out
            (j, cupCount) => {
                return {
                    x: canvasWidth / 2,
                    y: canvasHeight / 2
                };
            },
            // Cups line up in a row
            (j, cupCount) => {
                const spacing = canvasWidth * 0.7 / (cupCount + 1);
                return {
                    x: canvasWidth * 0.15 + j * spacing,
                    y: canvasHeight * 0.5
                };
            }
        ];
        
        // Create a timeline of moves
        const timeline = [];
        
        // Determine number of steps
        const numMoves = 10 + this.difficulty * 2; 
        
        // Start with cups gathering in center
        timeline.push(Array(this.cups.length).fill(0).map(() => ({
            x: canvasWidth / 2,
            y: canvasHeight / 2
        })));
        
        // Then use the patterns for the main shuffle
        for (let i = 0; i < numMoves; i++) {
            // Select a pattern based on the current step
            let pattern;
            
            if (i < 2) {
                // Use special patterns at the beginning
                pattern = specialPatterns[i % specialPatterns.length];
            } else {
                // Use regular patterns for the rest
                pattern = patterns[i % patterns.length];
            }
            
            // Generate positions for each cup
            const positions = [];
            for (let j = 0; j < this.cups.length; j++) {
                const pos = pattern(j, this.cups.length);
                
                // Ensure cups stay within bounds
                const x = Math.max(padding + cupWidth/2, Math.min(pos.x, canvasWidth - padding - cupWidth/2));
                const y = Math.max(padding + cupWidth/2, Math.min(pos.y, canvasHeight - padding - cupWidth/2));
                
                positions.push({ x, y });
            }
            
            // Only shuffle positions occasionally and later in the animation
            if (i > 5 && i % 3 === 0) {
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
        const totalDuration = 4500; // 4.5 seconds
        const stepDuration = totalDuration / timeline.length;
        
        // Execute each move with a delay
        timeline.forEach((positions, i) => {
            setTimeout(() => {
                // Move each cup to its new position
                for (let j = 0; j < this.cups.length; j++) {
                    this.cups[j].moveTo(positions[j].x, positions[j].y);
                }
                
                // Update message with prompts
                if (i === Math.floor(timeline.length / 3)) {
                    this.showMessage('KEEP TRACK OF THE CUPS', '#421C14');
                } else if (i === Math.floor(timeline.length * 2 / 3)) {
                    this.showMessage('ALMOST DONE SHUFFLING', '#421C14');
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
                            this.showMessage('WHICH CUP HIDES THE GEM?', '#421C14');
                        }, 500);
                    }, stepDuration);
                }
            }, i * stepDuration);
        });
    }
    
    /**
     * Show shuffle progress indicator with sleek styling
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
        indicator.style.height = '8px';
        indicator.style.backgroundColor = 'rgba(255,255,255,0.5)';
        indicator.style.borderRadius = '4px';
        indicator.style.zIndex = '50';
        indicator.style.overflow = 'hidden';
        indicator.style.border = '1px solid rgba(66, 28, 20, 0.3)';
        indicator.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        
        // Create progress bar with gradient
        const progress = document.createElement('div');
        progress.id = 'shuffle-progress';
        progress.style.width = '0%';
        progress.style.height = '100%';
        progress.style.borderRadius = '3px';
        progress.style.transition = 'width 0.3s ease';
        
        // Cat-themed gradient for progress bar
        progress.style.background = 'linear-gradient(to right, #421C14, #F8AD6B)';
        
        // Add subtle animated shimmer to the progress bar
        const shimmer = document.createElement('div');
        shimmer.style.position = 'absolute';
        shimmer.style.top = '0';
        shimmer.style.right = '0';
        shimmer.style.width = '100%';
        shimmer.style.height = '100%';
        shimmer.style.background = 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)';
        shimmer.style.backgroundSize = '200% 100%';
        shimmer.style.animation = 'shimmerMove 2s linear infinite';
        
        // Add the animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes shimmerMove {
                0% { background-position: 100% 0; }
                100% { background-position: -100% 0; }
            }
        `;
        document.head.appendChild(style);
        
        progress.appendChild(shimmer);
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
            button.textContent = `CUP ${i+1}`;
            button.style.position = 'absolute';
            
            // Position button below the cup
            const buttonWidth = 80;
            button.style.left = `${cup.x - buttonWidth/2}px`;
            button.style.top = `${cup.y + 80}px`;
            button.style.width = `${buttonWidth}px`;
            
            // Style the button
            button.style.padding = '8px 12px';
            button.style.backgroundColor = '#421C14';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '6px';
            button.style.cursor = 'pointer';
            button.style.zIndex = '1000';
            button.style.boxShadow = '0 3px 0 #2C1208';
            button.style.transition = 'all 0.2s ease';
            button.style.fontFamily = "'Fredoka', sans-serif";
            button.style.fontWeight = '600';
            button.style.letterSpacing = '1px';
            
            // Add hover effects
            button.onmouseover = function() {
                this.style.backgroundColor = '#5A2C18';
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 5px 0 #2C1208';
            };
            button.onmouseout = function() {
                this.style.backgroundColor = '#421C14';
                this.style.transform = 'scale(1)';
                this.style.boxShadow = '0 3px 0 #2C1208';
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
        const colors = ['#FFB6C1', '#FFFECE', '#F1E7E7', '#FFD0C7', '#E69DB8', '#FFC8DD', '#FFAFCC', '#BDE0FE', '#A2D2FF', '#CDB4DB', '#FFC6FF', '#CAFFBF', '#9BF6FF'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    /**
     * Start the game loop
     */
    start() {
        // Start render loop
        this.render();
    }
    
    /**
     * Load audio assets for the game
     */
    loadAudio() {
        try {
            // Background music - use the existing file
            this.bgMusic = new Audio('src/audio/bgMusic.mp3');
            this.bgMusic.loop = true;
            this.bgMusic.volume = 0.5;
            
            // Sound effects with fallbacks
            const createAudioWithFallback = (path) => {
                const audio = new Audio();
                audio.src = path;
                audio.onerror = () => {
                    console.warn(`Could not load audio file: ${path}`);
                    // Don't set audioLoaded to false, just handle this specific file
                    audio.src = ''; // Clear source to avoid further errors
                };
                return audio;
            };
            
            // Setup sound effects
            this.soundEffects = {
                correct: createAudioWithFallback('src/audio/correct.mp3'),
                wrong: createAudioWithFallback('src/audio/wrong.mp3'),
                shuffle: createAudioWithFallback('src/audio/shuffle.mp3'),
                select: createAudioWithFallback('src/audio/select.mp3')
            };
            
            // Set volumes for sound effects
            Object.values(this.soundEffects).forEach(sound => {
                sound.volume = 0.6;
            });
            
            // Preload bgMusic specifically
            this.bgMusic.addEventListener('canplaythrough', () => {
                console.log('Background music loaded successfully');
            });
            
            this.bgMusic.addEventListener('error', (e) => {
                console.error('Error loading background music:', e);
            });
            
            // Mark audio as loaded
            this.audioLoaded = true;
            
            console.log('Audio assets loading initiated');
        } catch (error) {
            console.error('Error setting up audio assets:', error);
            // Allow game to continue without audio
            this.audioLoaded = false;
        }
    }
    
    /**
     * Create audio control UI
     */
    createAudioControls() {
        const gameContainer = document.getElementById('game-container');
        
        // Create audio control container
        const audioControls = document.createElement('div');
        audioControls.className = 'audio-controls';
        audioControls.style.position = 'absolute';
        audioControls.style.top = '10px';
        audioControls.style.right = '10px';
        audioControls.style.zIndex = '1000';
        audioControls.style.display = 'flex';
        audioControls.style.alignItems = 'center';
        audioControls.style.gap = '10px';
        
        // Create mute toggle button
        const muteBtn = document.createElement('button');
        muteBtn.id = 'mute-btn';
        muteBtn.innerHTML = '🔊';
        muteBtn.style.width = '40px';
        muteBtn.style.height = '40px';
        muteBtn.style.borderRadius = '50%';
        muteBtn.style.backgroundColor = '#421C14';
        muteBtn.style.color = 'white';
        muteBtn.style.border = 'none';
        muteBtn.style.cursor = 'pointer';
        muteBtn.style.display = 'flex';
        muteBtn.style.alignItems = 'center';
        muteBtn.style.justifyContent = 'center';
        muteBtn.style.fontSize = '18px';
        muteBtn.style.boxShadow = '0 3px 0 #2C1208';
        
        // Add click handler for mute button
        muteBtn.addEventListener('click', () => {
            this.toggleMute();
            muteBtn.innerHTML = this.isMuted ? '🔇' : '🔊';
        });
        
        // Create volume slider
        const volumeSlider = document.createElement('input');
        volumeSlider.type = 'range';
        volumeSlider.id = 'volume-slider';
        volumeSlider.min = '0';
        volumeSlider.max = '100';
        volumeSlider.value = '50';
        volumeSlider.style.width = '80px';
        volumeSlider.style.accentColor = '#421C14';
        
        // Add input handler for volume slider
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            this.setVolume(volume);
        });
        
        // Add controls to the container
        audioControls.appendChild(muteBtn);
        audioControls.appendChild(volumeSlider);
        
        // Add the container to the game
        gameContainer.appendChild(audioControls);
    }
    
    /**
     * Toggle mute state for all audio
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        
        if (this.bgMusic) {
            this.bgMusic.muted = this.isMuted;
        }
        
        Object.values(this.soundEffects).forEach(sound => {
            sound.muted = this.isMuted;
        });
    }
    
    /**
     * Set volume for all audio
     */
    setVolume(volume) {
        if (this.bgMusic) {
            this.bgMusic.volume = volume;
        }
        
        Object.values(this.soundEffects).forEach(sound => {
            sound.volume = volume * 0.8; // Slightly lower than music
        });
    }
    
    /**
     * Play a sound effect by name
     */
    playSound(name) {
        if (!this.audioLoaded || this.isMuted) return;
        
        const sound = this.soundEffects[name];
        if (sound) {
            // Reset the sound to start from beginning
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.warn('Error playing sound:', error);
            });
        }
    }
    
    /**
     * Initialize the game
     */
    init() {
        // Set up canvas size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Add event listener for the start button
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        
        // Load audio assets
        this.loadAudio();
        
        // Initial score display
        this.updateScoreDisplay();
        
        // Start animation loop
        this.animate();
        
        // Add audio control UI
        this.createAudioControls();
    }
    
    /**
     * Animation loop
     */
    animate(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Update cups
        for (let cup of this.cups) {
            cup.update(deltaTime);
        }
        
        // Render frame
        this.render();
        
        // Continue animation loop
        requestAnimationFrame(this.animate.bind(this));
    }
} 