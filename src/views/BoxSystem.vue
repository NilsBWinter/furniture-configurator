<template>
    <div>
        <h1>Box System</h1>

        <div>
            <h2>Enter the dimensions of your shelf</h2>

            <label>Shelf Height in mm:</label>
            <input type="number" v-model.number="shelf.height">

            <label>Shelf Width in mm:</label>
            <input type="number" v-model.number="shelf.width">

            <label>Shelf Depth in mm:</label>
            <input type="number" v-model.number="shelf.depth">
        </div>

        <div>
            <h2>Define the dimensions of your basict Box(this will define your smallest item size in the shelf Grid)</h2>
            <p>You can define bigger boxes based on your basic box (the dimesnions of your basic box have to be a divider by the maximum of the possible processable area of you machine)</p>

            <div>
                <select v-model="basicBox.height">
                    <option v-for="height in possibleBasicBoxDimensions.heights" :key="height" :value="height"> {{height}}</option>
                </select>
                <label>basicBoxHeight : {{basicBox.height}}</label>
            </div>

            <div>
                <select v-model="basicBox.width">
                    <option v-for="width in possibleBasicBoxDimensions.widths" :key="width" :value="width"> {{width}}</option>
                </select>
                <label>basicBoxWidth: {{ basicBox.width }}</label>
            </div>

            <div>
                <!-- <select v-model="basicBox.depth">
                    <option v-for="depth in (isBoxHeightOrWidthLong(basicBox, processingArea) ? basicBoxDimensions.shortDepths : basicBoxDimensions.longDepths)" :key="depth" :value="depth">{{depth}} {{width}} </option>
                </select> -->
                <label>basicBoxDepth: {{ basicBox.depth }}</label>
            </div>


        </div>

        <!-- <div>
            <h2>Add Boxes</h2>
            <p>for testing the user boxes Array</p>

            <div>
                <select v-model="selectedBox">
                    <option v-for="box in possibleUserBoxes" :key="box.name" :value="box">{{box.name.value}}</option>
                </select>
                <button type="button" @click="userBoxes.push(selectedBox)">Add Box</button>
            </div>
        </div> -->

        <div>
            <h2>Box Grid</h2>
             <div class="box-system-grid">
                <div v-for="(box, index) in userBoxes" :key="index" :value="box" :style="getGridStyle(box)" class="box-system-grid__box-container">
                    <!-- <div class="box-system-grid__box-container__add--top">
                        <select @change="addBoxTop(box, $event.target.value)">
                            <option v-for="box in possibleUserBoxes" :key="box.name" :value="box">{{box.name}}</option>
                        </select>
                        <button> Add box to top </button>
                    </div>
                    <div class="box-system-grid__box-container__add--left">
                        <select v-model="selectedBox">
                            <option v-for="box in possibleUserBoxes" :key="box.name" :value="box">{{box.name}}</option>
                        </select>
                        <button> Add box to left </button>
                    </div> -->
                    <div class="box-system-grid__box-container__box"> {{box.name}} </div>
                    <!-- <div class="box-system-grid__box-container__add--right">
                        <select v-model="selectedBox">
                            <option v-for="box in possibleUserBoxes" :key="box.name" :value="box">{{box.name}}</option>
                        </select>
                        <button> Add box to right </button>
                    </div> -->
                </div>
                <!-- <div>test1</div>
                <div>test2</div>
                <div>test3</div>
                <div>test4</div>
                <div>test5</div> -->
             </div>
        </div>

        <div>
            <h2>Configure your Boxes</h2>

             <div v-for="(box, index) in userBoxes" :key="index" :value="box" class="box-container">
                 <h3>{{box.name}} Height:{{box.height}} Width:{{box.width}}</h3>

                <div>
                    <h4> Configure the height and width of the box</h4>

                    <select v-model="box.height">
                        <option v-for="(height, index) in possibleUserBoxDimesnions.heights" :key="index" :value="height">{{height}}</option>
                    </select>
                    <label>Box height: {{ box.height }}</label>

                    <select v-model="box.width">
                        <option v-for="(width, index) in possibleUserBoxDimesnions.widths" :key="index" :value="width">{{width}}</option>
                    </select>
                    <label>Box width: {{ box.width }}</label>
                </div>

                <div>
                    <h4> Choose if the box should be connected with an other Box to the left or right side</h4>
                    <input type="checkbox" v-model="box.connectorRight">
                    <label>Connection to the right side</label>

                    <input type="checkbox" v-model="box.connectorLeft">
                    <label>Connection to the left side</label>
                </div>
             </div>




            <button @click="addBasicBox">Add Box</button>
        </div>

        <div>
            <h3>SVG:</h3>
            <div v-html="svgLeft"></div>
             <div v-html="svgRight"></div>
        </div>


    </div>

