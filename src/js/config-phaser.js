/**
 * Game Configuration
 * Contains settings for different difficulty levels
 */
const CONFIG = {
    // Phaser game configuration
    GAME: {
        width: 390,
        height: 300,
        backgroundColor: 0xfff0f6, // Light pink
        parent: 'phaser-game'
    },
    
    // Scoring
    POINTS_PER_WIN: 10,
    COMBO_MULTIPLIER: 1.5,
    
    // Animation timing (in milliseconds)
    SHOW_COIN_TIME: 1800, // Time to show the coin initially
    PAUSE_BEFORE_SHUFFLE: 600, // Pause before shuffling starts
    PAUSE_AFTER_SHUFFLE: 400, // Pause after shuffling ends
    
    // Kawaii style
    COLORS: {
        CUP_PRIMARY: 0xff9bce, // Pink cups
        CUP_SECONDARY: 0xd162a4, // Darker pink for accents
        CUP_FACE_BG: 0xffe6f7, // Light pink for face background
        COIN_PRIMARY: 0xffdf40, // Golden yellow
        COIN_SECONDARY: 0xff9900, // Orange for accent
        TABLE: 0xffeeff, // Very light pink table
        FACE_HAPPY: 0x6a4162, // Dark purple for face
        FACE_BLUSH: 0xfa86c4 // Pink for blush
    },
    
    // Difficulty levels - makes sure all cups are visible in each mode
    DIFFICULTY: {
        1: { // Easy
            NUM_CUPS: 3,
            SHUFFLE_SPEED: 650, // ms per move
            NUM_SHUFFLES: 5,
            CUP_SCALE: 0.9,
            CUP_SPACING: 110
        },
        2: { // Medium
            NUM_CUPS: 4,
            SHUFFLE_SPEED: 550,
            NUM_SHUFFLES: 8,
            CUP_SCALE: 0.8,
            CUP_SPACING: 95
        },
        3: { // Hard
            NUM_CUPS: 5,
            SHUFFLE_SPEED: 450,
            NUM_SHUFFLES: 12,
            CUP_SCALE: 0.7,
            CUP_SPACING: 78
        },
        4: { // Expert
            NUM_CUPS: 6,
            SHUFFLE_SPEED: 350,
            NUM_SHUFFLES: 15,
            CUP_SCALE: 0.6,
            CUP_SPACING: 65
        }
    },
    
    // Animation settings
    ANIMATION: {
        LIFT_DURATION: 300,
        LOWER_DURATION: 200,
        CUP_JUMP_HEIGHT: 50,
        SHUFFLE_EASE: 'Cubic',
        WOBBLE_AMPLITUDE: 10,
        WOBBLE_DURATION: 800,
        FACE_BLINK_INTERVAL: [2000, 5000] // Min and max time between blinks
    },
    
    // Cup dimensions (in pixels)
    CUP: {
        WIDTH: 120,
        HEIGHT: 150,
        FACE_OFFSET_Y: 40, // Position from top of cup
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
        SPIN_DURATION: 1200
    }
}; 