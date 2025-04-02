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
    
    // Canvas settings
    CANVAS_PADDING: 20,
    CUP_IMAGE_PATH: null, // We'll draw cups programmatically
    COIN_IMAGE_PATH: null, // We'll draw coin programmatically
    
    // Difficulty levels
    DIFFICULTY: {
        1: { // Easy
            NUM_CUPS: 3,
            SHUFFLE_SPEED: 0.7,
            SHUFFLE_DURATION: 2000,
            SHUFFLE_COMPLEXITY: 1,
            MIN_DISTANCE: 80, // Minimum distance between cups
        },
        2: { // Medium
            NUM_CUPS: 4,
            SHUFFLE_SPEED: 1,
            SHUFFLE_DURATION: 2500,
            SHUFFLE_COMPLEXITY: 2,
            MIN_DISTANCE: 80,
        },
        3: { // Hard
            NUM_CUPS: 5,
            SHUFFLE_SPEED: 1.5,
            SHUFFLE_DURATION: 3000,
            SHUFFLE_COMPLEXITY: 3,
            MIN_DISTANCE: 70,
        },
        4: { // Expert
            NUM_CUPS: 6,
            SHUFFLE_SPEED: 2,
            SHUFFLE_DURATION: 3500,
            SHUFFLE_COMPLEXITY: 4,
            MIN_DISTANCE: 65,
        }
    },
    
    // Cup dimensions
    CUP: {
        WIDTH: 70,
        HEIGHT: 100,
        BOTTOM_WIDTH: 50, // Width of the cup bottom (narrower than top)
        COLOR: '#8B4513', // Brown color for cups
        SHADOW: 'rgba(0, 0, 0, 0.3)',
    },
    
    // Coin dimensions
    COIN: {
        RADIUS: 20,
        COLOR: '#FFD700', // Gold
        SHADOW: 'rgba(0, 0, 0, 0.2)',
    }
}; 