/**
 * Animation Module
 * Handles the shuffling animations and movement patterns
 */
class Animation {
    constructor(cups, canvas) {
        this.cups = cups;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.isShuffling = false;
        this.shuffleSpeed = 1;
        this.complexity = 1;
        this.minDistance = 80;
        this.shuffleDuration = 2000;
        this.shuffleStartTime = 0;
        this.shuffleMoves = [];
        this.currentMove = 0;
        this.lastTimestamp = 0;
    }
    
    /**
     * Set difficulty parameters
     */
    setDifficulty(level) {
        const diffSettings = CONFIG.DIFFICULTY[level];
        this.shuffleSpeed = diffSettings.SHUFFLE_SPEED;
        this.complexity = diffSettings.SHUFFLE_COMPLEXITY;
        this.minDistance = diffSettings.MIN_DISTANCE;
        this.shuffleDuration = diffSettings.SHUFFLE_DURATION;
    }
    
    /**
     * Starts the cup shuffling animation
     * Returns a promise that resolves when shuffling is complete
     */
    startShuffle() {
        if (this.isShuffling) return Promise.resolve();
        
        return new Promise((resolve) => {
            this.isShuffling = true;
            this.shuffleStartTime = performance.now();
            this.generateShuffleMoves();
            this.currentMove = 0;
            
            // Animation loop
            const animate = (timestamp) => {
                if (!this.isShuffling) {
                    resolve();
                    return;
                }
                
                // Calculate delta time
                const deltaTime = timestamp - (this.lastTimestamp || timestamp);
                this.lastTimestamp = timestamp;
                
                // Check if we've exceeded shuffle duration
                const elapsed = timestamp - this.shuffleStartTime;
                if (elapsed >= this.shuffleDuration) {
                    // Ensure all cups are at their final positions
                    while (this.currentMove < this.shuffleMoves.length) {
                        const move = this.shuffleMoves[this.currentMove];
                        this.cups[move.cupIndex].moveTo(move.x, move.y);
                        this.currentMove++;
                    }
                    
                    // Update cups one last time
                    this.cups.forEach(cup => cup.update(deltaTime));
                    
                    // End shuffling
                    this.isShuffling = false;
                    console.log("Shuffle animation complete");
                    resolve();
                    return;
                }
                
                // Execute shuffle moves based on progress
                const progress = elapsed / this.shuffleDuration;
                const targetMove = Math.floor(progress * this.shuffleMoves.length);
                
                // Apply pending moves
                while (this.currentMove < targetMove && this.currentMove < this.shuffleMoves.length) {
                    const move = this.shuffleMoves[this.currentMove];
                    this.cups[move.cupIndex].moveTo(move.x, move.y);
                    this.currentMove++;
                }
                
                // Update and request next frame
                this.cups.forEach(cup => cup.update(deltaTime));
                requestAnimationFrame(animate);
            };
            
            requestAnimationFrame(animate);
        });
    }
    
    /**
     * Generate a sequence of shuffle moves
     */
    generateShuffleMoves() {
        this.shuffleMoves = [];
        
        // Calculate number of moves based on complexity and duration
        const numMoves = Math.ceil(10 * this.complexity * (this.shuffleDuration / 2000));
        
        // Get canvas dimensions for bounds checking
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        const padding = CONFIG.CANVAS_PADDING;
        const cupWidth = CONFIG.CUP.WIDTH;
        
        // Generate moves for each cup
        for (let i = 0; i < numMoves; i++) {
            // For each cup, determine a valid position to move to
            this.cups.forEach((cup, cupIndex) => {
                let validPosition = false;
                let x, y;
                let attempts = 0;
                
                // Try to find a valid position (not too close to other cups)
                while (!validPosition && attempts < 20) {
                    // Generate random position within canvas bounds
                    x = padding + cupWidth/2 + Math.random() * (canvasWidth - cupWidth - padding * 2);
                    y = padding + cupWidth/2 + Math.random() * (canvasHeight - CONFIG.CUP.HEIGHT - padding * 2);
                    
                    validPosition = true;
                    
                    // Check distance from other cups
                    for (let j = 0; j < this.cups.length; j++) {
                        if (j === cupIndex) continue;
                        
                        const otherCup = this.cups[j];
                        const dx = x - otherCup.x;
                        const dy = y - otherCup.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < this.minDistance) {
                            validPosition = false;
                            break;
                        }
                    }
                    
                    attempts++;
                }
                
                // If we found a valid position, add it to the moves
                if (validPosition) {
                    this.shuffleMoves.push({
                        cupIndex,
                        x,
                        y
                    });
                }
            });
        }
    }
    
    /**
     * Animate cup reveal
     */
    revealCup(cup) {
        cup.reveal();
        return new Promise(resolve => {
            const animate = () => {
                if (cup.revealed) {
                    resolve();
                    return;
                }
                requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        });
    }
    
    /**
     * Animate all cups hiding (for game reset)
     */
    hideAllCups() {
        this.cups.forEach(cup => cup.hide());
        return new Promise(resolve => {
            const animate = () => {
                const allHidden = this.cups.every(cup => !cup.revealed && cup.liftHeight === 0);
                if (allHidden) {
                    resolve();
                    return;
                }
                requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        });
    }
} 