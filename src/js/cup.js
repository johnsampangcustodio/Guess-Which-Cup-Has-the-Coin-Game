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
            
            // Mark as moving
            this.isMoving = true;
            
            // Smoother, gentler easing for less jittery movement
            const easing = 0.12;
            
            // Apply movement
            this.x += dx * easing;
            this.y += dy * easing;
            
            // Add subtle bounce effect 
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                // Soft bobbing motion
                const time = performance.now() / 350; // Slower oscillation
                const bounceFactor = 0.5; // Subtler bounce
                
                // Small vertical bounce
                this.y += Math.sin(time) * bounceFactor;
            }
            
            // Snap to position if very close
            if (Math.abs(dx) < 1) this.x = this.targetX;
            if (Math.abs(dy) < 1) this.y = this.targetY;
            
            // Add to trail if moving - fewer trail points for cleaner look
            if (this.isMoving && Math.random() < 0.2) {
                this.trail.push({ x: prevX, y: prevY, age: 0 });
                
                // Shorter trail length for a cleaner look
                if (this.trail.length > 2) {
                    this.trail.shift();
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
            if (this.trail[i].age > 8) {  // Shorter trail lifetime
                this.trail.splice(i, 1);
            }
        }
        
        // Handle cup lifting animation when revealing
        if (this.lifting) {
            this.liftHeight += this.liftSpeed * 1.1;
            if (this.liftHeight >= this.maxLift) {
                this.liftHeight = this.maxLift;
                this.revealed = true;
            }
        } else if (this.revealed && this.liftHeight > 0) {
            this.liftHeight -= this.liftSpeed * 1.1;
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
            
            // Draw gem if this cup has it and is being revealed
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
            const alpha = 0.3 * (1 - point.age / 8); // Subtler trail
            
            // Draw a faded cup silhouette
            ctx.globalAlpha = alpha;
            
            // Simpler, subtle trail
            ctx.fillStyle = 'rgba(66, 28, 20, 0.2)';
            
            // Draw simple trail dot
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.width / 8, 0, Math.PI * 2);
            ctx.fill();
            
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
        
        // Cup shadow
        ctx.fillStyle = CONFIG.CUP.SHADOW;
        ctx.beginPath();
        ctx.ellipse(x, y + this.height + 5, this.bottomWidth / 2 + 5, this.bottomWidth / 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // ---------------
        // Draw mug - based on image
        // ---------------
        
        // Mug handle (right side)
        ctx.fillStyle = CONFIG.CUP.COLOR;
        ctx.beginPath();
        const handleX = x + this.width / 2 + 8;
        const handleY = y + this.height / 3;
        const handleWidth = this.width / 4;
        const handleHeight = this.height / 2;
        
        ctx.ellipse(handleX, handleY, handleWidth / 2, handleHeight / 2, 0, 0, Math.PI * 2);
        
        // Cut out inner handle
        ctx.moveTo(handleX + handleWidth / 3, handleY);
        ctx.ellipse(handleX, handleY, handleWidth / 4, handleHeight / 3, 0, 0, Math.PI * 2, true);
        ctx.fill();
        
        // Main cup base - white
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        
        // Draw cup oval
        ctx.arc(x, y + this.height / 2, this.height / 2 + 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw cat face (orange/peach color)
        ctx.fillStyle = CONFIG.CUP.CAT_COLOR;
        ctx.beginPath();
        
        const catWidth = this.width * 0.8;
        const catHeight = this.height * 0.5;
        const catY = y + this.height / 2;
        
        // Cat face (semicircle at bottom half of mug)
        ctx.arc(x, catY, catWidth / 2, 0, Math.PI, false);
        ctx.fill();
        
        // Draw cup rim at top (brown)
        ctx.fillStyle = CONFIG.CUP.COLOR; 
        ctx.beginPath();
        ctx.arc(x, y + 3, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw coffee inside cup (dark brown)
        ctx.fillStyle = CONFIG.CUP.COLOR; 
        ctx.beginPath();
        ctx.arc(x, y + 8, this.width / 2 - 6, 0, Math.PI * 2);
        ctx.fill();
        
        // Add cat facial features
        // Eyes (closed, sleepy)
        ctx.fillStyle = "#421C14"; // Dark brown
        
        // Left eye
        ctx.beginPath();
        const eyeY = catY - catHeight / 6;
        const eyeDistance = catWidth / 4;
        ctx.arc(x - eyeDistance, eyeY, 3, 0, Math.PI, true);
        ctx.stroke();
        
        // Right eye
        ctx.beginPath();
        ctx.arc(x + eyeDistance, eyeY, 3, 0, Math.PI, true);
        ctx.stroke();
        
        // Mouth (cute small wave)
        ctx.beginPath();
        ctx.moveTo(x - 8, catY + 8);
        ctx.quadraticCurveTo(x, catY + 15, x + 8, catY + 8);
        ctx.stroke();
        
        // Add cat stripes (darker orange)
        ctx.strokeStyle = CONFIG.CUP.CAT_STRIPE_COLOR;
        ctx.lineWidth = 3;
        
        // Left stripe
        ctx.beginPath();
        ctx.moveTo(x - catWidth / 3, catY - catHeight / 4);
        ctx.lineTo(x - catWidth / 3 - 4, catY + catHeight / 3);
        ctx.stroke();
        
        // Middle stripe
        ctx.beginPath();
        ctx.moveTo(x, catY - catHeight / 6);
        ctx.lineTo(x, catY + catHeight / 3);
        ctx.stroke();
        
        // Right stripe
        ctx.beginPath();
        ctx.moveTo(x + catWidth / 3, catY - catHeight / 4);
        ctx.lineTo(x + catWidth / 3 + 4, catY + catHeight / 3);
        ctx.stroke();
        
        // Add cup outline
        ctx.strokeStyle = "#421C14";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y + this.height / 2, this.height / 2 + 3, 0, Math.PI * 2);
        ctx.stroke();
        
        // Add steam if it's not being lifted or revealed
        if (!this.lifting && !this.revealed) {
            ctx.strokeStyle = "rgba(66, 28, 20, 0.4)";
            ctx.lineWidth = 2;
            
            const steamX = x - 10;
            const steamBaseY = y - 8;
            
            // Left steam curl
            ctx.beginPath();
            ctx.moveTo(steamX, steamBaseY);
            ctx.bezierCurveTo(
                steamX - 5, steamBaseY - 10,
                steamX + 5, steamBaseY - 20,
                steamX, steamBaseY - 30
            );
            ctx.stroke();
            
            // Middle steam curl
            ctx.beginPath();
            ctx.moveTo(x, steamBaseY - 5);
            ctx.bezierCurveTo(
                x - 5, steamBaseY - 15,
                x + 5, steamBaseY - 25,
                x, steamBaseY - 35
            );
            ctx.stroke();
            
            // Right steam curl
            ctx.beginPath();
            ctx.moveTo(x + 10, steamBaseY);
            ctx.bezierCurveTo(
                x + 15, steamBaseY - 10,
                x + 5, steamBaseY - 20,
                x + 10, steamBaseY - 30
            );
            ctx.stroke();
        }
    }
    
    /**
     * Draw the gem under this cup
     */
    drawCoin(ctx) {
        const gemX = this.x;
        const gemY = this.y + this.height - CONFIG.COIN.RADIUS;
        
        // Create sparkly glow effect for gem
        const glow = ctx.createRadialGradient(gemX, gemY, 0, gemX, gemY, CONFIG.COIN.RADIUS * 2);
        glow.addColorStop(0, 'rgba(174, 214, 241, 0.7)');
        glow.addColorStop(1, 'rgba(174, 214, 241, 0)');
        
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(gemX, gemY, CONFIG.COIN.RADIUS * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Subtle gem shadow
        ctx.fillStyle = CONFIG.COIN.SHADOW;
        ctx.beginPath();
        ctx.ellipse(gemX, gemY + 5, CONFIG.COIN.RADIUS * 1.2, CONFIG.COIN.RADIUS / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw gem facets instead of a plain circle
        const facetCount = CONFIG.COIN.FACETS || 6;
        const colorCount = CONFIG.COIN.COLORS ? CONFIG.COIN.COLORS.length : 1;
        
        // Draw each facet with a different color
        for (let i = 0; i < facetCount; i++) {
            const startAngle = (i / facetCount) * Math.PI * 2;
            const endAngle = ((i + 1) / facetCount) * Math.PI * 2;
            
            // Choose color from the palette
            const facetColor = CONFIG.COIN.COLORS ? 
                CONFIG.COIN.COLORS[i % colorCount] : 
                CONFIG.COIN.COLOR;
            
            // Create gradient for each facet for dimensional effect
            const facetGradient = ctx.createRadialGradient(
                gemX, gemY, 0,
                gemX, gemY, CONFIG.COIN.RADIUS
            );
            
            facetGradient.addColorStop(0, '#FFFFFF');
            facetGradient.addColorStop(0.5, facetColor);
            facetGradient.addColorStop(1, shadeColor(facetColor, -20));
            
            ctx.fillStyle = facetGradient;
            ctx.beginPath();
            ctx.moveTo(gemX, gemY);
            ctx.arc(gemX, gemY, CONFIG.COIN.RADIUS, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();
            
            // Add facet edge highlights
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(gemX, gemY);
            ctx.lineTo(gemX + Math.cos(startAngle) * CONFIG.COIN.RADIUS, 
                       gemY + Math.sin(startAngle) * CONFIG.COIN.RADIUS);
            ctx.stroke();
        }
        
        // Add central highlight/sparkle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(gemX, gemY, CONFIG.COIN.RADIUS / 4, 0, Math.PI * 2);
        ctx.fill();
        
        // Add sparkle effect
        if (CONFIG.COIN.SPARKLE) {
            const time = performance.now() / 1000;
            
            // Draw a single sparkle that moves around
            const angle = time % (Math.PI * 2);
            const dist = CONFIG.COIN.RADIUS * 0.6;
            const sparkleX = gemX + Math.cos(angle) * dist;
            const sparkleY = gemY + Math.sin(angle) * dist;
            
            // Draw star-shaped sparkle
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            for (let j = 0; j < 5; j++) {
                const starAngle = j * Math.PI * 2 / 5 + time * 2;
                const innerRadius = CONFIG.COIN.RADIUS / 10;
                const outerRadius = CONFIG.COIN.RADIUS / 5;
                
                const x = sparkleX + Math.cos(starAngle) * (j % 2 ? innerRadius : outerRadius);
                const y = sparkleY + Math.sin(starAngle) * (j % 2 ? innerRadius : outerRadius);
                
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
        }
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

/**
 * Helper function to darken or lighten a color
 */
function shadeColor(color, percent) {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = parseInt(R * (100 + percent) / 100);
    G = parseInt(G * (100 + percent) / 100);
    B = parseInt(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    const RR = ((R.toString(16).length == 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length == 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length == 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
} 