<template>
    <div>
        <h1>Calculator</h1>

        <BasicSettings @update:material="updateMaterial" @update:processingArea="updateProcessingArea"></BasicSettings>
        <BoxSystem :processingArea="processingArea" :material="material"></BoxSystem>

    </div>
</template>

<script lang="ts">
import {reactive, ref} from 'vue';
import BasicSettings from './BasicSettings.vue'
import BoxSystem from './BoxSystem.vue'
import { Material, ProcessingArea } from '@/store/calculator';

export default {
    setup(){

        const material = ref<Material>({
            thickness: 0,
            type:"",
        });

        const processingArea = ref<ProcessingArea>({
            longSide: 0,
            shortSide: 0,
        });


        const testProcessingArea = {
            longSide: 1000000,
            shortSide: 80000000,
        };

        const testMaterial = {
            thickness: 20,
            type:"wood",
        };

        // material.value = testMaterial;
        // processingArea.value = testProcessingArea;

        function updateMaterial(m: Material) {
            material.value = m;
        }

        function updateProcessingArea(p: ProcessingArea) {
            processingArea.value = p;
        }

        return {
            processingArea,
            material,

            // Functions
            updateMaterial,
            updateProcessingArea
        }
    },
    components: {
        BasicSettings,
        BoxSystem
    },
}
</script>

<style>

</style>