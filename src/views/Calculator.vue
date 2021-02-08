<template>
    <div>
        <h1>Calculator</h1>

        <o-field label="Machinetype:">
            <o-select v-model="machine">
                <option v-for="(m, index) in machines" :key="index" :value="m">
                    {{ m.name }}
                </option>
            </o-select>
        </o-field>

        <o-field v-if="machine.dogboneRadius" :label="`Dogbone radius in ${unitType[unit]}`">
            <o-input type="number" v-model.number="machine.dogboneRadius" rounded />
        </o-field>

        <o-field label="Unit:">
            <o-select v-model="unit" rounded>
                <option v-for="(u, index) in unitType" :key="index" :value="index">
                    {{ index }}
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

        const machine = ref<Machine>(machines.LASERCUTTER);

        let material = reactive<Material>({
            thickness: undefined,
            type: undefined,
        });

        function updateMaterial(m: Material): void {
            material = m;
        }

        function updateMachine(m: Machine): void {
            machine.value = m;
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