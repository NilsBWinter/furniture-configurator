<template>
	<div class="container--molecule">
		<h1>Box System</h1>

		<!-- Button to fill in Testdata -->
		<o-button @click="fillTestData">Fill with Example Data</o-button>

		<div class="container--atom">
			<div class="container--atom__inner">
				<h2>Enter the dimensions of your shelf</h2>

				<o-field :label="`Shelf Height in ${unitType[unit]}:`">
					<o-input type="number" v-model.number="shelf.height" />
				</o-field>

				<o-field :label="`Shelf Width in ${unitType[unit]}:`">
					<o-input type="number" v-model.number="shelf.width" />
				</o-field>

				<o-field :label="`Shelf Depth in ${unitType[unit]}:`">
					<o-input type="number" v-model.number="shelf.depth" useHtml5Validation :max="machine.processingArea.longSide" />
				</o-field>
			</div>
		</div>

		<div class="container--atom">
			<div class="container--atom__inner">
				<h2>
					Define the dimensions of your basic Box<br/>
					(this will define your smallest item size in the shelf Grid)
				</h2>
				<p>
					You can define bigger boxes based on your basic box (the dimesnions of your basic box have to be a divider by the maximum of the
					possible processable area of you machine)
				</p>

				<o-field class="basicBoxSelect" label="BasicBox Height:">
					<o-select v-model="basicBox.height">
						<option v-for="(height, index) in basicBox.possibleBoxDimensions.heights" :key="index" :value="height">
							{{ index + 1 }}
						</option>
					</o-select>
					<div class="afterSelectText"> 
						a height of {{ basicBox.height }} {{unitType[unit]}}
					</div>
				</o-field>

				<o-field class="basicBoxSelect" label="BasicBox Width:">
					<o-select v-model="basicBox.width">
						<option v-for="(width, index) in basicBox.possibleBoxDimensions.widths" :key="index" :value="width">
							{{ index + 1 }}
						</option>
					</o-select>
					<div class="afterSelectText"> 
						a width of {{ basicBox.width }} {{unitType[unit]}}
					</div>
				</o-field>

				<o-field label="BasicBox Depth:">a depth of {{ basicBox.depth }} {{unitType[unit]}}</o-field>
			</div>
		</div>

		<div>
			<h2>Box Grid</h2>
			<o-button @click="createBoxToArray(userBoxes, shelf, possibleUserBoxDimensions)">Add Box</o-button>
			<o-button @click="fillTestBoxes">Add Example Boxes</o-button>
			<o-button @click="userBoxes.length = 0">Delete all Boxes</o-button>
			<p>{{ info }}</p>
			<div v-if="invalidBoxes.length > 0">You have {{ invalidBoxes.length }} invalid Boxes</div>
			<div id="grid">
				<div class="grid-stack"></div>
			</div>
		</div>

		<div>
			<h2>Configure your Boxes</h2>

			<div v-for="(box, index) in userBoxes" :key="index" :value="box" class="container--atom">
				<div class="container--atom__inner">

					<h3>{{ box.content }} Height:{{ box.height }} Width:{{ box.width }}</h3>

						<h4>Configure the height and width of the box</h4>

						<o-field label="Box height:">
							<o-select v-model="box.height">
								<option v-for="(height, index) in possibleUserBoxDimensions.heights" :key="index" :value="height">
									{{ index + 1 }}
								</option>
							</o-select>
							a height of {{ box.height }} {{unitType[unit]}}
						</o-field>

						<o-field label="Box width:">
							<o-select v-model="box.width">
								<option v-for="(width, index) in possibleUserBoxDimensions.widths" :key="index" :value="width">
									{{ index + 1 }}
								</option>
							</o-select>
							<div class="afterSelectText"> 
								a width of {{ box.width }} {{unitType[unit]}}
							</div>
						</o-field>
							<h4>Choose if the box should have a connection on a side</h4>
						<o-field>
							<o-checkbox v-model="box.connectorLeft"> Connection to the left side </o-checkbox>

							<o-checkbox v-model="box.connectorRight"> Connection to the right side </o-checkbox>
						</o-field>
						<h4>Choose if the Box should have a backside(improves stability)</h4>
						<o-field>
							<o-checkbox v-model="box.backSide"> Backside </o-checkbox>
						</o-field>
						<o-button @click="downloadBoxSVG(box, material, machine, unit)">Download SVGs of Box</o-button>
				</div>
			</div>

			<o-button @click="createBoxToArray(userBoxes, shelf, possibleUserBoxDimensions)">Add Box</o-button>
			<o-button @click="downloadBoxesSVG(userBoxes, material, machine, unit)">Download SVGs of all Boxes</o-button>
		</div>
	</div>
