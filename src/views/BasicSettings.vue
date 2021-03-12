<template>
	<div class="container--molecule">
		<h1>Basic Settings</h1>

        <!-- Button to fill in Testdata -->
        <o-button @click="fillTestData">Fill with Example Data</o-button>

		<div class="container--atom">
			<div class="container--atom__inner">
				<h2>Choose wich Unit should be used</h2>

				<o-field label="Unit:">
					<o-select v-model="unitRef">
						<option v-for="(u, index) in unitType" :key="index" :value="index">
							{{ index }}
						</option>
					</o-select>
				</o-field>
			</div>
		</div>

		<div class="container--atom">
			<div class="container--atom__inner">
				<h2>Choose your Device</h2>

				<o-field label="Machinetype:">
					<o-select v-model="machineRef">
						<option v-for="(m, index) in machines" :key="index" :value="m">
							{{ m.name }}
						</option>
					</o-select>
				</o-field>

				<o-field v-if="machineRef.dogboneRadius" :label="`Dogbone radius:`">
					<o-input icon="diameterVariant" type="number" v-model.number="machineRef.dogboneRadius" />
				{{unitType[unit]}}
				</o-field>

				<h2>Enter the maximum possible processing area of your device</h2>

				<o-field :label="`Longer Side:`" variant="#222">
					<o-input type="number" v-model.number="machineRef.processingArea.longSide"  />
					{{unitType[unit]}}
				</o-field>

				<o-field :label="`Shorter Side:`">
					<o-input type="number" v-model.number="machineRef.processingArea.shortSide" />
					{{unitType[unit]}}
				</o-field>

				<h2 v-if="!machineRef.dogboneRadius">Enter the curv of your device</h2>

				<o-field v-if="!machineRef.dogboneRadius" :label="`Curv:`">
					<o-input type="number" v-model.number="machineRef.tolerance" />
					{{unitType[unit]}}
				</o-field>
			</div>
		</div>


		<div class="container--atom">
			<div class="container--atom__inner">
				<h2>Enter the your Material</h2>

				<!-- <o-field label="Type:">
					<o-input type="text" v-model="materialRef.type" />
				</o-field> -->

				<o-field :label="`Thickness:`">
					<o-input type="number" v-model.number="materialRef.thickness" />
					{{unitType[unit]}}
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
import { reactive, ref, watch } from 'vue';

import { Material, machines, Machine} from '@/store/calculator';

import { unitType } from 'makerjs';

import { mdiDiameterVariant } from '@mdi/js';
import { registerIcons } from '@/Icons';

registerIcons({
	mdiDiameterVariant,
});

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

	emits: ['update:material', 'update:machine', 'update:unit'],

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
            required: true,
        },
	},

	setup(props, context) {

		const machineRef = ref<Machine>(props.machine);

		const unitRef = ref<string>(props.unit);

		const materialRef = reactive<Material>(props.material);

		watch( unitRef, () => {
			context.emit('update:unit', unitRef.value);
		});

		watch( machineRef, () => {
			context.emit('update:machine', machineRef.value);
		});

		watch( materialRef, () => {
			context.emit('update:material', materialRef);
		});

		// Fills in Testdata to show User possible Inputs
		function fillTestData(): void {
			machineRef.value.processingArea = testProcessingArea;
            machineRef.value.tolerance = 3;
            materialRef.type = testMaterial.type;
            materialRef.thickness = testMaterial.thickness;
		}

		return {
			materialRef,
			unitType,
			machineRef,
			machines,
			unitRef,
            
            //Functions
            fillTestData,
		};
	},
};
</script>

<style></style>
