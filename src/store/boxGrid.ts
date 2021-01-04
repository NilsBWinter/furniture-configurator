
import  { GridStackOptions, GridStack} from 'gridstack';
import { Shelf, Box } from './calculator';

export function calculateGrid(shelf: Shelf, basicBox: Box, userBoxes: Box[]) {
	const gridOptions: GridStackOptions = {
		// column: shelf.width / basicBox.width,
		minRow: 1,
		maxRow: shelf.height / basicBox.height,
		disableOneColumnMode: true,
		float: true,
		cellHeight: `50px`,
	}
	const grid = GridStack.init(gridOptions);
	grid.removeAll();

	createGridColumnsCSS(shelf.width / basicBox.width);
	userBoxes.forEach((box) => {
		grid.addWidget(box);
	});

}

export function createGridColumnsCSS(columns: number) {
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