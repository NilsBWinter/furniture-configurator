<template>
    <div class="calculator">
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

<style lang="scss">


.calculator {
    max-width: 1080px;

    margin-left: auto;
    margin-right: auto;

    // background-color: var(--color-background);

    .container--atom {
        // justify-content: center;
        text-align: -webkit-center;
        text-align: -moz-center;

        border: solid 1px;
        border-radius: 4px;

        margin: 16px;

        &__inner {
            margin-left: auto;
            margin-right: auto;

            padding-bottom: 16px;

            max-width: 720px;
            width: 100%;
        }
    }

    .container--molecule {
        background-color: var(--color-background);

        border-radius: 4px;

        margin: 16px;
        padding: 16px;
    }

    .afterSelectText {
        padding-left: 16px;
    }
}

</style>