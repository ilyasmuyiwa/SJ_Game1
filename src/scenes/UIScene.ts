import Phaser from 'phaser';
import { GameConfig } from '../config';

interface GameState {
  score: number;
  dataQuality: number;
  distance: number;
  time: number;
  combo: number;
  collectedItems: string[];
}

export class UIScene extends Phaser.Scene {
  // HUD Elements
  private scoreText!: Phaser.GameObjects.Text;
  private dataQualityBar!: Phaser.GameObjects.Graphics;
  private dataQualityText!: Phaser.GameObjects.Text;
  private distanceText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private missionBanner!: Phaser.GameObjects.Container;
  private inventoryStrip!: Phaser.GameObjects.Container;
  private comboText!: Phaser.GameObjects.Text;

  // Game Over UI
  private gameOverContainer?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    // Create HUD elements
    this.createTopLeftHUD();
    this.createTopRightHUD();
    this.createMissionBanner();
    this.createInventoryStrip();

    // Listen for game state updates from RunnerScene
    const runnerScene = this.scene.get('RunnerScene');
    runnerScene.events.on('updateGameState', this.updateHUD, this);
    runnerScene.events.on('gameOver', this.showGameOver, this);
  }

  private createTopLeftHUD(): void {
    const padding = 20;

    // Score
    this.scoreText = this.add.text(padding, padding, 'SCORE: 0', {
      fontFamily: 'Arial',
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 4
    });

    // Data Quality label
    this.dataQualityText = this.add.text(padding, padding + 40, 'DATA QUALITY: 100%', {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });

    // Data Quality bar background
    this.dataQualityBar = this.add.graphics();
    this.updateDataQualityBar(100);

    // Combo text
    this.comboText = this.add.text(padding, padding + 110, '', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffff00',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    });
  }

  private createTopRightHUD(): void {
    const width = GameConfig.WIDTH;
    const padding = 20;

    // Distance
    this.distanceText = this.add.text(width - padding, padding, 'DISTANCE: 0m', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(1, 0);

    // Time
    this.timeText = this.add.text(width - padding, padding + 35, 'TIME: 0s', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(1, 0);
  }

  private createMissionBanner(): void {
    const width = GameConfig.WIDTH;

    // Create container
    this.missionBanner = this.add.container(width / 2, 20);

    // Background
    const bg = this.add.rectangle(0, 0, 400, 50, 0x000000, 0.7);

    // Mission text
    const missionText = this.add.text(0, 0, 'MISSION: COLLECT FLORA ONLY', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.missionBanner.add([bg, missionText]);
  }

  private createInventoryStrip(): void {
    const height = GameConfig.HEIGHT;
    const padding = 20;

    // Create container for inventory at bottom-left
    this.inventoryStrip = this.add.container(padding, height - padding - 50);

    // Label
    const label = this.add.text(0, 0, 'COLLECTED:', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2
    });

    this.inventoryStrip.add(label);
  }

  private updateDataQualityBar(quality: number): void {
    const padding = 20;
    const barWidth = 200;
    const barHeight = 20;
    const barX = padding;
    const barY = padding + 70;

    this.dataQualityBar.clear();

    // Background (dark)
    this.dataQualityBar.fillStyle(0x333333);
    this.dataQualityBar.fillRect(barX, barY, barWidth, barHeight);

    // Fill based on quality
    const fillWidth = (quality / 100) * barWidth;
    let color = 0x00ff00; // Green

    if (quality < 30) {
      color = 0xff0000; // Red
    } else if (quality < 60) {
      color = 0xff8800; // Orange
    }

    this.dataQualityBar.fillStyle(color);
    this.dataQualityBar.fillRect(barX, barY, fillWidth, barHeight);

    // Border
    this.dataQualityBar.lineStyle(2, 0xffffff);
    this.dataQualityBar.strokeRect(barX, barY, barWidth, barHeight);
  }

  private updateInventoryDisplay(items: string[]): void {
    // Clear existing inventory icons (except label)
    const children = this.inventoryStrip.list.slice(1);
    children.forEach(child => child.destroy());

    // Add new icons
    items.forEach((item, index) => {
      const x = 120 + (index * 45);
      const y = 10;

      // Create icon background
      const bg = this.add.rectangle(x, y, 40, 40, item === 'flora' ? 0x00ff00 : 0xff0000, 0.7);

      // Create icon text
      const text = this.add.text(x, y, item === 'flora' ? 'F' : 'X', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      this.inventoryStrip.add([bg, text]);
    });
  }

  private updateHUD(state: GameState): void {
    // Update score
    this.scoreText.setText(`SCORE: ${state.score}`);

    // Update data quality
    this.dataQualityText.setText(`DATA QUALITY: ${Math.floor(state.dataQuality)}%`);
    this.updateDataQualityBar(state.dataQuality);

    // Update distance and time
    this.distanceText.setText(`DISTANCE: ${state.distance}m`);
    this.timeText.setText(`TIME: ${state.time}s`);

    // Update combo
    if (state.combo > 1) {
      this.comboText.setText(`COMBO x${state.combo}!`);
      this.comboText.setVisible(true);
    } else {
      this.comboText.setVisible(false);
    }

    // Update inventory
    this.updateInventoryDisplay(state.collectedItems);
  }

  private showGameOver(data: { score: number; distance: number; time: number }): void {
    const width = GameConfig.WIDTH;
    const height = GameConfig.HEIGHT;

    // Create game over container
    this.gameOverContainer = this.add.container(width / 2, height / 2);

    // Background overlay
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.8);

    // Game Over text
    const gameOverText = this.add.text(0, -150, 'GAME OVER', {
      fontFamily: 'Arial',
      fontSize: '72px',
      color: '#ff0000',
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    // Stats
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

    // Restart button
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

    // Restart the runner scene
    const runnerScene = this.scene.get('RunnerScene') as any;
    runnerScene.restart();

    // Reset HUD
    this.scoreText.setText('SCORE: 0');
    this.dataQualityText.setText('DATA QUALITY: 100%');
    this.updateDataQualityBar(100);
    this.distanceText.setText('DISTANCE: 0m');
    this.timeText.setText('TIME: 0s');
    this.comboText.setVisible(false);
    this.updateInventoryDisplay([]);
  }
}
