<template>
	<div>
		<h1>Box System</h1>

		<div>
			<h2>Enter the dimensions of your shelf</h2>

			<label>Shelf Height in mm:</label>
			<input type="number" v-model.number="shelf.height" />

			<label>Shelf Width in mm:</label>
			<input type="number" v-model.number="shelf.width" />

			<label>Shelf Depth in mm:</label>
			<input type="number" v-model.number="shelf.depth" />
		</div>

		<div>
			<h2>Define the dimensions of your basict Box(this will define your smallest item size in the shelf Grid)</h2>
			<p>
				You can define bigger boxes based on your basic box (the dimesnions of your basic box have to be a divider by the maximum of the
				possible processable area of you machine)
			</p>

			<div>
				<select v-model="basicBox.height">
					<option v-for="height in possibleBasicBoxDimensions.heights" :key="height" :value="height">
						{{ height }}
					</option>
				</select>
				<label>basicBoxHeight : {{ basicBox.height }}</label>
			</div>

			<div>
				<select v-model="basicBox.width">
					<option v-for="width in possibleBasicBoxDimensions.widths" :key="width" :value="width">
						{{ width }}
					</option>
				</select>
				<label>basicBoxWidth: {{ basicBox.width }}</label>
			</div>

			<div>
				<label>basicBoxDepth: {{ basicBox.depth }}</label>
			</div>
		</div>


		<div>
			<h2>Box Grid</h2>
			<div class="box-system-grid">
				<div v-for="(box, index) in userBoxes" :key="index" :value="box" :style="getGridStyle(box)" class="box-system-grid__box-container">

					<div class="box-system-grid__box-container__box">{{ box.name }}</div>

				</div>
			</div>
		</div>

		<div>
			<h2>Configure your Boxes</h2>

			<div v-for="(box, index) in userBoxes" :key="index" :value="box" class="box-container">
				<h3>{{ box.name }} Height:{{ box.height }} Width:{{ box.width }}</h3>

				<div>
					<h4>Configure the height and width of the box</h4>

					<select v-model="box.height">
						<option v-for="(height, index) in possibleUserBoxDimesnions.heights" :key="index" :value="height">
							{{ height }}
						</option>
					</select>
					<label>Box height: {{ box.height }}</label>

					<select v-model="box.width">
						<option v-for="(width, index) in possibleUserBoxDimesnions.widths" :key="index" :value="width">
							{{ width }}
						</option>
					</select>
					<label>Box width: {{ box.width }}</label>
				</div>

				<div>
					<h4>Choose if the box should be connected with an other Box to the left or right side</h4>
					<label>
						<input type="checkbox" v-model="box.connectorRight" />
						Connection to the right side
					</label>

					<label>
						<input type="checkbox" v-model="box.connectorLeft" />
						Connection to the left side
					</label>
				</div>

				<div>
					<h4>Choose if the Box should have a backside or not (improves stability)</h4>
					<label>
						<input type="checkbox" v-model="box.backside" />
						Backside
					</label>
				</div>

				<button type="button" @click="downloadSVG(box)">Download SVGs of Box</button>

				<div v-html="makerjs.exporter.toSVG(boxCoordinates(box, material).groundSide)"></div>
			</div>

			<button @click="addBasicBox">Add Box</button>
		</div>

		<div>
			<h3>SVG:</h3>
			<div v-html="svgLeft"></div>
			<div v-html="svgRight"></div>
			<div v-html="svgConnector"></div>
			<div v-html="svgGround"></div>
			<div v-html="svgBack"></div>
		</div>
	</div>
</template>

<script lang="ts">
import { computed, reactive, Ref, ref } from 'vue';

import {
	Box,
	ProcessingArea,
	Shelf,
	BoxDimensions,
	isValidLongHeightAtStep,
	isValidLongWidthAtStep,
	isValidShortHeightAtStep,
	isValidShortWidthAtStep,
	isValidShortDepth,
	isValidLongDepth,
	Material,
	Connector,
} from '../store/calculator';
import { boxCoordinates, Sides } from '../store/boxCoordinates';

