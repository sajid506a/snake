export interface Point {
    x: number;
    y: number;
}

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type FoodType = 'NORMAL' | 'GOLDEN' | 'SPEED' | 'SHRINK';

export interface Food {
    x: number;
    y: number;
    type: FoodType;
    color: string;
    points: number;
    duration?: number; // for temporary items
}

export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    alpha: number;
    decay: number;
}

export interface Theme {
    background: string;
    grid: string;
    snakeHead: string;
    snakeBody: string;
    snakeGlow: string;
    particleColors: string[];
    foodColors: Record<FoodType, string>;
}
