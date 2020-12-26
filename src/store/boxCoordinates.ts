import makerjs, { IModel } from 'makerjs';
import { Box, Material, Connector } from './calculator';

export function boxCoordinates (box: Box, material: Material) {
    const boxTenonSize = 10;
    const boxPositiveTenons = 2;
    const boxNegativeTenons = boxPositiveTenons + 1;
    const boxTenonsSum = boxPositiveTenons + boxNegativeTenons;

    const slotOffSetEdgeX = 20;
    const slotOffSetEdgeY = 10 + boxTenonSize;
    const slotHeight = material.thickness;
    const slotWidth = box.depth / boxTenonsSum;

    const connectorTenonWidth = slotWidth;
    const connectorTenonLength = material.thickness * 2;

    const backTenonWidth = box.height / boxTenonsSum;
    const backTenonLength = material.thickness;
    const backTenonOffSetEdgeY = slotOffSetEdgeY + slotHeight;

    function boxSide (connector: Connector, side: 'LEFT' | 'RIGHT') {


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

        function slotPointsHorizontal(side: 'LEFT' | 'RIGHT'): makerjs.IModel[] {
            const height = slotHeight;
            const width = slotWidth;
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

            if(connector && (connector === side || connector === 'BOTH')) models.push(new makerjs.models.ConnectTheDots(true, bottomMid));

            return models;

        }

        function slotPointsVertical(): {top: IModel; bottom: IModel} {
            const backSlotHeight = backTenonWidth;
            const backSlotWidth = slotHeight;
            const offSetEdgeY = backTenonOffSetEdgeY;
            const offSetEdgeX = slotOffSetEdgeX;
            // const xPos = side === 'RIGHT' ? width + offSetEdgeX/2 : box.depth - offSetEdgeX /2;
            const xPos =  box.depth - offSetEdgeX / 2;

             const top: [number, number][] = [
                [ xPos, box.height - offSetEdgeY - backSlotHeight],
                [ xPos - backSlotWidth, box.height - offSetEdgeY - backSlotHeight],
                [ xPos - backSlotWidth, box.height - offSetEdgeY],
                [ xPos, box.height - offSetEdgeY],
                [ xPos, box.height - offSetEdgeY - backSlotHeight]];

            const bottom: [number, number][] = [
                [ xPos, offSetEdgeY],
                [ xPos - backSlotWidth, offSetEdgeY],
                [ xPos - backSlotWidth, offSetEdgeY + backSlotHeight],
                [ xPos, offSetEdgeY + backSlotHeight],
                [ xPos, offSetEdgeY]];

             const models: {top: IModel; bottom: IModel} = {
                top: new makerjs.models.ConnectTheDots(true, top),
                bottom: new makerjs.models.ConnectTheDots(true, bottom),
             };

            return models;
        }

        let slotVTop;
        let slotVBottom;

        if (!box.backSide) {
            slotVTop = slotPointsVertical().top;
            slotVBottom = slotPointsVertical().bottom
        }



        const boxSidePaths = {
            models: {
                top: topLine,
                bottom: bottomLine,
                slotPointsVerticalTop: slotVTop,
                slotPointsVerticalBottom: slotVBottom,
            },
            paths: {
                left: leftLine,
                right: rightLine,
            },
        };

        boxSidePaths.models = Object.assign( boxSidePaths.models, slotPointsHorizontal(side));

        return boxSidePaths;

    }

    function connector() {
        const connectorPoints: [number, number][] = [
                [0, 0],
                [connectorTenonWidth, 0],
                [connectorTenonWidth, connectorTenonLength],
                [connectorTenonWidth / 4 * 3, connectorTenonLength],
                [connectorTenonWidth / 4 * 3, connectorTenonLength + connectorTenonLength/2],
                [connectorTenonWidth, connectorTenonLength + connectorTenonLength/2],
                [connectorTenonWidth, connectorTenonLength * 2 + connectorTenonLength / 2],
                [connectorTenonWidth / 4 * 3, connectorTenonLength * 2 + connectorTenonLength / 2],
                [connectorTenonWidth / 4 * 3, connectorTenonLength * 3],
                [connectorTenonWidth, connectorTenonLength * 3],
                [connectorTenonWidth, connectorTenonLength * 4],
                [0, connectorTenonLength * 4],
                [0, connectorTenonLength * 3],
                [connectorTenonWidth / 4, connectorTenonLength * 3],
                [connectorTenonWidth / 4, connectorTenonLength * 2 + connectorTenonLength / 2],
                [0, connectorTenonLength * 2 + connectorTenonLength / 2],
                [0, connectorTenonLength + connectorTenonLength / 2],
                [connectorTenonWidth / 4, connectorTenonLength + connectorTenonLength / 2],
                [connectorTenonWidth / 4, connectorTenonLength],
                [0, connectorTenonLength],
                ];
        return new makerjs.models.ConnectTheDots(true, connectorPoints);
    }

    function boxGround(connector: Connector) {
        const sideTenonLength = material.thickness;
        const sideTenonWidth = slotWidth;

        const frontLine = new makerjs.paths.Line([sideTenonLength,0], [box.width - sideTenonLength, 0]);
        const backLine = new makerjs.paths.Line([sideTenonLength, box.depth], [box.width - sideTenonLength, box.depth]);

        const leftSidePoints: [number, number][] = [
            [sideTenonLength, 0],
            [sideTenonLength, slotOffSetEdgeX],
            [0, slotOffSetEdgeX],
            [0, slotOffSetEdgeX + sideTenonWidth],
            [sideTenonLength, slotOffSetEdgeX + sideTenonWidth],
            [sideTenonLength, box.depth - sideTenonWidth -slotOffSetEdgeX],
            [0, box.depth - sideTenonWidth - slotOffSetEdgeX],
            [0, box.depth - slotOffSetEdgeX],
            [sideTenonLength, box.depth - slotOffSetEdgeX],
            [sideTenonLength, box.depth],
        ];

        const rightSidePoints: [number, number][] = [
            [box.width - sideTenonLength, 0],
            [box.width - sideTenonLength, slotOffSetEdgeX],
            [box.width, slotOffSetEdgeX],
            [box.width, slotOffSetEdgeX + sideTenonWidth],
            [box.width - sideTenonLength, slotOffSetEdgeX + sideTenonWidth],
            [box.width - sideTenonLength, box.depth - sideTenonWidth -slotOffSetEdgeX],
            [box.width, box.depth - sideTenonWidth - slotOffSetEdgeX],
            [box.width, box.depth - slotOffSetEdgeX],
            [box.width - sideTenonLength, box.depth - slotOffSetEdgeX],
            [box.width - sideTenonLength, box.depth],
        ];

        const leftLine = new makerjs.models.ConnectTheDots(false, leftSidePoints);
        const rightLine = new makerjs.models.ConnectTheDots(false, rightSidePoints);

        const connectorSlotPointsLeft: [number, number][] = [
            [sideTenonLength, box.depth/2 - connectorTenonWidth / 4],
            [sideTenonLength + connectorTenonLength / 2, box.depth/2 - connectorTenonWidth / 4],
            [sideTenonLength + connectorTenonLength / 2, box.depth/2 - connectorTenonWidth / 2],
            [sideTenonLength + connectorTenonLength + connectorTenonLength / 2, box.depth/2 - connectorTenonWidth / 2],
            [sideTenonLength + connectorTenonLength + connectorTenonLength / 2, box.depth/2 + connectorTenonWidth / 2],
            [sideTenonLength + connectorTenonLength / 2, box.depth/2 + connectorTenonWidth / 2],
            [sideTenonLength + connectorTenonLength / 2, box.depth/2 + connectorTenonWidth / 4],
            [sideTenonLength, box.depth/2 + connectorTenonWidth / 4],
        ];

        const connectorSlotPointsRight: [number, number][] = [
            [box.width - sideTenonLength, box.depth/2 - connectorTenonWidth / 4],
            [box.width - sideTenonLength - connectorTenonLength / 2, box.depth/2 - connectorTenonWidth / 4],
            [box.width - sideTenonLength - connectorTenonLength / 2, box.depth/2 - connectorTenonWidth / 2],
            [box.width - sideTenonLength - connectorTenonLength - connectorTenonLength / 2, box.depth/2 - connectorTenonWidth / 2],
            [box.width - sideTenonLength - connectorTenonLength - connectorTenonLength / 2, box.depth/2 + connectorTenonWidth / 2],
            [box.width - sideTenonLength - connectorTenonLength / 2, box.depth/2 + connectorTenonWidth / 2],
            [box.width - sideTenonLength - connectorTenonLength / 2, box.depth/2 + connectorTenonWidth / 4],
            [box.width - sideTenonLength, box.depth/2 + connectorTenonWidth / 4],
        ];

        let slotLeftLine;
        let slotRightLine;

        if (connector === 'LEFT' || connector === 'BOTH') slotLeftLine = new makerjs.models.ConnectTheDots(false, connectorSlotPointsLeft);
        if (connector === 'RIGHT' || connector === 'BOTH') slotRightLine = new makerjs.models.ConnectTheDots(false, connectorSlotPointsRight);

        const backSlotWidth = box.height / boxTenonsSum;
        const backSlotHeight = slotHeight;
        const offSetEdgeY = slotOffSetEdgeX;

        const slotPointsBack: [number, number][] = [
            [box.width / 2 - backSlotWidth / 2, box.depth - offSetEdgeY],
            [box.width / 2 - backSlotWidth / 2, box.depth - offSetEdgeY - backSlotHeight],
            [box.width / 2 + backSlotWidth / 2, box.depth - offSetEdgeY - backSlotHeight],
            [box.width / 2 + backSlotWidth / 2, box.depth - offSetEdgeY],
            [box.width / 2 - backSlotWidth / 2, box.depth - offSetEdgeY],
        ];

        let backSlotLine;

        if (box.backSide) {
            backSlotLine = new makerjs.models.ConnectTheDots(true, slotPointsBack);
        }

        const boxGroundPaths = {
            models: {
                left: leftLine,
                right: rightLine,
                slotLeft: slotLeftLine,
                slotRight: slotRightLine,
                backSlot: backSlotLine,

            },
            paths: {
                front: frontLine,
                back: backLine,
            },
        };

        return boxGroundPaths;

    }

    function backSide() {
        const tenonWidth = backTenonWidth;
        const tenonLength = backTenonLength;

        const leftSidePoints: [number, number][] = [
            [tenonLength, tenonLength],
            [tenonLength, backTenonOffSetEdgeY],
            [0, backTenonOffSetEdgeY],
            [0, backTenonOffSetEdgeY + tenonWidth],
            [tenonLength, backTenonOffSetEdgeY + tenonWidth],
            [tenonLength, box.height - backTenonOffSetEdgeY - tenonWidth],
            [0, box.height - backTenonOffSetEdgeY - tenonWidth],
            [0, box.height - backTenonOffSetEdgeY],
            [tenonLength, box.height - backTenonOffSetEdgeY],
            [tenonLength, box.height - tenonLength]
        ];

         const rightSidePoints: [number, number][] = [
            [box.width - tenonLength, tenonLength],
            [box.width - tenonLength, backTenonOffSetEdgeY],
            [box.width, backTenonOffSetEdgeY],
            [box.width, backTenonOffSetEdgeY + tenonWidth],
            [box.width - tenonLength, backTenonOffSetEdgeY + tenonWidth],
            [box.width - tenonLength, box.height - backTenonOffSetEdgeY - tenonWidth],
            [box.width, box.height - backTenonOffSetEdgeY - tenonWidth],
            [box.width, box.height - backTenonOffSetEdgeY],
            [box.width - tenonLength, box.height - backTenonOffSetEdgeY],
            [box.width - tenonLength, box.height - tenonLength]
        ];

        const topSidePoints: [number, number][] = [
            [tenonLength, box.height - tenonLength],
            [box.width / 2 - tenonWidth / 2, box.height - tenonLength],
            [box.width / 2 - tenonWidth / 2, box.height],
            [box.width / 2 + tenonWidth / 2, box.height],
            [box.width / 2 + tenonWidth / 2, box.height - tenonLength],
            [box.width - tenonLength, box.height - tenonLength]
        ];

        const bottomSidePoints: [number, number][] = [
            [tenonLength, tenonLength],
            [box.width / 2 - tenonWidth / 2, tenonLength],
            [box.width / 2 - tenonWidth / 2, 0],
            [box.width / 2 + tenonWidth / 2, 0],
            [box.width / 2 + tenonWidth / 2, tenonLength],
            [box.width - tenonLength, tenonLength]
        ];

        const leftSideLine = new makerjs.models.ConnectTheDots(false, leftSidePoints);
        const rightSideLine = new makerjs.models.ConnectTheDots(false, rightSidePoints);
        const topSideLine = new makerjs.models.ConnectTheDots(false, topSidePoints);
        const bottomSideLine = new makerjs.models.ConnectTheDots(false, bottomSidePoints);

        const boxBackPaths = {
            models: {
                left: leftSideLine,
                right: rightSideLine,
                top: topSideLine,
                bottom: bottomSideLine,
            }
        }

        return boxBackPaths;
    }


    return  {
        leftSide: boxSide(box.connector, 'LEFT'),
        rightSide: boxSide(box.connector, 'RIGHT'),
        connector: connector(),
        groundSide: boxGround(box.connector),
        backSide: backSide(),


    };

}