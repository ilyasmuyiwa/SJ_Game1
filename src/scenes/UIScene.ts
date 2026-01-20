import Phaser from 'phaser';
import { GameConfig } from '../config';

interface GameState {
  score: number;
  lives: number;
  distance: number;
  time: number;
  combo: number;
  collectedItems: string[];
  floraCollected?: number;
  floraTarget?: number;
}

export class UIScene extends Phaser.Scene {
  // Component 1: Score and Currency Display
  private scoreContainer!: Phaser.GameObjects.Container;
  private scoreText!: Phaser.GameObjects.Text;

  // Component 2: Lives Display
  private livesContainer!: Phaser.GameObjects.Container;
  private livesIcons!: Phaser.GameObjects.Graphics[];

  // Component 3: Level and Objective Display
  private objectiveContainer!: Phaser.GameObjects.Container;

  // Component 4: Stream Name Display
  private streamContainer!: Phaser.GameObjects.Container;

  // Component 5: Distance and Time Display
  private distanceContainer!: Phaser.GameObjects.Container;
  private timeContainer!: Phaser.GameObjects.Container;
  private distanceText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;

  // Component 6: Item Counter
  private itemCounterContainer!: Phaser.GameObjects.Container;
  private itemCountText!: Phaser.GameObjects.Text;

  // Component 7: Action Buttons (Mobile)
  private jumpButton?: Phaser.GameObjects.Container;
  private slideButton?: Phaser.GameObjects.Container;

  // Combo and Game Over
  private comboText!: Phaser.GameObjects.Text;
  private gameOverContainer?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    // Create all UI components
    this.createScoreDisplay();
    this.createLivesDisplay();
    this.createObjectiveDisplay();
    this.createStreamNameDisplay();
    this.createDistanceTimeDisplay();
    this.createItemCounter();
    this.createActionButtons();
    this.createComboText();

