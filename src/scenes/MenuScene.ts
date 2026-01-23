import Phaser from 'phaser';
import { GameConfig } from '../config';

export class MenuScene extends Phaser.Scene {
    private startButton?: Phaser.GameObjects.Container;
    private startText?: Phaser.GameObjects.Text;
    private pressKeyText?: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'MenuScene' });
    }

    preload(): void {
        // Load menu background
        this.load.image('menu-background', 'assets/backgrounds/menu-background.jpg');
    }

    create(): void {
        const width = GameConfig.WIDTH;
        const height = GameConfig.HEIGHT;

        // Add background image
        const background = this.add.image(width / 2, height / 2, 'menu-background');

        // Scale background to cover screen while maintaining aspect ratio
        const scaleX = width / background.width;
        const scaleY = height / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);

        // Create "Start Game" button
        this.createStartButton();

        // Add "Press any key" text
        this.pressKeyText = this.add.text(width / 2, height - 80, 'Press any key to start', {
            fontFamily: 'Space Mono, Arial',
            fontSize: '20px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setAlpha(0.8);

        // Blinking animation for "Press any key"
        this.tweens.add({
            targets: this.pressKeyText,
            alpha: 0.3,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Handle keyboard input - any key starts the game
        this.input.keyboard?.once('keydown', () => {
            this.startGame();
        });
    }

    private createStartButton(): void {
        const width = GameConfig.WIDTH;
        const height = GameConfig.HEIGHT;

        // Create button container
        this.startButton = this.add.container(width / 2, height / 2 + 150);

        // Button background (purple with cyan border, matching the design)
        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x2D1B4E, 1); // Dark purple
        buttonBg.lineStyle(4, 0x00FFFF, 1); // Cyan border
        buttonBg.fillRoundedRect(-200, -40, 400, 80, 40);
        buttonBg.strokeRoundedRect(-200, -40, 400, 80, 40);

        // Button text
        this.startText = this.add.text(0, 0, 'Start Game', {
            fontFamily: 'Space Mono, Arial',
            fontSize: '36px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Add to container
        this.startButton.add([buttonBg, this.startText]);

        // Make button interactive
        const hitArea = new Phaser.Geom.Rectangle(-200, -40, 400, 80);
        this.startButton.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
        this.startButton.setSize(400, 80);

        // Button hover effects
        this.startButton.on('pointerover', () => {
            this.startButton?.setScale(1.05);
            buttonBg.clear();
            buttonBg.fillStyle(0x3D2B5E, 1); // Lighter purple on hover
            buttonBg.lineStyle(4, 0x00FFFF, 1);
            buttonBg.fillRoundedRect(-200, -40, 400, 80, 40);
            buttonBg.strokeRoundedRect(-200, -40, 400, 80, 40);
        });

        this.startButton.on('pointerout', () => {
            this.startButton?.setScale(1);
            buttonBg.clear();
            buttonBg.fillStyle(0x2D1B4E, 1);
            buttonBg.lineStyle(4, 0x00FFFF, 1);
            buttonBg.fillRoundedRect(-200, -40, 400, 80, 40);
            buttonBg.strokeRoundedRect(-200, -40, 400, 80, 40);
        });

        // Button click
        this.startButton.on('pointerdown', () => {
            this.startGame();
        });
    }

    private startGame(): void {
        // Fade out
        this.cameras.main.fadeOut(500, 0, 0, 0);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Start the preload scene which will then start the game
            this.scene.start('PreloadScene');
        });
    }
}
