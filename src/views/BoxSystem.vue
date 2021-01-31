<template>
	<div>
		<h1>Box System</h1>

		<!-- Button to fill in Testdata -->
		<o-button @click="fillTestData">Fill with Example Data</o-button>

		<div class="box-container">
			<h2>Enter the dimensions of your shelf</h2>

			<o-field label="Shelf Height in mm:">
				<o-input type="number" v-model.number="shelf.height" rounded />
			</o-field>

			<o-field label="Shelf Width in mm:">
				<o-input type="number" v-model.number="shelf.width" rounded />
			</o-field>

			<o-field label="Shelf Depth in mm:">
				<o-input type="number" v-model.number="shelf.depth" rounded useHtml5Validation :max="processingArea.longSide" />
			</o-field>
		</div>

		<div class="box-container">
			<h2>Define the dimensions of your basict Box(this will define your smallest item size in the shelf Grid)</h2>
			<p>
				You can define bigger boxes based on your basic box (the dimesnions of your basic box have to be a divider by the maximum of the
				possible processable area of you machine)
			</p>

			<o-field label="basicBoxHeight:">
				<o-select v-model="basicBox.height" rounded>
					<option v-for="(height, index) in basicBox.possibleBoxDimensions.heights" :key="index" :value="height">
						{{ index + 1 }}
					</option>
				</o-select>
				corresponds to a height of {{ basicBox.height }} mm
			</o-field>

			<o-field label="basicBoxWidth:">
				<o-select v-model="basicBox.width" rounded>
					<option v-for="(width, index) in basicBox.possibleBoxDimensions.widths" :key="index" :value="width">
						{{ index + 1 }}
					</option>
				</o-select>
				corresponds to a width of {{ basicBox.width }} mm
			</o-field>

			<o-field label="basicBoxDepth:">{{ basicBox.depth }}</o-field>
		</div>

		<div>
			<h2>Box Grid</h2>
			<o-button @click="createBoxToArray(userBoxes, shelf, possibleUserBoxDimensions)">Add Box</o-button>
			<p>{{ info }}</p>
			<div v-if="invalidBoxes.length > 0">You have {{ invalidBoxes.length }} invalid Boxes</div>
			<div id="grid">
				<div class="grid-stack"></div>
			</div>
		</div>

		<div>
			<h2>Configure your Boxes</h2>

			<div v-for="(box, index) in userBoxes" :key="index" :value="box" class="box-container">
				<h3>{{ box.content }} Height:{{ box.height }} Width:{{ box.width }}</h3>

				<div class="box-container-field">
					<h4>Configure the height and width of the box</h4>

					<o-field label="Box height:">
						<o-select v-model="box.height" rounded>
							<option v-for="(height, index) in possibleUserBoxDimensions.heights" :key="index" :value="height">
								{{ index + 1 }}
							</option>
						</o-select>
						corresponds to a height of {{ box.height }} mm
					</o-field>

					<o-field label="Box width:">
						<o-select v-model="box.width" rounded>
							<option v-for="(width, index) in possibleUserBoxDimensions.widths" :key="index" :value="width">
								{{ index + 1 }}
							</option>
						</o-select>
						corresponds to a width of {{ box.width }} mm
					</o-field>
				</div>

				<div>
					<h4>Choose if the box should be connected with an other Box to the left or right side</h4>

					<o-checkbox v-model="box.connectorLeft"> Connection to the left side </o-checkbox>

					<o-checkbox v-model="box.connectorRight"> Connection to the right side </o-checkbox>
				</div>

				<div>
					<h4>Choose if the Box should have a backside or not (improves stability)</h4>

					<o-checkbox v-model="box.backSide"> Backside </o-checkbox>
				</div>

				<o-button @click="downloadSVG(box, materialRef)">Download SVGs of Box</o-button>
			</div>

			<o-button @click="createBoxToArray(userBoxes, shelf, possibleUserBoxDimensions)">Add Box</o-button>
			<o-button @click="downloadBoxesSVG(userBoxes, material)">Download SVGs of all Boxes</o-button>
		</div>
	</div>
</template>

<script lang="ts">
import { computed, ComputedRef, onMounted, reactive, ref, Ref, watch } from 'vue';

