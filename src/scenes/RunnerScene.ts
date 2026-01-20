import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Spawner } from '../systems/Spawner';
import { Obstacle } from '../entities/Obstacle';
import { Collectible, CollectibleType } from '../entities/Collectible';
import { GameConfig } from '../config';

export class RunnerScene extends Phaser.Scene {
  private player!: Player;
  private spawner!: Spawner;
  private ground!: Phaser.GameObjects.TileSprite;
  private backgrounds!: Phaser.GameObjects.Image[];

  // Game state
  private gameTime: number = 0;
  private distance: number = 0;
  private score: number = 0;
  private lives: number = GameConfig.BALANCE.STARTING_LIVES;
  private combo: number = 0;
  private isGameOver: boolean = false;
  private collectedItems: string[] = [];

  // Mobile controls
  private jumpButton?: Phaser.GameObjects.Rectangle;
  private slideButton?: Phaser.GameObjects.Rectangle;
  private isMobile: boolean = false;

  constructor() {
    super({ key: 'RunnerScene' });
  }

  create(): void {
    this.gameTime = 0;
    this.distance = 0;
    this.score = 0;
    this.lives = GameConfig.BALANCE.STARTING_LIVES;
    this.combo = 0;
    this.isGameOver = false;
    this.collectedItems = [];

    // Detect mobile
    this.isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS ||
      this.sys.game.device.os.iPad || this.sys.game.device.os.iPhone;

    // Set world bounds
    this.physics.world.setBounds(0, 0, 50000, GameConfig.HEIGHT);

    // Create parallax backgrounds
    this.createBackgrounds();

    // Create ground
    this.createGround();

    // Create player
    this.player = new Player(
      this,
      GameConfig.PLAYER.START_X,
      GameConfig.PLAYER.GROUND_Y
    );

    // Create spawner system
    this.spawner = new Spawner(this);

    // Setup collisions
    this.setupCollisions();

    // Setup camera - instant follow to keep player perfectly centered
    this.cameras.main.startFollow(this.player, true, 1.0, 1.0);
    this.cameras.main.setBounds(0, 0, 50000, GameConfig.HEIGHT);

    // Set camera dead zone to keep player in center
    this.cameras.main.setDeadzone(100, 100);

    // Create mobile controls if needed
    if (this.isMobile) {
      this.createMobileControls();
    }

    // Emit initial game state
    this.emitGameState();
  }

  private createBackgrounds(): void {
    this.backgrounds = [];

    // Create multiple background instances for seamless looping
    // Need more copies since player moves through world space
    for (let i = 0; i < 5; i++) {
      const bg = this.add.image(0, 0, 'bg-stream').setOrigin(0, 0);
      const scale = GameConfig.HEIGHT / bg.height;
      bg.setScale(scale);
      bg.setScrollFactor(0.5);

      // Flip every other background horizontally for better continuity
      // Pattern: normal, flipped, normal, flipped, normal
      if (i % 2 === 1) {
        bg.setFlipX(true);
      }

      // Position backgrounds side by side with 1px overlap to prevent gaps
      bg.x = i * bg.displayWidth - i;

      this.backgrounds.push(bg);
    }
  }

  private createGround(): void {
    // Create invisible ground platform for physics
    // Position it so the top surface is at GROUND_PLATFORM_Y
    this.ground = this.add.tileSprite(
      0,
      GameConfig.GROUND_PLATFORM_Y,
      50000, // Match world bounds
      140,
      'bg-stream' // Use existing texture, will be invisible
    ).setOrigin(0, 0);

    this.ground.setAlpha(0); // Make invisible - just for physics

    // Add ground physics
    this.physics.add.existing(this.ground, true);
    const groundBody = this.ground.body as Phaser.Physics.Arcade.StaticBody;
    groundBody.setSize(50000, 140);
    groundBody.updateFromGameObject();
  }

  private setupCollisions(): void {
    // Player collides with ground
    this.physics.add.collider(this.player, this.ground);

    // Player overlaps with obstacles (passes through, no blocking)
    this.physics.add.overlap(
      this.player,
      this.spawner.getObstaclePool(),
      this.handleObstacleCollision,
      undefined,
      this
    );

    // Player overlaps with collectibles
    this.physics.add.overlap(
      this.player,
      this.spawner.getCollectiblePool(),
      this.handleCollectibleCollision,
      undefined,
      this
    );
  }

  // Lock to prevent processing multiple collision callbacks simultaneously
  private isProcessingCollision: boolean = false;

