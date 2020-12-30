import { Box } from './calculator';

/**
 * Function to get the right Style for Css Grid based on the properties on the Box
 *
 * @param box box to get the Style
 */
export function getGridStyle(box: Box): object {
    return {
        'grid-column-start': box.gridX,
        'grid-row-start': -box.gridY,

        'grid-column-end': box.gridX + box.gridSizeX,
        'grid-row-end': -box.gridY - box.gridSizeY,
    };
}