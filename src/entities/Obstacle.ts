import Phaser from 'phaser';

export enum ObstacleType {
  AVOIDABLE = 'avoidable',     // Yellow - easier to avoid, can jump/slide
  UNAVOIDABLE = 'unavoidable', // Orange - harder to avoid
}

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  public obstacleType: ObstacleType;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, type: ObstacleType) {
    super(scene, x, y, texture);

    this.obstacleType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Scale down obstacles
    this.setScale(0.2);

    this.setImmovable(true);

    // Set tighter hitbox - setSize and setOffset work in texture coordinates (unscaled)
    const body = this.body as Phaser.Physics.Arcade.Body;
    const hitboxWidth = this.width * 0.8;  // Use texture width
    const hitboxHeight = this.height * 0.8;
    body.setSize(hitboxWidth, hitboxHeight);
    // Center the hitbox
    body.setOffset((this.width - hitboxWidth) / 2, (this.height - hitboxHeight) / 2);

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
      this.setTint(0xffff00); // Yellow
    } else {
      this.setTint(0xff8800); // Orange
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
