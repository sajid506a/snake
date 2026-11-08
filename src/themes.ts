import { Theme } from './types';

export const THEMES: Record<string, Theme> = {
    phosphor: {
        background: '#07120a',
        grid: 'rgba(168, 240, 141, 0.045)',
        snakeHead: '#d8ffcc',
        snakeBody: '#8fe07a',
        snakeGlow: 'rgba(168, 240, 141, 0.45)',
        particleColors: ['#d8ffcc', '#a8f08d', '#f0c35e'],
        foodColors: {
            NORMAL: '#eef5d8',
            GOLDEN: '#ffd166',
            SPEED: '#9ad7ff',
            SHRINK: '#ff9c9c'
        }
    },
    amber: {
        background: '#140f07',
        grid: 'rgba(240, 179, 94, 0.05)',
        snakeHead: '#ffe3ad',
        snakeBody: '#e0a85a',
        snakeGlow: 'rgba(240, 179, 94, 0.45)',
        particleColors: ['#ffe3ad', '#f0b35e', '#c97b2e'],
        foodColors: {
            NORMAL: '#cde9b8',
            GOLDEN: '#ffe08a',
            SPEED: '#9ad7ff',
            SHRINK: '#ff9c9c'
        }
    }
};
