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
  private floraCollected: number = 0;
  private missionCompleted: boolean = false;
  private isPaused: boolean = false;

  // Pause UI
  private pauseOverlay?: Phaser.GameObjects.Rectangle;
  private pauseText?: Phaser.GameObjects.Text;
  private pauseInstructionText?: Phaser.GameObjects.Text;

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
    this.floraCollected = 0;
    this.missionCompleted = false;

    // Detect mobile
    this.isMobile = this.sys.game.device.os.android || this.sys.game.device.os.iOS ||
      this.sys.game.device.os.iPad || this.sys.game.device.os.iPhone;

    // Set world bounds
    this.physics.world.setBounds(0, 0, 1000000, GameConfig.HEIGHT);

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

    // Create pause UI (initially hidden)
    this.createPauseUI();

    // Setup pause key bindings
    this.input.keyboard?.on('keydown-ESC', () => this.togglePause());
    this.input.keyboard?.on('keydown-P', () => this.togglePause());

    // Setup arrow key controls
    this.input.keyboard?.on('keydown-UP', () => {
      if (!this.isPaused && !this.isGameOver) this.player.jump();
    });
    this.input.keyboard?.on('keydown-DOWN', () => {
      if (!this.isPaused && !this.isGameOver) this.player.startSlide();
    });

    // Setup camera - instant follow to keep player perfectly centered
    this.cameras.main.startFollow(this.player, true, 1.0, 1.0);
    this.cameras.main.setBounds(0, 0, 1000000, GameConfig.HEIGHT);

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

    // Immediately mark as inactive to prevent multiple triggers
    collectible.setActive(false);
    collectible.setVisible(false);

    // Mission: Collect FLORA only
    const isCorrect = collectible.collectibleType === CollectibleType.FLORA;

    if (isCorrect) {
      // Correct pickup - simple 1:1 scoring
      this.floraCollected++;
      this.score = this.floraCollected; // 1 flora = 1 score point
      this.combo++;

      // Add to collected items
      this.collectedItems.push('flora');
      if (this.collectedItems.length > 5) {
        this.collectedItems.shift();
      }

      // Check if mission target reached (50 flora = mission complete)
      if (this.floraCollected >= GameConfig.BALANCE.FLORA_TARGET && !this.missionCompleted) {
        this.completeMission();
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

  private createPauseUI(): void {
    // Semi-transparent black overlay
    this.pauseOverlay = this.add.rectangle(
      0, 0,
      GameConfig.WIDTH, GameConfig.HEIGHT,
      0x000000, 0.7
    ).setOrigin(0, 0).setScrollFactor(0).setDepth(10000).setVisible(false);

    // "PAUSED" text
    this.pauseText = this.add.text(
      GameConfig.WIDTH / 2,
      GameConfig.HEIGHT / 2 - 50,
      'PAUSED',
      {
        fontFamily: 'Arial',
        fontSize: '72px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 8,
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(10001).setVisible(false);

    // Instructions
    this.pauseInstructionText = this.add.text(
      GameConfig.WIDTH / 2,
      GameConfig.HEIGHT / 2 + 50,
      'Press ESC or P to Resume',
      {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(10001).setVisible(false);
  }

  private emitGameState(): void {
    // Send game state to UI scene
    this.events.emit('updateGameState', {
      score: this.score,
      lives: this.lives,
      distance: Math.floor(this.distance),
      time: Math.floor(this.gameTime / 1000),
      combo: this.combo,
      collectedItems: [...this.collectedItems],
      floraCollected: this.floraCollected,
      floraTarget: GameConfig.BALANCE.FLORA_TARGET,
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

  private completeMission(): void {
    this.missionCompleted = true;

    // Display mission completion message
    const text = this.add.text(
      GameConfig.WIDTH / 2,
      GameConfig.HEIGHT / 2,
      'MISSION COMPLETED!',
      {
        fontFamily: 'Arial',
        fontSize: '64px',
        color: '#00ff00',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 8,
      }
    ).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

    // Fade out after 3 seconds
    this.tweens.add({
      targets: text,
      alpha: 0,
      duration: 1000,
      delay: 3000,
      onComplete: () => {
        text.destroy();
      }
    });
  }

  private togglePause(): void {
    // Can't pause if game is over
    if (this.isGameOver) return;

    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.pauseGame();
    } else {
      this.resumeGame();
    }
  }

  private pauseGame(): void {
    // Pause physics
    this.physics.pause();

    // Show pause UI
    this.pauseOverlay?.setVisible(true);
    this.pauseText?.setVisible(true);
    this.pauseInstructionText?.setVisible(true);
  }

  private resumeGame(): void {
    // Resume physics
    this.physics.resume();

    // Hide pause UI
    this.pauseOverlay?.setVisible(false);
    this.pauseText?.setVisible(false);
    this.pauseInstructionText?.setVisible(false);
  }

  public restart(): void {
    this.scene.restart();
  }

  update(time: number, delta: number): void {
    if (this.isPaused || this.isGameOver) return;

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
        const rightmostBg = this.backgrounds.reduce((max, b) => b.x > max.x ? b : max);

        // Reposition this background to the right
        bg.x = rightmostBg.x + rightmostBg.displayWidth - 1;

        // Toggle flip to continue alternating pattern
        bg.setFlipX(!rightmostBg.flipX);
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
