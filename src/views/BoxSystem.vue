<template>
	<div>
		<h1>Box System</h1>

		<div>
			<h2>Enter the dimensions of your shelf</h2>

			<o-field label="Shelf Height in mm:">
                <o-input type="number" v-model.number="shelf.height" rounded />
            </o-field>

			<o-field label="Shelf Width in mm:">
                <o-input type="number" v-model.number="shelf.width" rounded />
            </o-field>

			<o-field label="Shelf Depth in mm:">
                <o-input type="number" v-model.number="shelf.depth" rounded />
            </o-field>
		</div>

		<div>
			<h2>Define the dimensions of your basict Box(this will define your smallest item size in the shelf Grid)</h2>
			<p>
				You can define bigger boxes based on your basic box (the dimesnions of your basic box have to be a divider by the maximum of the
				possible processable area of you machine)
			</p>

			<div>
				<o-field label="basicBoxHeight:">
					<o-select v-model="basicBox.height" rounded>
						<option v-for="height in possibleBasicBoxDimensions.heights" :key="height" :value="height">
							{{ height }}
						</option>
					</o-select>
				</o-field>
			</div>

			<div>
				<o-field label="basicBoxHeight:">
					<o-select v-model="basicBox.width" rounded>
						<option v-for="width in possibleBasicBoxDimensions.widths" :key="width" :value="width">
							{{ width }}
						</option>
					</o-select>
				</o-field>
			</div>

			<div>
				<o-field label="basicBoxDepth:">{{ basicBox.depth }}</o-field>
			</div>
		</div>

		<div>
			<h2>Box Grid</h2>
			<p>{{info}}</p>
			<div v-if="invalidBoxes.length > 0">You have {{invalidBoxes.length}} invalid Boxes</div>
			<div class="grid-stack"></div>
		</div>

		<div>
			<h2>Configure your Boxes</h2>

			<div v-for="(box, index) in userBoxes" :key="index" :value="box" class="box-container">
				<h3>{{ box.content }} Height:{{ box.height }} Width:{{ box.width }}</h3>

				<div>
					<h4>Configure the height and width of the box</h4>

					<o-field label="Box height:">
						<o-select v-model="box.height" rounded>
							<option v-for="(height, index) in possibleUserBoxDimensions.heights" :key="index" :value="height">
								{{ height }}
							</option>
						</o-select>
					</o-field>

					<o-field label="Box width:">
						<o-select v-model="box.width" rounded>
							<option v-for="(width, index) in possibleUserBoxDimensions.widths" :key="index" :value="width">
								{{ width }}
							</option>
						</o-select>
					</o-field>
				</div>

				<div>
					<h4>Choose if the box should be connected with an other Box to the left or right side</h4>

					<o-checkbox v-model="box.connectorLeft">
						Connection to the left side
					</o-checkbox>

					<o-checkbox v-model="box.connectorRight">
						Connection to the right side
					</o-checkbox>
				</div>

				<div>
					<h4>Choose if the Box should have a backside or not (improves stability)</h4>

					<o-checkbox v-model="box.backSide">
						Backside
					</o-checkbox>
				</div>

				<o-button @click="downloadSVG(box, materialRef)">Download SVGs of Box</o-button>

				<div v-html="getSVG(box, materialRef, 'groundSide')"></div>
			</div>

			<o-button @click="addBasicBox">Add Box</o-button>
		</div>
	</div>
</template>

<script lang="ts">
import { computed, onMounted, reactive, ref, Ref, watch} from 'vue';

import { Box, ProcessingArea, Shelf, BoxDimensions, Material } from '../store/calculator';
import { boxCoordinates } from '../store/boxCoordinates';
import {
	createTestBox,
	createBox,
	// addBasicBox,
	calculatePossibleBasicBoxDimensions,
	// calculatePossibleBoxes,
	calculatePossibleUserBoxDimensions,
  updatBoxDimensions,
} from '../store/box';
import {  createGridColumnsCSS } from '../store/boxGrid';
// import { calculateBoxesGridArea, getMaxGridDimensions } from '../store/boxGrid';
import { downloadSVG, getSVG } from '../store/svg';
import { getGridStyle } from '../store/style'


import GridStack from 'gridstack/dist/gridstack-h5.js'
import "gridstack/dist/gridstack.css";
import { GridStackOptions } from 'gridstack';

