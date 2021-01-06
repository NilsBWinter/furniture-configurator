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
			<o-button @click="createBoxToArray(userBoxes, shelf, possibleUserBoxDimensions)">Add Box</o-button>
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

				<!-- <div v-html="getSVG(box, materialRef, 'groundSide')"></div> -->
			</div>

			<o-button @click="createBoxToArray(userBoxes, shelf, possibleUserBoxDimensions)">Add Box</o-button>
			<o-button @click="downloadBoxesSVG(userBoxes, material)">Download SVGs of all Boxes</o-button>
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
	createBoxToArray,
	calculatePossibleBasicBoxDimensions,
	calculatePossibleUserBoxDimensions,
  updatBoxDimensions,
  initGridDragged,
  initGridResize,
} from '../store/box';
import {  calculateGrid } from '../store/boxGrid';
import { downloadBoxSVG, downloadBoxesSVG, getSVG } from '../store/svg';



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

		const gridOptions: GridStackOptions = {
			// column: shelf.width / basicBox.width,
			minRow: 1,
			maxRow: shelf.height / basicBox.height,
			disableOneColumnMode: true,
			float: true,
			cellHeight: `50px`,
		}
		let grid: GridStack;

		onMounted(() => {
			mounted = true;

			grid = GridStack.init(gridOptions);

			calculateGrid(grid, shelf, basicBox, userBoxes);

			initGridDragged(grid, userBoxes);
			initGridResize(grid, userBoxes);
		})

		watch([shelf, basicBox, userBoxes], () => {
			if(mounted) {
				calculateGrid(grid, shelf, basicBox, userBoxes);
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
		background: repeating-linear-gradient(
		45deg,
		rgb(168, 40, 40),
		rgb(168, 40, 40) 10px,
		hsla(0, 0%, 100%, 0) 10px,
		hsla(0, 0%, 100%, 0) 20px
		);
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


.box-container {
	border: solid 1px;
	margin-bottom: 16px;
}
</style>
