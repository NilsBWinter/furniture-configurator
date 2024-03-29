<template>
	<div class="container--molecule">
		<h1>Shelf System</h1>

		<!-- Button to fill in Testdata -->
		<o-button @click="fillTestData">Fill with Example Data</o-button>

		<div class="container--atom">
			<div class="container--atom__inner">
				<h2>Enter the dimensions of your shelf</h2>

				<o-field :label="`Shelf Height:`">
					<o-input type="number" v-model.number="shelf.height" min=0 oninput="validity.valid||(value='');" />
					<div class="afterSelectText"> 
								{{unitType[unit]}}
							</div>
				</o-field>

				<o-field :label="`Shelf Width:`">
					<o-input type="number" v-model.number="shelf.width" min=0 oninput="validity.valid||(value='');" />
					<div class="afterSelectText"> 
								{{unitType[unit]}}
							</div>
				</o-field>

				<o-field :label="`Shelf Depth:`">
					<o-input type="number" v-model.number="shelf.depth" useHtml5Validation :max="machine.processingArea.longSide" min=0 oninput="validity.valid||(value='');" />
					<div class="afterSelectText"> 
								{{unitType[unit]}}
							</div>
				</o-field>
			</div>
		</div>

		<div class="container--atom">
			<div class="container--atom__inner">
				<h2>
					Define the dimensions of your basic compartment<br/>
					(this will define your smallest item size in the shelf Grid)
				</h2>
				<p>
					You can define bigger boxes based on your basic compartment (the dimesnions of your basic box have to be a divider by the maximum of the
					possible processable area of you machine)
				</p>

				<o-field class="basicBoxSelect" label="Basic compartment Height:">
					<o-select v-model="basicBox.height">
						<option v-for="(height, index) in basicBox.possibleBoxDimensions.heights" :key="index" :value="height">
							{{ height }}
						</option>
					</o-select>
					<div class="afterSelectText"> 
						{{unitType[unit]}}
					</div>
				</o-field>

				<o-field class="basicBoxSelect" label="Basic compartment Width:">
					<o-select v-model="basicBox.width">
						<option v-for="(width, index) in basicBox.possibleBoxDimensions.widths" :key="index" :value="width">
							{{ width }}
						</option>
					</o-select>
					<div class="afterSelectText"> 
						{{unitType[unit]}}
					</div>
				</o-field>

				<o-field label="Basic compartment Depth:">
					<div class="afterSelectText"> 
						{{shelf.depth}} {{unitType[unit]}}
					</div>
				</o-field>
			</div>
		</div>

		<div>
			<h2>Shelf Grid</h2>
			<o-button @click="createBoxToArray(userBoxes, shelf, possibleUserBoxDimensions)">Add compartment</o-button>
			<o-button @click="fillTestBoxes">Add Example compartments</o-button>
			<o-button @click="userBoxes.length = 0">Delete all compartments</o-button>
			<p>{{ info }}</p>
			<div v-if="invalidBoxes.length > 0">You have {{ invalidBoxes.length }} invalid compartments</div>
			<div id="grid">
				<div class="grid-stack"></div>
			</div>
		</div>

		<div v-if="activeBox">
			<h2>Configure your compartments</h2>

			<div class="container--atom">
				<div class="container--atom__inner">

					<h3>Compartment {{activeBox.h}}.{{activeBox.w}} Height:{{ activeBox.height }} Width:{{ activeBox.width }}</h3>

						<h4>Configure the height and width of the compartment</h4>

						<o-field label="compartment height:">
							<o-select v-model="activeBox.height">
								<option v-for="(height, index) in possibleUserBoxDimensions.heights" :key="index" :value="height">
									{{ height }}
								</option>
							</o-select>
							<div class="afterSelectText"> 
								{{unitType[unit]}}
							</div>
						</o-field>

						<o-field label="compartment width:">
							<o-select v-model="activeBox.width">
								<option v-for="(width, index) in possibleUserBoxDimensions.widths" :key="index" :value="width">
									{{ width }}
								</option>
							</o-select>
							<div class="afterSelectText"> 
								{{unitType[unit]}}
							</div>
						</o-field>
							<h4>Choose if the compartment should have a connection on a side</h4>
						<o-field>
							<o-checkbox v-model="activeBox.connectorLeft" variant="warning"> Connection to the left side </o-checkbox>

							<o-checkbox v-model="activeBox.connectorRight" variant="warning"> Connection to the right side </o-checkbox>
						</o-field>
						<h4>Choose if the compartment should have a backside(improves stability)</h4>
						<o-field>
							<o-checkbox v-model="activeBox.backSide" variant="warning"> Backside </o-checkbox>
						</o-field>
						<o-button @click="downloadBoxSVG(activeBox, material, machine, unit)">Download SVGs of compartment</o-button>
						<o-button @click="deleteBox(activeBox)">Delete Box</o-button>
				</div>
			</div>

			<!-- <o-button @click="createBoxToArray(userBoxes, shelf, possibleUserBoxDimensions)">Add Box</o-button> -->
			<o-button @click="downloadBoxesSVG(userBoxes, material, machine, unit)">Download SVGs of all compartments</o-button>
		</div>
		<div v-else> Just click on a Compartment to show its details</div>
	</div>
