<template>
    <div>
        <h1>Calculator</h1>

        <BasicSettings></BasicSettings>
        <BoxSystem :processingArea="testProcessingArea" :material="testMaterial"></BoxSystem>

    </div>
</template>

<script lang="ts">
import {ref} from 'vue';
import BasicSettings from './BasicSettings.vue'
import BoxSystem from './BoxSystem.vue'
import { Material, ProcessingArea } from '@/store/calculator';

export default {
    setup(){


        const testProcessingArea = ref<ProcessingArea>({
            longSide: 1000000,
            shortSide: 80000000,
        });

        const testMaterial = ref<Material>({
            thickness: 20,
            type:"wood",
        });


        return {
            testProcessingArea,
            testMaterial,
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