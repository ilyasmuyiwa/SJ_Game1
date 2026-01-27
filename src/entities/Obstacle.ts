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
    this.setScale(0.245); // 70% of 0.35

    this.setImmovable(true);

    // Set tighter hitbox - setSize and setOffset work in texture coordinates (unscaled)
    const body = this.body as Phaser.Physics.Arcade.Body;
    const hitboxWidth = this.width * 0.8;  // Use texture width
    const hitboxHeight = this.height * 0.8;
    body.setSize(hitboxWidth, hitboxHeight);
    // Center the hitbox
    body.setOffset((this.width - hitboxWidth) / 2, (this.height - hitboxHeight) / 2);
    body.setAllowGravity(false); // Obstacles should not fall

    this.setActive(false);
    this.setVisible(false);
  }

  public spawn(x: number, y: number, type: ObstacleType): void {
    this.setPosition(x, y);
    this.obstacleType = type;
    this.setActive(true);
    this.setVisible(true);

    // Randomize obstacle texture from new assets
    const obstacleAssets = [
      'obstacle-broken-asphalt',
      'obstacle-broken-guardrail',
      'obstacle-geothermal-vent',
      'obstacle-rusted-girders',
      'obstacle-shattered-glass',
      'obstacle-telephone-poles',
      'obstacle-toxic-pool',
      'obstacle-unstable-scaffolding',
      'obstacle-chainlink-fence',
      'obstacle-brick-wall',
      'obstacle-electrical-cables',
      'obstacle-radioactive-zone'
    ];
    this.setTexture(Phaser.Math.RND.pick(obstacleAssets));

    // Re-enable physics body (it gets disabled when setActive(false) is called)
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    this.setImmovable(true); // Ensure immovable is set

    // Update hitbox after texture change
    const hitboxWidth = this.width * 0.8;
    const hitboxHeight = this.height * 0.8;
    body.setSize(hitboxWidth, hitboxHeight);
    body.setOffset((this.width - hitboxWidth) / 2, (this.height - hitboxHeight) / 2);

    // Remove tints - use natural obstacle colors
    this.clearTint();
  }

  public reset(): void {
    this.setActive(false);
    this.setVisible(false);
    this.setPosition(-1000, -1000);

    // Disable physics body
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.enable = false;
  }

  update(): void {
    // Obstacles are moved by the spawner system
    // Automatically reset if moved too far off screen (left side)
    if (this.x < -200) {
      this.reset();
    }
  }
}
