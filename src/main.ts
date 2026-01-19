import Phaser from 'phaser';
import { GameConfig, QualityPreset } from './config';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { RunnerScene } from './scenes/RunnerScene';
import { UIScene } from './scenes/UIScene';

// Change this to adjust graphics quality: 'HIGH' | 'MEDIUM' | 'LOW'
const QUALITY_PRESET: QualityPreset = 'HIGH';

const quality = GameConfig.QUALITY[QUALITY_PRESET];

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GameConfig.WIDTH,
  height: GameConfig.HEIGHT,
  parent: 'game-container',
  backgroundColor: '#000000',

  // HD Quality Settings
  // We keep antialias ON for smooth HD sprites
  // pixelArt is OFF because we want smooth scaling for HD assets
  // resolution uses devicePixelRatio for crisp rendering on high-DPI screens
  render: {
    antialias: quality.antialias,
    pixelArt: quality.pixelArt,
    roundPixels: quality.roundPixels,
  },

  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },

  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: GameConfig.GRAVITY, x: 0 },
      debug: true
    }
  },

  scene: [BootScene, PreloadScene, RunnerScene, UIScene]
};

new Phaser.Game(config);

// Export for debugging
(window as any).game = config;
