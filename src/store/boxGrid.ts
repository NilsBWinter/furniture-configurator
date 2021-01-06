import { Shelf, Box } from './calculator';
import GridStack from 'gridstack/dist/gridstack-h5.js';

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

export function calculateGrid(grid: GridStack, shelf: Shelf, basicBox: Box, userBoxes: Box[]): void {

	grid.removeAll();

	createGridColumnsCSS(shelf.width / basicBox.width);
	userBoxes.forEach((box) => {
		grid.addWidget(box);
	});

}
