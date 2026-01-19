# Quick Start Guide

## Getting Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser
Navigate to `http://localhost:3000`

## Controls

**Desktop:**
- **W** - Jump (hold longer for higher jumps)
- **S** - Slide under obstacles

**Mobile:**
- **Green Button** - Jump
- **Red Button** - Slide

## How to Play

1. Your character runs automatically (speed increases over time)
2. **Mission**: Collect FLORA (green) only
3. Avoid or jump over obstacles
4. Build combos by collecting correct items
5. Watch your Data Quality meter - game over at 0%

## Scoring

- **Flora (correct)**: +10 points + combo bonus
- **Fauna (wrong)**: -10% Data Quality, breaks combo
- **Yellow obstacles**: -10% Data Quality
- **Orange obstacles**: -20% Data Quality

## Adjusting Graphics Quality

Edit [src/main.ts](src/main.ts) line 8:

```typescript
const QUALITY_PRESET: QualityPreset = 'HIGH'; // or 'MEDIUM' or 'LOW'
```

## Project Structure

- `/src/scenes` - Game scenes (Boot, Preload, Runner, UI)
- `/src/entities` - Player, Obstacles, Collectibles
- `/src/systems` - Spawner with object pooling
- `/src/config.ts` - All game settings and balance
- `/assets` - All game assets (sprites, backgrounds)

## Building for Production

```bash
npm run build
```

Output will be in `/dist` folder.

## Troubleshooting

**Assets not loading?**
- Make sure assets are in `/assets` directory
- Check browser console for 404 errors

**Blurry sprites?**
- Set quality to 'HIGH' in src/main.ts

**Performance issues?**
- Set quality to 'LOW' or 'MEDIUM'

For more details, see [README.md](README.md)
