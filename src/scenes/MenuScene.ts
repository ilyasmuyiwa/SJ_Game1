import Phaser from 'phaser';
import { GameConfig } from '../config';

export class MenuScene extends Phaser.Scene {
    private pressKeyText?: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'MenuScene' });
    }

    preload(): void {
        this.load.svg('start-page', 'assets/backgrounds/Start Page.svg');
    }

    create(): void {
        const width = GameConfig.WIDTH;
        const height = GameConfig.HEIGHT;

        // Add Start Page SVG as background (contains all text and button graphics)
        const background = this.add.image(width / 2, height / 2, 'start-page');

        // Scale background to cover screen
        const scaleX = width / background.width;
        const scaleY = height / background.height;
        const scale = Math.max(scaleX, scaleY);
        background.setScale(scale);

        // Add prominent "Press any key to start" text
        this.pressKeyText = this.add.text(width / 2, height - 80, 'Press any key to start', {
            fontFamily: 'Space Mono, Arial',
            fontSize: '32px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Blinking animation - more noticeable
        this.tweens.add({
            targets: this.pressKeyText,
            alpha: 0.2,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Input handling
        this.input.keyboard?.once('keydown', () => {
            this.startGame();
        });

        // Also handle mouse click
        this.input.once('pointerdown', () => {
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
