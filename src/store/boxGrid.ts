import { Shelf, Box } from './calculator';
import GridStack from 'gridstack/dist/gridstack-h5.js';
import { GridItemHTMLElement, GridStackOptions } from 'gridstack';
import { updateBoxGridPosition, updateBoxSize } from './box';

export function createGridColumnsCSS(columns: number): void {
    const style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `.grid-stack-item {min-width: ${100 / columns}%}`
    for(let i = 1; i <= columns; i++) {
        style.innerHTML = `.grid-stack-item[gs-w=${i}] { width: (${(100 / columns) * i }%}`;
        style.innerHTML = `.grid-stack-item[gs-x=${i}] { left: (${(100 / columns) * i }%}`;
        style.innerHTML = `.grid-stack-item[gs-min-w=${i}] { min-width: (${(100 / columns) * i }%}`;
        style.innerHTML = `.grid-stack-item[gs-max-w=${i}] { max-width: (${(100 / columns) * i }%}`;
    }
    document.getElementsByClassName('grid-stack')[0].appendChild(style);
}

export function addBoxCSS(box: Box): void {
    const element = document.querySelectorAll(`[gs-id="${box.id}"]`)[0];
    if (!box.validDimensions) element.classList.add('box--invalid');
    if (box.backSide) element.classList.add('box--backside');
}

export function resetGrid(gridParentElementId: string): void {
    const gridParentElement = document.getElementById(gridParentElementId);

    const gridElement = document.createElement('div');
    gridElement.classList.add('grid-stack')

    if(gridParentElement != null) {
        while (gridParentElement.firstChild) {
            gridParentElement.removeChild(gridParentElement.firstChild);
        }

        gridParentElement.appendChild(gridElement);
    } else console.error('No Grid Element');
}

export function calculateGrid(gridOptions: GridStackOptions, shelf: Shelf, basicBox: Box, userBoxes: Box[]): void {
    const shelfWidth = shelf.width ? shelf.width : 0;
    const columns = shelfWidth;
    const gridElement = document.getElementsByClassName('grid-stack')[0];
    const grid = GridStack.init(gridOptions);

    initGridDragged(grid, userBoxes);
    initGridResize(grid, userBoxes);

    grid.removeAll();
    if(columns > 12) createGridColumnsCSS(columns);
    else gridElement.classList.add(`grid-stack-${columns}`);
	userBoxes.forEach((box) => {
        grid.addWidget(box);
        addBoxCSS(box);
	});
}

export function initGridDragged(grid: GridStack, userBoxes: Box[]): void {
	grid.on("dragstop", (event: Event, element: GridItemHTMLElement) => {
		const node = element.gridstackNode as Box;
        console.log('dragged');
		updateBoxGridPosition(userBoxes, node);
	});
}

export function initGridResize(grid: GridStack, userBoxes: Box[]): void {
	grid.on("resizestop", (event: Event, element: GridItemHTMLElement) => {
		const node = element.gridstackNode as Box;
		updateBoxSize(userBoxes, node);
	});
}