import makerjs from 'makerjs';


function getSVG(box: Box, material: Material, side: Sides, svgOptions?: makerjs.exporter.ISVGRenderOptions): string {
    return makerjs.exporter.toSVG(boxCoordinates(box, material)[side], svgOptions)
}

function createBox(shelf: Shelf, possibleBoxDimensions: BoxDimensions): Box {
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

function createTestBox(shelf: Shelf, possibleBoxDimensions: BoxDimensions, gridX: number, gridY: number, height: number, width: number) {
			const box: Box = {
				height: height,
				width: width,
				depth: ref(shelf.depth).value,

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

function addBasicBox(userBoxes: Box[], shelf: Shelf, possibleBoxDimensions: BoxDimensions): void {
    userBoxes.push(createBox(shelf, possibleBoxDimensions));
}

function getMaxGridDimensions(boxes: Box[]): {maxX: number; maxY: number} {
            let maxWidth = 0;
            let maxHeight = 0;
			boxes.forEach((box) => {
				if (box.gridY + box.gridSizeY > maxHeight) maxHeight = box.gridY + box.gridSizeY - 1;
            });
            boxes.forEach((box) => {
				if (box.gridX + box.gridSizeX > maxWidth) maxWidth = box.gridX + box.gridSizeX - 1;
			});
			return {
                maxX: maxWidth,
                maxY: maxHeight
            };
        }

export default {
	name: 'BoxSystem',

	props: {
		processingArea: {
			type: Object as () => ProcessingArea,
			required: true,
		},
		material: {
			type: Object as () => Material,
			required: true,
		},
	},

	setup(props) {
		const processingArea: ProcessingArea = ref(props.processingArea).value;
		const material: Material = ref(props.material).value;

		let shelf: Shelf = reactive({
			height: 0,
			width: 0,
			depth: 0,
		});

		const testShelf = ref<Shelf>({
			height: 2000,
			width: 1800,
			depth: 400,
		});

		const rangeSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

		shelf = testShelf.value;


        let userBoxes: Box[] = [];

		const gridWidth = computed((): number => getMaxGridDimensions(userBoxes).maxX);
		const gridHeight = computed((): number => getMaxGridDimensions(userBoxes).maxY);


		const userBoxesGridSpace = computed((): number => {
			let boxesArea = 0;
			userBoxes.forEach((box) => {
				boxesArea += box.gridSizeX * box.gridSizeY;
			});
			return boxesArea;
		});

		const userBoxesEmptySpaces = computed((): number => {
			const gridArea = gridHeight.value * gridWidth.value;
			return gridArea - userBoxesGridSpace.value;
		});


		const possibleBasicBoxDimensions = computed(
			(): BoxDimensions => {
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
			},
		);

        const basicBox = reactive<Box>(createBox(shelf, possibleBasicBoxDimensions.value));

		const possibleUserBoxDimesnions = computed(
			(): BoxDimensions => {
				return {
					heights: possibleBasicBoxDimensions.value.heights.filter((height) => height >= basicBox.height),
					widths: possibleBasicBoxDimensions.value.widths.filter((width) => width >= basicBox.width),
					depth: possibleBasicBoxDimensions.value.depth,
				};
			},
		);

		const possibleBoxes = computed((): Box[] => {
			const boxes: Box[] = [];

			possibleBasicBoxDimensions.value.heights.forEach((height, hIndex) => {
				possibleBasicBoxDimensions.value.widths.forEach((width, wIndex) => {
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
		});

		const possibleUserBoxes = computed(() => possibleBoxes.value.filter((box) => box.height >= basicBox.height && box.width >= basicBox.width));

		const sameUserBoxes = computed(() => {
			return userBoxes.reduce((acum, box) => Object.assign(acum, { [box.name]: (acum[box.name] || 0) + 1 }), {});
		});


		function downloadSVG(box: Box): void {
			const svgOptions: makerjs.exporter.ISVGRenderOptions = {
				// strokeWidth: '0.1',
				// viewBox: false,
				// origin: [0, -box.width],
				// svgAttrs: {width: box.width, height: box.height},
				// units: 'mm',
			};
			const downloadSVGs = {
                left: getSVG(box, material, Sides.leftSide, svgOptions),
				right: '',
				ground: getSVG(box, material, Sides.groundSide, svgOptions),
				back: '',
				connector: '',
			};

			if (box.connector === 'RIGHT' || box.connector === 'BOTH')
				downloadSVGs.right = getSVG(box, material, Sides.rightSide, svgOptions);
			if (box.connector !== 'NONE') downloadSVGs.connector = getSVG(box, material, Sides.connector, svgOptions);
			if (box.backSide) downloadSVGs.back = getSVG(box, material, Sides.backSide, svgOptions);

			Object.keys(downloadSVGs).forEach((key) => {
				const element = downloadSVGs[key];
				if (element.length <= 0) return;

				console.log(element);

				const a = document.createElement('a');
				a.href = 'data:image/svg; base64, ' + btoa(unescape(encodeURIComponent(element)));
				a.download = `${box.name}-${key}.svg`;
				// a.setAttribute('target', '_blank');
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
			});
		}

		const testUserBoxes = reactive<Array<any>>([
			reactive(createTestBox(shelf, possibleUserBoxDimesnions.value,1, 1, possibleUserBoxDimesnions.value.heights[0], possibleUserBoxDimesnions.value.widths[1])),
			reactive(createTestBox(shelf, possibleUserBoxDimesnions.value,3, 1, possibleUserBoxDimesnions.value.heights[0], possibleUserBoxDimesnions.value.widths[1])),
			reactive(createTestBox(shelf, possibleUserBoxDimesnions.value,2, 2, possibleUserBoxDimesnions.value.heights[1], possibleUserBoxDimesnions.value.widths[1])),
			reactive(createTestBox(shelf, possibleUserBoxDimesnions.value,5, 1, possibleUserBoxDimesnions.value.heights[2], possibleUserBoxDimesnions.value.widths[0])),
			reactive(createTestBox(shelf, possibleUserBoxDimesnions.value,2, 4, possibleUserBoxDimesnions.value.heights[0], possibleUserBoxDimesnions.value.widths[3])),
		]);

		userBoxes = testUserBoxes;

		return {
			shelf,
			testShelf,
			basicBox,
			possibleBasicBoxDimensions,
			possibleBoxes,
			possibleUserBoxes,
			userBoxes,
			gridHeight,
			gridWidth,
			userBoxesEmptySpaces,
			userBoxesGridSpace,
			possibleUserBoxDimesnions,
			sameUserBoxes,
			downloadSVG,
			makerjs,
			boxCoordinates,

			getGridStyle(box: Box): object {

				return {
					'grid-column-start': box.gridX,
					'grid-row-start': -box.gridY,

					// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
					//@ts-ignore
					'grid-column-end': box.gridX + box.gridSizeX,
					// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
					//@ts-ignore
					'grid-row-end': -box.gridY - box.gridSizeY,

				};
			},

			createBox,
			addBasicBox,
		};
	},
};
</script>

<style lang="scss">
.box-system-grid {
	display: grid;

	grid-auto-rows: 300px;
	grid-auto-columns: 300px;

	border: solid 1px;

	width: max-content;

	&__box-container {
		display: grid;
		grid-template-columns: 1fr 10fr 1fr;
		grid-template-rows: 1fr 6fr;

		border: solid 1px;

		&__add--top {
			grid-column: 2/2;
			grid-row: 1;
		}

		&__add--left {
			grid-column: 1/1;
			grid-row: 2;
		}

		&__add--right {
			grid-column: 3/3;
			grid-row: 2;
		}

		&__box {
			grid-column: 2/2;
			grid-row: 2;

			// border: solid 1px;
		}
	}
}

.box-container {
	border: solid 1px;
	margin-bottom: 16px;
}
</style>
