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
    STARTING_LIVES: 4,
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
  },

  // Level Configurations
  LEVELS: [
    {
      level: 1,
      name: 'Fauna Collection',
      objective: 'Collect 50 Fauna',
      phases: [
        { target: 50, collectibleType: 'fauna' as const, message: 'Collect Fauna!' }
      ],
      spawnTypes: ['fauna' as const, 'flora' as const],
      hasObstacles: false,
      baseSpeed: 350,
      maxSpeed: 550,
      startingLives: 4,
      background: 'bg-verdant',
      streamName: 'Verdant Stream'
    },
    {
      level: 2,
      name: 'Flora Collection',
      objective: 'Collect 50 Flora',
      phases: [
        { target: 50, collectibleType: 'flora' as const, message: 'Collect Flora!' }
      ],
      spawnTypes: ['flora' as const, 'fauna' as const],
      hasObstacles: false,
      baseSpeed: 400,
      maxSpeed: 600,
      startingLives: 4,
      background: 'bg-crimson',
      streamName: 'Crimson Stream'
    },
    {
      level: 3,
      name: 'Flora then Fauna',
      objective: 'Collect 30 Flora, then 30 Fauna',
      phases: [
        { target: 30, collectibleType: 'flora' as const, message: 'Collect 30 Flora!' },
        { target: 30, collectibleType: 'fauna' as const, message: 'Now collect 30 Fauna!' }
      ],
      spawnTypes: ['flora' as const, 'fauna' as const],
      hasObstacles: false,
      baseSpeed: 450,
      maxSpeed: 650,
      startingLives: 4,
      background: 'bg-glacial',
      streamName: 'Glacial Stream'
    },
    {
      level: 4,
      name: 'Flora vs Obstacles',
      objective: 'Collect 50 Flora, avoid obstacles',
      phases: [
        { target: 50, collectibleType: 'flora' as const, message: 'Collect Flora, avoid obstacles!' }
      ],
      spawnTypes: ['flora' as const, 'obstacle' as const],
      hasObstacles: true,
      baseSpeed: 500,
      maxSpeed: 700,
      startingLives: 4,
      background: 'bg-sands',
      streamName: 'Shifting Sands'
    },
    {
      level: 5,
      name: 'Fauna vs Obstacles',
      objective: 'Collect 50 Fauna, avoid obstacles',
      phases: [
        { target: 50, collectibleType: 'fauna' as const, message: 'Collect Fauna, avoid obstacles!' }
      ],
      spawnTypes: ['fauna' as const, 'obstacle' as const],
      hasObstacles: true,
      baseSpeed: 550,
      maxSpeed: 750,
      startingLives: 4,
      background: 'bg-sunken',
      streamName: 'Sunken Stream'
    },
    {
      level: 6,
      name: 'Mixed Collection',
      objective: 'Collect 30 Fauna, then 30 Flora',
      phases: [
        { target: 30, collectibleType: 'fauna' as const, message: 'Collect 30 Fauna!' },
        { target: 30, collectibleType: 'flora' as const, message: 'Now collect 30 Flora!' }
      ],
      spawnTypes: ['fauna' as const, 'flora' as const, 'obstacle' as const],
      hasObstacles: true,
      baseSpeed: 600,
      maxSpeed: 800,
      startingLives: 4,
      background: 'bg-void',
      streamName: 'The Void'
    }
  ]
};

export type QualityPreset = keyof typeof GameConfig.QUALITY;
export type CollectibleType = 'fauna' | 'flora';
export type SpawnType = 'fauna' | 'flora' | 'obstacle';

