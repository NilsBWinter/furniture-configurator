<template>
	<div class="container--molecule">
		<h1>Basic Settings</h1>

        <!-- Button to fill in Testdata -->
        <o-button @click="fillTestData">Fill with Example Data</o-button>

		<div class="container--atom">
			<div class="container--atom__inner">
				<h2>Enter the maximum possible processing area of your device</h2>

				<o-field :label="`Longer Side in ${unitType[unit]}:`" variant="#222">
					<o-input type="number" v-model.number="machineRef.processingArea.longSide"  rounded />
				</o-field>

				<o-field :label="`Shorter Side in ${unitType[unit]}:`">
					<o-input type="number" v-model.number="machineRef.processingArea.shortSide" rounded />
				</o-field>
			</div>
		</div>


		<div class="container--atom">
			<div class="container--atom__inner">
				<h2>Enter the your Material</h2>

				<o-field label="Type:">
					<o-input type="text" v-model="materialRef.type" rounded />
				</o-field>

				<o-field :label="`Thickness in ${unitType[unit]}:`">
					<o-input type="number" v-model.number="materialRef.thickness" rounded />
				</o-field>
			</div>
		</div>

		<div class="container--atom">
			<div class="container--atom__inner">
				<h2>Enter the tolerance of your device</h2>

				<o-field :label="`Tolerance in ${unitType[unit]}:`">
					<o-input type="number" v-model.number="machineRef.tolerance" rounded />
				</o-field>
			</div>
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
import { reactive, watch } from 'vue';

import { Material, machines, Machine} from '@/store/calculator';

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

	emits: ['update:material', 'update:machine'],

	props: {
		machine: {
			type: Object as () => Machine,
			default: true,
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

		const machineRef = reactive<Machine>(props.machine);

		const materialRef = reactive<Material>(props.material);

		watch( machineRef, () => {
			console.log('logged123');
			context.emit('update:machine', machineRef);
		});

		watch(materialRef, () => {
			context.emit('update:material', materialRef);
		});

		// Fills in Testdata to show User possible Inputs
		function fillTestData(): void {
            machineRef.processingArea.longSide = testProcessingArea.longSide;
            machineRef.processingArea.shortSide = testProcessingArea.shortSide;
            machineRef.tolerance = 3;
            materialRef.type = testMaterial.type;
            materialRef.thickness = testMaterial.thickness;
		}

		return {
			materialRef,
			unitType,
			machineRef,
			machines,
            
            //Functions
            fillTestData,
		};
	},
};
</script>

<style></style>
