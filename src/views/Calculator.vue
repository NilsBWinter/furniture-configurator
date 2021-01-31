<template>
    <div>
        <h1>Calculator</h1>

        <o-field label="Unit:">
            <o-select v-model="unit" rounded>
                <option v-for="(u, index) in unitType" :key="index" :value="index">
                    {{ index }}
                </option>
            </o-select>
        </o-field>

        <BasicSettings @update:material="updateMaterial" @update:processingArea="updateProcessingArea" :processingArea="processingArea" :material="material" :unit="unit"></BasicSettings>
        <BoxSystem :processingArea="processingArea" :material="material" :unit="unit"></BoxSystem>

    </div>
</template>

<script lang="ts">
import {reactive, ref} from 'vue';
import BasicSettings from './BasicSettings.vue'
import BoxSystem from './BoxSystem.vue'
import { Material, ProcessingArea} from '@/store/calculator';
import { unitType } from 'makerjs';

export default {
    components: {
        BasicSettings,
        BoxSystem
    },

    setup(){

        const unit = ref('Millimeter');

        let material = reactive<Material>({
            thickness: undefined,
            type: undefined,
        });

        let processingArea = reactive<ProcessingArea>({
            longSide: undefined,
            shortSide: undefined,
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
            unit,
            unitType,

            // Functions
            updateMaterial,
            updateProcessingArea,
        }
    },
}
</script>

<style>

</style>