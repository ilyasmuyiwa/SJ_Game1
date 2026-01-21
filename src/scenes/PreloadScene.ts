import Phaser from 'phaser';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' });
  }

  preload(): void {
    // Create loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const percentText = this.add.text(width / 2, height / 2, '0%', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Update loading bar
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
      percentText.setText(Math.floor(value * 100) + '%');
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });

    // Load background
    this.load.image('bg-stream', 'assets/backgrounds/Verdant Stream Background.png');

    // Load player sprites (run animation)
    for (let i = 1; i <= 4; i++) {
      this.load.image(`player-run-${i}`, `assets/sprites/player/run_0${i}.png`);
    }

    // Load other player animations
    this.load.image('player-jump-1', 'assets/sprites/player/jump_01.png');
    this.load.image('player-jump-2', 'assets/sprites/player/jump_02.png');
    this.load.image('player-fall', 'assets/sprites/player/fall_01.png');
    this.load.image('player-slide-1', 'assets/sprites/player/slide_01.png');
    this.load.image('player-slide-2', 'assets/sprites/player/slide_02.png');
    this.load.image('player-idle-1', 'assets/sprites/player/idle_01.png');
    this.load.image('player-idle-2', 'assets/sprites/player/idle_02.png');
    this.load.image('player-land', 'assets/sprites/player/land_01.png');
    this.load.image('player-damage', 'assets/sprites/player/damage_01.png');
    this.load.image('player-climb-1', 'assets/sprites/player/climb_01.png');
    this.load.image('player-climb-2', 'assets/sprites/player/climb_02.png');

    // Load obstacles
    this.load.image('obstacle-concrete', 'assets/sprites/obstacles/concrete obstacle.png');
    this.load.image('obstacle-3', 'assets/sprites/obstacles/obstacle 3.png');
    this.load.image('obstacle-chemical', 'assets/sprites/obstacles/spilled chemical.png');

    // Load collectibles
    this.load.image('flora-1', 'assets/sprites/flora/Flora-1.png');
    this.load.image('flora-2', 'assets/sprites/flora/Flora-2.png');
    this.load.image('fauna-1', 'assets/sprites/fauna/fauna-1.png');
    this.load.image('fauna-2', 'assets/sprites/fauna/fauna-2.png');

    // Load UI icons
    this.load.image('storage-icon', 'assets/Icons/Storage Icon.png');
    this.load.svg('storage-card', 'assets/Icons/storage-card.svg');
  }

  create(): void {
    // Create animations
    this.createAnimations();

    // Start the game
    this.scene.start('RunnerScene');
    this.scene.launch('UIScene');
  }

  private createAnimations(): void {
    // Player run animation
    this.anims.create({
      key: 'player-run',
      frames: [
        { key: 'player-run-1' },
        { key: 'player-run-2' },
        { key: 'player-run-3' },
        { key: 'player-run-4' }
      ],
      frameRate: 10,
      repeat: -1
    });

    // Player jump animation
    this.anims.create({
      key: 'player-jump',
      frames: [
        { key: 'player-jump-1' },
        { key: 'player-jump-2' }
      ],
      frameRate: 8,
      repeat: 0
    });

    // Player slide animation
    this.anims.create({
      key: 'player-slide',
      frames: [
        { key: 'player-slide-1' },
        { key: 'player-slide-2' }
      ],
      frameRate: 10,
      repeat: -1
    });

    // Player idle animation
    this.anims.create({
      key: 'player-idle',
      frames: [
        { key: 'player-idle-1' },
        { key: 'player-idle-2' }
      ],
      frameRate: 4,
      repeat: -1
    });
  }
}
