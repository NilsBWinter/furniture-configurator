import { Box } from './calculator';

export function getGridStyle(box: Box): object {
    return {
        'grid-column-start': box.gridX,
        'grid-row-start': -box.gridY,

        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        //@ts-ignore
        'grid-column-end': box.gridX + box.gridSizeX,
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        //@ts-ignore
        'grid-row-end': -box.gridY - box.gridSizeY,
    };
}