  private handleObstacleCollision(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody,
    obstacleObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody
  ): void {
    const obstacle = obstacleObj as Obstacle;
    const playerSprite = player as Player;

    if (!obstacle.active) return;

    // Don't damage if player is invincible
    if (playerSprite.isPlayerInvincible()) return;

    // Lock processing immediately to prevent multiple hits in same frame
    this.isProcessingCollision = true;

    // Set invincibility IMMEDIATELY (5 seconds)
    playerSprite.setInvincible(obstacle);

    // Lose a life
    this.lives = Math.max(0, this.lives - GameConfig.BALANCE.OBSTACLE_DAMAGE);
    this.combo = 0; // Break combo

    // Visual feedback
    playerSprite.takeDamage();

    // Check game over
    if (this.lives <= 0) {
      this.gameOver();
    }

    this.emitGameState();

    // Release lock after a small delay
    this.time.delayedCall(50, () => {
      this.isProcessingCollision = false;
    });
  }

  private handleCollectibleCollision(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody,
    collectibleObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile | Phaser.Physics.Arcade.Body | Phaser.Physics.Arcade.StaticBody
  ): void {
    const collectible = collectibleObj as Collectible;

    if (!collectible.active) return;

    // Mission: Collect FLORA only
    const isCorrect = collectible.collectibleType === CollectibleType.FLORA;

    if (isCorrect) {
      // Correct pickup
      this.combo++;
      const comboBonus = Math.floor(this.combo * GameConfig.BALANCE.COMBO_MULTIPLIER);
      this.score += GameConfig.BALANCE.CORRECT_PICKUP_SCORE + comboBonus;

      // Add to collected items
      this.collectedItems.push('flora');
      if (this.collectedItems.length > 5) {
        this.collectedItems.shift();
      }
    } else {
      // Wrong pickup (fauna) - no life penalty, just break combo
      this.combo = 0;

      // Add to collected items
      this.collectedItems.push('fauna');
      if (this.collectedItems.length > 5) {
        this.collectedItems.shift();
      }
    }

    // Collect animation
    collectible.collect();

    this.emitGameState();
  }

  private createMobileControls(): void {
    const width = GameConfig.WIDTH;
    const height = GameConfig.HEIGHT;

    // Jump button (left side)
    this.jumpButton = this.add.rectangle(
      100, height - 100,
      120, 120,
      0x00ff00, 0.5
    ).setScrollFactor(0).setInteractive();

    this.add.text(100, height - 100, 'JUMP', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0);

    this.jumpButton.on('pointerdown', () => {
      this.player.jump();
    });

    // Slide button (right side)
    this.slideButton = this.add.rectangle(
      width - 100, height - 100,
      120, 120,
      0xff0000, 0.5
    ).setScrollFactor(0).setInteractive();

    this.add.text(width - 100, height - 100, 'SLIDE', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0);

    this.slideButton.on('pointerdown', () => {
      this.player.startSlide();
    });
  }

  private emitGameState(): void {
    // Send game state to UI scene
    this.events.emit('updateGameState', {
      score: this.score,
      lives: this.lives,
      distance: Math.floor(this.distance),
      time: Math.floor(this.gameTime / 1000),
      combo: this.combo,
      collectedItems: [...this.collectedItems]
    });
  }

  private gameOver(): void {
    if (this.isGameOver) return;

    this.isGameOver = true;
    this.physics.pause();

    // Show game over UI
    this.events.emit('gameOver', {
      score: this.score,
      distance: Math.floor(this.distance),
      time: Math.floor(this.gameTime / 1000)
    });
  }

  public restart(): void {
    this.scene.restart();
  }

  update(time: number, delta: number): void {
    if (this.isGameOver) return;

    // Update game time
    this.gameTime += delta;

    // Update player
    this.player.update(time, delta);

    // Get player speed for scrolling
    const speed = this.player.getSpeed();

    // Update distance
    this.distance += speed * delta / 1000;

    // Loop backgrounds as camera moves
    // Since backgrounds have scrollFactor 0.5, they move at half camera speed
    this.backgrounds.forEach((bg) => {
      // Calculate where this background is in camera view
      const bgRightEdge = bg.x + bg.displayWidth;
      const cameraLeftEdge = this.cameras.main.scrollX * 0.5; // scrollFactor 0.5

      // If background has scrolled completely off screen to the left
      if (bgRightEdge < cameraLeftEdge) {
        // Find the rightmost background
        const maxX = Math.max(...this.backgrounds.map(b => b.x));
        // Reposition this background to the right
        bg.x = maxX + bg.displayWidth - 1;
      }
    });

    // Update spawner (spawns new objects)
    // Pass the right edge of the camera view for spawning
    const cameraRightEdge = this.cameras.main.scrollX + GameConfig.WIDTH;
    this.spawner.update(delta, cameraRightEdge, this.gameTime);

    // Move existing obstacles/collectibles (world scrolling effect)
    this.spawner.moveObjects(speed, delta);

    // Emit game state periodically
    if (Math.floor(time / 100) % 5 === 0) {
      this.emitGameState();
    }
  }
}
