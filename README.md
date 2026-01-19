# The Data Run - Phaser 3 Endless Runner MVP

A horizontal endless runner game built with Phaser 3 and TypeScript, featuring variable jump mechanics, collectible missions, and dynamic difficulty scaling.

## Features Implemented

### Core Gameplay
- **Auto-running player** with automatic speed increase over time
- **Variable jump height** - hold W longer for higher jumps
- **Slide mechanic** - S key reduces hitbox to pass under obstacles
- **Three vertical zones** - Ground, Mid-air, and Upper zones for varied gameplay
- **Collision detection** with dynamic hitbox adjustments

### Game Systems
- **Object pooling** for optimized performance (obstacles & collectibles)
- **Spawner system** with weighted randomness and difficulty scaling
- **Mission system** - "Collect FLORA only" with scoring and penalties
- **Combo system** - Chain correct pickups for bonus points
- **Data Quality meter** - Acts as health, depletes on damage/wrong pickups

### Obstacles
- **Avoidable obstacles** (Yellow tint) - 10 damage, can jump/slide over
- **Unavoidable obstacles** (Orange tint) - 20 damage, harder to avoid

### Collectibles
- **Flora** (Correct) - Increases score, builds combo
- **Fauna** (Incorrect) - Reduces data quality, breaks combo

### HUD Elements
- **Top-left**: Score + Data Quality bar (color-coded: green/orange/red)
- **Top-right**: Distance traveled + Time elapsed
- **Center-top**: Mission objective banner ("COLLECT FLORA ONLY")
- **Bottom-left**: Inventory strip showing last 5 collected items
- **Combo indicator**: Shows active combo multiplier

### Mobile Support
- **Touch controls** with Jump and Slide buttons (auto-detected on mobile devices)
- **Responsive layout** that scales to device screen

### Graphics Quality Settings
The game uses **HIGH quality rendering** by default for crisp HD sprites:

```typescript
// In src/main.ts, line 8
const QUALITY_PRESET: QualityPreset = 'HIGH'; // Change to 'MEDIUM' or 'LOW'
```

**Quality Presets Explained:**
- **HIGH**: Uses `devicePixelRatio` for pixel-perfect rendering on HD screens
  - `resolution: window.devicePixelRatio` (usually 2 on retina displays)
  - `antialias: true` for smooth sprite edges
  - `pixelArt: false` because we're using HD PNG assets
  - `roundPixels: false` to maintain sub-pixel positioning

- **MEDIUM**: Balanced performance
  - `resolution: 1.5` for moderately crisp rendering
  - Good for mid-range devices

- **LOW**: Maximum performance
  - `resolution: 1` for fastest rendering
  - `roundPixels: true` to reduce sub-pixel calculations

**Why these settings?**
- We keep `pixelArt: false` because your assets are HD PNGs, not pixel art
- `antialias: true` prevents jagged edges when sprites scale
- Using `devicePixelRatio` ensures crisp rendering on high-DPI screens (Retina, 4K)
- The game uses `Phaser.Scale.FIT` mode to prevent stretching/blur

## Project Structure

```
/src
  /scenes
    BootScene.ts       - Initial boot and setup
    PreloadScene.ts    - Asset loading with progress bar
    RunnerScene.ts     - Main game logic, physics, collisions
    UIScene.ts         - HUD overlay (score, health, mission, etc.)
  /entities
    Player.ts          - Player character with animations & controls
    Obstacle.ts        - Obstacle entity with pooling
    Collectible.ts     - Collectible entity with types
  /systems
    Spawner.ts         - Object spawning with pooling & difficulty
  config.ts            - Game configuration and constants
  main.ts              - Phaser game initialization

/assets
  /backgrounds         - Parallax background layers
  /sprites
    /player           - Player animation frames
    /obstacles        - Obstacle sprites
    /flora            - Flora collectibles
    /fauna            - Fauna collectibles
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

The game will be available at `http://localhost:3000`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Controls

### Desktop
- **W or SPACE** - Jump (hold for higher jump, press twice for double jump)
- **S** - Slide (temporary hitbox reduction)

### Mobile
- **Green Button** (bottom-left) - Jump
- **Red Button** (bottom-right) - Slide

## Game Balance Configuration