</template>

<script lang="ts">
import { computed, ComputedRef, onMounted, reactive, ref, watch } from 'vue';

import { Box, Shelf, BoxDimensions, Material, isValidShelf, Machine } from '../logic/calculator';
import { boxCoordinates } from '../logic/boxCoordinates';
import {
	createTestBox,
	createBox,
	createBoxToArray,
	calculatePossibleBasicBoxDimensions,
	calculatePossibleUserBoxDimensions,
	updatBoxDimensions,
} from '../logic/box';
import { calculateGrid, resetGrid } from '../logic/boxGrid';
import { downloadBoxSVG, downloadBoxesSVG, getSVG } from '../logic/svg';

import GridStack from 'gridstack/dist/gridstack-h5.js';
import 'gridstack/dist/gridstack.css';
import 'gridstack/dist/gridstack-extra.css';
import { GridStackOptions } from 'gridstack';
import { unitType } from 'makerjs';
import { useStore } from 'vuex';

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
            type: String,
            default: 'Millimeter',
        },
	},

	setup(props) {

		const store = useStore();

		const activeBox = computed(() => store.state.activeBox);
		const basicBoxSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
		const userBoxSteps = [1, 2, 3, 4, 5];

		const materialRef = ref<Material>(props.material);

		const machine = reactive<Machine>(props.machine);

		let mounted = false;

		const shelf = reactive<Shelf>({});

		let userBoxes = reactive<Box[]>([]);

		const gridItemButtons = computed(() => document.getElementsByClassName('gridItem__button'));

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

			const gridButtons = (document.getElementsByClassName('griditem__button'));
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

		function deleteBox() {
			const box = activeBox.value;
			userBoxes = userBoxes.filter((b) => b.id !== box.id);
			console.log(userBoxes);
			resetGrid('grid');
			calculateGrid(gridOptions(shelf, basicBox), shelf, basicBox, userBoxes);
			store.commit('setActiveBox', undefined);
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
			activeBox,
			gridItemButtons,

			// Functions
			createBox,
			getSVG,
			createBoxToArray,
			fillTestData,
			fillTestBoxes,
			deleteBox,
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

	// margin: 16px;

	&-item {
		border: 3px solid;

		&-content {
			position: relative !important;
			inset: 0 !important;
			height: 100%;

			display: flex;
			// flex-direction: column;
			justify-content: center;

			background-color: var(--color-primary-light);

			& button {
				width: 100%;

				background-color: var(--color-primary-light);
			}
		}
	}
}

.basicBoxSelect {
	.o-control-select {
		right: 0;
	}
}
</style>
