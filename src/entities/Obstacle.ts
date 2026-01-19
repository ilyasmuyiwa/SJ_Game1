import Phaser from 'phaser';

export enum ObstacleType {
  AVOIDABLE = 'avoidable',     // Yellow - 10 HP damage, can jump/slide
  UNAVOIDABLE = 'unavoidable', // Orange - 20 HP damage, hard to avoid
}

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  public obstacleType: ObstacleType;
  public damage: number;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, type: ObstacleType, damage: number) {
    super(scene, x, y, texture);

    this.obstacleType = type;
    this.damage = damage;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setImmovable(true);

    // Set hitbox (slightly smaller than sprite)
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.width * 0.8, this.height * 0.8);
    body.setOffset(this.width * 0.1, this.height * 0.1);

    // Color tint based on type
    if (type === ObstacleType.AVOIDABLE) {
      this.setTint(0xffff00); // Yellow tint
    } else {
      this.setTint(0xff8800); // Orange tint
    }

    this.setActive(false);
    this.setVisible(false);
  }

  public spawn(x: number, y: number, type: ObstacleType): void {
    this.setPosition(x, y);
    this.obstacleType = type;
    this.setActive(true);
    this.setVisible(true);

    // Update tint based on type
    if (type === ObstacleType.AVOIDABLE) {
      this.setTint(0xffff00);
      this.damage = 10;
    } else {
      this.setTint(0xff8800);
      this.damage = 20;
    }
  }

  public reset(): void {
    this.setActive(false);
    this.setVisible(false);
    this.setPosition(-1000, -1000);
  }

  update(): void {
    // Obstacles are moved by the spawner system
    // Automatically reset if moved too far off screen (left side)
    if (this.x < -200) {
      this.reset();
    }
  }
}
