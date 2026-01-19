import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    // Load any boot assets here (loading bar graphics, etc.)
  }

  create(): void {
    // Initialize any global game systems here
    this.scene.start('PreloadScene');
  }
}
