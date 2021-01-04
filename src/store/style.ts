import { Box } from './calculator';

/**
 * Function to get the right Style for Css Grid based on the properties on the Box
 *
 * @param box box to get the Style
 */
export function getGridStyle(box: Box): object {
    return {
        'grid-column-start': box.x,
        'grid-row-start': -box.y,

        'grid-column-end': box.x + box.w,
        'grid-row-end': -box.y - box.h,
    };
}