</template>

<script lang="ts">
import { computed, ComputedRef, onMounted, reactive, ref, watch } from 'vue';

import { Box, Shelf, BoxDimensions, Material, isValidShelf, Machine } from '../store/calculator';
import { boxCoordinates } from '../store/boxCoordinates';
import {
	createTestBox,
	createBox,
	createBoxToArray,
	calculatePossibleBasicBoxDimensions,
	calculatePossibleUserBoxDimensions,
	updatBoxDimensions,
} from '../store/box';
import { calculateGrid, resetGrid } from '../store/boxGrid';
import { downloadBoxSVG, downloadBoxesSVG, getSVG } from '../store/svg';

import GridStack from 'gridstack/dist/gridstack-h5.js';
import 'gridstack/dist/gridstack.css';
import 'gridstack/dist/gridstack-extra.css';
import { GridStackOptions } from 'gridstack';
import { unitType } from 'makerjs';

function createTestBoxes(shelf: Shelf, possibleUserBoxDimensions: BoxDimensions): Box[] {
	return reactive<Array<Box>>([
		reactive(
			createTestBox(
				shelf,
				possibleUserBoxDimensions,
				0,
				possibleUserBoxDimensions.heights.length,
				possibleUserBoxDimensions.heights[0],
				possibleUserBoxDimensions.widths[1],
			),
		),
		reactive(
			createTestBox(
				shelf,
				possibleUserBoxDimensions,
				2,
				possibleUserBoxDimensions.heights.length,
				possibleUserBoxDimensions.heights[0],
				possibleUserBoxDimensions.widths[1],
			),
		),
		reactive(
			createTestBox(
				shelf,
				possibleUserBoxDimensions,
				1,
				possibleUserBoxDimensions.heights.length,
				possibleUserBoxDimensions.heights[1],
				possibleUserBoxDimensions.widths[1],
			),
		),
		reactive(
			createTestBox(
				shelf,
				possibleUserBoxDimensions,
				4,
				possibleUserBoxDimensions.heights.length,
				possibleUserBoxDimensions.heights[2],
				possibleUserBoxDimensions.widths[0],
			),
		),
		reactive(
			createTestBox(
				shelf,
				possibleUserBoxDimensions,
				possibleUserBoxDimensions.widths.length,
				possibleUserBoxDimensions.heights.length,
				possibleUserBoxDimensions.heights[0],
				possibleUserBoxDimensions.widths[3],
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
		machine: {
			type: Object as () => Machine,
			required: true,
		},
		material: {
			type: Object as () => Material,
			required: true,
		},
		unit: {
            type: Object as () => typeof unitType,
            default: 'Millimeter',
        },
	},

	setup(props) {
		const basicBoxSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const userBoxSteps = [1, 2, 3, 4, 5];

		const materialRef = ref<Material>(props.material);

		const machine = reactive<Machine>(props.machine);

		let mounted = false;

		const shelf = reactive<Shelf>({});

		const userBoxes = reactive<Box[]>([]);

		const possibleBasicBoxDimensions = computed(
			(): BoxDimensions => calculatePossibleBasicBoxDimensions(shelf, machine, basicBoxSteps),
		);

		const basicBox = reactive<Box>(createBox(shelf, possibleBasicBoxDimensions.value));

		const possibleUserBoxDimensions: ComputedRef<BoxDimensions> = computed(
			(): BoxDimensions => calculatePossibleUserBoxDimensions(shelf, machine.processingArea, basicBox, userBoxSteps),
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
			if (isValidShelf(shelf, machine)) {
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

		function fillTestBoxes(): void {
			if(possibleUserBoxDimensions.value.heights.length > 0) {
				const testBoxes = reactive<Box[]>(createTestBoxes(shelf, possibleUserBoxDimensions.value));
				testBoxes.forEach((box) => userBoxes.push(box));
			}
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
			unitType,

			// Functions
			createBox,
			getSVG,
			createBoxToArray,
			fillTestData,
			fillTestBoxes,
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
	border: 1px solid var(--color-primary-dark);
	border-radius: 4px;

	margin: 16px;

	&-item {
		border: 3px solid;

		&-content {
			display: flex;
			flex-direction: column;
			justify-content: center;

			background-color: var(--color-primary-light);
		}
	}
}

.basicBoxSelect {
	.o-control-select {
		right: 0;
	}
}
</style>
