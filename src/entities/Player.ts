import Phaser from 'phaser';
import { GameConfig } from '../config';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private keys!: {
    W: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
  };

  private jumpHoldTime: number = 0;
  private isJumpHeld: boolean = false;
  private isSliding: boolean = false;
  private slideTimer: number = 0;
  private currentSpeed: number = GameConfig.PLAYER.SPEED;
  private hasDoubleJump: boolean = true;
  private jumpCount: number = 0;

  // Original hitbox size
  private normalWidth: number = 0;
  private normalHeight: number = 0;
  private normalOffsetY: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player-run-1');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Scale down the player sprite first
    this.setScale(0.084); // 0.12 * 0.7 = 0.084

    // Setup physics
    this.setCollideWorldBounds(false);
    this.setBounce(0);

    // IMPORTANT: Set tighter hitbox for better collision detection
    // setSize and setOffset work in texture coordinates (unscaled pixels)
    const body = this.body as Phaser.Physics.Arcade.Body;
    const hitboxWidth = this.width * 0.6;  // Use texture width, not display width
    const hitboxHeight = this.height * 0.8;
    body.setSize(hitboxWidth, hitboxHeight);
    // Center the hitbox
    body.setOffset((this.width - hitboxWidth) / 2, (this.height - hitboxHeight) / 2);

    // Store sizes for slide mechanic (in texture coordinates)
    this.normalWidth = hitboxWidth;
    this.normalHeight = hitboxHeight;
    this.normalOffsetY = (this.height - hitboxHeight) / 2;

    // Setup controls
    this.setupControls();

    // Start running animation
    this.play('player-run');
  }

  private setupControls(): void {
    if (this.scene.input.keyboard) {
      this.keys = {
        W: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        S: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        SPACE: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        UP: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        DOWN: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
      };

      // Jump on W or SPACE key down
      this.keys.W.on('down', () => {
        this.jump();
      });

      this.keys.SPACE.on('down', () => {
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

    // First jump - on ground
    if (body.touching.down || body.blocked.down) {
      this.isJumpHeld = true;
      this.jumpHoldTime = 0;
      this.jumpCount = 1;
      this.hasDoubleJump = true;
      body.setVelocityY(GameConfig.PLAYER.JUMP_VELOCITY);
      this.play('player-jump', true);
    }
    // Double jump - in air
    else if (this.hasDoubleJump && this.jumpCount === 1) {
      this.isJumpHeld = true;
      this.jumpHoldTime = 0;
      this.jumpCount = 2;
      this.hasDoubleJump = false;
      body.setVelocityY(GameConfig.PLAYER.DOUBLE_JUMP_VELOCITY);
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
      const slideHeight = this.normalHeight * 0.5;
      body.setSize(this.normalWidth, slideHeight);
      // Keep the hitbox at the same bottom position by adjusting offset
      const offsetY = this.normalOffsetY + (this.normalHeight - slideHeight);
      body.setOffset((this.width - this.normalWidth) / 2, offsetY);
    }
  }

  private endSlide(): void {
    if (this.isSliding) {
      this.isSliding = false;
      const body = this.body as Phaser.Physics.Arcade.Body;

      // Restore normal hitbox
      body.setSize(this.normalWidth, this.normalHeight);
      body.setOffset((this.width - this.normalWidth) / 2, this.normalOffsetY);

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

  private isInvincible: boolean = false;
  private lastHitObstacle: Phaser.Physics.Arcade.Sprite | null = null;

  // Called FIRST to immediately set invincibility and prevent race conditions
  public setInvincible(obstacle: Phaser.Physics.Arcade.Sprite): void {
    this.isInvincible = true;
    this.lastHitObstacle = obstacle;

    // Remove invincibility after 5 seconds
    // NOTE: lastHitObstacle is NOT cleared here - it stays until player separates from obstacle
    this.scene.time.delayedCall(5000, () => {
      this.isInvincible = false;
    });
  }

  public clearLastHitObstacle(): void {
    this.lastHitObstacle = null;
  }

  // Called SECOND for visual feedback only
  public takeDamage(): void {
    // Show damage sprite briefly
    const currentAnim = this.anims.currentAnim?.key;
    this.setTexture('player-damage');
    this.anims.stop();

    // Flash effect with damage sprite
    this.setTint(0xff0000);

    this.scene.time.delayedCall(200, () => {
      this.clearTint();
      // Return to running animation
      if (currentAnim) {
        this.play(currentAnim, true);
      } else {
        this.play('player-run', true);
      }
    });
  }

  public isPlayerInvincible(): boolean {
    return this.isInvincible;
  }

  public getLastHitObstacle(): Phaser.Physics.Arcade.Sprite | null {
    return this.lastHitObstacle;
  }

  update(_time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    // Set horizontal velocity to move right constantly (endless runner)
    body.setVelocityX(this.currentSpeed);

    // Handle variable jump height (works with W, SPACE, and UP arrow)
    if (this.isJumpHeld && (this.keys.W.isDown || this.keys.SPACE.isDown || this.keys.UP.isDown)) {
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

    if (this.keys.W.isUp && this.keys.SPACE.isUp && this.keys.UP.isUp) {
      this.isJumpHeld = false;
    }

    // Handle slide duration
    if (this.isSliding) {
      this.slideTimer += delta;
      if (this.slideTimer >= GameConfig.PLAYER.SLIDE_DURATION) {
        this.endSlide();
      }
    }

    // Reset jump count when landing
    if (body.touching.down || body.blocked.down) {
      this.jumpCount = 0;
      this.hasDoubleJump = true;
    }

    // Update animation based on state
    if (!this.isSliding) {
      if (body.touching.down || body.blocked.down) {
        // On ground - running
        if (this.anims.currentAnim?.key !== 'player-run') {
          this.play('player-run', true);
        }
      } else if (body.velocity.y < 0) {
        // In air - jumping up
        if (this.anims.currentAnim?.key !== 'player-jump') {
          this.play('player-jump', true);
        }
      } else {
        // In air - falling
        if (this.texture.key !== 'player-fall') {
          this.setTexture('player-fall');
          this.anims.stop();
        }
      }
    }

    // Increase speed over time
    this.increaseSpeed(delta);
  }
}
