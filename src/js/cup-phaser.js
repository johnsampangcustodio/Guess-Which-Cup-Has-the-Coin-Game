/**
 * KawaiiCup Class
 * Represents a kawaii (cute) cup in the Phaser game
 */
class KawaiiCup extends Phaser.GameObjects.Container {
    constructor(scene, x, y, hasCoin = false) {
        super(scene, x, y);
        
        this.scene = scene;
        this.baseX = x;
        this.baseY = y;
        this.hasCoin = hasCoin;
        this.isRevealed = false;
        this.isAnimating = false;
        this.isHovered = false;
        this.isBlinking = false;
        this.blinkTimer = null;
        
        // Create cup and coin graphics
        this.createCup();
        this.createFace();
        
        if (this.hasCoin) {
            this.createCoin();
        }
        
        // Add input handling
        this.setSize(CONFIG.CUP.WIDTH, CONFIG.CUP.HEIGHT);
        this.setInteractive();
        
        // Add to scene
        scene.add.existing(this);
        
        // Start face animations
        this.setupFaceAnimations();
    }
    
    /**
     * Create the cup graphics
     */
    createCup() {
        // Create cup body
        this.cupBody = this.scene.add.graphics();
        this.drawCup();
        this.add(this.cupBody);
        
        // Create bottom shadow
        this.cupShadow = this.scene.add.ellipse(0, CONFIG.CUP.HEIGHT - 10, CONFIG.CUP.WIDTH * 0.7, 20, 0x000000, 0.1);
        this.add(this.cupShadow);
    }
    
    /**
     * Draw the cup shape
     */
    drawCup() {
        const width = CONFIG.CUP.WIDTH;
        const height = CONFIG.CUP.HEIGHT;
        
        this.cupBody.clear();
        
        // Cup body (main color)
        this.cupBody.fillStyle(CONFIG.COLORS.CUP_PRIMARY, 1);
        
        // Draw cup shape (trapezoid with rounded top)
        this.cupBody.fillRoundedRect(-width/2, 0, width, height * 0.9, 16);
        
        // Bottom part (slightly darker)
        this.cupBody.fillStyle(CONFIG.COLORS.CUP_SECONDARY, 1);
        
        // Draw cup rim
        this.cupBody.fillRoundedRect(-width/2, 0, width, height * 0.15, {
            tl: 16,
            tr: 16,
            bl: 0,
            br: 0
        });
        
        // Draw cup handle
        this.cupBody.fillStyle(CONFIG.COLORS.CUP_SECONDARY, 1);
        this.cupBody.fillEllipse(width/2 - 5, height * 0.4, 15, 30);
        this.cupBody.fillStyle(CONFIG.COLORS.CUP_PRIMARY, 1);
        this.cupBody.fillEllipse(width/2 - 5, height * 0.4, 8, 20);
    }
    
    /**
     * Create a kawaii face on the cup
     */
    createFace() {
        // Face background (creates a lighter area for the face)
        this.faceBackground = this.scene.add.circle(0, CONFIG.CUP.FACE_OFFSET_Y, 35, CONFIG.COLORS.CUP_FACE_BG, 0.5);
        this.add(this.faceBackground);
        
        // Create face container for easy manipulation
        this.face = this.scene.add.container(0, CONFIG.CUP.FACE_OFFSET_Y);
        this.add(this.face);
        
        // Create eyes
        const eyeSpacing = CONFIG.CUP.EYE_SPACING;
        const eyeSize = CONFIG.CUP.EYE_SIZE;
        
        // Left eye
        this.leftEye = this.scene.add.circle(-eyeSpacing/2, 0, eyeSize, CONFIG.COLORS.FACE_HAPPY);
        this.face.add(this.leftEye);
        
        // Right eye
        this.rightEye = this.scene.add.circle(eyeSpacing/2, 0, eyeSize, CONFIG.COLORS.FACE_HAPPY);
        this.face.add(this.rightEye);
        
        // Blink eyes (closed version - initially invisible)
        this.leftEyeClosed = this.scene.add.rectangle(-eyeSpacing/2, 0, eyeSize*2, 2, CONFIG.COLORS.FACE_HAPPY);
        this.leftEyeClosed.setOrigin(0.5);
        this.leftEyeClosed.visible = false;
        this.face.add(this.leftEyeClosed);
        
        this.rightEyeClosed = this.scene.add.rectangle(eyeSpacing/2, 0, eyeSize*2, 2, CONFIG.COLORS.FACE_HAPPY);
        this.rightEyeClosed.setOrigin(0.5);
        this.rightEyeClosed.visible = false;
        this.face.add(this.rightEyeClosed);
        
        // Create mouth (happy face)
        const mouthWidth = CONFIG.CUP.MOUTH_WIDTH;
        this.mouth = this.scene.add.graphics();
        this.drawHappyMouth();
        this.face.add(this.mouth);
        
        // Add blush circles
        const blushSize = CONFIG.CUP.BLUSH_SIZE;
        const blushOffsetX = CONFIG.CUP.BLUSH_OFFSET_X;
        
        this.leftBlush = this.scene.add.circle(-blushOffsetX, 10, blushSize, CONFIG.COLORS.FACE_BLUSH, 0.4);
        this.rightBlush = this.scene.add.circle(blushOffsetX, 10, blushSize, CONFIG.COLORS.FACE_BLUSH, 0.4);
        this.face.add(this.leftBlush);
        this.face.add(this.rightBlush);
    }
    
