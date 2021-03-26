/**
 * Enum holding types for different machines
 */
export enum machineTypes {
	LASERCUTTER = 'LASERCUTTER',
	CNC = 'CNC',
}

/**
 * Interface for a machine
 */
export interface Machine {
	name: string;
	processingArea: ProcessingArea;
	tolerance?: number;
	dogboneRadius?: number;
}

/**
 * A definition for a machine type
 */
export type MachineTypeDefinition = {
	[k in machineTypes]: Machine
}

/**
 * Const hollding the supported machine types
 */
export const machines: MachineTypeDefinition = {
	[machineTypes.LASERCUTTER]: {
		name: 'Lasercutter',
		processingArea: {},
	},
	[machineTypes.CNC]: {
		name: 'CNC-Mill',
		processingArea: {},
		dogboneRadius: 1,
	},
}

/**
 * Interface for the Material to be processed
 */
export interface Material {
	type?: string;
	thickness?: number;
}

/**
 * Interface for the Maximum possible Proccings Area
 */
export interface ProcessingArea {
	longSide?: number;
	shortSide?: number;
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
	height?: number;
	width?: number;
	depth?: number;
}

/**
 * Interface for possible Box Dimensions
 */
export interface BoxDimensions {
	heights: number[];
	widths: number[];
	depth: number;
}

export function isValidShelf(shelf: Shelf, machine: Machine): boolean {
	const tolerance = machine.tolerance ? machine.tolerance : 0;
	if (typeof machine.processingArea.longSide === 'undefined') return false;
	else return typeof shelf.height === 'number' && typeof shelf.width === 'number' && typeof shelf.depth === 'number' && shelf.depth <= machine.processingArea.longSide + tolerance;
}

export function isValidLongHeight(shelf: Shelf, machine: Machine, height: number): boolean {
	const tolerance = machine.tolerance ? machine.tolerance : 0;
	return (
		typeof shelf.height !== 'undefined' &&
		typeof machine.processingArea.longSide !== 'undefined' &&
		shelf.height % height === 0 &&
		height <= machine.processingArea.longSide + tolerance
	);
}

export function isValidShortHeight(shelf: Shelf, machine: Machine, height: number): boolean {
	const tolerance = machine.tolerance ? machine.tolerance : 0;
	return (
		typeof shelf.height !== 'undefined' &&
		typeof machine.processingArea.shortSide !== 'undefined' &&
		shelf.height % height === 0 &&
		height <= machine.processingArea.shortSide + tolerance
	);
}

export function isValidLongWidth(shelf: Shelf, machine: Machine, width: number): boolean {
	const tolerance = machine.tolerance ? machine.tolerance : 0;
	return (
		typeof shelf.width !== 'undefined' &&
		typeof machine.processingArea.longSide !== 'undefined' &&
		shelf.width % width === 0 &&
		width <= machine.processingArea.longSide + tolerance
	);
}

export function isValidShortWidth(shelf: Shelf, machine: Machine, width: number): boolean {
	const tolerance = machine.tolerance ? machine.tolerance : 0;
	return (
		typeof shelf.width !== 'undefined' &&
		typeof machine.processingArea.shortSide !== 'undefined' &&
		shelf.width % width === 0 &&
		width <= machine.processingArea.shortSide + tolerance
	);
}

export function isValidLongDepth(shelf: Shelf, machine: Machine, depth: number): boolean {
	const tolerance = machine.tolerance ? machine.tolerance : 0;
	return typeof machine.processingArea.longSide !== 'undefined' && depth === shelf.depth && depth <= machine.processingArea.longSide + tolerance && depth >= 0;
}

export function isValidShortDepth(shelf: Shelf, machine: Machine, depth: number): boolean {
	const tolerance = machine.tolerance ? machine.tolerance : 0;
	return typeof machine.processingArea.shortSide !== 'undefined' && depth === shelf.depth && depth <= machine.processingArea.shortSide + tolerance && depth >= 0;
}
