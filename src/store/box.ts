import { Shelf, BoxDimensions, Box, Connector, ProcessingArea, isValidShortDepth, isValidLongDepth, isValidLongHeightAtStep, isValidLongWidthAtStep, isValidShortHeightAtStep, isValidShortWidthAtStep } from './calculator';

export function createBox(shelf: Shelf, possibleBoxDimensions: BoxDimensions): Box {
    const box: Box = {
        height: possibleBoxDimensions.heights[0],
        width: possibleBoxDimensions.widths[0],
        depth: shelf.depth,

        get gridSizeX() {
            return possibleBoxDimensions.widths.indexOf(box.width) + 1;
        },
        get gridSizeY() {
            return possibleBoxDimensions.heights.indexOf(box.height) + 1;
        },

        gridX: 0,
        gridY: 0,

        connectorLeft: false,
        connectorRight: false,

        get connector(): Connector {
            if (box.connectorLeft && box.connectorRight) return 'BOTH';
            if (box.connectorLeft) return 'LEFT';
            if (box.connectorRight) return 'RIGHT';
            else return 'NONE';
        },

        backSide: false,

        get name() {
            return `Box ${box.gridSizeY}.${box.gridSizeX}`;
        },
    };
    return box;
}

export function createTestBox(shelf: Shelf, possibleBoxDimensions: BoxDimensions, gridX: number, gridY: number, height: number, width: number) {
			const box: Box = {
				height: height,
				width: width,
				depth: shelf.depth,

				get gridSizeX() {
					return possibleBoxDimensions.widths.indexOf(box.width) + 1;
				},
				get gridSizeY() {
					return possibleBoxDimensions.heights.indexOf(box.height) + 1;
				},

				gridX: gridX,
				gridY: gridY,

				connectorLeft: false,
				connectorRight: false,

				get connector(): Connector {
					if (box.connectorLeft && box.connectorRight) return 'BOTH';
					if (box.connectorLeft) return 'LEFT';
					if (box.connectorRight) return 'RIGHT';
					else return 'NONE';
				},

				backSide: false,

				get name() {
					return `Box ${box.gridSizeY}.${box.gridSizeX}`;
				},
			};

			return box;
		}

export function addBasicBox(userBoxes: Box[], shelf: Shelf, possibleBoxDimensions: BoxDimensions): void {
    userBoxes.push(createBox(shelf, possibleBoxDimensions));
}

export function calculatePossibleBasicBoxDimensions(shelf: Shelf, processingArea: ProcessingArea, rangeSteps: number[]): BoxDimensions {
    const longHeights: number[] = [];
    const longWidths: number[] = [];

    const shortHeights: number[] = [];
    const shortWidths: number[] = [];

    let depth: number;
    if (isValidShortDepth(shelf.depth, shelf, processingArea) || isValidLongDepth(shelf.depth, shelf, processingArea))
        depth = shelf.depth;
    else throw new Error('shelf.depth is not a valid number');

    rangeSteps.forEach((step) => {
        if (isValidLongHeightAtStep(shelf, processingArea, step)) longHeights.push(shelf.height / step);
        if (isValidLongWidthAtStep(shelf, processingArea, step)) longWidths.push(shelf.width / step);

        if (isValidShortHeightAtStep(shelf, processingArea, step)) shortHeights.push(shelf.height / step);
        if (isValidShortWidthAtStep(shelf, processingArea, step)) shortWidths.push(shelf.width / step);
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

export function calculatePossibleUserBoxDimensions(possibleBasicBoxDimensions: BoxDimensions, basicBox: Box) {
    return {
            heights: possibleBasicBoxDimensions.heights.filter((height) => height >= basicBox.height),
            widths: possibleBasicBoxDimensions.widths.filter((width) => width >= basicBox.width),
            depth: possibleBasicBoxDimensions.depth,
    };
}

export function calculatePossibleBoxes(possibleBasicBoxDimensions: BoxDimensions, basicBox: Box): Box[] {
    const boxes: Box[] = [];

    possibleBasicBoxDimensions.heights.forEach((height, hIndex) => {
        possibleBasicBoxDimensions.widths.forEach((width, wIndex) => {
            const box: Box = {
                height: height,
                width: width,
                depth: basicBox.depth,

                gridX: 0,
                gridY: 0,

                get gridSizeX() {
                    return wIndex + 1;
                },
                get gridSizeY() {
                    return hIndex + 1;
                },

                connectorLeft: false,
                connectorRight: false,

                get connector(): Connector {
                    if (box.connectorLeft && box.connectorRight) return 'BOTH';
                    if (box.connectorLeft) return 'LEFT';
                    if (box.connectorRight) return 'RIGHT';
                    else return 'NONE';
                },

                backSide: false,

                get name() {
                    return `Box${hIndex + 1}.${wIndex + 1}`;
                },
            };

            boxes.push(box);
        });
    });

    return boxes;
}