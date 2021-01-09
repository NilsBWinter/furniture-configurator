import {
	Shelf,
	BoxDimensions,
	Box,
	Connector,
	ProcessingArea,
	isValidShortDepth,
	isValidLongDepth,
	isValidLongHeight,
	isValidLongWidth,
	isValidShortHeight,
	isValidShortWidth,
} from './calculator';

import GridStack from 'gridstack/dist/gridstack-h5.js';

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
		depth: shelf.depth,

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
			return box.possibleBoxDimensions.widths.length-1;
		},
		get maxH() {
			return box.possibleBoxDimensions.heights.length-1;
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
export function calculatePossibleBasicBoxDimensions(shelf: Shelf, processingArea: ProcessingArea, rangeSteps: number[]): BoxDimensions {
	const longHeights: number[] = [];
	const longWidths: number[] = [];

	const shortHeights: number[] = [];
	const shortWidths: number[] = [];

	let depth: number;
	if (isValidShortDepth(shelf.depth, shelf, processingArea) || isValidLongDepth(shelf.depth, shelf, processingArea)) depth = shelf.depth;
	else throw new Error('shelf.depth is not a valid number');

	rangeSteps.forEach((step) => {
		const height = shelf.height / step;
		const width = shelf.width / step;
		if (isValidLongHeight(shelf, processingArea, height)) longHeights.push(height);
		if (isValidLongWidth(shelf, processingArea, width)) longWidths.push(width);

		if (isValidShortHeight(shelf, processingArea, height)) shortHeights.push(height);
		if (isValidShortWidth(shelf, processingArea, width)) shortWidths.push(width);
	});

	if (isValidShortDepth(depth, shelf, processingArea) && isValidLongDepth(depth, shelf, processingArea))
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

	rangeSteps.forEach((step) => {
		const height = basicBox.height * step;
		const width = basicBox.width * step;
		if (isValidLongHeight(shelf, processingArea, height)) heights.push(height);
		if (isValidLongWidth(shelf, processingArea, width)) widths.push(width);
	})
	return {
		// heights: possibleBasicBoxDimensions.heights.filter((height) => height >= basicBox.height),
		heights: heights,
		// widths: possibleBasicBoxDimensions.widths.filter((width) => width >= basicBox.width),
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

export function initGridDragged(grid: GridStack, userBoxes: Box[]): void {
	grid.on("dragstop", (event, element) => {
		const node = element.gridstackNode;
		updateBoxGridPosition(userBoxes, node);
	});
}

export function initGridResize(grid: GridStack, userBoxes: Box[]): void {
	grid.on("resizestop", (event, element) => {
		const node = element.gridstackNode;
		updateBoxSize(userBoxes, node);
	});
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
	boxes.every((box) => {
			if (box.id === changedBox.id) {
				if (changedBox.w - 1 > box.possibleBoxDimensions.widths.length - 1) {
					console.error('Box does not for the given Box Dimensions(width)');
					return false;
				}
				if (changedBox.h - 1 > box.possibleBoxDimensions.heights.length) {
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
