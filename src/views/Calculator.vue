<template>
    <div class="calculator">
        <h1>Shelf-Configurator</h1>

       
       

        <BasicSettings @update:material="updateMaterial" @update:machine="updateMachine" @update:unit="updateUnit" :machine="machine" :material="material" :unit="unit"></BasicSettings>
        <BoxSystem :machine="machine" :material="material" :unit="unit"></BoxSystem>

    </div>
</template>

<script lang="ts">
import {reactive, ref} from 'vue';
import BasicSettings from './BasicSettings.vue'
import BoxSystem from './BoxSystem.vue'
import { Material, machineTypes, machines, Machine} from '@/logic/calculator';
import { unitType } from 'makerjs';

export default {
    components: {
        BasicSettings,
        BoxSystem
    },

    setup(){

        const unit = ref<string>('Millimeter');

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

        function updateUnit(u: string): void {
            console.log(unit.value);
            unit.value = u;
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
            updateUnit,
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