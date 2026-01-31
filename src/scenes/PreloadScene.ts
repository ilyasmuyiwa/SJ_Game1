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

    // Load all level backgrounds
    this.load.image('bg-verdant', 'assets/backgrounds/Verdant Stream Background.png');
    this.load.image('bg-crimson', 'assets/backgrounds/Crimson Data Stream.png');
    this.load.image('bg-glacial', 'assets/backgrounds/Glacial Data Stream.png');
    this.load.image('bg-sands', 'assets/backgrounds/Shifting Sands Data Stream.png');
    this.load.image('bg-sunken', 'assets/backgrounds/Sunken Data Stream.png');
    this.load.image('bg-void', 'assets/backgrounds/The Void Data Stream.png');

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

    // Load obstacles (new assets)
    this.load.image('obstacle-broken-asphalt', 'assets/sprites/Obstacles/Broken Asphalt.png');
    this.load.image('obstacle-broken-guardrail', 'assets/sprites/Obstacles/Broken Guardrail.png');
    this.load.image('obstacle-geothermal-vent', 'assets/sprites/Obstacles/Geothermal Vent.png');
    this.load.image('obstacle-rusted-girders', 'assets/sprites/Obstacles/Rusted Metal Girders.png');
    this.load.image('obstacle-shattered-glass', 'assets/sprites/Obstacles/Shattered Glass Sheets.png');
    this.load.image('obstacle-telephone-poles', 'assets/sprites/Obstacles/Toppled Telephone Poles.png');
    this.load.image('obstacle-toxic-pool', 'assets/sprites/Obstacles/Toxic Waste Pool.png');
    this.load.image('obstacle-unstable-scaffolding', 'assets/sprites/Obstacles/Unstable Scaffolding.png');
    this.load.image('obstacle-chainlink-fence', 'assets/sprites/Obstacles/chainlink_fence.png');
    this.load.image('obstacle-brick-wall', 'assets/sprites/Obstacles/crumbling_brick_wall.png');
    this.load.image('obstacle-electrical-cables', 'assets/sprites/Obstacles/electrical_cables.png');
    this.load.image('obstacle-radioactive-zone', 'assets/sprites/Obstacles/radioactive_zone.png');

    // Load Flora collectibles (new assets)
    this.load.image('flora-crystal-orchid', 'assets/sprites/Flora/Crystal-Petal Orchid.png');
    this.load.image('flora-phosphorescent-toadstool', 'assets/sprites/Flora/Phosphorescent Toadstool.png');
    this.load.image('flora-bioluminescent-moss', 'assets/sprites/Flora/bioluminescent_moss.png');
    this.load.image('flora-creeping-rootmass', 'assets/sprites/Flora/creeping_rootmass.png');
    this.load.image('flora-fungal-bloom', 'assets/sprites/Flora/fungal_bloom.png');
    this.load.image('flora-razorleaf-fern', 'assets/sprites/Flora/razorleaf_fern.png');
    this.load.image('flora-spore-mushroom', 'assets/sprites/Flora/spore_cloud_mushroom.png');
    this.load.image('flora-sun-petal', 'assets/sprites/Flora/sun_petal_flower_clean.png');
    this.load.image('flora-thornvine-creeper', 'assets/sprites/Flora/thornvine_creeper.png');
    this.load.image('flora-veridian-creeper', 'assets/sprites/Flora/veridian_creeper.png');

    // Load Fauna collectibles (new assets)
    this.load.image('fauna-jellyfish-vine', 'assets/sprites/Fauna/bioluminescent_jellyfish_vine.png');
    this.load.image('fauna-glimmerwing-butterfly', 'assets/sprites/Fauna/glimmerwing_butterfly.png');
    this.load.image('fauna-leaf-hopper', 'assets/sprites/Fauna/leaf_hopper.png');
    this.load.image('fauna-luminescent-beetle', 'assets/sprites/Fauna/luminescent_beetle.png');
    this.load.image('fauna-luminescent-glider', 'assets/sprites/Fauna/luminescent_glider.png');
    this.load.image('fauna-thorned-hopper', 'assets/sprites/Fauna/thorned_hopper.png');
    this.load.image('fauna-venomous-crawler', 'assets/sprites/Fauna/venomous_crawler.png');

    // Load UI icons
    this.load.image('storage-icon', 'assets/Icons/Storage Icon.png');
    this.load.svg('storage-card', 'assets/Icons/storage-card.svg');
    this.load.svg('stream-container', 'assets/Icons/stream-container.svg');
    this.load.image('energy-unit-icon', 'assets/Icons/Energy Unit Icon 2.png');
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