function createTestBoxes(shelf: Shelf, possibleUserBoxDimensions: Ref<BoxDimensions>): Box[] {
	return reactive<Array<Box>>([
			reactive(
				createTestBox(
					shelf,
					possibleUserBoxDimensions.value,
					0,
					possibleUserBoxDimensions.value.heights.length,
					possibleUserBoxDimensions.value.heights[0],
					possibleUserBoxDimensions.value.widths[1],
				),
			),
			reactive(
				createTestBox(
					shelf,
					possibleUserBoxDimensions.value,
					2,
					possibleUserBoxDimensions.value.heights.length,
					possibleUserBoxDimensions.value.heights[0],
					possibleUserBoxDimensions.value.widths[1],
				),
			),
			reactive(
				createTestBox(
					shelf,
					possibleUserBoxDimensions.value,
					1,
					possibleUserBoxDimensions.value.heights.length,
					possibleUserBoxDimensions.value.heights[1],
					possibleUserBoxDimensions.value.widths[1],
				),
			),
			reactive(
				createTestBox(
					shelf,
					possibleUserBoxDimensions.value,
					4,
					possibleUserBoxDimensions.value.heights.length,
					possibleUserBoxDimensions.value.heights[2],
					possibleUserBoxDimensions.value.widths[0],
				),
			),
			reactive(
				createTestBox(
					shelf,
					possibleUserBoxDimensions.value,
					possibleUserBoxDimensions.value.widths.length,
					possibleUserBoxDimensions.value.heights.length,
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

function calculateGrid(shelf: Shelf, basicBox: Box, userBoxes: Box[]) {
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

		let mounted = false;

		let shelf = reactive<Shelf>({
			height: 0,
			width: 0,
			depth: 0,
		});

		shelf = testShelf.value;

		// let userBoxes: Box[] = [];

		const possibleBasicBoxDimensions = computed((): BoxDimensions => calculatePossibleBasicBoxDimensions(shelf, processingArea, rangeSteps));

		const basicBox = reactive<Box>(createBox(shelf, possibleBasicBoxDimensions.value));

		const possibleUserBoxDimensions = computed(
			(): BoxDimensions => calculatePossibleUserBoxDimensions(possibleBasicBoxDimensions.value, basicBox),
		);

		const userBoxes = reactive<Box[]>(createTestBoxes(shelf, possibleUserBoxDimensions));

		const info = ref('');

		const invalidBoxes = ref<Box[]>([]);

		onMounted(() => {
			mounted = true;

			calculateGrid(shelf, basicBox, userBoxes);

			GridStack.init().on("dragstop", (event, element) => {
				const node = element.gridstackNode;
				// `this` will only access your Vue instance if you used an arrow function, otherwise `this` binds to window scope. see https://hacks.mozilla.org/2015/06/es6-in-depth-arrow-functions/
				info.value = `you just dragged node #${node.id} to ${node.x},${node.y} – good job!`;
			});
		})

		watch([shelf, basicBox, userBoxes], () => {
			if(mounted) {
				calculateGrid(shelf, basicBox, userBoxes);
			}
		})

		watch(possibleUserBoxDimensions, (newBoxDimesnions) => {
			userBoxes.forEach((box) => updatBoxDimensions(box, newBoxDimesnions));
		})

		watch(userBoxes, () => {
			const boxes: Box[] = [];
			userBoxes.forEach((box: Box) => {
				if(!box.validDimensions) boxes.push(box);
			})
			invalidBoxes.value = boxes;
		})

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
			// addBasicBox,
			createBox,
			getSVG,
			invalidBoxes,
			info
		};

	},

};
</script>

<style lang="scss">
:root {
	--gridstack-columns: 12;
}

.grid-stack {
	border: 1px solid blue;

	&-item {
		border: 1px solid;

		// min-width: (100% / var(--gristack-columns));

		// @for $i from 1 through var(--gristack-columns) {
		// 	&[gs-w='#{$i}'] { width: (100% / var(--gristack-columns)) * $i; }
		// 	&[gs-x='#{$i}'] { left: (100% / var(--gristack-columns)) * $i; }
		// 	&[gs-min-w='#{$i}'] { min-width: (100% / var(--gristack-columns)) * $i; }
		// 	&[gs-max-w='#{$i}'] { max-width: (100% / var(--gristack-columns)) * $i; }
		// }
	}
}


.box-container {
	border: solid 1px;
	margin-bottom: 16px;
}
</style>
