import Phaser from 'phaser';

export enum CollectibleType {
  FLORA = 'flora',
  FAUNA = 'fauna'
}

export class Collectible extends Phaser.Physics.Arcade.Sprite {
  public collectibleType: CollectibleType;
  private floatOffset: number = 0;
  private floatSpeed: number = 2;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, type: CollectibleType) {
    super(scene, x, y, texture);

    this.collectibleType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Scale down collectibles
    this.setScale(0.15);

    // Set tighter hitbox for more accurate collection
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.width * 0.5, this.height * 0.5);
    body.setOffset(this.width * 0.25, this.height * 0.25);
    body.setAllowGravity(false);

    this.setActive(false);
    this.setVisible(false);
  }

  public spawn(x: number, y: number, type: CollectibleType): void {
    this.setPosition(x, y);
    this.collectibleType = type;
    this.setActive(true);
    this.setVisible(true);
    this.floatOffset = 0;

    // Set texture based on type
    if (type === CollectibleType.FLORA) {
      this.setTexture(Phaser.Math.RND.pick(['flora-1', 'flora-2']));
    } else {
      this.setTexture(Phaser.Math.RND.pick(['fauna-1', 'fauna-2']));
    }
  }

  public reset(): void {
    this.setActive(false);
    this.setVisible(false);
    this.setPosition(-1000, -1000);
  }

  public collect(): void {
    // Visual feedback for collection
    this.scene.tweens.add({
      targets: this,
      scale: 0.3,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.reset();
        this.setScale(0.15);
        this.setAlpha(1);
      }
    });
  }

  update(_time: number, delta: number): void {
    // Floating animation
    if (this.active) {
      this.floatOffset += this.floatSpeed * delta / 1000;
      const baseY = this.getData('baseY') || this.y;
      this.setData('baseY', baseY);
      this.y = baseY + Math.sin(this.floatOffset) * 10;
    }

    // Auto-reset if moved too far off screen
    if (this.x < -200) {
      this.reset();
    }
  }
}
