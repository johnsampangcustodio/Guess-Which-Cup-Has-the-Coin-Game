/**
 * Cup Class
 * Handles cup rendering, animation and interaction
 */
class Cup {
    constructor(x, y, hasCoin = false) {
        this.x = x;
        this.y = y;
        this.targetX = x;
        this.targetY = y;
        this.width = CONFIG.CUP.WIDTH;
        this.height = CONFIG.CUP.HEIGHT;
        this.bottomWidth = CONFIG.CUP.BOTTOM_WIDTH;
        this.hasCoin = hasCoin;
        this.revealed = false;
        this.lifting = false;
        this.liftHeight = 0;
        this.liftSpeed = 5;
        this.maxLift = 50;
    }
    
    /**
     * Update cup position based on its target position
     */
    update(deltaTime) {
        // If cup is being moved (during shuffle)
        if (this.x !== this.targetX || this.y !== this.targetY) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            
            // Move towards target position (easing effect)
            this.x += dx * 0.1;
            this.y += dy * 0.1;
            
            // Snap to position if very close
            if (Math.abs(dx) < 0.1) this.x = this.targetX;
            if (Math.abs(dy) < 0.1) this.y = this.targetY;
        }
        
        // Handle cup lifting animation when revealing
        if (this.lifting) {
            this.liftHeight += this.liftSpeed;
            if (this.liftHeight >= this.maxLift) {
                this.liftHeight = this.maxLift;
                this.revealed = true;
            }
        } else if (this.revealed && this.liftHeight > 0) {
            // Lower the cup back down
            this.liftHeight -= this.liftSpeed;
            if (this.liftHeight <= 0) {
                this.liftHeight = 0;
                this.revealed = false;
            }
        }
    }
    
    /**
     * Draw the cup on the canvas
     */
    draw(ctx) {
        // Save context state
        ctx.save();
        
        // Draw lifted cup if revealing
        if (this.lifting || this.revealed) {
            this.drawCup(ctx, this.liftHeight);
            
            // Draw coin if this cup has it and is being revealed
            if (this.hasCoin && this.revealed) {
                this.drawCoin(ctx);
            }
        } else {
            // Draw regular cup
            this.drawCup(ctx, 0);
        }
        
        // Restore context state
        ctx.restore();
    }
    
    /**
     * Draw cup with potential lift offset
     */
    drawCup(ctx, liftOffset) {
        const x = this.x;
        const y = this.y - liftOffset;
        
        // Cup top ellipse
        ctx.fillStyle = CONFIG.CUP.COLOR;
        ctx.beginPath();
        ctx.ellipse(x, y, this.width / 2, this.width / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Cup body (trapezoid)
        ctx.beginPath();
        ctx.moveTo(x - this.width / 2, y);
        ctx.lineTo(x - this.bottomWidth / 2, y + this.height);
        ctx.lineTo(x + this.bottomWidth / 2, y + this.height);
        ctx.lineTo(x + this.width / 2, y);
        ctx.closePath();
        ctx.fill();
        
        // Cup bottom
        ctx.beginPath();
        ctx.ellipse(x, y + this.height, this.bottomWidth / 2, this.bottomWidth / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Cup shadow
        ctx.fillStyle = CONFIG.CUP.SHADOW;
        ctx.beginPath();
        ctx.ellipse(x, y + this.height + 5, this.bottomWidth / 2 + 5, this.bottomWidth / 4, 0, 0, Math.PI);
        ctx.fill();
    }
    
    /**
     * Draw the coin under this cup
     */
    drawCoin(ctx) {
        const coinX = this.x;
        const coinY = this.y + this.height - CONFIG.COIN.RADIUS;
        
        // Coin shadow
        ctx.fillStyle = CONFIG.COIN.SHADOW;
        ctx.beginPath();
        ctx.ellipse(coinX, coinY + 5, CONFIG.COIN.RADIUS, CONFIG.COIN.RADIUS / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Coin body
        ctx.fillStyle = CONFIG.COIN.COLOR;
        ctx.beginPath();
        ctx.arc(coinX, coinY, CONFIG.COIN.RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        // Coin details (simple design)
        ctx.strokeStyle = '#DAA520';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(coinX, coinY, CONFIG.COIN.RADIUS * 0.7, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    /**
     * Start lifting the cup to reveal what's underneath
     */
    reveal() {
        this.lifting = true;
    }
    
    /**
     * Lower the cup back down
     */
    hide() {
        this.lifting = false;
    }
    
    /**
     * Check if a point (like a click/tap) is within this cup
     */
    containsPoint(point) {
        return point.x >= this.x - this.width / 2 &&
               point.x <= this.x + this.width / 2 &&
               point.y >= this.y - this.width / 4 &&
               point.y <= this.y + this.height;
    }
    
    /**
     * Animate the cup to a new position
     */
    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
    }
} 