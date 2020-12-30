import { Box } from './calculator';

export function getGridStyle(box: Box): object {
    return {
        'grid-column-start': box.gridX,
        'grid-row-start': -box.gridY,

        'grid-column-end': box.gridX + box.gridSizeX,
        'grid-row-end': -box.gridY - box.gridSizeY,
    };
}