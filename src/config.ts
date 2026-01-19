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
    SPEED: 400,
    SPEED_INCREMENT: 0.5, // Speed increase per second
    MAX_SPEED: 800,
    JUMP_VELOCITY: -600,
    JUMP_VELOCITY_MAX: -750,
    JUMP_HOLD_TIME: 300, // Max time to hold jump for variable height
    SLIDE_DURATION: 500,
    START_X: 200,
    GROUND_Y: 400,
  },

  // Zones (Y positions)
  ZONES: {
    GROUND: 500,
    MID: 320,
    UPPER: 180
  },

  // Spawn System
  SPAWN: {
    INITIAL_INTERVAL: 1500,
    MIN_INTERVAL: 800,
    INTERVAL_DECREASE: 10, // Decrease per second
    AHEAD_DISTANCE: 1500,
  },

  // Game Balance
  BALANCE: {
    STARTING_DATA_QUALITY: 100,
    WRONG_PICKUP_PENALTY: 10,
    AVOIDABLE_DAMAGE: 10,
    UNAVOIDABLE_DAMAGE: 20,
    CORRECT_PICKUP_SCORE: 10,
    COMBO_MULTIPLIER: 1.5,
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
