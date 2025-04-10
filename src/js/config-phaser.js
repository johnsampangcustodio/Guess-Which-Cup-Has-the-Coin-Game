/**
 * Game Configuration
 * Contains settings for different difficulty levels
 */
const CONFIG = {
    // Phaser game configuration
    GAME: {
        width: 450,  // Increased to match container width
        height: 400, // Increased for more game space
        backgroundColor: 0xF1E7E7, // Updated to new color scheme
        parent: 'phaser-game',
        ROUNDS_PER_GAME: 5 // Number of rounds in a single game
    },
    
    // Animation timing (in milliseconds)
    ANIMATION: {
        SHOW_COIN_TIME: 1200,
        PAUSE_BEFORE_SHUFFLE: 400,
        PAUSE_AFTER_SHUFFLE: 300,
        LIFT_DURATION: 250,
        LOWER_DURATION: 150,
        CUP_JUMP_HEIGHT: 60,
        SHUFFLE_EASE: 'Cubic',
        WOBBLE_AMPLITUDE: 10,
        WOBBLE_DURATION: 600,
        FACE_BLINK_INTERVAL: [2000, 4000]
    },
    
    // Scoring
    POINTS_PER_WIN: 10,
    COMBO_MULTIPLIER: 1.5,
    
    // Color scheme
    COLORS: {
        CUP_PRIMARY: 0xE69DB8, // Updated to new color scheme
        CUP_SECONDARY: 0xc97d96, // Darker shade for accents
        CUP_FACE_BG: 0xFFD0C7, // Updated to new color scheme
        COIN_PRIMARY: 0xFFFECE, // Updated to new color scheme
        COIN_SECONDARY: 0xF5E7A0, // Darker gold for accent
        TABLE: 0xF1E7E7, // Updated to new color scheme
        FACE_HAPPY: 0x825765, // Darker complementary color
        FACE_BLUSH: 0xE69DB8 // Updated to new color scheme
    },
    
    // Difficulty levels - makes sure all cups are visible in each mode
    DIFFICULTY: {
        "easy": { // Easy
            CUP_COUNT: 3,
            SHUFFLE_SPEED: 500,
            SHUFFLE_COUNT: 5,
            CUP_SCALE: 0.9,
            CUP_SPACING: 130
        },
        "medium": { // Medium
            CUP_COUNT: 4,
            SHUFFLE_SPEED: 450,
            SHUFFLE_COUNT: 8,
            CUP_SCALE: 0.85,
            CUP_SPACING: 110
        },
        "hard": { // Hard
            CUP_COUNT: 5,
            SHUFFLE_SPEED: 400,
            SHUFFLE_COUNT: 12,
            CUP_SCALE: 0.75,
            CUP_SPACING: 95
        }
    },
    
    // Cup dimensions (in pixels)
    CUP: {
        WIDTH: 120,
        HEIGHT: 150,
        FACE_OFFSET_Y: 40,
        EYE_SPACING: 24,
        EYE_SIZE: 10,
        MOUTH_WIDTH: 20,
        BLUSH_SIZE: 8,
        BLUSH_OFFSET_X: 18
    },
    
    // Coin dimensions (in pixels)
    COIN: {
        DIAMETER: 60,
        SPARKLE_SIZE: 10,
        SPIN_DURATION: 1000
    }
}; 