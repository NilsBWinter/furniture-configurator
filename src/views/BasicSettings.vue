<template>
    <div>
        <h1>Basic Settings</h1>

        <div>
            <h2>Enter the maximum possible processing area of your device</h2>

            <label>Longer Side in mm:</label>
            <input type="number" v-model.number="processingArea.height" />

            <label>Shorter Side in mm:</label>
            <input type="number" v-model.number="processingArea.width" />
        </div>

        <div>
            <h2>Enter the your Material</h2>

            <label>Type:</label>
            <input type="text" v-model="material.type" />

            <label>Thickness:</label>
            <input type="number" v-model.number="material.thickness" />
        </div>

        <div>
            <h2>Enter the tolerance of your device and material</h2>

            <label>Tolerance in mm:</label>
            <input type="number" v-model.number="tolerance" />
        </div>

        <div>
            <h2>Select the type of your shelf</h2>

            <div>
                <input type="radio" id="box-system" name="box-system" value="box-system" checked>
                <label for="box-system">Box-System</label>
            </div>
        </div>


        <div>
            <h2>your Settings</h2>
            <p> Processing Area Height: {{ processingArea.height}}mm * {{ processingArea.width}}mm</p>
            <p> Material: {{material.type}} , {{material.thickness}}</p>
            <p> Tolerance: {{tolerance}}mm</p>
        </div>
    </div>

</template>

<script lang="ts">
import {computed, ref} from 'vue';

import {Material, ProcessingArea} from '../store/calculator';

export default {
    name:"BasicSettings",

    setup(){

        const tolerance = ref(0);

        const _processingArea: ProcessingArea = {
            longSide: 0,
            shortSide: 0,
        };
        const processingArea = ref(_processingArea);

        const material = ref<Material>({
            type: "",
            thickness: 0,
        })


        return {
            processingArea,
            material,
            tolerance
        }
    },

}
</script>

<style>

</style>