All game balance values can be adjusted in [src/config.ts](src/config.ts):

```typescript
BALANCE: {
  STARTING_DATA_QUALITY: 100,    // Starting health
  WRONG_PICKUP_PENALTY: 10,      // Fauna collection penalty
  AVOIDABLE_DAMAGE: 10,          // Yellow obstacle damage
  UNAVOIDABLE_DAMAGE: 20,        // Orange obstacle damage
  CORRECT_PICKUP_SCORE: 10,      // Base points for flora
  COMBO_MULTIPLIER: 1.5,         // Combo bonus multiplier
}
```

## Physics Configuration

```typescript
PLAYER: {
  SPEED: 400,                    // Starting speed
  SPEED_INCREMENT: 0.5,          // Speed increase per second
  MAX_SPEED: 800,                // Maximum speed cap
  JUMP_VELOCITY: -600,           // Initial jump force
  JUMP_VELOCITY_MAX: -750,       // Max jump force (held)
  JUMP_HOLD_TIME: 300,           // Max hold time (ms)
  SLIDE_DURATION: 500,           // Slide duration (ms)
}
```

## Spawn System Configuration

```typescript
SPAWN: {
  INITIAL_INTERVAL: 1500,        // Starting spawn delay (ms)
  MIN_INTERVAL: 800,             // Minimum spawn delay (ms)
  INTERVAL_DECREASE: 10,         // Decrease per second
  AHEAD_DISTANCE: 1500,          // Spawn distance ahead of player
}
```

## Asset Requirements

The game expects assets in the following structure:

```
/assets
  /backgrounds
    - Verdant Stream Background.png
    - Verdant World.png
  /sprites
    /player
      - run_01.png to run_04.png
      - jump_01.png, jump_02.png
      - slide_01.png, slide_02.png
      - fall_01.png, idle_01.png, idle_02.png
      - land_01.png, damage_01.png
      - climb_01.png, climb_02.png
    /obstacles
      - concrete obstacle.png
      - obstacle 3.png
      - spilled chemical.png
    /flora
      - Flora-1.png
      - Flora-2.png
    /fauna
      - fauna-1.png
      - fauna-2.png
```

## Performance Optimizations

1. **Object Pooling** - Obstacles and collectibles are recycled instead of destroyed
2. **Texture Atlas** - Could be added for even better performance (batching)
3. **Arcade Physics** - Lightweight physics engine for 2D games
4. **Scene Separation** - UI scene is separate for independent rendering
5. **Efficient Updates** - Only active objects are updated
6. **Resolution Scaling** - Adjustable quality presets for different devices

## Future Enhancements (Post-MVP)

- [ ] Power-ups system
- [ ] Multiple mission types
- [ ] Procedural terrain generation (hills, valleys, platforms)
- [ ] Boss encounters
- [ ] Leaderboard system
- [ ] Sound effects and music
- [ ] Particle effects for pickups/collisions
- [ ] More player animations (climb, damage states)
- [ ] Save/load progress
- [ ] Multiple character skins

## Technical Details

### Camera & Scrolling
- Camera follows player on X-axis with smooth lerp (0.1)
- Parallax backgrounds with different scroll factors (0.3, 0.6)
- Ground tile sprite repeats infinitely

### Collision System
- Player vs Ground (collider)
- Player vs Obstacles (overlap + damage)
- Player vs Collectibles (overlap + scoring)

### Animation System
- Frame-based sprite animations
- State machine for player animations (run, jump, fall, slide)
- Smooth transitions between states

## Troubleshooting

### Assets not loading
- Ensure assets are in `/assets` directory (not `/public/assets`)
- Vite serves files from the project root
- Check browser console for 404 errors

### Blurry sprites
- Change quality preset to 'HIGH' in [src/main.ts](src/main.ts)
- Ensure `pixelArt: false` in render config
- Check that `resolution` uses `devicePixelRatio`

### Performance issues
- Change quality preset to 'LOW' or 'MEDIUM'
- Disable physics debug mode (already disabled)
- Reduce max pool sizes in [src/systems/Spawner.ts](src/systems/Spawner.ts)

## License

MIT License - Free to use and modify

## Credits

Built with:
- [Phaser 3](https://phaser.io/) - Game framework
- [Vite](https://vitejs.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Language
