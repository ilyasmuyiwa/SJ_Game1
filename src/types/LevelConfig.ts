export type CollectibleType = 'fauna' | 'flora';
export type SpawnType = 'fauna' | 'flora' | 'obstacle';

export interface LevelPhase {
    target: number;
    collectibleType: CollectibleType;
    message: string;
}

export interface LevelConfig {
    level: number;
    name: string;
    objective: string;
    phases: LevelPhase[];
    spawnTypes: SpawnType[];
    hasObstacles: boolean;
    baseSpeed: number;
    maxSpeed: number;
    startingLives: number;
}