    /**
     * Draw happy mouth
     */
    drawHappyMouth() {
        const mouthWidth = CONFIG.CUP.MOUTH_WIDTH;
        this.mouth.clear();
        this.mouth.lineStyle(2, CONFIG.COLORS.FACE_HAPPY, 1);
        
        // Draw a curved smile
        this.mouth.beginPath();
        this.mouth.moveTo(-mouthWidth/2, 15);
        this.mouth.bezierCurveTo(-mouthWidth/4, 25, mouthWidth/4, 25, mouthWidth/2, 15);
        this.mouth.stroke();
    }
    
    /**
     * Draw surprised mouth (when lifted)
     */
    drawSurprisedMouth() {
        this.mouth.clear();
        this.mouth.fillStyle(CONFIG.COLORS.FACE_HAPPY, 1);
        
        // Draw a small oval mouth
        this.mouth.fillEllipse(0, 15, 10, 12);
    }
    
    /**
     * Set up blinking and other face animations
     */
    setupFaceAnimations() {
        // Schedule random blinking
        this.scheduleNextBlink();
    }
    
    /**
     * Schedule the next eye blink
     */
    scheduleNextBlink() {
        // Clear any existing timers
        if (this.blinkTimer) {
            this.scene.time.removeEvent(this.blinkTimer);
        }
        
        const blinkInterval = Phaser.Math.Between(
            CONFIG.ANIMATION.FACE_BLINK_INTERVAL[0],
            CONFIG.ANIMATION.FACE_BLINK_INTERVAL[1]
        );
        
        this.blinkTimer = this.scene.time.delayedCall(blinkInterval, () => {
            this.blink();
        });
    }
    
    /**
     * Perform an eye blink animation
     */
    blink() {
        if (this.isBlinking || !this.visible) return;
        
        this.isBlinking = true;
        
        // Hide open eyes, show closed eyes
        this.leftEye.visible = false;
        this.rightEye.visible = false;
        this.leftEyeClosed.visible = true;
        this.rightEyeClosed.visible = true;
        
        // Reopen eyes after a short time
        this.scene.time.delayedCall(150, () => {
            this.leftEye.visible = true;
            this.rightEye.visible = true;
            this.leftEyeClosed.visible = false;
            this.rightEyeClosed.visible = false;
            this.isBlinking = false;
            
            // Schedule next blink
            this.scheduleNextBlink();
        });
    }
    
    /**
     * Create the coin
     */
    createCoin() {
        this.coin = this.scene.add.container(0, CONFIG.CUP.HEIGHT - 30);
        
        // Coin body
        const coinDiameter = CONFIG.COIN.DIAMETER;
        this.coinBody = this.scene.add.circle(0, 0, coinDiameter/2, CONFIG.COLORS.COIN_PRIMARY);
        
        // Coin details
        this.coinDetail = this.scene.add.circle(0, 0, coinDiameter/3, CONFIG.COLORS.COIN_SECONDARY);
        
        // Add sparkle
        this.coinSparkle = this.scene.add.star(
            coinDiameter/4, -coinDiameter/4, 
            5, 
            CONFIG.COIN.SPARKLE_SIZE/3, 
            CONFIG.COIN.SPARKLE_SIZE, 
            0xFFFFFF
        );
        
        // Add all to coin container
        this.coin.add(this.coinBody);
        this.coin.add(this.coinDetail);
        this.coin.add(this.coinSparkle);
        
        // Add coin to main container but hide it initially
        this.add(this.coin);
        this.coin.visible = false;
    }
    
    /**
     * Set hover state, change cup appearance when hovered
     */
    setHover(isHovered) {
        if (this.isHovered === isHovered) return;
        
        this.isHovered = isHovered;
        
        // Scale effect on hover
        if (isHovered) {
            this.scene.tweens.add({
                targets: this,
                scaleX: 1.05,
                scaleY: 1.05,
                duration: 200,
                ease: 'Cubic.Out'
            });
        } else {
            this.scene.tweens.add({
                targets: this,
                scaleX: 1,
                scaleY: 1,
                duration: 200,
                ease: 'Cubic.Out'
            });
        }
    }
    
