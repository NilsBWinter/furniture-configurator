import { reactive } from 'vue';
import {
	Shelf,
	BoxDimensions,
	Box,
	Connector,
	ProcessingArea,
	isValidLongHeight,
	isValidLongWidth,
	isValidShortHeight,
	isValidShortWidth,
	isValidLongDepth,
	Machine,
} from './calculator';

/**
 * Function to create a new Box fitting to the shelf giving the smallest possible box Dimensions
 *
 * @param shelf shelf in wich the box should be belong
 * @param possibleBoxDimensions possible Dimensions for Boxes of the shelf to be compatible witch each other
 */
export function createBox(shelf: Shelf, boxDimensions: BoxDimensions): Box {
	const box: Box = {
		height: boxDimensions.heights[0],
		width: boxDimensions.widths[0],
		depth: shelf.depth ? shelf.depth : 0,
		
		possibleBoxDimensions: boxDimensions,

		id: getRandomInt(1, 9999),
		x: 0,
		y: 0,

		get w() {
			return box.possibleBoxDimensions.widths.indexOf(box.width) + 1;
		},
		get h() {
			return box.possibleBoxDimensions.heights.indexOf(box.height) + 1;
		},
		minW: 1,
		minH: 1,
		get maxW() {
			return box.possibleBoxDimensions.widths.length;
		},
		get maxH() {
			return box.possibleBoxDimensions.heights.length;
		},


		connectorLeft: false,
		connectorRight: false,

		get connector(): Connector {
			if (box.connectorLeft && box.connectorRight) return Connector.BOTH;
			if (box.connectorLeft) return Connector.LEFT;
			if (box.connectorRight) return Connector.RIGHT;
			else return Connector.NONE;
		},

		backSide: false,


		get content() {
			return `Box ${box.h}.${box.w}`;
		},

		get validDimensions() {
			return boxDimensionValid(box, box.possibleBoxDimensions);
		},
	};
	return box;
}

/**
 * Function to create a Testbox to test the functionality & Grid
 * @param shelf shelf in wich the box should be belong
 * @param possibleBoxDimensions possible Dimensions for Boxes of the shelf to be compatible witch each other
 * @param gridX GridX Position
 * @param gridY GridY Position
 * @param height height of the Box
 * @param width width of the Box
 */
export function createTestBox(shelf: Shelf, possibleBoxDimensions: BoxDimensions, gridX: number, gridY: number, height: number, width: number) {
    const box = createBox(shelf, possibleBoxDimensions);

    box.x = gridX;
    box.y = gridY;
	box.height = height;
	box.width = width;
	// box.noMove = true;

	return box;
}

/**
 * Function to create a new Box into the given Box Array
 *
 * @param boxes Boxes Array to push the Box in
 * @param shelf Shelf to wich the Boxes Array belongs
 * @param possibleBoxDimensions possible Box Dimensions of the Shelf
 */
export function createBoxToArray(boxes: Box[], shelf: Shelf, possibleBoxDimensions: BoxDimensions): void {
	boxes.push(createBox(shelf, possibleBoxDimensions));
}

/**
 * Function to calculate the possible Box Dimensions of the base Box from a Shelf
 *
 * @param shelf Shelf the Box belongs to
 * @param processingArea The maximum processable Area that can be processed
 * @param rangeSteps number of possible Size Variants for the Box Dimensions
 */
export function calculatePossibleBasicBoxDimensions(shelf: Shelf, machine: Machine, rangeSteps: number[]): BoxDimensions {
	const longHeights: number[] = [];
	const longWidths: number[] = [];

	const shortHeights: number[] = [];
	const shortWidths: number[] = [];

	const depth = shelf.depth ? shelf.depth : 0;
	const shelfHeight = shelf.height ? shelf.height : 0;
	const shelfWidth = shelf.width ? shelf.width : 0;

	rangeSteps.forEach((step) => {
		const height = shelfHeight / step;
		const width = shelfWidth / step;
		if (isValidLongHeight(shelf, machine, height)) longHeights.push(height);
		if (isValidLongWidth(shelf, machine, width)) longWidths.push(width);

		if (isValidShortHeight(shelf, machine, height)) shortHeights.push(height);
		if (isValidShortWidth(shelf, machine, width)) shortWidths.push(width);
	});

	if (!isValidLongDepth(shelf, machine, depth))
		return {
			heights: longHeights.sort((a, b) => a - b),
			widths: longWidths.sort((a, b) => a - b),
			depth: depth,
		};
	else
		return {
			heights: shortHeights.sort((a, b) => a - b),
			widths: shortWidths.sort((a, b) => a - b),
			depth: depth,
		};
}


/**
 * Function to calculate all possible Box Dimensions based on a base Box
 *
 * @param possibleBasicBoxDimensions Possible Box Dimensions of the base Box
 * @param basicBox the base Box
 */
export function calculatePossibleUserBoxDimensions(shelf: Shelf, processingArea: ProcessingArea, basicBox: Box, rangeSteps: number[]) {
	const heights: number[] = [];
	const widths: number[] = [];
	const shelfHeight = shelf.height ? shelf.height : 0;
	const shelfWidth = shelf.width ? shelf.width : 0;

	rangeSteps.forEach((step) => {
		const height = basicBox.height * step;
		const width = basicBox.width * step;
		if (basicBox.height * step <= shelfHeight) heights.push(height);
		if (basicBox.width * step <= shelfWidth) widths.push(width);
	})
	return {
		heights: heights,
		widths: widths,
		depth: basicBox.depth,
	};
}

export function updatBoxDimensions(box: Box, newBoxDimesnions: BoxDimensions): void {
	box.possibleBoxDimensions = newBoxDimesnions;
}

export function boxDimensionValid(box: Box, boxDimensions: BoxDimensions): boolean {
	return boxDimensions.heights.includes(box.height) && boxDimensions.widths.includes(box.width);
}

export function updateBoxGridPosition(boxes: Box[], changedBox: Box) {
	boxes.forEach((box) => {
			if (box.id === changedBox.id) {
				box.x = changedBox.x;
				box.y = changedBox.y;
			}
	});
}

export function updateBoxSize(boxes: Box[], changedBox: Box) {
	boxes.forEach((box) => {
		if (box.id === changedBox.id) {
			if (changedBox.w > box.possibleBoxDimensions.widths.length) {
				console.error('Box does not for the given Box Dimensions(width)');
				return false;
			}
			if (changedBox.h > box.possibleBoxDimensions.heights.length) {
				console.error('Box does not for the given Box Dimensions(height)');
				return false;
			}
			box.width = box.possibleBoxDimensions.widths[changedBox.w - 1];
			box.height = box.possibleBoxDimensions.heights[changedBox.h - 1];
		}
	});
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}
