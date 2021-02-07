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
        <o-field label="Machinetype:">
            <o-select v-model="machine">
                <option v-for="(machine, index) in machines" :key="index" :value="machine">
                    {{ machine.name }}
                </option>
            </o-select>
        </o-field>

        <BasicSettings @update:material="updateMaterial" @update:machine="updateMachine" :machine="machine" :material="material" :unit="unit"></BasicSettings>
        <BoxSystem :machine="machine" :material="material" :unit="unit"></BoxSystem>

    </div>
</template>

<script lang="ts">
import {reactive, ref} from 'vue';
import BasicSettings from './BasicSettings.vue'
import BoxSystem from './BoxSystem.vue'
import { Material, machineTypes, machines, Machine} from '@/store/calculator';
import { unitType } from 'makerjs';

export default {
    components: {
        BasicSettings,
        BoxSystem
    },

    setup(){

        const unit = ref('Millimeter');

        let machine = reactive<Machine>(machines.LASERCUTTER);

        let material = reactive<Material>({
            thickness: undefined,
            type: undefined,
        });

        // let processingArea = reactive<ProcessingArea>({
        //     longSide: undefined,
        //     shortSide: undefined,
        // });

        function updateMaterial(m: Material): void {
            material = m;
        }

        function updateMachine(m: Machine): void {
            machine = m;
        }

        return {
            material,
            unit,
            unitType,
            machineTypes,
            machine,
            machines,

            // Functions
            updateMaterial,
            updateMachine,
        }
    },
}
</script>

<style>

</style>