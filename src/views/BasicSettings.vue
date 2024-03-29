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
				<h2>Choose your Machine</h2>

				<o-field label="Machinetype:">
					<o-select v-model="machineRef">
						<option v-for="(m, index) in machines" :key="index" :value="m">
							{{ m.name }}
						</option>
					</o-select>
				</o-field>

				<o-field v-if="machineRef.dogboneRadius" :label="`Dogbone radius:`">
					<o-input icon="diameter" type="number" v-model.number="machineRef.dogboneRadius" />
				<div class="afterSelectText"> 
								{{unitType[unit]}}
							</div>
				</o-field>

				<o-field v-if="!machineRef.dogboneRadius" :label="`Curv:`">
					<o-input type="number" v-model.number="machineRef.tolerance" min=0 oninput="validity.valid||(value='');" />
					<div class="afterSelectText"> 
								{{unitType[unit]}}
							</div>
				</o-field>

				<h2>Enter the specifications of your Processing</h2>

				<o-field :label="`Longer Side:`" variant="#222">
					<o-input type="number" v-model.number="machineRef.processingArea.longSide" min=0 oninput="validity.valid||(value='');" />
					<div class="afterSelectText"> 
								{{unitType[unit]}}
							</div>
				</o-field>

				<o-field :label="`Shorter Side:`">
					<o-input type="number" v-model.number="machineRef.processingArea.shortSide" min=0 oninput="validity.valid||(value='');" />
					<div class="afterSelectText"> 
								{{unitType[unit]}}
							</div>
				</o-field>		

				<o-field :label="`Material Thickness:`">
					<o-input type="number" v-model.number="materialRef.thickness" min=0 oninput="validity.valid||(value='');" />
					<div class="afterSelectText"> 
								{{unitType[unit]}}
							</div>
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

import { Material, machines, Machine} from '@/logic/calculator';

import { unitType } from 'makerjs';

import { mdiDiameter, mdiDiameterOutline, mdiMagnify } from '@mdi/js';
import { registerIcons } from '@/Icons';

registerIcons({
	mdiDiameter,
	mdiDiameterOutline,
	mdiMagnify
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
