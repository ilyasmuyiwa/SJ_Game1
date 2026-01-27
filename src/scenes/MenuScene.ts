import Phaser from 'phaser';
import { GameConfig } from '../config';

export class MenuScene extends Phaser.Scene {
    private pressKeyText?: Phaser.GameObjects.Text;
    private levelSelectText?: Phaser.GameObjects.Text;

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
        this.pressKeyText = this.add.text(width / 2, height - 120, 'Press any key to start', {
            fontFamily: 'Space Mono, Arial',
            fontSize: '32px',
            color: '#FFFFFF',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Add level selection hint
        this.levelSelectText = this.add.text(width / 2, height - 60, 'Press 1-6 to select level', {
            fontFamily: 'Space Mono, Arial',
            fontSize: '20px',
            color: '#00FFFF',
            fontStyle: 'bold',
            stroke: '#2D1B4E',
            strokeThickness: 3
        }).setOrigin(0.5);

        // Blinking animation - more noticeable
        this.tweens.add({
            targets: this.pressKeyText,
            alpha: 0.2,
            duration: 800,
            yoyo: true,
            repeat: -1
        });

        // Input handling - check for number keys 1-6 or any other key
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            // Check if it's a number key 1-6
            if (event.key >= '1' && event.key <= '6') {
                const level = parseInt(event.key, 10);
                this.startGame(level);
            } else {
                // Any other key starts level 1
                this.startGame(1);
            }
        }, this);

        // Also handle mouse click - starts level 1
        this.input.once('pointerdown', () => {
            this.startGame(1);
        });
    }

    private startGame(level: number = 1): void {
        // Remove all keyboard listeners to prevent multiple triggers
        this.input.keyboard?.removeAllListeners();

        this.cameras.main.fadeOut(500, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            // Store level in registry for RunnerScene to pick up
            this.registry.set('selectedLevel', level);
            this.scene.start('PreloadScene');
        });
    }
}
