<template>
	<div>
		<h1>Basic Settings</h1>

        <!-- Button to fill in Testdata -->
        <o-button @click="fillTestData">Fill with Example Data</o-button>

		<div class="box-container">
			<h2>Enter the maximum possible processing area of your device</h2>

			<o-field :label="`Longer Side in ${unitType[unit]}:`">
				<o-input type="number" v-model.number="processingAreaRef.longSide" rounded />
			</o-field>

			<o-field :label="`Shorter Side in ${unitType[unit]}:`">
				<o-input type="number" v-model.number="processingAreaRef.shortSide" rounded />
			</o-field>
		</div>

		<div class="box-container">
			<h2>Enter the your Material</h2>

			<o-field label="Type:">
				<o-input type="text" v-model="materialRef.type" rounded />
			</o-field>

			<o-field :label="`Thickness in ${unitType[unit]}:`">
				<o-input type="number" v-model.number="materialRef.thickness" rounded />
			</o-field>
		</div>

		<div class="box-container">
			<h2>Enter the tolerance of your device and material</h2>

			<o-field :label="`Tolerance in ${unitType[unit]}:`">
				<o-input type="number" v-model.number="tolerance" rounded />
			</o-field>
		</div>

		<!-- <div> Future Code
            <h2>Select the type of your shelf</h2>

            <div>

                <input type="radio" id="box-system" name="box-system" value="box-system" checked>
                <label for="box-system">Box-System</label>
            </div>
        </div> -->

		<!-- <div>
            <h2>your Settings</h2>
            <p> Processing Area: {{ processingArea.longSide}}mm * {{ processingArea.shortSide}}mm</p>
            <p> Material: {{material.type}} , {{material.thickness}}</p>
            <p> Tolerance: {{tolerance}}mm</p>
        </div> -->
	</div>
</template>

<script lang="ts">
import { reactive, ref, watch } from 'vue';

import { Material, ProcessingArea } from '../store/calculator';

import { unitType } from 'makerjs';

const testProcessingArea = reactive({
	longSide: 3000,
	shortSide: 2000,
});

const testMaterial = reactive({
	thickness: 20,
	type: 'wood',
});

export default {
	name: 'BasicSettings',

	emits: ['update:material', 'update:processingArea'],

	props: {
		processingArea: {
			type: Object as () => ProcessingArea,
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

	setup(props, context) {
		const tolerance = ref();

		const processingAreaRef = reactive<ProcessingArea>(props.processingArea);

		const materialRef = reactive<Material>(props.material);

		watch(processingAreaRef, () => {
			context.emit('update:processingArea', processingAreaRef);
		});

		watch(materialRef, () => {
			context.emit('update:material', materialRef);
		});

		// Fills in Testdata to show User possible Inputs
		function fillTestData(): void {
            processingAreaRef.longSide = testProcessingArea.longSide;
            processingAreaRef.shortSide = testProcessingArea.shortSide;
            materialRef.type = testMaterial.type;
            materialRef.thickness = testMaterial.thickness;
            tolerance.value = 3;
		}

		return {
			processingAreaRef,
			materialRef,
            tolerance,
            unitType,
            
            //Functions
            fillTestData,
		};
	},
};
</script>

<style></style>