import { Box, ProcessingArea, Shelf, BoxDimensions, Material, isValidShelf } from '../store/calculator';
import { boxCoordinates } from '../store/boxCoordinates';
import {
	createTestBox,
	createBox,
	createBoxToArray,
	calculatePossibleBasicBoxDimensions,
	calculatePossibleUserBoxDimensions,
	updatBoxDimensions,
} from '../store/box';
import { calculateGrid, resetGrid, initGridDragged, initGridResize } from '../store/boxGrid';
import { downloadBoxSVG, downloadBoxesSVG, getSVG } from '../store/svg';

import GridStack from 'gridstack/dist/gridstack-h5.js';
import 'gridstack/dist/gridstack.css';
import 'gridstack/dist/gridstack-extra.css';
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

const testShelf = reactive<Shelf>({
	height: 2000,
	width: 3000,
	depth: 400,
});

function gridOptions(shelf: Shelf, basicBox: Box): GridStackOptions {
	const shelfHeight = shelf.height ? shelf.height : 0;
	const shelfWidth = shelf.width ? shelf.width : 0;

	return {
		column: shelfWidth / basicBox.width,
		row: shelfHeight / basicBox.height,
		disableOneColumnMode: true,
		float: true,
		cellHeight: `50px`,
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
		const basicBoxSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const userBoxSteps = [1, 2, 3, 4, 5];

		const materialRef = ref<Material>(props.material);

		let mounted = false;

		const shelf = reactive<Shelf>({});

		const userBoxes = reactive<Box[]>([]);

		const possibleBasicBoxDimensions = computed(
			(): BoxDimensions => calculatePossibleBasicBoxDimensions(shelf, props.processingArea, basicBoxSteps),
		);

		const basicBox = reactive<Box>(createBox(shelf, possibleBasicBoxDimensions.value));

		const possibleUserBoxDimensions: ComputedRef<BoxDimensions> = computed(
			(): BoxDimensions => calculatePossibleUserBoxDimensions(shelf, props.processingArea, basicBox, userBoxSteps),
		);

		// const userBoxes = reactive<Box[]>(createTestBoxes(shelf, possibleUserBoxDimensions));

		const info = ref('');

		const invalidBoxes = ref<Box[]>([]);

		let grid: GridStack;

		onMounted(() => {
			mounted = true;

			grid = GridStack.init(gridOptions(shelf, basicBox));

			calculateGrid(grid, shelf, basicBox, userBoxes);
		});

		watch(shelf, () => {
			if (isValidShelf(shelf, props.processingArea)) {
				basicBox.possibleBoxDimensions = possibleBasicBoxDimensions.value;
				basicBox.height = basicBox.possibleBoxDimensions.heights[0];
				basicBox.width = basicBox.possibleBoxDimensions.widths[0];
				basicBox.depth = shelf.depth ? shelf.depth : 0;
			}
		});

		watch([shelf, basicBox, userBoxes], () => {
			if (mounted) {
				// TODO change rows & columns of grid based on basic box
				resetGrid('grid');
				calculateGrid(gridOptions(shelf, basicBox), shelf, basicBox, userBoxes);
			}
		});

		watch(possibleUserBoxDimensions, (newBoxDimesnions) => {
			if (mounted) {
				userBoxes.forEach((box) => updatBoxDimensions(box, newBoxDimesnions));
			}
		});

		watch(userBoxes, () => {
			const boxes: Box[] = [];
			userBoxes.forEach((box: Box) => {
				if (!box.validDimensions) boxes.push(box);
			});
			invalidBoxes.value = boxes;
		});

		function fillTestData(): void {
			shelf.height = testShelf.height;
			shelf.width = testShelf.width;
			shelf.depth = testShelf.depth;
		}

		return {
			shelf,
			basicBox,
			possibleBasicBoxDimensions,
			userBoxes,
			possibleUserBoxDimensions,
			downloadBoxSVG,
			downloadBoxesSVG,
			boxCoordinates,
			materialRef,
			invalidBoxes,
			info,

			// Functions
			createBox,
			getSVG,
			createBoxToArray,
			fillTestData,
		};
	},
};
</script>

<style lang="scss">
:root {
	--gridstack-columns: 12;
}

.box {
	&--invalid {
		background: repeating-linear-gradient(45deg, rgb(168, 40, 40), rgb(168, 40, 40) 10px, hsla(0, 0%, 100%, 0) 10px, hsla(0, 0%, 100%, 0) 20px);
	}

	&--backside {
		background-color: black;
	}
}

.grid-stack {
	border: 1px solid blue;

	&-item {
		border: 3px solid;

		&-content {
			display: flex;
			flex-direction: column;
			justify-content: center;

			background-color: white;
		}
	}
}
</style>
