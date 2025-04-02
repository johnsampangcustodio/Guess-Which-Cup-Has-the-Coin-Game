/**
 * Game Configuration
 * Contains settings for different difficulty levels
 */
const CONFIG = {
    // Scoring
    POINTS_PER_WIN: 10,
    COMBO_MULTIPLIER: 1.5,
    
    // Animation timing (in milliseconds)
    SHOW_COIN_TIME: 2500, // Increased time to show the coin initially
    PAUSE_BEFORE_SHUFFLE: 500, // Pause before shuffling starts
    PAUSE_AFTER_SHUFFLE: 300, // Pause after shuffling ends
    
    // Canvas settings
    CANVAS_PADDING: 50,  // Padding from edge of canvas
    
    // 3D Scene settings
    CAMERA: {
        FOV: 50,
        NEAR: 0.1,
        FAR: 1000,
        POSITION: { x: 0, y: 1.5, z: 5 }, // Initial camera position
        LOOK_AT: { x: 0, y: 0, z: 0 }, // Where camera looks at
    },
    
    LIGHTS: {
        AMBIENT: {
            COLOR: 0xffffff, // White ambient light
            INTENSITY: 0.5
        },
        DIRECTIONAL: {
            COLOR: 0xffffff,
            INTENSITY: 0.8,
            POSITION: { x: 5, y: 5, z: 5 } // Light position
        }
    },
    
    // 3D Object settings
    TABLE: {
        WIDTH: 6,
        DEPTH: 4,
        COLOR: 0x8B4513 // Brown table
    },
    
    // Difficulty levels
    DIFFICULTY: {
        1: { // Easy
            NUM_CUPS: 3,
            SHUFFLE_SPEED: 0.8,
            SHUFFLE_DURATION: 2000,
            SHUFFLE_COMPLEXITY: 1,
            MIN_DISTANCE: 80,
        },
        2: { // Medium
            NUM_CUPS: 4,
            SHUFFLE_SPEED: 1.2,
            SHUFFLE_DURATION: 2500,
            SHUFFLE_COMPLEXITY: 2,
            MIN_DISTANCE: 90,
        },
        3: { // Hard
            NUM_CUPS: 5,
            SHUFFLE_SPEED: 1.6,
            SHUFFLE_DURATION: 3000,
            SHUFFLE_COMPLEXITY: 3,
            MIN_DISTANCE: 100,
        },
        4: { // Expert
            NUM_CUPS: 6,
            SHUFFLE_SPEED: 2,
            SHUFFLE_DURATION: 3500,
            SHUFFLE_COMPLEXITY: 4,
            MIN_DISTANCE: 110,
        }
    },
    
    // Cup dimensions and appearance (for 2D canvas)
    CUP: {
        WIDTH: 70,           // Cup width
        HEIGHT: 90,          // Cup height
        BOTTOM_WIDTH: 50,    // Width of cup bottom
        COLOR: '#4285F4',    // Cup color - Google Blue
        SHADOW: 'rgba(0,0,0,0.4)', // Cup shadow color
        // 3D properties kept for compatibility
        RADIUS_TOP: 0.5,    
        RADIUS_BOTTOM: 0.35,
        SEGMENTS: 32,
        HOVER_COLOR: 0xFF4444,
        LIFT_HEIGHT: 1.5,
    },
    
    // Coin dimensions and appearance
    COIN: {
        RADIUS: 25,          // Increased coin radius for better visibility
        COLOR: '#FFC107',    // Brighter gold color
        SHADOW: 'rgba(0,0,0,0.5)', // Darker shadow for better contrast
    },
    
    // Physics and Movement
    PHYSICS: {
        GRAVITY: 9.8,
        BOUNCE: 0.3,
        FRICTION: 0.95
    }
}; 