// import { Box } from './calculator';

// export function calculateBoxesGridArea(boxes: Box[]): number {
//     return boxes.map(box => box.gridSizeX * box.gridSizeY).reduce((a, b) => a + b, 0);
// }

// export function getMaxGridDimensions(boxes: Box[]): {maxX: number; maxY: number} {
// 	let maxWidth = 0;
// 	let maxHeight = 0;
// 	boxes.forEach((box) => {
// 		if (box.gridY + box.gridSizeY > maxHeight) maxHeight = box.gridY + box.gridSizeY - 1;
// 	});
// 	boxes.forEach((box) => {
// 		if (box.gridX + box.gridSizeX > maxWidth) maxWidth = box.gridX + box.gridSizeX - 1;
//     });


// 	return {
// 		maxX: maxWidth,
// 		maxY: maxHeight
// 	};
// }