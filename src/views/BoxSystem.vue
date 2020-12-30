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
						<option v-for="(height, index) in possibleUserBoxDimensions.heights" :key="index" :value="height">
							{{ height }}
						</option>
					</select>
					<label>Box height: {{ box.height }}</label>

					<select v-model="box.width">
						<option v-for="(width, index) in possibleUserBoxDimensions.widths" :key="index" :value="width">
							{{ width }}
						</option>
					</select>
					<label>Box width: {{ box.width }}</label>
				</div>

				<div>
					<h4>Choose if the box should be connected with an other Box to the left or right side</h4>
					<label>
						<input type="checkbox" v-model="box.connectorLeft" />
						Connection to the left side
					</label>

					<label>
						<input type="checkbox" v-model="box.connectorRight" />
						Connection to the right side
					</label>
				</div>

				<div>
					<h4>Choose if the Box should have a backside or not (improves stability)</h4>
					<label>
						<input type="checkbox" v-model="box.backSide" />
						Backside
					</label>
				</div>

				<button type="button" @click="downloadSVG(box, materialRef)">Download SVGs of Box</button>

				<div v-html="getSVG(box, materialRef, 'groundSide')"></div>
			</div>

			<button @click="addBasicBox">Add Box</button>
		</div>

		<!-- <div>
			<h3>SVG:</h3>
			<div v-html="svgLeft"></div>
			<div v-html="svgRight"></div>
			<div v-html="svgConnector"></div>
			<div v-html="svgGround"></div>
			<div v-html="svgBack"></div>
		</div> -->
	</div>
</template>

<script lang="ts">
import { computed, reactive, ref, Ref} from 'vue';
import makerjs from 'makerjs';

import { Box, ProcessingArea, Shelf, BoxDimensions, Material } from '../store/calculator';
import { boxCoordinates } from '../store/boxCoordinates';
import {
	createTestBox,
	createBox,
	addBasicBox,
	calculatePossibleBasicBoxDimensions,
	// calculatePossibleBoxes,
	calculatePossibleUserBoxDimensions,
} from '../store/box';
// import { calculateBoxesGridArea, getMaxGridDimensions } from '../store/boxGrid';
import { downloadSVG, getSVG } from '../store/svg';
import { getGridStyle } from '../store/style'

function createTestBoxes(shelf: Shelf, possibleUserBoxDimensions: Ref<BoxDimensions>): Box[] {
	return reactive<Array<Box>>([
			reactive(
				createTestBox(
					shelf,
					possibleUserBoxDimensions.value,
					1,
					1,
					possibleUserBoxDimensions.value.heights[0],
					possibleUserBoxDimensions.value.widths[1],
				),
			),
			reactive(
				createTestBox(
					shelf,
					possibleUserBoxDimensions.value,
					3,
					1,
					possibleUserBoxDimensions.value.heights[0],
					possibleUserBoxDimensions.value.widths[1],
				),
			),
			reactive(
				createTestBox(
					shelf,
					possibleUserBoxDimensions.value,
					2,
					2,
					possibleUserBoxDimensions.value.heights[1],
					possibleUserBoxDimensions.value.widths[1],
				),
			),
			reactive(
				createTestBox(
					shelf,
					possibleUserBoxDimensions.value,
					5,
					1,
					possibleUserBoxDimensions.value.heights[2],
					possibleUserBoxDimensions.value.widths[0],
				),
			),
			reactive(
				createTestBox(
					shelf,
					possibleUserBoxDimensions.value,
					2,
					4,
					possibleUserBoxDimensions.value.heights[0],
					possibleUserBoxDimensions.value.widths[3],
				),
			),
		]);
}

const testShelf = ref<Shelf>({
	height: 2000,
	width: 1800,
	depth: 400,
});

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
		const rangeSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

		const processingArea: ProcessingArea = ref(props.processingArea).value;
		const materialRef = ref<Material>(props.material);

		let shelf: Shelf = reactive({
			height: 0,
			width: 0,
			depth: 0,
		});

		shelf = testShelf.value;

		let userBoxes: Box[] = [];

		// const gridWidth = computed((): number => getMaxGridDimensions(userBoxes).maxX);
		// const gridHeight = computed((): number => getMaxGridDimensions(userBoxes).maxY);

		// const userBoxesGridSpace = computed((): number => calculateBoxesGridArea(userBoxes));

		// const userBoxesEmptySpaces = computed((): number => {
		// 	const gridArea = gridHeight.value * gridWidth.value;
		// 	return gridArea - userBoxesGridSpace.value;
		// });

		const possibleBasicBoxDimensions = computed((): BoxDimensions => calculatePossibleBasicBoxDimensions(shelf, processingArea, rangeSteps));

		const basicBox = reactive<Box>(createBox(shelf, possibleBasicBoxDimensions.value));

		const possibleUserBoxDimensions = computed(
			(): BoxDimensions => calculatePossibleUserBoxDimensions(possibleBasicBoxDimensions.value, basicBox),
		);

		// const possibleBoxes = computed((): Box[] => calculatePossibleBoxes(possibleBasicBoxDimensions.value, basicBox));

		// const possibleUserBoxes = computed(() => possibleBoxes.value.filter((box) => box.height >= basicBox.height && box.width >= basicBox.width));

		// const sameUserBoxes = computed(() => {
		// 	return userBoxes.reduce((acum, box) => ({...acum, [box.name]: (acum[box.name] || 0) + 1 }), {});
		// });

		userBoxes = createTestBoxes(shelf, possibleUserBoxDimensions);

		return {
			shelf,
			// testShelf,
			basicBox,
			possibleBasicBoxDimensions,
			// possibleBoxes,
			// possibleUserBoxes,
			userBoxes,
			// gridHeight,
			// gridWidth,
			// userBoxesEmptySpaces,
			// userBoxesGridSpace,
			possibleUserBoxDimensions,
			// sameUserBoxes,
			downloadSVG,
			boxCoordinates,
			materialRef,

			getGridStyle,

			// Functions
			addBasicBox,
			createBox,
			getSVG,
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
