<template>
    <div>
        <h1>Calculator</h1>

        <BasicSettings @update:material="updateMaterial" @update:processingArea="updateProcessingArea" :processingArea="processingArea" :material="material"></BasicSettings>
        <BoxSystem :processingArea="processingArea" :material="material"></BoxSystem>

    </div>
</template>

<script lang="ts">
import {reactive} from 'vue';
import BasicSettings from './BasicSettings.vue'
import BoxSystem from './BoxSystem.vue'
import { Material, ProcessingArea } from '@/store/calculator';

export default {
    setup(){

        let material = reactive<Material>({
            thickness: 0,
            type:"",
        });

        let processingArea = reactive<ProcessingArea>({
            longSide: 0,
            shortSide: 0,
        });

        function updateMaterial(m: Material): void {
            material = m;
        }

        function updateProcessingArea(p: ProcessingArea): void {
            processingArea = p;
        }

        return {
            processingArea,
            material,

            // Functions
            updateMaterial,
            updateProcessingArea,
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