import Phaser from 'phaser';
import { GameConfig } from '../config';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private keys!: {
    W: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
  };

  private jumpHoldTime: number = 0;
  private isJumpHeld: boolean = false;
  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private currentSpeed: number = GameConfig.PLAYER.SPEED;

  // Original hitbox size
  private normalWidth: number = 0;
  private normalHeight: number = 0;
  private normalOffsetY: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-run-1');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Scale down the player sprite first
    this.setScale(0.12);

    // Setup physics
    this.setCollideWorldBounds(false);
    this.setBounce(0);

    // IMPORTANT: After scaling, use refreshBody() to sync the body with the sprite
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.displayWidth * 0.6, this.displayHeight * 0.8, false);
    body.setOffset(this.displayWidth * 0.2, this.displayHeight * 0.1);

    // Store sizes for slide mechanic
    this.normalWidth = this.displayWidth * 0.6;
    this.normalHeight = this.displayHeight * 0.8;
    this.normalOffsetY = this.displayHeight * 0.1;

    // Setup controls
    this.setupControls();

    // Start running animation
    this.play('player-run');
  }

  private setupControls(): void {
    if (this.scene.input.keyboard) {
      this.keys = {
        W: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
      };

      // Jump on W key down
      this.keys.W.on('down', () => {
        this.jump();
      });

      // Slide on S key down
      this.keys.S.on('down', () => {
        this.startSlide();
      });
    }
  }

  public jump(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Only jump if on ground
    if (body.touching.down || body.blocked.down) {
      this.isJumpHeld = true;
      this.jumpHoldTime = 0;
      body.setVelocityY(GameConfig.PLAYER.JUMP_VELOCITY);
      this.play('player-jump', true);
    }
  }

  public startSlide(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Only slide if on ground
    if ((body.touching.down || body.blocked.down) && !this.isSliding) {
      this.isSliding = true;
      this.slideTimer = 0;
      this.play('player-slide', true);

      // Reduce hitbox height for sliding
      body.setSize(this.normalWidth, this.normalHeight * 0.5, false);
      body.setOffset(this.displayWidth * 0.2, this.displayHeight * 0.5);
    }
  }

  private endSlide(): void {
    if (this.isSliding) {
      this.isSliding = false;
      const body = this.body as Phaser.Physics.Arcade.Body;

      // Restore normal hitbox
      body.setSize(this.normalWidth, this.normalHeight, false);
      body.setOffset(this.displayWidth * 0.2, this.normalOffsetY);

      // Return to running animation
      this.play('player-run', true);
    }
  }

  public getSpeed(): number {
    return this.currentSpeed;
  }

  public increaseSpeed(delta: number): void {
    this.currentSpeed = Math.min(
      this.currentSpeed + (GameConfig.PLAYER.SPEED_INCREMENT * delta / 1000),
      GameConfig.PLAYER.MAX_SPEED
    );
  }

  public takeDamage(): void {
    // Flash effect
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      this.clearTint();
    });
  }

  update(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Handle variable jump height
    if (this.isJumpHeld && this.keys.W.isDown) {
      this.jumpHoldTime += delta;

      if (this.jumpHoldTime < GameConfig.PLAYER.JUMP_HOLD_TIME && body.velocity.y < 0) {
        // Boost jump velocity while holding
        body.setVelocityY(
          Math.max(body.velocity.y - 20, GameConfig.PLAYER.JUMP_VELOCITY_MAX)
        );
      } else {
        this.isJumpHeld = false;
      }
    }

    if (this.keys.W.isUp) {
      this.isJumpHeld = false;
    }

    // Handle slide duration
    if (this.isSliding) {
      this.slideTimer += delta;
      if (this.slideTimer >= GameConfig.PLAYER.SLIDE_DURATION) {
        this.endSlide();
      }
    }

    // Update animation based on state
    if (!this.isSliding) {
      if (body.velocity.y < 0) {
        // Jumping up
        if (this.anims.currentAnim?.key !== 'player-jump') {
          this.play('player-jump', true);
        }
      } else if (body.velocity.y > 50) {
        // Falling
        this.setTexture('player-fall');
        this.anims.stop();
      } else if (body.touching.down || body.blocked.down) {
        // Running on ground
        if (this.anims.currentAnim?.key !== 'player-run') {
          this.play('player-run', true);
        }
      }
    }

    // Increase speed over time
    this.increaseSpeed(delta);
  }
}
