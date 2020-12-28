import makerjs, { IModel } from 'makerjs';
import { Box, Material, Connector } from './calculator';

export enum Sides {
    leftSide = "leftSide",
    rightSide = "rightSide",
    connector = "connector",
    groundSide = "groundSide",
    backSide = "backSide",
}
export type Coordinates = {
    [key in Sides]: IModel;
}

export function boxCoordinates(box: Box, material: Material): Coordinates {
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

	function boxSide(connector: Connector, side: 'LEFT' | 'RIGHT'): IModel {
		const bottomLinePoints: [number, number][] = [];

		for (let i = 0; i < boxTenonsSum; i++) {
			bottomLinePoints.push([(box.depth / boxTenonsSum) * i, i % 2 !== 0 ? boxTenonSize : 0]);
			bottomLinePoints.push([(box.depth / boxTenonsSum) * (i + 1), i % 2 !== 0 ? boxTenonSize : 0]);
		}

		const topLinePoints: [number, number][] = [];

		for (let i = 0; i < boxTenonsSum; i++) {
			topLinePoints.push([(box.depth / boxTenonsSum) * i, box.height - (i % 2 !== 0 ? 0 : boxTenonSize)]);
			topLinePoints.push([(box.depth / boxTenonsSum) * (i + 1), box.height - (i % 2 !== 0 ? 0 : boxTenonSize)]);
		}
		// debugger;

		const topLine = new makerjs.models.ConnectTheDots(false, topLinePoints);
		const bottomLine = new makerjs.models.ConnectTheDots(false, bottomLinePoints);
		const leftLine = new makerjs.paths.Line([0, 0], [0, box.height - boxTenonSize]);
		const rightLine = new makerjs.paths.Line([box.depth, 0], [box.depth, box.height - boxTenonSize]);
		// debugger;

		function slotPointsHorizontal(side: 'LEFT' | 'RIGHT', height: number, width: number, offSetEdgeY: number, offSetEdgeX: number): IModel[] {
			// const height = slotHeight;
			// const width = slotWidth;
			// const offSetEdgeY = slotOffSetEdgeY;
			// const offSetEdgeX = slotOffSetEdgeX * 2;

			const bottomLeft: [number, number][] = [
				[offSetEdgeX, offSetEdgeY],
				[width + offSetEdgeX, offSetEdgeY],
				[width + offSetEdgeX, offSetEdgeY + height],
				[offSetEdgeX, offSetEdgeY + height],
				[offSetEdgeX, offSetEdgeY],
			];
			const bottomRight: [number, number][] = [
				[box.depth - offSetEdgeX - width, offSetEdgeY],
				[box.depth - offSetEdgeX, offSetEdgeY],
				[box.depth - offSetEdgeX, offSetEdgeY + height],
				[box.depth - offSetEdgeX - width, offSetEdgeY + height],
				[box.depth - offSetEdgeX - width, offSetEdgeY],
			];
			const topLeft: [number, number][] = [
				[offSetEdgeX, box.height - offSetEdgeY - height],
				[width + offSetEdgeX, box.height - offSetEdgeY - height],
				[width + offSetEdgeX, box.height - offSetEdgeY],
				[offSetEdgeX, box.height - offSetEdgeY],
				[offSetEdgeX, box.height - offSetEdgeY - height],
			];
			const topRight: [number, number][] = [
				[box.depth - (offSetEdgeX + width), box.height - offSetEdgeY - height],
				[box.depth - offSetEdgeX, box.height - offSetEdgeY - height],
				[box.depth - offSetEdgeX, box.height - offSetEdgeY],
				[box.depth - (offSetEdgeX + width), box.height - offSetEdgeY],
				[box.depth - (offSetEdgeX + width), box.height - offSetEdgeY - height],
			];

			const bottomMid: [number, number][] = [
				[box.depth / 2 - width / 2, offSetEdgeY],
				[box.depth / 2 + width / 2, offSetEdgeY],
				[box.depth / 2 + width / 2, offSetEdgeY + height],
				[box.depth / 2 - width / 2, offSetEdgeY + height],
				[box.depth / 2 - width / 2, offSetEdgeY],
			];

			const models: IModel[] = [
				new makerjs.models.ConnectTheDots(true, bottomLeft),
				new makerjs.models.ConnectTheDots(true, bottomRight),
				new makerjs.models.ConnectTheDots(true, topLeft),
				new makerjs.models.ConnectTheDots(true, topRight),
			];

			if (connector === side || connector === 'BOTH') models.push(new makerjs.models.ConnectTheDots(true, bottomMid));

			return models;
		}

		function slotPointsVertical(backSlotHeight: number, backSlotWidth: number, offSetEdgeY: number, offSetEdgeX: number, box: Box ): { top: IModel; bottom: IModel } {
			// const backSlotHeight = backTenonWidth;
			// const backSlotWidth = slotHeight;
			// const offSetEdgeY = backTenonOffSetEdgeY;
			// const offSetEdgeX = slotOffSetEdgeX;
            const xPos = box.depth - offSetEdgeX / 2;

			// const xPos = side === 'RIGHT' ? width + offSetEdgeX/2 : box.depth - offSetEdgeX /2;

			const top: [number, number][] = [
				[xPos, box.height - offSetEdgeY - backSlotHeight],
				[xPos - backSlotWidth, box.height - offSetEdgeY - backSlotHeight],
				[xPos - backSlotWidth, box.height - offSetEdgeY],
				[xPos, box.height - offSetEdgeY],
				[xPos, box.height - offSetEdgeY - backSlotHeight],
			];

			const bottom: [number, number][] = [
				[xPos, offSetEdgeY],
				[xPos - backSlotWidth, offSetEdgeY],
				[xPos - backSlotWidth, offSetEdgeY + backSlotHeight],
				[xPos, offSetEdgeY + backSlotHeight],
				[xPos, offSetEdgeY],
			];

			const models: { top: IModel; bottom: IModel } = {
				top: new makerjs.models.ConnectTheDots(true, top),
				bottom: new makerjs.models.ConnectTheDots(true, bottom),
			};

			return models;
		}

		let slotVTop = {};
		let slotVBottom = {};

		if (!box.backSide) {
			slotVTop = slotPointsVertical(backTenonWidth, slotHeight, backTenonOffSetEdgeY, slotOffSetEdgeX, box).top;
			slotVBottom = slotPointsVertical(backTenonWidth, slotHeight, backTenonOffSetEdgeY, slotOffSetEdgeX, box).bottom;
		}

		const boxSidePaths: IModel = {
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

		boxSidePaths.models = Object.assign(boxSidePaths.models, slotPointsHorizontal(side, slotHeight, slotWidth, slotOffSetEdgeY,slotOffSetEdgeX * 2));

		return boxSidePaths;
	}

	function connector(tenonWidth: number, tenonLength: number): IModel{
		const connectorPoints: [number, number][] = [
			[0, 0],
			[tenonWidth, 0],
			[tenonWidth, tenonLength],
			[(tenonWidth / 4) * 3, tenonLength],
			[(tenonWidth / 4) * 3, tenonLength + tenonLength / 2],
			[tenonWidth, tenonLength + tenonLength / 2],
			[tenonWidth, tenonLength * 2 + tenonLength / 2],
			[(tenonWidth / 4) * 3, tenonLength * 2 + tenonLength / 2],
			[(tenonWidth / 4) * 3, tenonLength * 3],
			[tenonWidth, tenonLength * 3],
			[tenonWidth, tenonLength * 4],
			[0, tenonLength * 4],
			[0, tenonLength * 3],
			[tenonWidth / 4, tenonLength * 3],
			[tenonWidth / 4, tenonLength * 2 + tenonLength / 2],
			[0, tenonLength * 2 + tenonLength / 2],
			[0, tenonLength + tenonLength / 2],
			[tenonWidth / 4, tenonLength + tenonLength / 2],
			[tenonWidth / 4, tenonLength],
			[0, tenonLength],
		];
		return new makerjs.models.ConnectTheDots(true, connectorPoints);
	}

	function boxGround(box: Box, material: Material, tenonWidth: number, offSetEdgeX: number, connectorTenonWidth: number, connectorTenonLength: number): IModel{
		const tenonLength = material.thickness;
        // const sideTenonWidth = slotWidth;
        const connector = box.connector;

		const frontLine = new makerjs.paths.Line([tenonLength, 0], [box.width - tenonLength, 0]);
		const backLine = new makerjs.paths.Line([tenonLength, box.depth], [box.width - tenonLength, box.depth]);
        tenonLength
		const leftSidePoints: [number, number][] = [
			[tenonLength, 0],
			[tenonLength, offSetEdgeX],
			[0, offSetEdgeX],
			[0, offSetEdgeX + tenonWidth],
			[tenonLength, offSetEdgeX + tenonWidth],
			[tenonLength, box.depth - tenonWidth - offSetEdgeX],
			[0, box.depth - tenonWidth - offSetEdgeX],
			[0, box.depth - offSetEdgeX],
			[tenonLength, box.depth - offSetEdgeX],
			[tenonLength, box.depth],
		];

		const rightSidePoints: [number, number][] = [
			[box.width - tenonLength, 0],
			[box.width - tenonLength, offSetEdgeX],
			[box.width, offSetEdgeX],
			[box.width, offSetEdgeX + tenonWidth],
			[box.width - tenonLength, offSetEdgeX + tenonWidth],
			[box.width - tenonLength, box.depth - tenonWidth - offSetEdgeX],
			[box.width, box.depth - tenonWidth - offSetEdgeX],
			[box.width, box.depth - offSetEdgeX],
			[box.width - tenonLength, box.depth - offSetEdgeX],
			[box.width - tenonLength, box.depth],
		];

		const leftLine = new makerjs.models.ConnectTheDots(false, leftSidePoints);
		const rightLine = new makerjs.models.ConnectTheDots(false, rightSidePoints);

		const connectorSlotPointsLeft: [number, number][] = [
			[tenonLength, box.depth / 2 - connectorTenonWidth / 4],
			[tenonLength + connectorTenonLength / 2, box.depth / 2 - connectorTenonWidth / 4],
			[tenonLength + connectorTenonLength / 2, box.depth / 2 - connectorTenonWidth / 2],
			[tenonLength + connectorTenonLength + connectorTenonLength / 2, box.depth / 2 - connectorTenonWidth / 2],
			[tenonLength + connectorTenonLength + connectorTenonLength / 2, box.depth / 2 + connectorTenonWidth / 2],
			[tenonLength + connectorTenonLength / 2, box.depth / 2 + connectorTenonWidth / 2],
			[tenonLength + connectorTenonLength / 2, box.depth / 2 + connectorTenonWidth / 4],
			[tenonLength, box.depth / 2 + connectorTenonWidth / 4],
		];

		const connectorSlotPointsRight: [number, number][] = [
			[box.width - tenonLength, box.depth / 2 - connectorTenonWidth / 4],
			[box.width - tenonLength - connectorTenonLength / 2, box.depth / 2 - connectorTenonWidth / 4],
			[box.width - tenonLength - connectorTenonLength / 2, box.depth / 2 - connectorTenonWidth / 2],
			[box.width - tenonLength - connectorTenonLength - connectorTenonLength / 2, box.depth / 2 - connectorTenonWidth / 2],
			[box.width - tenonLength - connectorTenonLength - connectorTenonLength / 2, box.depth / 2 + connectorTenonWidth / 2],
			[box.width - tenonLength - connectorTenonLength / 2, box.depth / 2 + connectorTenonWidth / 2],
			[box.width - tenonLength - connectorTenonLength / 2, box.depth / 2 + connectorTenonWidth / 4],
			[box.width - tenonLength, box.depth / 2 + connectorTenonWidth / 4],
		];

		let slotLeftLine: IModel = {};
		let slotRightLine: IModel = {};

		if ([Connector.LEFT, Connector.BOTH].includes(connector)) slotLeftLine = new makerjs.models.ConnectTheDots(false, connectorSlotPointsLeft);
		if ([Connector.RIGHT, Connector.BOTH].includes(connector)) slotRightLine = new makerjs.models.ConnectTheDots(false, connectorSlotPointsRight);

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

		let backSlotLine: IModel = {};

		if (box.backSide) {
			backSlotLine = new makerjs.models.ConnectTheDots(true, slotPointsBack);
		}

		const boxGroundPaths: IModel = {
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

	function backSide(tenonWidth: number, tenonLength: number, backTenonOffSetEdgeY: number, box: Box) {
		// const tenonWidth = backTenonWidth;
		// const tenonLength = backTenonLength;

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
			[tenonLength, box.height - tenonLength],
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
			[box.width - tenonLength, box.height - tenonLength],
		];

		const topSidePoints: [number, number][] = [
			[tenonLength, box.height - tenonLength],
			[box.width / 2 - tenonWidth / 2, box.height - tenonLength],
			[box.width / 2 - tenonWidth / 2, box.height],
			[box.width / 2 + tenonWidth / 2, box.height],
			[box.width / 2 + tenonWidth / 2, box.height - tenonLength],
			[box.width - tenonLength, box.height - tenonLength],
		];

		const bottomSidePoints: [number, number][] = [
			[tenonLength, tenonLength],
			[box.width / 2 - tenonWidth / 2, tenonLength],
			[box.width / 2 - tenonWidth / 2, 0],
			[box.width / 2 + tenonWidth / 2, 0],
			[box.width / 2 + tenonWidth / 2, tenonLength],
			[box.width - tenonLength, tenonLength],
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
			},
		};

		return boxBackPaths;
	}

	return {
		leftSide: boxSide(box.connector, 'LEFT'),
		rightSide: boxSide(box.connector, 'RIGHT'),
		connector: connector(connectorTenonWidth, connectorTenonLength),
		groundSide: boxGround(box, material, slotWidth, slotOffSetEdgeX, connectorTenonWidth, connectorTenonLength),
		backSide: backSide(backTenonWidth, backTenonLength, backTenonOffSetEdgeY, box),
	};
}
