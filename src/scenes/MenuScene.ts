import Phaser from 'phaser';
import { GameConfig } from '../config';

export class MenuScene extends Phaser.Scene {
    private startButton?: Phaser.GameObjects.Container;
    private pressKeyText?: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'MenuScene' });
    }

    preload(): void {
        this.load.image('menu-background', 'assets/backgrounds/Start Page Bg.png');
    }

    create(): void {
        const width = GameConfig.WIDTH;
        const height = GameConfig.HEIGHT;

        // Add background image
        const background = this.add.image(width / 2, height / 2, 'menu-background');

        // Scale background to cover screen
        const scaleX = width / background.width;
        const scaleY = height / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);

        // Layout constants (Right side of screen)
        const uiX = width * 0.75;
        const titleY = height * 0.35;
        const buttonY = height * 0.65;

        // Create Title "ECHOES OF TERA"
        this.createTitle(uiX, titleY);

        // Create "Start Game" button
        this.createStartButton(uiX, buttonY);

        // Add "Press any key" text (bottom center or bottom right)
        this.pressKeyText = this.add.text(uiX, height - 50, 'Press any key to start', {
            fontFamily: 'Space Mono, Arial',
            fontSize: '18px',
            color: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5).setAlpha(0.8);

        // Blinking animation
        this.tweens.add({
            targets: this.pressKeyText,
            alpha: 0.3,
            duration: 1000,
            yoyo: true,
            repeat: -1
        });

        // Input handling
        this.input.keyboard?.once('keydown', () => {
            this.startGame();
        });
    }

    private createTitle(x: number, y: number): void {
        const titleContainer = this.add.container(x, y);

        // "ECHOES"
        const echoes = this.add.text(-220, 0, 'ECHOES', {
            fontFamily: 'Danfo, Arial',
            fontSize: '72px',
            color: '#FFFFFF',
            stroke: '#00FFFF',
            strokeThickness: 8,
            shadow: { offsetX: 4, offsetY: 4, color: '#2D1B4E', blur: 0, fill: true }
        }).setOrigin(0.5);

        // "OF" (Orange box style)
        const ofBg = this.add.graphics();
        ofBg.fillStyle(0xFF6600, 1);
        ofBg.fillRoundedRect(-35, -25, 70, 50, 8); // Centered relative to text center
        // Graphics don't support setOrigin easily in container logic without offset, 
        // effectively 0,0 of graphic is container 0,0. 
        // We want "OF" at x=0 (center of container). 
        // Let's position "OF" graphics at x=0 relative to container.

        const ofText = this.add.text(0, 0, 'OF', {
            fontFamily: 'Danfo, Arial',
            fontSize: '36px',
            color: '#FFFFFF'
        }).setOrigin(0.5);

        // "TERA"
        const tera = this.add.text(180, 0, 'TERA', {
            fontFamily: 'Danfo, Arial',
            fontSize: '72px',
            color: '#FFFFFF',
            stroke: '#00FFFF',
            strokeThickness: 8,
            shadow: { offsetX: 4, offsetY: 4, color: '#2D1B4E', blur: 0, fill: true }
        }).setOrigin(0.5);

        // "by Stackjunior"
        const subtitle = this.add.text(180, 60, 'by Stackjunior', {
            fontFamily: 'Space Mono, Arial',
            fontSize: '20px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5).setAlpha(0.9);

        // Add logo/icon for Stackjunior if needed (simulated with text for now)
        // Adjust positions
        // ECHOES: Left
        // OF: Center
        // TERA: Right

        // Let's refine positioning
        echoes.setPosition(-180, 0);
        ofText.setPosition(0, 0);
        // Orange box for OF
        // We need to add graphic to container
        // Draw rect relative to 0,0
        // OF text is approx 50px wide. Box 60px wide.
        const boxWidth = 50;
        const boxHeight = 40;
        const boxX = -boxWidth / 2;
        const boxY = -boxHeight / 2;

        const ofBox = this.add.graphics();
        ofBox.fillStyle(0xFF8800, 1); // Orange
        ofBox.fillRoundedRect(boxX, boxY, boxWidth, boxHeight, 8);

        tera.setPosition(160, 0);
        subtitle.setPosition(160, 50); // Under TERA as per usual design or centered? 
        // Image shows "by Stackjunior" under "TERA" right aligned or centered. 
        // Text "by Stackjunior" is usually small. Let's center it under "TERA" or the whole block?
        // Let's center under the whole block for now, or just under TERA. 
        // Reference image crop shows it under TERA.

        titleContainer.add([echoes, ofBox, ofText, tera, subtitle]);
    }

    private createStartButton(x: number, y: number): void {
        this.startButton = this.add.container(x, y);

        // Skewed/Rounded Rectangle styling
        const width = 360;
        const height = 80;
        const radius = 40;

        const bg = this.add.graphics();
        // Style: Dark Purple (#2D1B4E) with Cyan (#00FFFF) border
        const drawButton = (color: number, scale: number = 1) => {
            bg.clear();
            bg.fillStyle(color, 1);
            bg.lineStyle(4, 0x00FFFF, 1);

            // Draw rounded rect centered
            bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
            bg.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
        };

        drawButton(0x2D1B4E);

        const text = this.add.text(0, 0, 'Start Game', {
            fontFamily: 'Space Mono, Arial',
            fontSize: '32px',
            color: '#FFFFFF',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.startButton.add([bg, text]);
        this.startButton.setSize(width, height);
        this.startButton.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);

        // Hover effects
        this.startButton.on('pointerover', () => {
            this.startButton?.setScale(1.05);
            drawButton(0x3D2B5E); // Lighter purple
        });

        this.startButton.on('pointerout', () => {
            this.startButton?.setScale(1);
            drawButton(0x2D1B4E); // Normal purple
        });

        this.startButton.on('pointerdown', () => {
            this.startGame();
        });
    }

    private startGame(): void {
        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('PreloadScene');
        });
    }
}
