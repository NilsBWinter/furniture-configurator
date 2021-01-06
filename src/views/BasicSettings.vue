<template>
    <div>
        <h1>Basic Settings</h1>

        <div class="box-container">
            <h2>Enter the maximum possible processing area of your device</h2>

            <o-field label="Longer Side in mm:">
                <o-input type="number" v-model.number="processingArea.longSide" rounded />
            </o-field>

            <o-field label="Shorter Side in mm:">
                <o-input type="number" v-model.number="processingArea.shortSide" rounded />
            </o-field>
        </div>

        <div class="box-container">
            <h2>Enter the your Material</h2>

            <o-field label="Type:">
                <o-input type="text" v-model="material.type" rounded />
            </o-field>

            <o-field label="Thickness in mm:">
                <o-input type="number" v-model.number="material.thickness" rounded />
            </o-field>
        </div>

        <div class="box-container">
            <h2>Enter the tolerance of your device and material</h2>

            <o-field label="Tolerance in mm:">
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


        <div>
            <h2>your Settings</h2>
            <p> Processing Area: {{ processingArea.longSide}}mm * {{ processingArea.shortSide}}mm</p>
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