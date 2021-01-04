/**
 * Interface for the Material to be processed
 */
export interface Material {
	type: string;
	thickness: number;
}

/**
 * Interface for the Maximum possible Proccings Area
 */
export interface ProcessingArea {
	longSide: number;
	shortSide: number;
}

// export function isProcessingArea(obj: unknown): obj is ProcessingArea {
//     return (
//         typeof obj === "object" &&
//         obj !== null &&
//         Object.hasKey(obj, "longSide") &&
//         typeof obj.longSide === "number" &&
//         Object.hasKey(obj, "shortSide") &&
//         typeof obj.shortSide === "number" &&

//         obj.longSide <= obj.shortSide

//     );
// }

/**
 * Inteface of a Box of the Shelf
 *
 * @param x gridposition x-Axis
 * @param y gridposition y-Axis
 * @param w dimensio width in Grid
 * @param h dimensio height in Grid
 * @param minW min width Dimension for Grid
 * @param maxW max width Dimension for Grid
 * @param minH min height Dimension for Grid
 * @param maxH max height Dimension for Grid
 */
export interface Box {
	height: number;
	width: number;
	depth: number;

	/**
	 * Grid
	 */
	id: number;
	x: number;
	y: number;
	w: number;
	h: number;
	minW?: number;
	maxW?: number;
	minH?: number;
	maxH?: number;
	noMove?: boolean;

	content: string;

	connectorLeft: boolean;
	connectorRight: boolean;
	connector: Connector;

	backSide: boolean;

	possibleBoxDimensions: BoxDimensions;

	validDimensions: boolean;
}

/**
 * Interface of a Connector to connect to boxes horizontal
 */
export enum Connector {
	LEFT = 'LEFT',
	RIGHT = 'RIGHT',
	BOTH = 'BOTH',
	NONE = 'NONE',
}

/**
 * interface of a Shelf
 */
export interface Shelf {
	height: number;
	width: number;
	depth: number;
}

/**
 * Interface for possible Box Dimensions
 */
export interface BoxDimensions {
	heights: number[];
	widths: number[];
	depth: number;
}

export function isValidLongHeightAtStep(shelf: Shelf, processingArea: ProcessingArea, step: number): boolean {
	return shelf.height % step === 0 && shelf.height / step <= processingArea.longSide;
}

export function isValidShortHeightAtStep(shelf: Shelf, processingArea: ProcessingArea, step: number): boolean {
	return shelf.height % step === 0 && shelf.height / step <= processingArea.shortSide;
}

export function isValidLongWidthAtStep(shelf: Shelf, processingArea: ProcessingArea, step: number): boolean {
	return shelf.width % step === 0 && shelf.width / step <= processingArea.longSide;
}

export function isValidShortWidthAtStep(shelf: Shelf, processingArea: ProcessingArea, step: number): boolean {
	return shelf.width % step === 0 && shelf.width / step <= processingArea.shortSide;
}

// export function isValidLongDepthAtStep(shelf: Shelf, processingArea: ProcessingArea, step: number): boolean {
//     return shelf.depth % step === 0 && shelf.depth / step <= processingArea.longSide;
// }

// export function isValidShortDepthAtStep(shelf: Shelf, processingArea: ProcessingArea, step: number): boolean {
//     return shelf.depth % step === 0 && shelf.depth / step <= processingArea.shortSide;
// }

export function isValidShortDepth(depth: number, shelf: Shelf, processingArea: ProcessingArea): boolean {
	return depth === shelf.depth && depth <= processingArea.shortSide && depth >= 0;
}

export function isValidLongDepth(depth: number, shelf: Shelf, processingArea: ProcessingArea): boolean {
	return depth === shelf.depth && depth <= processingArea.longSide && depth >= 0;
}
