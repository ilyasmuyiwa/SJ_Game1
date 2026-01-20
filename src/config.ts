export const GameConfig = {
  // Graphics Quality Presets
  QUALITY: {
    HIGH: {
      resolution: window.devicePixelRatio || 2,
      antialias: true,
      roundPixels: false,
      pixelArt: false
    },
    MEDIUM: {
      resolution: 1.5,
      antialias: true,
      roundPixels: false,
      pixelArt: false
    },
    LOW: {
      resolution: 1,
      antialias: false,
      roundPixels: true,
      pixelArt: false
    }
  },

  // Game Dimensions
  WIDTH: 1280,
  HEIGHT: 720,

  // Physics
  GRAVITY: 1500,

  // Player
  PLAYER: {
    SPEED: 350,
    SPEED_INCREMENT: 0.5, // Speed increase per second
    MAX_SPEED: 550,
    JUMP_VELOCITY: -600,
    JUMP_VELOCITY_MAX: -750,
    JUMP_HOLD_TIME: 300, // Max time to hold jump for variable height
    DOUBLE_JUMP_VELOCITY: -550, // Second jump is slightly weaker
    SLIDE_DURATION: 500,
    START_X: 200,
    GROUND_Y: 445,
  },

  // Ground platform position (collision box top edge)
  GROUND_PLATFORM_Y: 650,

  // Zones (Y positions) - where obstacles/collectibles spawn
  ZONES: {
    GROUND: 580,  // Spawn ground items above the platform
    MID: 420,
    UPPER: 260
  },

  // Spawn System
  SPAWN: {
    INITIAL_INTERVAL: 2000, // Spawn every 2 seconds (was 5s)
    MIN_INTERVAL: 1000, // Min 1 second (was 3s)
    INTERVAL_DECREASE: 10, // Decrease per second
    AHEAD_DISTANCE: 800, // Distance ahead of camera right edge to spawn
  },

  // Game Balance
  BALANCE: {
    STARTING_LIVES: 3,
    WRONG_PICKUP_PENALTY: 1, // Lose 1 life
    OBSTACLE_DAMAGE: 1, // Lose 1 life
    CORRECT_PICKUP_SCORE: 10,
    COMBO_MULTIPLIER: 1.5,
    FLORA_TARGET: 50, // Number of flora to collect to complete mission
  },

  // Mission Types
  MISSIONS: {
    COLLECT_FLORA: {
      name: 'COLLECT FLORA ONLY',
      correct: 'flora',
      incorrect: 'fauna'
    }
  }
};

export type QualityPreset = keyof typeof GameConfig.QUALITY;