</template>

<script lang="ts">
import {computed, reactive, ref, unref} from 'vue';

import {Box, ProcessingArea, Shelf, BoxDimensions, isValidLongHeightAtStep, isValidLongWidthAtStep, isValidShortHeightAtStep, isValidShortWidthAtStep, isValidShortDepth, isValidLongDepth, Material} from '../store/calculator';

import makerjs, { IModel } from 'makerjs';

export default {
    name:"BoxSystem",


    props:{
        processingArea: {
            type: Object as () => ProcessingArea,
            required: true
        },
        material: {
            type: Object as () => Material,
            required: true,
        }
    },



    setup(props) {

        const processingArea: ProcessingArea = ref(props.processingArea).value;
        const material: Material = ref(props.material).value;

        let shelf: Shelf = reactive({
            height: 0,
            width: 0,
            depth: 0,
        });


        const testShelf = ref<Shelf>({
            height:2000,
            width:1800,
            depth:400,
        })


        const rangeSteps =  [1,2,3,4,5,6,7,8,9,10];

        shelf = testShelf.value;
        // basicBox.value.depth = shelf.depth;


        // watch(shelf, () => {
        //     basicBox.depth = shelf.depth;
        // })

        let userBoxes: Box[] = [];


        // const selectedBox = reactive<Box>({
        //     height: 0,
        //     width: 0,
        //     depth: 0,

        //     gridX: 0,
        //     gridY: 0,

        //     gridSizeX: 0,
        //     gridSizeY: 0,

        //     connectorRight: false,
        //     connectorLeft: false,

        //     name: ref(""),
        // });

        const gridHeight = computed((): number => {
            let maxHeight = 0;
            userBoxes.forEach(box => {
                if (box.gridY + box.gridSizeY > maxHeight) maxHeight = box.gridY + box.gridSizeY -1;
            })

            return maxHeight;
        });

        const gridWidth = computed((): number => {
            let maxWidth = 0;
            userBoxes.forEach(box => {
                if (box.gridX + box.gridSizeX > maxWidth) maxWidth = box.gridX + box.gridSizeX -1;
            })

            return maxWidth;
        });

        const userBoxesGridSpace = computed((): number => {
             let boxesArea = 0;
            userBoxes.forEach(box => {
                boxesArea += box.gridSizeX* box.gridSizeY;
            })
            return boxesArea;
        })

        const userBoxesEmptySpaces = computed((): number => {
            const gridArea = gridHeight.value * gridWidth.value;
            return gridArea - userBoxesGridSpace.value;
        });

        // const userBoxesEmptySpaceBoxes = computed((): Box[] => {
        //     const boxes: Box[] = [];

        //     for(let x = 1; x <= gridWidth.value; x++) {

        //         for(let y = 1; y <= gridHeight.value; y++) {

        //             let emptX = true;
        //             let emptY = true;

        //             let boxEmpty = true;

        //             userBoxes.value.forEach(box => {
        //                 if(x >= box.gridX && x < box.gridX + box.gridSizeX-1 ) emptX = false;
        //                 else emptX = true;
        //                 if(y >= box.gridY && y < box.gridY + box.gridSizeY-1 ) emptY = false;
        //                 else emptY = true;

        //                 if(!emptX && !emptY) boxEmpty =false;
        //                 else boxEmpty = true;

        //             });

        //             if(boxEmpty) boxes.push({
        //                 height: 0,
        //                 width: 0,
        //                 depth: 0,

        //                 gridX: x,
        //                 gridY: y,

        //                 gridSizeX: 1,
        //                 gridSizeY: 1,

        //                 name: `EmptyGridBox 1.1 x:${x} y:${y}`,
        //             });

        //         }
        //     }
        //     return boxes;
        // });

        const possibleBasicBoxDimensions = computed((): BoxDimensions => {
            const longHeights: number[] = [];
            const longWidths: number[] = [];

            const shortHeights: number[] = [];
            const shortWidths: number[] = [];

            let depth: number;
            if(isValidShortDepth(shelf.depth, shelf, processingArea) || isValidLongDepth(shelf.depth, shelf, processingArea)) depth = shelf.depth;
            else throw new Error("shelf.depth is not a valid number");

            rangeSteps.forEach(step => {
                if (isValidLongHeightAtStep(shelf, processingArea, step)) longHeights.push(shelf.height / step);
                if (isValidLongWidthAtStep(shelf, processingArea, step)) longWidths.push(shelf.width / step);


                if (isValidShortHeightAtStep(shelf, processingArea, step)) shortHeights.push(shelf.height / step);
                if (isValidShortWidthAtStep(shelf, processingArea, step)) shortWidths.push(shelf.width / step);

            })


            if(isValidShortDepth(depth, shelf, processingArea) && isValidLongDepth(depth, shelf, processingArea)) return {
                heights: longHeights.sort((a, b) => a - b),
                widths: longWidths.sort((a, b) => a - b),
                depth: depth,
            }
            else return {
                heights: shortHeights.sort((a, b) => a - b),
                widths: shortWidths.sort((a, b) => a - b),
                depth: depth,
            }
        });


        const basicBox = reactive<Box>({
            height: possibleBasicBoxDimensions.value.heights[0],
            width: possibleBasicBoxDimensions.value.widths[0],
            depth: ref(shelf.depth).value,

            get gridSizeX() {return possibleBasicBoxDimensions.value.widths.indexOf(basicBox.width) + 1},
            get gridSizeY() {return possibleBasicBoxDimensions.value.heights.indexOf(basicBox.height) + 1},

            gridX: 0,
            gridY: 0,

            connectorRight: false,
            connectorLeft: false,

            backSide:false,

            get name() {return `Box ${basicBox.gridSizeX}.${basicBox.gridSizeX}`},
        });

        // basicBox.gridSizeX = computed(() => possibleBasicBoxDimensions.value.widths.indexOf(basicBox.width) + 1);
        // basicBox.gridSizeY = computed(() => possibleBasicBoxDimensions.value.heights.indexOf(basicBox.height) + 1);

        const possibleUserBoxDimesnions = computed((): BoxDimensions => {
            return {
                heights: possibleBasicBoxDimensions.value.heights.filter(height => height >= basicBox.height),
                widths: possibleBasicBoxDimensions.value.widths.filter(width => width >= basicBox.width),
                depth: possibleBasicBoxDimensions.value.depth,
            }
        });

        function createBox(): Box {
            const box: Box = {
                height: possibleUserBoxDimesnions.value.heights[0],
                width: possibleUserBoxDimesnions.value.widths[0],
                depth: ref(shelf.depth).value,


                get gridSizeX() {return possibleUserBoxDimesnions.value.widths.indexOf(box.width) + 1},
                get gridSizeY() {return possibleUserBoxDimesnions.value.heights.indexOf(box.height) + 1},

                gridX: 0,
                gridY: 0,

                connectorRight: false,
                connectorLeft: false,
                backSide: false,

                get name() {return `Box ${box.gridSizeY}.${box.gridSizeX}`},
            }
            return box;
        }

        function createTestBox(gridX: number, gridY: number, height: number, width: number) {
            const box: Box = {
                height: height,
                width: width,
                depth: ref(shelf.depth).value,


                get gridSizeX() {return possibleUserBoxDimesnions.value.widths.indexOf(box.width) + 1},
                get gridSizeY() {return possibleUserBoxDimesnions.value.heights.indexOf(box.height) + 1},

                gridX: gridX,
                gridY: gridY,

                connectorRight: false,
                connectorLeft: false,

                backSide: false,

                get name(){return `Box ${box.gridSizeY}.${box.gridSizeX}`},
            }


            return box;
        }

        const possibleBoxes = computed((): Box[] => {

            const boxes: Box[] = []

            possibleBasicBoxDimensions.value.heights.forEach((height, hIndex)=> {
                possibleBasicBoxDimensions.value.widths.forEach((width, wIndex)=> {
                    const box: Box = {
                        height: height,
                        width: width,
                        depth: basicBox.depth,

                        gridX: 0,
                        gridY: 0,

                        get gridSizeX() {return wIndex + 1},
                        get gridSizeY() {return hIndex + 1},

                        connectorRight: false,
                        connectorLeft: false,

                        backSide: false,

                        get name() {return `Box${hIndex + 1}.${wIndex + 1}`},
                    }

                    boxes.push(box);
                })
            });

        return boxes;

        });

        const possibleUserBoxes = computed(() => possibleBoxes.value.filter(box => (box.height >= basicBox.height) && (box.width >= basicBox.width)));

        const sameUserBoxes = computed(() => {
            return userBoxes.reduce((acum,box) => Object.assign(acum,{[box.name]: (acum[box.name] || 0)+1}),{});
        });

        function boxCoordinates (box: Box, material: Material) {
            const boxSide = (connertor: boolean, side: 'LEFT' | 'RIGHT') => {
                const boxTenonSize = 10;
                const boxPositiveTenons = 2;
                const boxNegativeTenons = boxPositiveTenons + 1;
                const boxTenonsSum = boxPositiveTenons + boxNegativeTenons;
                const slotOffSetEdgeX = 20;
                const slotOffSetEdgeY = 10 + boxTenonSize;
                const slotHeight = material.thickness;


                const bottomLinePoints: [number, number][] = [];

                for (let i = 0; i < boxTenonsSum; i++) {
                    bottomLinePoints.push([(box.depth / boxTenonsSum) * i, (i % 2) !== 0 ? boxTenonSize : 0]);
                    bottomLinePoints.push([(box.depth / boxTenonsSum) * (i + 1), (i % 2) !== 0 ? boxTenonSize : 0])
                }

                const topLinePoints: [number, number][] = [];

                for (let i = 0; i < boxTenonsSum; i++) {
                    topLinePoints.push([(box.depth / boxTenonsSum) * i, box.height - ((i % 2) !== 0 ? 0 : boxTenonSize)]);
                    topLinePoints.push([(box.depth / boxTenonsSum) * (i + 1), box.height - ((i % 2) !== 0 ? 0 : boxTenonSize)]);
                }
                // debugger;

                const topLine = new makerjs.models.ConnectTheDots(false, topLinePoints);
                const bottomLine = new makerjs.models.ConnectTheDots(false, bottomLinePoints);
                const leftLine = new makerjs.paths.Line([0,0], [0, box.height - boxTenonSize]);
                const rightLine = new makerjs.paths.Line([box.depth,0], [box.depth, (box.height - boxTenonSize)]);
                // debugger;

                function slotPointsHorizontal(): makerjs.IModel[] {
                    const height = slotHeight;
                    const width = box.depth / boxTenonsSum;
                    const offSetEdgeY = slotOffSetEdgeY;
                    const offSetEdgeX = slotOffSetEdgeX*2;

                    const bottomLeft: [number, number][] = [
                        [offSetEdgeX, offSetEdgeY],
                        [width + offSetEdgeX, offSetEdgeY],
                        [width + offSetEdgeX, offSetEdgeY + height],
                        [offSetEdgeX, offSetEdgeY + height],
                        [offSetEdgeX, offSetEdgeY]];
                    const bottomRight: [number, number][] = [
                        [(box.depth) - offSetEdgeX - width, offSetEdgeY],
                        [(box.depth) - offSetEdgeX, offSetEdgeY],
                        [(box.depth) - offSetEdgeX, offSetEdgeY + height],
                        [(box.depth) - offSetEdgeX - width, offSetEdgeY + height],
                        [(box.depth) - offSetEdgeX - width, offSetEdgeY]];
                    const topLeft: [number, number][] = [
                        [offSetEdgeX, box.height - offSetEdgeY - height],
                        [width + offSetEdgeX, box.height - offSetEdgeY - height],
                        [width + offSetEdgeX, box.height - offSetEdgeY],
                        [offSetEdgeX, box.height - offSetEdgeY],
                        [offSetEdgeX, box.height - offSetEdgeY - height]];
                    const topRight: [number, number][] = [
                        [(box.depth) - (offSetEdgeX + width), box.height - offSetEdgeY - height],
                        [(box.depth) - offSetEdgeX, box.height - offSetEdgeY - height],
                        [(box.depth) - offSetEdgeX, box.height - offSetEdgeY],
                        [(box.depth) - (offSetEdgeX + width), box.height - offSetEdgeY],
                        [(box.depth) - (offSetEdgeX + width), box.height - offSetEdgeY - height]];

                    const bottomMid: [number, number][] = [
                        [(box.depth)/2 - width/2, offSetEdgeY],
                        [(box.depth)/2 + width/2, offSetEdgeY],
                        [(box.depth)/2 + width/2, offSetEdgeY + height],
                        [(box.depth)/2 - width/2, offSetEdgeY + height],
                        [(box.depth)/2 - width/2, offSetEdgeY],
                    ];

                    const models: IModel[] =[
                        new makerjs.models.ConnectTheDots(true, bottomLeft),
                        new makerjs.models.ConnectTheDots(true, bottomRight),
                        new makerjs.models.ConnectTheDots(true, topLeft),
                        new makerjs.models.ConnectTheDots(true, topRight)
                    ];

                    if(connertor) models.push(new makerjs.models.ConnectTheDots(true, bottomMid));

                    return models;

                }

                function slotPointsVertical(side: 'LEFT' | 'RIGHT'): makerjs.IModel[] {
                    const height = box.height / boxTenonsSum;
                    const width = slotHeight;
                    const offSetEdgeY = slotOffSetEdgeY + width;
                    const offSetEdgeX = slotOffSetEdgeX;
                    const xPos = side === 'RIGHT' ? width + offSetEdgeX/2 : box.depth - offSetEdgeX /2;

                     const top: [number, number][] = [
                        [ xPos, box.height - offSetEdgeY - height],
                        [ xPos - width, box.height - offSetEdgeY - height],
                        [ xPos - width, box.height - offSetEdgeY],
                        [ xPos, box.height - offSetEdgeY],
                        [ xPos, box.height - offSetEdgeY - height]];

                    const bottom: [number, number][] = [
                        [ xPos, offSetEdgeY],
                        [ xPos - width, offSetEdgeY],
                        [ xPos - width, offSetEdgeY + height],
                        [ xPos, offSetEdgeY + height],
                        [ xPos, offSetEdgeY]];

                     const models: IModel[] =[
                        new makerjs.models.ConnectTheDots(true, top),
                        new makerjs.models.ConnectTheDots(true, bottom),
                    ];

                    return models;
                }

                const boxPaths = {
                    models: {
                        top: topLine,
                        bottom: bottomLine,
                        slotPointsVerticalTop: slotPointsVertical(side)[0],
                        slotPointsVerticalBottom: slotPointsVertical(side)[1],
                    },
                    paths: {
                        left: leftLine,
                        right: rightLine,
                    },
                };

                boxPaths.models = Object.assign( boxPaths.models, slotPointsHorizontal());

                return boxPaths;

            }
            // debugger;

            return  {
                leftSide: boxSide(box.connectorLeft, 'LEFT'),
                rightSide: boxSide(box.connectorLeft, 'RIGHT'),
            };

        }
        // const svg1 = boxCoordinates(possibleBoxes.value[0], material).leftSide;
        // debugger;
        const svgLeft = makerjs.exporter.toSVG(boxCoordinates(possibleUserBoxes.value[0] as unknown as Box, material).leftSide);
        const svgRight = makerjs.exporter.toSVG(boxCoordinates(possibleUserBoxes.value[0] as unknown as Box, material).rightSide);
        // debugger;

        const testUserBoxes = reactive<Array<any>>([
            reactive(createTestBox(1,1, possibleUserBoxDimesnions.value.heights[0], possibleUserBoxDimesnions.value.widths[1])),
            reactive(createTestBox(3,1, possibleUserBoxDimesnions.value.heights[0], possibleUserBoxDimesnions.value.widths[1])),
            reactive(createTestBox(2,2, possibleUserBoxDimesnions.value.heights[1], possibleUserBoxDimesnions.value.widths[1])),
            reactive(createTestBox(5,1, possibleUserBoxDimesnions.value.heights[2], possibleUserBoxDimesnions.value.widths[0])),
            reactive(createTestBox(2,4, possibleUserBoxDimesnions.value.heights[0], possibleUserBoxDimesnions.value.widths[3])),
        ]);

        userBoxes = testUserBoxes;

        return {
            shelf,
            testShelf,
            basicBox,
            possibleBasicBoxDimensions,
            possibleBoxes,
            possibleUserBoxes,
            userBoxes,
            // selectedBox,
            gridHeight,
            gridWidth,
            userBoxesEmptySpaces,
            userBoxesGridSpace,
            // userBoxesEmptySpaceBoxes,
            possibleUserBoxDimesnions,
            sameUserBoxes,
            svgLeft,
            svgRight,

            getGridStyle(box: Box): object {
                // if(box.gridX === 0) box.gridX = Math.round(Math.random() * (10 - 1) + 1);
                // if(box.gridY === 0) box.gridY = Math.round(Math.random() * (10 - 1) + 1);

                // if(box.gridX === 0) box.gridX = 1;
                // if(box.gridY === 0) box.gridY = 999;

                // console.log(`${box.gridX} / span ${box.gridSizeX}`);
                // console.log(`${box.gridY} / ${box.gridY - box.gridSizeY}`);

                return {
                    "grid-column-start": box.gridX,
                    "grid-row-start": -box.gridY,


                    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                    //@ts-ignore
                    "grid-column-end": box.gridX + box.gridSizeX,
                     // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
                     //@ts-ignore
                    "grid-row-end": -box.gridY - box.gridSizeY,

                    // "grid-column": `${box.gridX} / ${box.gridX + box.gridSizeX}`,
                    // "grid-row": `${box.gridY} / ${box.gridY - box.gridSizeY}`,

                    // "background-color": `#${Math.floor(Math.random()*16777215).toString(16)}`,
                }
            },

            // addBoxTop(box: Box, test: any): void {

            //     console.log(box, test.toString());
            // }

            createBox,
            addBasicBox(): void {
                userBoxes.push(createBox());
            }


        }
    },
}
</script>

<style lang="scss">

.box-system-grid {
    display:grid;

    grid-auto-rows: 300px;
    grid-auto-columns: 300px;

    border: solid 1px;

    width: max-content;

    &__box-container {
        display: grid;
        grid-template-columns: 1fr 10fr 1fr;
         grid-template-rows: 1fr 6fr;

        border: solid 1px;

        &__add--top {
            grid-column:  2/2;
            grid-row: 1;
        }

        &__add--left {
            grid-column:  1/1;
            grid-row: 2;
        }

        &__add--right {
            grid-column:  3/3;
            grid-row: 2;
        }

        &__box {
            grid-column:  2/2;
            grid-row: 2;

            // border: solid 1px;
        }
    }
}

.box-container {
    border: solid 1px;
    margin-bottom: 16px;
}

</style>