    // Listen for game state updates
    const runnerScene = this.scene.get('RunnerScene');
    runnerScene.events.on('updateGameState', this.updateHUD, this);
    runnerScene.events.on('gameOver', this.showGameOver, this);
  }

  // Component 1: Score and Currency Display (Top-Left)
  private createScoreDisplay(): void {
    const padding = 20;

    this.scoreContainer = this.add.container(padding, padding);

    // Beige container background
    const bg = this.add.rectangle(0, 0, 180, 60, 0xF5E6D3).setOrigin(0, 0);
    const border = this.add.rectangle(0, 0, 180, 60).setOrigin(0, 0);
    border.setStrokeStyle(2, 0x558B2F);
    this.add.existing(border);

    // Score text with orange-yellow color (gradient approximation)
    this.scoreText = this.add.text(12, 30, '2,550', {
      fontFamily: 'Danfo, Arial',
      fontSize: '40px',
      color: '#FFA500', // Orange-yellow
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0, 0.5);

    // Currency icon (simplified - circular multi-layer)
    const currencyIcon = this.add.graphics();
    currencyIcon.lineStyle(2, 0xFFA500);
    currencyIcon.fillStyle(0xFFD700);
    currencyIcon.fillCircle(150, 30, 18);
    currencyIcon.lineStyle(2, 0xFFFFFF);
    currencyIcon.strokeCircle(150, 30, 12);
    currencyIcon.fillStyle(0x0066FF);
    currencyIcon.fillCircle(150, 30, 8);
    currencyIcon.fillStyle(0xFFFFFF);
    currencyIcon.fillCircle(150, 30, 3);

    this.scoreContainer.add([bg, border, this.scoreText, currencyIcon]);
  }

  // Component 2: Lives Display (Below Score)
  private createLivesDisplay(): void {
    const padding = 20;

    this.livesContainer = this.add.container(padding, padding + 70);

    // Light green container
    const bg = this.add.rectangle(0, 0, 160, 50, 0xC8E6C9).setOrigin(0, 0);
    const border = this.add.rectangle(0, 0, 160, 50).setOrigin(0, 0);
    border.setStrokeStyle(2, 0x558B2F);

    this.livesIcons = [];

    // Create 4 chip/battery icons with $ symbol
    for (let i = 0; i < 4; i++) {
      const x = 20 + (i * 36);
      const y = 25;

      const chip = this.add.graphics();
      // Chip body
      chip.fillStyle(0xA5D6A7);
      chip.lineStyle(1.5, 0x558B2F);
      chip.fillRoundedRect(x - 12, y - 12, 24, 24, 3);
      chip.strokeRoundedRect(x - 12, y - 12, 24, 24, 3);

      // $ symbol
      const dollarText = this.add.text(x, y, '$', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#558B2F',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.livesIcons.push(chip);
      this.livesContainer.add([chip, dollarText]);
    }

    this.livesContainer.add([bg, border]);
    this.livesContainer.sendToBack(border);
    this.livesContainer.sendToBack(bg);
  }

  // Component 3: Level and Objective Display (Top-Center)
  private createObjectiveDisplay(): void {
    const width = GameConfig.WIDTH;

    this.objectiveContainer = this.add.container(width / 2, 40);

    // Main white box with orange border
    const mainBox = this.add.rectangle(0, 0, 300, 60, 0xFFFFFF);
    mainBox.setStrokeStyle(4, 0xFF8C00);

    // Level label box (gray, top-left)
    const labelBox = this.add.rectangle(-100, -20, 100, 28, 0xD3D3D3).setOrigin(0, 0);
    labelBox.setStrokeStyle(1.5, 0x808080);

    const labelText = this.add.text(-50, -6, 'Level 1', {
      fontFamily: 'Space Mono, Arial',
      fontSize: '16px',
      color: '#000000'
    }).setOrigin(0.5);

    // Objective text
    const objectiveText = this.add.text(0, 0, 'Collect 50 Flora', {
      fontFamily: 'Space Mono, Arial',
      fontSize: '20px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.objectiveContainer.add([mainBox, labelBox, labelText, objectiveText]);
  }

  // Component 4: Stream Name Display (Top-Right)
  private createStreamNameDisplay(): void {
    const width = GameConfig.WIDTH;
    const padding = 20;

    this.streamContainer = this.add.container(width - padding - 70, padding + 25);

    // Purple hexagonal shape (simplified as elongated hexagon)
    const hex = this.add.graphics();
    hex.fillStyle(0x663399);
    hex.lineStyle(2, 0x4B0082);
    hex.beginPath();
    hex.moveTo(-60, 0);
    hex.lineTo(-50, -20);
    hex.lineTo(50, -20);
    hex.lineTo(60, 0);
    hex.lineTo(50, 20);
    hex.lineTo(-50, 20);
    hex.closePath();
    hex.fillPath();
    hex.strokePath();

    // Stream name text
    const streamText = this.add.text(-40, 0, 'Verdant Stream', {
      fontFamily: 'Space Mono, Arial',
      fontSize: '14px',
      color: '#FFFFFF'
    }).setOrigin(0, 0.5);

    // Leaf icon (simplified green circle with leaf shape)
    const leaf = this.add.graphics();
    leaf.fillStyle(0x00CC00);
    leaf.fillEllipse(40, 0, 12, 18);

    this.streamContainer.add([hex, streamText, leaf]);
  }

  // Component 5: Distance and Time Display (Right Side)
  private createDistanceTimeDisplay(): void {
    const width = GameConfig.WIDTH;
    const padding = 20;

    // Distance display (pink)
    this.distanceContainer = this.add.container(width - padding - 60, padding + 70);

    const distBg = this.add.rectangle(0, 0, 120, 40, 0xFF1493);
    distBg.setStrokeStyle(2, 0xC71585);

    this.distanceText = this.add.text(-50, 0, '3,000m', {
      fontFamily: 'Danfo, Arial',
      fontSize: '16px',
      color: '#FFFFFF'
    }).setOrigin(0, 0.5);

    // Running person icon (simplified stick figure)
    const runner = this.add.graphics();
    runner.lineStyle(2, 0xFFFFFF);
    runner.strokeCircle(40, -5, 4);
    runner.lineBetween(40, 1, 40, 10);
    runner.lineBetween(40, 3, 45, 8);
    runner.lineBetween(40, 10, 35, 15);
    runner.lineBetween(40, 10, 45, 15);

    this.distanceContainer.add([distBg, this.distanceText, runner]);

    // Time display (white with blue border)
    this.timeContainer = this.add.container(width - padding - 60, padding + 118);

    const timeBg = this.add.rectangle(0, 0, 120, 40, 0xFFFFFF);
    timeBg.setStrokeStyle(2, 0x0066FF);

    this.timeText = this.add.text(-50, 0, '01:32', {
      fontFamily: 'Danfo, Arial',
      fontSize: '16px',
      color: '#0066FF'
    }).setOrigin(0, 0.5);

    // Clock icon
    const clock = this.add.graphics();
    clock.lineStyle(2, 0x0066FF);
    clock.strokeCircle(40, 0, 8);
    clock.lineBetween(40, 0, 40, -5);
    clock.lineBetween(40, 0, 43, 2);

    this.timeContainer.add([timeBg, this.timeText, clock]);
  }

  // Component 6: Item Counter (Bottom-Right)
  private createItemCounter(): void {
    const width = GameConfig.WIDTH;
    const height = GameConfig.HEIGHT;
    const padding = 20;

    this.itemCounterContainer = this.add.container(width - padding - 90, height - padding - 40);

    // Blue container
    const bg = this.add.rectangle(0, 0, 180, 80, 0x0066FF);
    bg.setStrokeStyle(3, 0xFFFFFF);

    // Pink square with backpack icon (simplified)
    const pinkSquare = this.add.rectangle(-60, 0, 60, 60, 0xFF69B4);

    const backpack = this.add.graphics();
    backpack.fillStyle(0x666666);
    backpack.fillRoundedRect(-75, -15, 30, 30, 3);
    backpack.fillStyle(0xFFD700);
    backpack.fillRect(-72, -10, 6, 8);
    backpack.fillRect(-58, -10, 6, 8);

    // Flora count text
    this.itemCountText = this.add.text(10, 0, '50', {
      fontFamily: 'Danfo, Arial',
      fontSize: '36px',
      color: '#FFD700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Burst icon (simplified flower pattern)
    const burst = this.add.graphics();
    burst.fillStyle(0xFF69B4);
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const x = 70 + Math.cos(angle) * 8;
      const y = 0 + Math.sin(angle) * 8;
      burst.fillCircle(x, y, 4);
    }
    burst.fillCircle(70, 0, 6);

    this.itemCounterContainer.add([bg, pinkSquare, backpack, this.itemCountText, burst]);
  }

  // Component 7: Action Buttons (Bottom-Left)
  private createActionButtons(): void {
    const padding = 20;
    const height = GameConfig.HEIGHT;

    // Jump button
    this.jumpButton = this.add.container(padding + 50, height - padding - 80);

    const jumpBg = this.add.rectangle(0, 0, 100, 50, 0x7B2CBF);
    jumpBg.setStrokeStyle(2, 0x4B0082);
    jumpBg.setInteractive({ useHandCursor: true });

    const upArrow = this.add.graphics();
    upArrow.fillStyle(0xFFFFFF);
    upArrow.fillTriangle(0, -15, -8, -5, 8, -5);

    const jumpText = this.add.text(0, 10, 'Jump', {
      fontFamily: 'Space Mono, Arial',
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.jumpButton.add([jumpBg, upArrow, jumpText]);

    // Slide button
    this.slideButton = this.add.container(padding + 50, height - padding - 20);

    const slideBg = this.add.rectangle(0, 0, 100, 50, 0x7B2CBF);
    slideBg.setStrokeStyle(2, 0x4B0082);
    slideBg.setInteractive({ useHandCursor: true });

    const downArrow = this.add.graphics();
    downArrow.fillStyle(0xFFFFFF);
    downArrow.fillTriangle(0, 15, -8, 5, 8, 5);

    const slideText = this.add.text(0, -10, 'Slide', {
      fontFamily: 'Space Mono, Arial',
      fontSize: '16px',
      color: '#FFFFFF',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.slideButton.add([slideBg, slideText, downArrow]);

    // Button interactions
    const runnerScene = this.scene.get('RunnerScene') as any;

    jumpBg.on('pointerdown', () => {
      if (runnerScene.player) runnerScene.player.jump();
    });

    slideBg.on('pointerdown', () => {
      if (runnerScene.player) runnerScene.player.startSlide();
    });

    // Button hover effects
    jumpBg.on('pointerover', () => jumpBg.setFillStyle(0x9B4CDF));
    jumpBg.on('pointerout', () => jumpBg.setFillStyle(0x7B2CBF));
    slideBg.on('pointerover', () => slideBg.setFillStyle(0x9B4CDF));
    slideBg.on('pointerout', () => slideBg.setFillStyle(0x7B2CBF));
  }

  // Combo text (kept from original)
  private createComboText(): void {
    const padding = 20;

    this.comboText = this.add.text(padding, padding + 130, '', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
  }

  private updateHUD(state: GameState): void {
    // Update score
    this.scoreText.setText(state.score.toLocaleString());

    // Update lives (show/hide icons)
    this.livesIcons.forEach((icon, index) => {
      icon.setAlpha(index < state.lives ? 1 : 0.3);
    });

    // Update distance
    this.distanceText.setText(`${state.distance.toLocaleString()}m`);

    // Update time
    const minutes = Math.floor(state.time / 60);
    const seconds = state.time % 60;
    this.timeText.setText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

    // Update flora counter
    if (state.floraCollected !== undefined) {
      this.itemCountText.setText(state.floraCollected.toString());
    }

    // Update combo
    if (state.combo > 1) {
      this.comboText.setText(`COMBO x${state.combo}!`);
      this.comboText.setVisible(true);
    } else {
      this.comboText.setVisible(false);
    }
  }

  private showGameOver(data: { score: number; distance: number; time: number }): void {
    const width = GameConfig.WIDTH;
    const height = GameConfig.HEIGHT;

    this.gameOverContainer = this.add.container(width / 2, height / 2);

    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);

    const gameOverText = this.add.text(0, -150, 'GAME OVER', {
      fontFamily: 'Arial',
      fontSize: '72px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    const statsText = this.add.text(0, -50,
      `Final Score: ${data.score}\nDistance: ${data.distance}m\nTime: ${data.time}s`,
      {
        fontFamily: 'Arial',
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold',
        stroke: '#000000',
        strokeThickness: 4,
        align: 'center'
      }
    ).setOrigin(0.5);

    const restartButton = this.add.rectangle(0, 100, 250, 60, 0x00ff00, 1);
    const restartText = this.add.text(0, 100, 'RESTART', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    restartButton.setInteractive({ useHandCursor: true });
    restartButton.on('pointerdown', () => {
      this.restartGame();
    });

    restartButton.on('pointerover', () => {
      restartButton.setFillStyle(0x00dd00);
    });

    restartButton.on('pointerout', () => {
      restartButton.setFillStyle(0x00ff00);
    });

    this.gameOverContainer.add([overlay, gameOverText, statsText, restartButton, restartText]);
  }

  private restartGame(): void {
    if (this.gameOverContainer) {
      this.gameOverContainer.destroy();
      this.gameOverContainer = undefined;
    }

    const runnerScene = this.scene.get('RunnerScene') as any;
    runnerScene.restart();

    // Reset displays
    this.scoreText.setText('0');
    this.distanceText.setText('0m');
    this.timeText.setText('00:00');
    this.itemCountText.setText('0');
    this.comboText.setVisible(false);
    this.livesIcons.forEach(icon => icon.setAlpha(1));
  }
}
