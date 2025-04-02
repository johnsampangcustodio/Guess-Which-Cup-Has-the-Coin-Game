/**
 * Game3D Class
 * Manages the 3D game environment, cups, and game flow
 */
class Game3D {
    constructor(container) {
        this.container = container;
        this.cups = [];
        this.coinIndex = -1;
        this.gameActive = false;
        this.difficulty = 1;
        this.score = 0;
        this.consecutiveWins = 0;
        this.canSelect = false;
        this.hoveredCupIndex = -1;
        
        // Initialize 3D scene
        this.initScene();
        
        // Add event listeners
        this.setupEventListeners();
        
        // For raycasting (cup selection)
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }
    
    /**
     * Initialize the Three.js scene, camera, renderer
     */
    initScene() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            CONFIG.CAMERA.FOV,
            this.container.clientWidth / this.container.clientHeight,
            CONFIG.CAMERA.NEAR,
            CONFIG.CAMERA.FAR
        );
        this.camera.position.set(
            CONFIG.CAMERA.POSITION.x,
            CONFIG.CAMERA.POSITION.y,
            CONFIG.CAMERA.POSITION.z
        );
        this.camera.lookAt(
            CONFIG.CAMERA.LOOK_AT.x,
            CONFIG.CAMERA.LOOK_AT.y,
            CONFIG.CAMERA.LOOK_AT.z
        );
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        
        // Add renderer's canvas to the DOM
        this.container.appendChild(this.renderer.domElement);
        
        // Add lights
        this.addLights();
        
        // Create table
        this.createTable();
        
        // Start animation loop
        this.animate();
    }
    
    /**
     * Add lights to the scene
     */
    addLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(
            CONFIG.LIGHTS.AMBIENT.COLOR,
            CONFIG.LIGHTS.AMBIENT.INTENSITY
        );
        this.scene.add(ambientLight);
        
        // Directional light (sun-like)
        const directionalLight = new THREE.DirectionalLight(
            CONFIG.LIGHTS.DIRECTIONAL.COLOR,
            CONFIG.LIGHTS.DIRECTIONAL.INTENSITY
        );
        directionalLight.position.set(
            CONFIG.LIGHTS.DIRECTIONAL.POSITION.x,
            CONFIG.LIGHTS.DIRECTIONAL.POSITION.y,
            CONFIG.LIGHTS.DIRECTIONAL.POSITION.z
        );
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
    }
    
    /**
     * Create a table for the cups
     */
    createTable() {
        const tableGeometry = new THREE.BoxGeometry(
            CONFIG.TABLE.WIDTH,
            0.1, // Height/thickness
            CONFIG.TABLE.DEPTH
        );
        const tableMaterial = new THREE.MeshPhongMaterial({
            color: CONFIG.TABLE.COLOR,
            shininess: 10
        });
        this.table = new THREE.Mesh(tableGeometry, tableMaterial);
        this.table.position.y = -0.05; // Slightly below origin
        this.table.receiveShadow = true;
        this.scene.add(this.table);
    }
    
    /**
     * Animation loop
     */
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * Set up event listeners for user interaction
     */
    setupEventListeners() {
        // Mouse move for hover effects
        this.container.addEventListener('mousemove', (event) => {
            this.updateMousePosition(event);
            this.checkCupHover();
        });
        
        // Touch move for mobile
        this.container.addEventListener('touchmove', (event) => {
            event.preventDefault();
            this.updateTouchPosition(event);
            this.checkCupHover();
        });
        
        // Click/tap for cup selection
        this.container.addEventListener('click', (event) => {
            if (!this.canSelect) return;
            this.updateMousePosition(event);
            this.selectCupFromRaycaster();
        });
        
        // Touch end for mobile selection
        this.container.addEventListener('touchend', (event) => {
            if (!this.canSelect) return;
            event.preventDefault();
            this.updateTouchPosition(event);
            this.selectCupFromRaycaster();
        });
        
        // Window resize
        window.addEventListener('resize', this.handleResize.bind(this));
    }
    
    /**
     * Update mouse position for raycasting
     */
    updateMousePosition(event) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / this.container.clientHeight) * 2 + 1;
    }
    
    /**
     * Update touch position for raycasting
     */
    updateTouchPosition(event) {
        if (event.touches.length > 0) {
            const rect = this.container.getBoundingClientRect();
            const touch = event.touches[0];
            this.mouse.x = ((touch.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
            this.mouse.y = -((touch.clientY - rect.top) / this.container.clientHeight) * 2 + 1;
        }
    }
    
    /**
     * Check if mouse is hovering over a cup
     */
    checkCupHover() {
        if (!this.canSelect || this.cups.length === 0) return;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Find the first intersected cup
        let hoveredIndex = -1;
        for (let i = 0; i < this.cups.length; i++) {
            if (this.cups[i].checkIntersection(this.raycaster)) {
                hoveredIndex = i;
                break;
            }
        }
        
        // Update hover states
        if (hoveredIndex !== this.hoveredCupIndex) {
            // Remove hover from previously hovered cup
            if (this.hoveredCupIndex !== -1) {
                this.cups[this.hoveredCupIndex].setHover(false);
            }
            
            // Add hover to new cup
            if (hoveredIndex !== -1) {
                this.cups[hoveredIndex].setHover(true);
            }
            
            this.hoveredCupIndex = hoveredIndex;
        }
    }
    
    /**
     * Select a cup based on raycaster intersection
     */
    selectCupFromRaycaster() {
        if (!this.canSelect || this.cups.length === 0) return;
        
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Find the first intersected cup
        for (let i = 0; i < this.cups.length; i++) {
            if (this.cups[i].checkIntersection(this.raycaster)) {
                this.selectCup(i);
                break;
            }
        }
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Update camera aspect ratio
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        
        // Update renderer size
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    
    /**
     * Process player's cup selection
     */
    async selectCup(index) {
        if (!this.canSelect) return;
        
        this.canSelect = false;
        
        // Reveal the selected cup
        await this.cups[index].reveal();
        
        // Check if the player guessed correctly
        const correct = index === this.coinIndex;
        
        // Show all cups after a delay
        setTimeout(async () => {
            // Show all cups to reveal the correct one
            for (let i = 0; i < this.cups.length; i++) {
                if (i !== index) {
                    await this.cups[i].reveal();
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
        this.hoveredCupIndex = -1;
        document.getElementById('start-btn').disabled = true;
        
        // Get difficulty level
        this.difficulty = parseInt(document.getElementById('difficulty').value);
        document.getElementById('level').textContent = `Level: ${this.difficulty}`;
        
        // Clean up previous cups
        this.cleanUpCups();
        
        // Set difficulty
        const numCups = CONFIG.DIFFICULTY[this.difficulty].NUM_CUPS;
        
        // Create cups
        this.createCups(numCups);
        
        // Show all cups initially
        for (let i = 0; i < this.cups.length; i++) {
            await this.cups[i].reveal();
        }
        
        // Show which cup has the coin
        this.showMessage('Remember which cup has the coin!', '#007bff');
        
        // Wait for player to see the coin
        setTimeout(async () => {
            // Hide message
            this.hideMessage();
            
            // Hide cups
            for (let i = 0; i < this.cups.length; i++) {
                await this.cups[i].hide();
            }
            
            // Short pause before shuffling
            setTimeout(async () => {
                // Start shuffling animation
                await this.shuffleCups();
                
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
     * Create 3D cups
     */
    createCups(numCups) {
        this.cups = [];
        
        // Calculate spacing based on cup radius and number of cups
        const spacing = CONFIG.CUP.RADIUS_TOP * 2.5;
        const totalWidth = (numCups - 1) * spacing;
        
        // Randomly decide which cup has the coin
        this.coinIndex = Math.floor(Math.random() * numCups);
        
        // Create cups in a row
        for (let i = 0; i < numCups; i++) {
            const x = (i * spacing) - (totalWidth / 2);
            const z = 0;
            const hasCoin = (i === this.coinIndex);
            
            const cup = new Cup3D(this.scene, x, z, hasCoin);
            this.cups.push(cup);
        }
    }
    
    /**
     * Clean up previous cups
     */
    cleanUpCups() {
        for (let i = 0; i < this.cups.length; i++) {
            this.cups[i].remove();
        }
        this.cups = [];
    }
    
    /**
     * Shuffle the cups
     */
    async shuffleCups() {
        const shuffleSpeed = CONFIG.DIFFICULTY[this.difficulty].SHUFFLE_SPEED;
        const complexity = CONFIG.DIFFICULTY[this.difficulty].SHUFFLE_COMPLEXITY;
        const duration = CONFIG.DIFFICULTY[this.difficulty].SHUFFLE_DURATION;
        
        // Number of shuffle moves based on complexity
        const numMoves = Math.ceil(5 * complexity);
        
        // Calculate timing for each move
        const moveDuration = duration / (numMoves * 1000); // Convert to seconds
        
        // Generate shuffle sequence
        for (let i = 0; i < numMoves; i++) {
            // For each move, swap two random cups
            const cup1Index = Math.floor(Math.random() * this.cups.length);
            let cup2Index;
            do {
                cup2Index = Math.floor(Math.random() * this.cups.length);
            } while (cup2Index === cup1Index);
            
            const cup1 = this.cups[cup1Index];
            const cup2 = this.cups[cup2Index];
            
            // Swap positions
            const tempX = cup1.x;
            const tempZ = cup1.z;
            
            // Animate the swap
            const timeline1 = cup1.moveTo(cup2.x, cup2.z, moveDuration / shuffleSpeed);
            const timeline2 = cup2.moveTo(tempX, tempZ, moveDuration / shuffleSpeed);
            
            // Wait for both animations to complete
            await new Promise(resolve => {
                gsap.timeline().add(timeline1, 0).add(timeline2, 0)
                    .then(resolve);
            });
        }
        
        return Promise.resolve();
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
            document.querySelector('.game-area').appendChild(messageElement);
        }
        
        messageElement.textContent = text;
        messageElement.style.backgroundColor = color;
        
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
} 