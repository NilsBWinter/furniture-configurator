import { ref, Ref, ComputedRef } from 'vue';

export interface Material {
    type: string;
    thickness: number;
}

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

export interface Box {
    height: number;
    width: number;
    depth: number;

    gridX: number;
    gridY: number;
    gridSizeX: number;
    gridSizeY: number;

    name: string;

    connectorLeft: boolean;
    connectorRight: boolean;
    connector: Connector;

    backSide: boolean;
}

export type Connector = 'LEFT' | 'RIGHT' | 'BOTH' | 'NONE';

export interface Shelf {
    height: number;
    width: number;
    depth: number;
}

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
