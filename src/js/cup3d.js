/**
 * Cup3D Class
 * Represents a 3D cup in the scene using Three.js
 */
class Cup3D {
    constructor(scene, x, z, hasCoin = false) {
        this.scene = scene;
        this.x = x;
        this.z = z;
        this.y = 0; // Base y position (on the table)
        this.hasCoin = hasCoin;
        this.isRevealed = false;
        this.isAnimating = false;
        this.isHovered = false;
        
        // Create cup and coin objects
        this.createCup();
        if (this.hasCoin) {
            this.createCoin();
        }
        
        // Position the cup
        this.setPosition(x, this.y, z);
    }
    
    /**
     * Create the 3D cup model
     */
    createCup() {
        // Cup geometry (cylinder with different top and bottom radius)
        const cupGeometry = new THREE.CylinderGeometry(
            CONFIG.CUP.RADIUS_TOP,
            CONFIG.CUP.RADIUS_BOTTOM,
            CONFIG.CUP.HEIGHT,
            CONFIG.CUP.SEGMENTS
        );
        
        // Cup material (basic red)
        const cupMaterial = new THREE.MeshPhongMaterial({
            color: CONFIG.CUP.COLOR,
            shininess: 30
        });
        
        // Create cup mesh
        this.cupMesh = new THREE.Mesh(cupGeometry, cupMaterial);
        
        // Adjust cup position so it sits on the ground
        this.cupMesh.position.y = CONFIG.CUP.HEIGHT / 2;
        
        // Add cup to scene
        this.scene.add(this.cupMesh);
        
        // Store original color for hover effects
        this.originalColor = CONFIG.CUP.COLOR;
    }
    
    /**
     * Create the 3D coin model
     */
    createCoin() {
        // Coin geometry (cylinder)
        const coinGeometry = new THREE.CylinderGeometry(
            CONFIG.COIN.RADIUS,
            CONFIG.COIN.RADIUS,
            CONFIG.COIN.HEIGHT,
            CONFIG.COIN.SEGMENTS
        );
        
        // Coin material (gold)
        const coinMaterial = new THREE.MeshPhongMaterial({
            color: CONFIG.COIN.COLOR,
            shininess: 100
        });
        
        // Edge material for the rim
        const edgeMaterial = new THREE.MeshPhongMaterial({
            color: CONFIG.COIN.EDGE_COLOR,
            shininess: 80
        });
        
        // Create coin mesh
        this.coinMesh = new THREE.Mesh(coinGeometry, coinMaterial);
        
        // Add rim/edge details to coin
        const rimGeometry = new THREE.TorusGeometry(
            CONFIG.COIN.RADIUS,
            CONFIG.COIN.HEIGHT / 2,
            16,
            50
        );
        this.coinRim = new THREE.Mesh(rimGeometry, edgeMaterial);
        this.coinRim.rotation.x = Math.PI / 2; // Rotate to wrap around coin edge
        
        // Create a coin group to hold both parts
        this.coinGroup = new THREE.Group();
        this.coinGroup.add(this.coinMesh);
        this.coinGroup.add(this.coinRim);
        
        // Position the coin under the cup
        this.coinGroup.position.y = CONFIG.COIN.HEIGHT / 2;
        
        // Hide coin initially
        this.coinGroup.visible = false;
        
        // Add coin to scene
        this.scene.add(this.coinGroup);
    }
    
    /**
     * Set the position of the cup and coin
     */
    setPosition(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        
        // Update cup mesh position
        this.cupMesh.position.x = x;
        this.cupMesh.position.z = z;
        this.cupMesh.position.y = y + CONFIG.CUP.HEIGHT / 2; // Keep bottom on ground
        
        // Update coin position if it exists
        if (this.hasCoin && this.coinGroup) {
            this.coinGroup.position.x = x;
            this.coinGroup.position.z = z;
            this.coinGroup.position.y = CONFIG.COIN.HEIGHT / 2; // On the ground
        }
    }
    
    /**
     * Move the cup to a new position with animation
     */
    moveTo(x, z, duration = 1) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        const moveYHeight = (Math.random() * 0.5) + 0.2; // Random hop height
        
        // Create GSAP timeline for smooth movement
        const timeline = gsap.timeline({
            onComplete: () => {
                this.isAnimating = false;
                this.x = x;
                this.z = z;
            }
        });
        
        // Animate cup
        timeline.to(this.cupMesh.position, {
            x: x,
            y: CONFIG.CUP.HEIGHT / 2 + moveYHeight, // Up
            z: z,
            duration: duration / 2,
            ease: "power1.out"
        }).to(this.cupMesh.position, {
            y: CONFIG.CUP.HEIGHT / 2, // Down
            duration: duration / 2,
            ease: "bounce.out"
        });
        
        // Animate coin if it exists
        if (this.hasCoin && this.coinGroup) {
            timeline.to(this.coinGroup.position, {
                x: x,
                z: z,
                duration: duration,
                ease: "power1.inOut"
            }, 0); // Start at the same time as cup animation
        }
        
        return timeline;
    }
    
    /**
     * Lift the cup to reveal what's underneath
     */
    reveal(duration = 0.5) {
        if (this.isAnimating || this.isRevealed) return;
        
        this.isAnimating = true;
        
        // Create GSAP timeline for lift animation
        const timeline = gsap.timeline({
            onComplete: () => {
                this.isAnimating = false;
                this.isRevealed = true;
                
                // Show coin if this cup has it
                if (this.hasCoin && this.coinGroup) {
                    this.coinGroup.visible = true;
                }
            }
        });
        
        // Lift the cup
        timeline.to(this.cupMesh.position, {
            y: CONFIG.CUP.HEIGHT / 2 + CONFIG.CUP.LIFT_HEIGHT,
            duration: duration,
            ease: "back.out(1.7)"
        });
        
        return timeline;
    }
    
    /**
     * Lower the cup back down
     */
    hide(duration = 0.3) {
        if (this.isAnimating || !this.isRevealed) return;
        
        this.isAnimating = true;
        
        // Create GSAP timeline for lower animation
        const timeline = gsap.timeline({
            onComplete: () => {
                this.isAnimating = false;
                this.isRevealed = false;
                
                // Hide coin
                if (this.hasCoin && this.coinGroup) {
                    this.coinGroup.visible = false;
                }
            }
        });
        
        // Lower the cup
        timeline.to(this.cupMesh.position, {
            y: CONFIG.CUP.HEIGHT / 2,
            duration: duration,
            ease: "power3.in"
        });
        
        return timeline;
    }
    
    /**
     * Highlight the cup when hovered
     */
    setHover(isHovered) {
        if (this.isHovered === isHovered) return;
        
        this.isHovered = isHovered;
        
        // Change material color
        if (isHovered) {
            this.cupMesh.material.color.setHex(CONFIG.CUP.HOVER_COLOR);
            this.cupMesh.material.needsUpdate = true;
        } else {
            this.cupMesh.material.color.setHex(this.originalColor);
            this.cupMesh.material.needsUpdate = true;
        }
    }
    
    /**
     * Check if a raycaster intersects with this cup
     */
    checkIntersection(raycaster) {
        return raycaster.intersectObject(this.cupMesh).length > 0;
    }
    
    /**
     * Remove cup and coin from scene (cleanup)
     */
    remove() {
        this.scene.remove(this.cupMesh);
        if (this.coinGroup) {
            this.scene.remove(this.coinGroup);
        }
    }
} 