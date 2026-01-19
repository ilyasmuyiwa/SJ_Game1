import Phaser from 'phaser';
import { Obstacle, ObstacleType } from '../entities/Obstacle';
import { Collectible, CollectibleType } from '../entities/Collectible';
import { GameConfig } from '../config';

export class Spawner {
  private scene: Phaser.Scene;
  private obstaclePool: Phaser.GameObjects.Group;
  private collectiblePool: Phaser.GameObjects.Group;
  private spawnTimer: number = 0;
  private spawnInterval: number = GameConfig.SPAWN.INITIAL_INTERVAL;
  private playerX: number = 0;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Create object pools
    this.obstaclePool = this.scene.add.group({
      classType: Obstacle,
      maxSize: 20,
      runChildUpdate: true
    });

    this.collectiblePool = this.scene.add.group({
      classType: Collectible,
      maxSize: 30,
      runChildUpdate: true
    });

    // Pre-populate pools
    this.createPooledObjects();
  }

  private createPooledObjects(): void {
    // Create obstacles
    const obstacleTextures = ['obstacle-concrete', 'obstacle-3', 'obstacle-chemical'];

    for (let i = 0; i < 20; i++) {
      const texture = Phaser.Math.RND.pick(obstacleTextures);
      const type = Phaser.Math.RND.pick([ObstacleType.AVOIDABLE, ObstacleType.UNAVOIDABLE]);
      const obstacle = new Obstacle(this.scene, -1000, -1000, texture, type);
      this.obstaclePool.add(obstacle);
    }

    // Create collectibles
    for (let i = 0; i < 30; i++) {
      const texture = i % 2 === 0 ? 'flora-1' : 'fauna-1';
      const type = i % 2 === 0 ? CollectibleType.FLORA : CollectibleType.FAUNA;
      const collectible = new Collectible(this.scene, -1000, -1000, texture, type);
      this.collectiblePool.add(collectible);
    }
  }

  public update(delta: number, cameraRightEdge: number, gameTime: number): void {
    this.playerX = cameraRightEdge; // Store for spawning
    this.spawnTimer += delta;

    // Decrease spawn interval over time (increase difficulty)
    this.spawnInterval = Math.max(
      GameConfig.SPAWN.MIN_INTERVAL,
      GameConfig.SPAWN.INITIAL_INTERVAL - (gameTime / 1000 * GameConfig.SPAWN.INTERVAL_DECREASE)
    );

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;
      this.spawnRandomObject();
    }
  }

  private spawnRandomObject(): void {
    const spawnX = this.playerX + GameConfig.SPAWN.AHEAD_DISTANCE;

    // 20% chance for obstacle, 80% for collectible
    if (Math.random() < 0.2) {
      this.spawnObstacle(spawnX);
    } else {
      this.spawnCollectible(spawnX);
    }
  }

  private spawnObstacle(x: number): void {
    const obstacle = this.getInactiveObstacle();
    if (!obstacle) {
      console.log('No inactive obstacle available in pool');
      return;
    }

    // Obstacles always spawn on ground
    const y = GameConfig.ZONES.GROUND;

    // 70% avoidable, 30% unavoidable
    const type = Math.random() < 0.7 ? ObstacleType.AVOIDABLE : ObstacleType.UNAVOIDABLE;

    obstacle.spawn(x, y, type);
  }

  private spawnCollectible(x: number): void {
    const collectible = this.getInactiveCollectible();
    if (!collectible) return;

    // Choose random zone
    const zones = [
      GameConfig.ZONES.GROUND,
      GameConfig.ZONES.MID,
      GameConfig.ZONES.UPPER
    ];

    const y = Phaser.Math.RND.pick(zones);

    // Mission: Collect FLORA only
    // 70% flora (correct), 30% fauna (incorrect)
    const type = Math.random() < 0.7 ? CollectibleType.FLORA : CollectibleType.FAUNA;

    collectible.spawn(x, y, type);
  }

  private getInactiveObstacle(): Obstacle | null {
    const obstacle = this.obstaclePool.getChildren().find(
      (obj) => !obj.active
    ) as Obstacle;

    return obstacle || null;
  }

  private getInactiveCollectible(): Collectible | null {
    const collectible = this.collectiblePool.getChildren().find(
      (obj) => !obj.active
    ) as Collectible;

    return collectible || null;
  }

  public getObstaclePool(): Phaser.GameObjects.Group {
    return this.obstaclePool;
  }

  public getCollectiblePool(): Phaser.GameObjects.Group {
    return this.collectiblePool;
  }

  public moveObjects(scrollSpeed: number, delta: number): void {
    const moveAmount = scrollSpeed * delta / 1000;
    let activeObstacleCount = 0;
    let activeCollectibleCount = 0;

    // Count active obstacles (they stay in world space - no movement needed!)
    // Camera following player creates the scrolling effect
    this.obstaclePool.getChildren().forEach((obj) => {
      if (obj.active) {
        activeObstacleCount++;
        // Don't move obstacles - they are static in world space
        // Direct position manipulation bypasses physics collisions!
      }
    });

    // Move all active collectibles (they use overlap, not collider)
    this.collectiblePool.getChildren().forEach((obj) => {
      if (obj.active) {
        activeCollectibleCount++;
        (obj as Collectible).x -= moveAmount;
      }
    });

    // Log every 2 seconds
    if (Math.random() < 0.01) {
      console.log(`Active objects - Obstacles: ${activeObstacleCount}, Collectibles: ${activeCollectibleCount}`);
    }
  }

  public reset(): void {
    // Reset all objects
    this.obstaclePool.getChildren().forEach((obj) => {
      (obj as Obstacle).reset();
    });

    this.collectiblePool.getChildren().forEach((obj) => {
      (obj as Collectible).reset();
    });

    this.spawnTimer = 0;
    this.spawnInterval = GameConfig.SPAWN.INITIAL_INTERVAL;
  }
}
