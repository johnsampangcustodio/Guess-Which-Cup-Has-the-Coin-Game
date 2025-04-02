/**
 * Game Configuration
 * Contains settings for different difficulty levels
 */
const CONFIG = {
    // Scoring
    POINTS_PER_WIN: 10,
    COMBO_MULTIPLIER: 1.5,
    
    // Animation timing (in milliseconds)
    SHOW_COIN_TIME: 1500, // Time to show the coin initially
    PAUSE_BEFORE_SHUFFLE: 500, // Pause before shuffling starts
    PAUSE_AFTER_SHUFFLE: 300, // Pause after shuffling ends
    
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
            MAX_HEIGHT: 0.8, // Max height during jumps
        },
        2: { // Medium
            NUM_CUPS: 4,
            SHUFFLE_SPEED: 1.2,
            SHUFFLE_DURATION: 2500,
            SHUFFLE_COMPLEXITY: 2,
            MAX_HEIGHT: 1.0,
        },
        3: { // Hard
            NUM_CUPS: 5,
            SHUFFLE_SPEED: 1.6,
            SHUFFLE_DURATION: 3000,
            SHUFFLE_COMPLEXITY: 3,
            MAX_HEIGHT: 1.2,
        },
        4: { // Expert
            NUM_CUPS: 6,
            SHUFFLE_SPEED: 2,
            SHUFFLE_DURATION: 3500,
            SHUFFLE_COMPLEXITY: 4,
            MAX_HEIGHT: 1.5,
        }
    },
    
    // Cup dimensions
    CUP: {
        RADIUS_TOP: 0.5,    // Cup top radius
        RADIUS_BOTTOM: 0.35, // Cup bottom radius
        HEIGHT: 0.8,        // Cup height
        SEGMENTS: 32,       // Geometry detail
        COLOR: 0xDD0000,    // Red cups
        HOVER_COLOR: 0xFF4444, // Lighter red for hover effect
        LIFT_HEIGHT: 1.5,   // How high to lift the cup for reveal
    },
    
    // Coin dimensions
    COIN: {
        RADIUS: 0.25,
        HEIGHT: 0.05,
        SEGMENTS: 32,
        COLOR: 0xFFD700, // Gold
        EDGE_COLOR: 0xDAA520, // Darker gold for edge
    },
    
    // Physics and Movement
    PHYSICS: {
        GRAVITY: 9.8,
        BOUNCE: 0.3,
        FRICTION: 0.95
    }
}; 