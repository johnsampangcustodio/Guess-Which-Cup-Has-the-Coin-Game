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
        
        // Add trail effect for movement
        this.trail = [];
        this.maxTrailLength = 5;
        this.isMoving = false;
    }
    
    /**
     * Update cup position based on its target position
     */
    update(deltaTime) {
        // Store previous position for trail
        const prevX = this.x;
        const prevY = this.y;
        
        // If cup is being moved (during shuffle)
        if (this.x !== this.targetX || this.y !== this.targetY) {
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            
            // Mark as moving with a more generous threshold
            this.isMoving = true;
            
            // Much faster easing for more visible movement
            const easing = 0.3;
            
            // Apply movement
            this.x += dx * easing;
            this.y += dy * easing;
            
            // Add strong wobble effect for better visibility
            const wobbleAmount = 2;
            const time = performance.now() / 100;
            this.y += Math.sin(time) * wobbleAmount;
            this.x += Math.cos(time * 1.5) * (wobbleAmount * 0.7);
            
            // Snap to position if very close
            if (Math.abs(dx) < 1) this.x = this.targetX;
            if (Math.abs(dy) < 1) this.y = this.targetY;
            
            // Add to trail if moving
            if (this.isMoving) {
                // Add trail point every few frames for better performance
                if (Math.random() < 0.5) {
                    this.trail.push({ x: prevX, y: prevY, age: 0 });
                    
                    // Limit trail length
                    if (this.trail.length > this.maxTrailLength) {
                        this.trail.shift();
                    }
                }
            }
        } else {
            this.isMoving = false;
            // Clear trail when not moving
            if (this.trail.length > 0 && !this.isMoving) {
                this.trail = [];
            }
        }
        
        // Age the trail points
        for (let i = this.trail.length - 1; i >= 0; i--) {
            this.trail[i].age++;
            // Remove old trail points
            if (this.trail[i].age > 15) {  // Shorter trail lifetime
                this.trail.splice(i, 1);
            }
        }
        
        // Handle cup lifting animation when revealing
        if (this.lifting) {
            this.liftHeight += this.liftSpeed * 1.5;  // Faster lift
            if (this.liftHeight >= this.maxLift) {
                this.liftHeight = this.maxLift;
                this.revealed = true;
            }
        } else if (this.revealed && this.liftHeight > 0) {
            // Lower the cup back down
            this.liftHeight -= this.liftSpeed * 1.5;  // Faster lowering
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
        // Draw trail first (if moving)
        if (this.trail.length > 0) {
            this.drawTrail(ctx);
        }
        
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
    }
    
    /**
     * Draw movement trail
     */
    drawTrail(ctx) {
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            const alpha = 0.7 * (1 - point.age / 15); // Higher alpha for more visible trail
            
            // Draw a faded cup silhouette
            ctx.globalAlpha = alpha;
            
            // Larger trail for better visibility
            ctx.fillStyle = CONFIG.CUP.COLOR;
            ctx.beginPath();
            ctx.ellipse(point.x, point.y, this.width / 2.5, this.width / 5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // Add prominent trail outline
            ctx.strokeStyle = 'rgba(255,255,255,0.6)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Reset alpha
            ctx.globalAlpha = 1;
        }
    }
    
    /**
     * Draw cup with potential lift offset
     */
    drawCup(ctx, liftOffset) {
        const x = this.x;
        const y = this.y - liftOffset;
        
        // Draw cup glow if it has a coin and is revealed
        if (this.hasCoin && this.revealed) {
            // Create radial gradient for glow effect
            const glow = ctx.createRadialGradient(x, y + this.height/2, this.width/2, x, y + this.height/2, this.width * 1.2);
            glow.addColorStop(0, 'rgba(255, 215, 0, 0.7)'); // Stronger gold color
            glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
            
            // Draw glow
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(x, y + this.height/2, this.width * 1.2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw cup shadow for better depth perception
        ctx.fillStyle = CONFIG.CUP.SHADOW;
        ctx.beginPath();
        ctx.ellipse(x, y + this.height + 5, this.bottomWidth / 2 + 10, this.bottomWidth / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Cup top ellipse
        ctx.fillStyle = CONFIG.CUP.COLOR;
        ctx.beginPath();
        ctx.ellipse(x, y, this.width / 2, this.width / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add outline to cup top for better visibility
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y, this.width / 2, this.width / 4, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Add highlight to cup top
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(x - this.width/6, y - this.width/12, this.width/4, this.width/12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Cup body (trapezoid)
        ctx.fillStyle = CONFIG.CUP.COLOR;
        ctx.beginPath();
        ctx.moveTo(x - this.width / 2, y);
        ctx.lineTo(x - this.bottomWidth / 2, y + this.height);
        ctx.lineTo(x + this.bottomWidth / 2, y + this.height);
        ctx.lineTo(x + this.width / 2, y);
        ctx.closePath();
        ctx.fill();
        
        // Add outline to cup body
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - this.width / 2, y);
        ctx.lineTo(x - this.bottomWidth / 2, y + this.height);
        ctx.lineTo(x + this.bottomWidth / 2, y + this.height);
        ctx.lineTo(x + this.width / 2, y);
        ctx.closePath();
        ctx.stroke();
        
        // Add subtle gradient to cup body
        const gradient = ctx.createLinearGradient(x - this.width/2, y, x + this.width/2, y);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x - this.width / 2, y);
        ctx.lineTo(x - this.bottomWidth / 2, y + this.height);
        ctx.lineTo(x + this.bottomWidth / 2, y + this.height);
        ctx.lineTo(x + this.width / 2, y);
        ctx.closePath();
        ctx.fill();
        
        // Cup bottom
        ctx.fillStyle = CONFIG.CUP.COLOR;
        ctx.beginPath();
        ctx.ellipse(x, y + this.height, this.bottomWidth / 2, this.bottomWidth / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Add outline to cup bottom
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y + this.height, this.bottomWidth / 2, this.bottomWidth / 4, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    /**
     * Draw the coin under this cup
     */
    drawCoin(ctx) {
        const coinX = this.x;
        const coinY = this.y + this.height - CONFIG.COIN.RADIUS;
        
        // Enhance coin glow for better visibility
        const glow = ctx.createRadialGradient(coinX, coinY, 0, coinX, coinY, CONFIG.COIN.RADIUS * 3);
        glow.addColorStop(0, 'rgba(255, 215, 0, 0.8)');
        glow.addColorStop(1, 'rgba(255, 215, 0, 0)');
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(coinX, coinY, CONFIG.COIN.RADIUS * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Coin shadow
        ctx.fillStyle = CONFIG.COIN.SHADOW;
        ctx.beginPath();
        ctx.ellipse(coinX, coinY + 5, CONFIG.COIN.RADIUS * 1.2, CONFIG.COIN.RADIUS / 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Coin body with enhanced gradient
        const coinGradient = ctx.createRadialGradient(coinX - CONFIG.COIN.RADIUS/3, coinY - CONFIG.COIN.RADIUS/3, 0, 
                                                     coinX, coinY, CONFIG.COIN.RADIUS);
        coinGradient.addColorStop(0, '#FFF9C4'); // Light gold
        coinGradient.addColorStop(0.7, CONFIG.COIN.COLOR); // Standard gold
        coinGradient.addColorStop(1, '#B7950B'); // Darker edge
        
        ctx.fillStyle = coinGradient;
        ctx.beginPath();
        ctx.arc(coinX, coinY, CONFIG.COIN.RADIUS, 0, Math.PI * 2);
        ctx.fill();
        
        // Add edge highlight
        ctx.strokeStyle = '#FFF9C4';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(coinX, coinY, CONFIG.COIN.RADIUS, 0, Math.PI * 2);
        ctx.stroke();
        
        // Coin details
        ctx.strokeStyle = '#B7950B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(coinX, coinY, CONFIG.COIN.RADIUS * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        
        // Add $ symbol
        ctx.fillStyle = '#B7950B';
        ctx.font = `bold ${CONFIG.COIN.RADIUS}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', coinX, coinY);
        
        // Add shimmer effect
        const shimmerAngle = (performance.now() / 1000) % (Math.PI * 2);
        const shimmerX = coinX + Math.cos(shimmerAngle) * (CONFIG.COIN.RADIUS * 0.5);
        const shimmerY = coinY + Math.sin(shimmerAngle) * (CONFIG.COIN.RADIUS * 0.5);
        
        const shimmerGradient = ctx.createRadialGradient(shimmerX, shimmerY, 0, 
                                                        shimmerX, shimmerY, CONFIG.COIN.RADIUS * 0.4);
        shimmerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        shimmerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = shimmerGradient;
        ctx.beginPath();
        ctx.arc(shimmerX, shimmerY, CONFIG.COIN.RADIUS * 0.4, 0, Math.PI * 2);
        ctx.fill();
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