    /**
     * Lift the cup to reveal what's underneath
     */
    lift() {
        if (this.isAnimating || this.isRevealed) return;
        
        this.isAnimating = true;
        
        // Change face to surprised
        this.drawSurprisedMouth();
        
        // Show coin if this cup has it
        if (this.hasCoin) {
            this.coin.visible = true;
            
            // Add spinning animation to coin
            this.scene.tweens.add({
                targets: this.coin,
                angle: 360,
                duration: CONFIG.COIN.SPIN_DURATION,
                repeat: -1,
                ease: 'Linear'
            });
            
            // Add sparkle animation
            this.scene.tweens.add({
                targets: this.coinSparkle,
                alpha: 0.5,
                scale: 1.2,
                duration: 400,
                yoyo: true,
                repeat: -1
            });
        }
        
        // Lift the cup with a nice animation
        this.scene.tweens.add({
            targets: this,
            y: this.baseY - CONFIG.ANIMATION.CUP_JUMP_HEIGHT,
            duration: CONFIG.ANIMATION.LIFT_DURATION,
            ease: 'Back.Out',
            onComplete: () => {
                this.isAnimating = false;
                this.isRevealed = true;
            }
        });
        
        return this;
    }
    
    /**
     * Lower the cup back down
     */
    lower() {
        if (this.isAnimating || !this.isRevealed) return;
        
        this.isAnimating = true;
        
        // Change face back to happy
        this.drawHappyMouth();
        
        // Hide the coin
        if (this.hasCoin) {
            this.coin.visible = false;
        }
        
        // Lower the cup
        this.scene.tweens.add({
            targets: this,
            y: this.baseY,
            duration: CONFIG.ANIMATION.LOWER_DURATION,
            ease: 'Bounce.Out',
            onComplete: () => {
                this.isAnimating = false;
                this.isRevealed = false;
            }
        });
        
        return this;
    }
    
    /**
     * Wobble the cup (when shuffling is complete)
     */
    wobble() {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Create a wobble animation
        this.scene.tweens.add({
            targets: this,
            x: {
                value: {
                    getEnd: () => this.baseX + Phaser.Math.Between(-CONFIG.ANIMATION.WOBBLE_AMPLITUDE, CONFIG.ANIMATION.WOBBLE_AMPLITUDE),
                    getStart: () => this.x
                }
            },
            ease: 'Sine.InOut',
            duration: 100,
            repeat: 5,
            onComplete: () => {
                // Reset position exactly
                this.x = this.baseX;
                this.isAnimating = false;
            }
        });
        
        return this;
    }
    
    /**
     * Move the cup to a new position (for shuffling)
     */
    moveTo(x, y, duration) {
        if (this.isAnimating) return;
        
        this.isAnimating = true;
        
        // Store the new base position
        this.baseX = x;
        
        // Jump animation path
        const jumpHeight = 40;
        
        // Create a path for the cup to follow (arc motion)
        const timeline = this.scene.tweens.createTimeline();
        
        // Up and halfway there
        timeline.add({
            targets: this,
            x: this.x + (x - this.x) / 2,
            y: this.y - jumpHeight,
            duration: duration / 2,
            ease: 'Quad.Out'
        });
        
        // Down and to final position
        timeline.add({
            targets: this,
            x: x,
            y: this.y,
            duration: duration / 2,
            ease: 'Quad.In',
            onComplete: () => {
                this.isAnimating = false;
            }
        });
        
        timeline.play();
        
        return this;
    }
}

/**
 * Message Class for kawaii messages
 */
class KawaiiMessage extends Phaser.GameObjects.Container {
    constructor(scene, x, y) {
        super(scene, x, y);
        
        this.scene = scene;
        
        // Create message background
        this.bg = scene.add.graphics();
        this.add(this.bg);
        
        // Create message text
        this.text = scene.add.text(0, 0, '', {
            fontFamily: '"Baloo 2", cursive',
            fontSize: '18px',
            color: '#FFFFFF',
            stroke: '#d162a4',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5);
        this.add(this.text);
        
        // Add to scene but hide initially
        scene.add.existing(this);
        this.visible = false;
        this.alpha = 0;
    }
    
    /**
     * Show message with text and color
     */
    show(text, color = 0xff9bce) {
        // Set text
        this.text.setText(text);
        
        // Draw background
        this.bg.clear();
        this.bg.fillStyle(color, 0.9);
        
        // Calculate background size based on text width
        const padding = { x: 20, y: 12 };
        const width = this.text.width + padding.x * 2;
        const height = this.text.height + padding.y * 2;
        
        // Draw rounded rectangle background
        this.bg.fillRoundedRect(-width/2, -height/2, width, height, 15);
        
        // Show with animation
        this.visible = true;
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            y: this.y - 10,
            scale: 1.05,
            duration: 300,
            ease: 'Back.Out'
        });
        
        return this;
    }
    
    /**
     * Hide message with animation
     */
    hide() {
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            y: this.y + 10,
            scale: 0.9,
            duration: 200,
            ease: 'Back.In',
            onComplete: () => {
                this.visible = false;
            }
        });
        
        return this;
    }
} 