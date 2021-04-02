import makerjs, { IModel, IPathLine, IPathMap } from 'makerjs';
import { Box, Material, Connector, Machine, machines } from './calculator';

/**
 * Enum for the different Coordninate Components of a Box
 */
export enum Components {
    leftSide = "leftSide",
    rightSide = "rightSide",
    connector = "connector",
    groundSide = "groundSide",
    backSide = "backSide",
}
/**
 * Typedefinition for the Coordinate Components of a Box
 */
export type Coordinates = {
    [key in Components]: IModel;
}

/**
 * Function to create the Coordinates of a box for rendering & export
 *
 * @param box Box for the Coordinates
 * @param material Material of the Box
 */
export function boxCoordinates(box: Box, material: Material, machine: Machine): Coordinates {

	const dogboneRadius = machine.dogboneRadius ? machine.dogboneRadius : 0;

	let boxHeight = box.height;
	let boxWidth = box.width;
	let boxDepth = box.depth;

	// if the machine has a tolerance adjust box dimensions
	if (machine.tolerance && machine.tolerance > 0) {
		boxHeight = box.height + machine.tolerance / 2;
		boxWidth = box.width + machine.tolerance / 2;
		boxDepth = box.depth + machine.tolerance / 2;
	}

	const mTchickness = material.thickness ? material.thickness : 0;
	const boxTenonSize = 10;
	const boxPositiveTenons = 2;
	const boxNegativeTenons = boxPositiveTenons + 1;
	const boxTenonsSum = boxPositiveTenons + boxNegativeTenons;

	const slotOffSetEdgeX = 20;
	const slotOffSetEdgeY = 10 + boxTenonSize;
	const slotHeight = mTchickness;
	const slotWidth = boxDepth / boxTenonsSum;

	const connectorTenonWidth = slotWidth;
	const connectorTenonLength = mTchickness * 2;

	const backTenonWidth = boxHeight / boxTenonsSum;
	const backTenonLength = mTchickness;
	const backTenonOffSetEdgeY = slotOffSetEdgeY + slotHeight;

	/**
	 * function to create the Coordinates of a Side Component of a Box
	 *
	 * @param connector Connector Type of the Box
	 * @param side Side if left or right side should be created
	 */
	function boxSide(connector: Connector, side: 'LEFT' | 'RIGHT'): IModel {

		const bottomLine: IModel = {};
		const topLine: IModel = {};

		for (let i = 0; i < boxTenonsSum; i++) {
			const points1 = [(boxDepth / boxTenonsSum) * i, i % 2 !== 0 ? boxTenonSize : 0];
			const points2 = [(boxDepth / boxTenonsSum) * (i + 1), i % 2 !== 0 ? boxTenonSize : 0];
			if (typeof bottomLine.paths === 'undefined') bottomLine.paths = {};
			bottomLine.paths[i] = new makerjs.paths.Line(points1, points2);
			if (i+1 <= boxTenonsSum) {
				const points3 = [(boxDepth / boxTenonsSum) * (i + 1), (i + 1) % 2 !== 0 ? boxTenonSize : 0];
				bottomLine.paths[`${i}.${i}`] = new makerjs.paths.Line(points2, points3);
			}
		}

		for (let i = 0; i < boxTenonsSum; i++) {
			const points1 = [(boxDepth / boxTenonsSum) * i, boxHeight - (i % 2 !== 0 ? 0 : boxTenonSize)];
			const points2 = [(boxDepth / boxTenonsSum) * (i + 1), boxHeight - (i % 2 !== 0 ? 0 : boxTenonSize)];
			if (typeof topLine.paths === 'undefined') topLine.paths = {};
			topLine.paths[i] = new makerjs.paths.Line(points1, points2);
			if (i+2 <= boxTenonsSum) {
				const points3 = [(boxDepth / boxTenonsSum) * (i + 1), boxHeight - ((i + 1) % 2 !== 0 ? 0 : boxTenonSize)];
				topLine.paths[`${i}.${i}`] = new makerjs.paths.Line(points2, points3);
			}
		}

		// if machine is from type CNC (future: if a machine needs dogbones) 
		if (machine.name === machines.CNC.name) {
			const bottomLineDogbone: IModel = {};
			const topLineDogbone: IModel = {};
			for (let i = 0; i < boxTenonsSum; i++) {
				if (typeof bottomLineDogbone.paths === 'undefined') bottomLineDogbone.paths = {};
				if (typeof topLineDogbone.paths === 'undefined') topLineDogbone.paths = {};
				if (typeof bottomLine.paths === 'undefined') throw new Error('No path for bottomLine.paths');
				if (typeof topLine.paths === 'undefined') throw new Error('No path for topLine.paths');
	
				if ( i % 2 === 0) {
					bottomLineDogbone.paths[`dogbone-${i}`] = makerjs.path.dogbone(bottomLine.paths[`${i}.${i}`] as IPathLine, bottomLine.paths[`${i+1}`] as IPathLine, dogboneRadius);
					topLineDogbone.paths[`dogbone-${i}`] = makerjs.path.dogbone(topLine.paths[`${i}`] as IPathLine, topLine.paths[`${i}.${i}`] as IPathLine, dogboneRadius);
				} else {
					bottomLineDogbone.paths[`dogbone-${i}`] = makerjs.path.dogbone(bottomLine.paths[`${i}`] as IPathLine, bottomLine.paths[`${i}.${i}`] as IPathLine, dogboneRadius);
					topLineDogbone.paths[`dogbone-${i}`] = makerjs.path.dogbone(topLine.paths[`${i}.${i}`] as IPathLine, topLine.paths[`${i+1}`] as IPathLine, dogboneRadius);
				}
			}
	
			bottomLine.paths = {...bottomLine.paths, ...bottomLineDogbone.paths};
			topLine.paths = {...topLine.paths, ...topLineDogbone.paths};
		}
		

		const leftLine = new makerjs.paths.Line([0, 0], [0, boxHeight - boxTenonSize]);
		const rightLine = new makerjs.paths.Line([boxDepth, 0], [boxDepth, boxHeight - boxTenonSize]);

		/**
		 * Function to create the Points of the Horizontal Slots of the side Components for the bottom & top Component
		 *
		 * @param side left or right side to create horizontal slots on
		 * @param height height of the slots
		 * @param width width of the slots
		 * @param offSetEdgeY offset to the outer Edge on the Y Axis
		 * @param offSetEdgeX offset to the outer Edge on the X Axis
		 */
		function slotPointsHorizontal(side: 'LEFT' | 'RIGHT', height: number, width: number, offSetEdgeY: number, offSetEdgeX: number): IModel[] {

			let bottomLeft: IModel;
			let bottomRight: IModel;
			let bottomMid: IModel;
			let topLeft: IModel;
			let topRight: IModel;
			let topMid: IModel;
			
			// if machine is from type CNC (future: if a machine needs dogbones) 
			if (machine.name === machines.CNC.name) {
				bottomLeft = new makerjs.models.Dogbone(width, height, dogboneRadius);
				bottomRight = new makerjs.models.Dogbone(width, height, dogboneRadius);
				bottomMid = new makerjs.models.Dogbone(width, height, dogboneRadius);
				topLeft = new makerjs.models.Dogbone(width, height, dogboneRadius);
				topRight = new makerjs.models.Dogbone(width, height, dogboneRadius);
				topMid = new makerjs.models.Dogbone(width, height, dogboneRadius);
			} else {
				// normal Rectangles e.g for lasercutting
				bottomLeft = new makerjs.models.Rectangle(width, height);
				bottomRight = new makerjs.models.Rectangle(width, height);
				bottomMid = new makerjs.models.Rectangle(width, height);
				topLeft = new makerjs.models.Rectangle(width, height);
				topRight = new makerjs.models.Rectangle(width, height);
				topMid = new makerjs.models.Rectangle(width, height);
			}




			bottomLeft.origin = [offSetEdgeX, offSetEdgeY];
			bottomRight.origin = [boxDepth - offSetEdgeX - width, offSetEdgeY];
			topLeft.origin = [offSetEdgeX, boxHeight - offSetEdgeY - height];
			topRight.origin = [boxDepth - offSetEdgeX- width, boxHeight - offSetEdgeY - height];
			bottomMid.origin = [boxDepth / 2 - width / 2, offSetEdgeY];
			topMid.origin = [boxDepth / 2 - width / 2, boxHeight - offSetEdgeY - height];
			
	

			const models: IModel[] = [
				// new makerjs.models.ConnectTheDots(true, bottomLeft),
				bottomLeft,
				bottomRight,
				topLeft,
				topRight,
			];

			if (connector === side || connector === 'BOTH') {
				models.push(bottomMid);
				models.push(topMid);
			}

			return models;
		}

		/**
		 * Function to create the Points of the Vertical Slots of the side Components for the back Component
		 *
		 * @param side left or right side to create horizontal slots on
		 * @param height height of the slots
		 * @param width width of the slots
		 * @param offSetEdgeY offset to the outer Edge on the Y Axis
		 * @param offSetEdgeX offset to the outer Edge on the X Axis
		 * @param box box to create Coordinates for
		 */
		function slotPointsVertical(backSlotHeight: number, backSlotWidth: number, offSetEdgeY: number, offSetEdgeX: number): { top: IModel; bottom: IModel } {
			const xPos = boxDepth - offSetEdgeX / 2 - backSlotWidth;
			
			let top: IModel;
			let bottom: IModel;

			// if machine is from type CNC (future: if a machine needs dogbones) 
			if (machine.name === machines.CNC.name) {
				top = new makerjs.models.Dogbone(backSlotWidth, backSlotHeight, dogboneRadius);
				bottom = new makerjs.models.Dogbone(backSlotWidth, backSlotHeight, dogboneRadius);
				
			} else {
				// normal Rectangles e.g for lasercutting
				top = new makerjs.models.Rectangle(backSlotWidth, backSlotHeight);
				bottom = new makerjs.models.Rectangle(backSlotWidth, backSlotHeight);
				
			}

			top.origin = [xPos, boxHeight - offSetEdgeY - backSlotHeight];
			bottom.origin = [xPos, offSetEdgeY];

			const models: { top: IModel; bottom: IModel } = {
				top,
				bottom,
			};

			return models;
		}

		let slotVTop = {};
		let slotVBottom = {};

		if (box.backSide) {
			slotVTop = slotPointsVertical(backTenonWidth, slotHeight, backTenonOffSetEdgeY, slotOffSetEdgeX).top;
			slotVBottom = slotPointsVertical(backTenonWidth, slotHeight, backTenonOffSetEdgeY, slotOffSetEdgeX).bottom;
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

	/**
	 * Function to create the Coordinates of the Connector Component of a Box based on the size of the dimsnions of a tenon
	 *
	 * @param tenonWidth width of a tenon
	 * @param tenonLength height of a tenon
	 */
	function connector(tenonWidth: number, tenonLength: number): IModel {

		const connectorPaths: IPathMap = {
			bottom: new makerjs.paths.Line([0, 0], [tenonWidth, 0]),
			rigth1: new makerjs.paths.Line([tenonWidth, 0], [tenonWidth, tenonLength]),
			right2: new makerjs.paths.Line([tenonWidth, tenonLength], [(tenonWidth / 4) * 3, tenonLength]),
			right3: new makerjs.paths.Line([(tenonWidth / 4) * 3, tenonLength], [(tenonWidth / 4) * 3, tenonLength + tenonLength / 2]),
			right4: new makerjs.paths.Line([(tenonWidth / 4) * 3, tenonLength + tenonLength / 2], [tenonWidth, tenonLength + tenonLength / 2]),
			rigth5: new makerjs.paths.Line([tenonWidth, tenonLength + tenonLength / 2], [tenonWidth, tenonLength * 2 + tenonLength / 2]),
			right6: new makerjs.paths.Line([tenonWidth, tenonLength * 2 + tenonLength / 2], [(tenonWidth / 4) * 3, tenonLength * 2 + tenonLength / 2]),
			right7: new makerjs.paths.Line([(tenonWidth / 4) * 3, tenonLength * 2 + tenonLength / 2], [(tenonWidth / 4) * 3, tenonLength * 3]),
			right8: new makerjs.paths.Line([(tenonWidth / 4) * 3, tenonLength * 3], [tenonWidth, tenonLength * 3]),
			right9: new makerjs.paths.Line([tenonWidth, tenonLength * 3], [tenonWidth, tenonLength * 4]),
			top: new makerjs.paths.Line([tenonWidth, tenonLength * 4], [0, tenonLength * 4]),
			left9: new makerjs.paths.Line([0, tenonLength * 4], [0, tenonLength * 3]),
			left8: new makerjs.paths.Line([0, tenonLength * 3], [tenonWidth / 4, tenonLength * 3]),
			left7: new makerjs.paths.Line([tenonWidth / 4, tenonLength * 3], [tenonWidth / 4, tenonLength * 2 + tenonLength / 2]),
			left6: new makerjs.paths.Line([tenonWidth / 4, tenonLength * 2 + tenonLength / 2], [0, tenonLength * 2 + tenonLength / 2]),
			left5: new makerjs.paths.Line([0, tenonLength * 2 + tenonLength / 2], [0, tenonLength + tenonLength / 2]),
			left4: new makerjs.paths.Line([0, tenonLength + tenonLength / 2], [tenonWidth / 4, tenonLength + tenonLength / 2]),
			left3: new makerjs.paths.Line([tenonWidth / 4, tenonLength + tenonLength / 2], [tenonWidth / 4, tenonLength]),
			left2: new makerjs.paths.Line([tenonWidth / 4, tenonLength], [0, tenonLength]),
			left1: new makerjs.paths.Line([0, tenonLength], [0,0])
		}

		const c: IModel = {
			paths: connectorPaths	
		}

		// if machine is from type CNC (future: if a machine needs dogbones) 
		if (machine.name === machines.CNC.name) {

			const connedctorDogBones: IPathMap = {
				dogboneRight1: makerjs.path.dogbone(connectorPaths.right2 as IPathLine, connectorPaths.right3 as IPathLine, dogboneRadius),
				dogboneRight2: makerjs.path.dogbone(connectorPaths.right3 as IPathLine, connectorPaths.right4 as IPathLine, dogboneRadius),
				dogboneRight3: makerjs.path.dogbone(connectorPaths.right6 as IPathLine, connectorPaths.right7 as IPathLine, dogboneRadius),
				dogboneRight4: makerjs.path.dogbone(connectorPaths.right7 as IPathLine, connectorPaths.right8 as IPathLine, dogboneRadius),
	
				dogboneLeft1: makerjs.path.dogbone(connectorPaths.left2 as IPathLine, connectorPaths.left3 as IPathLine, dogboneRadius),
				dogboneLeft2: makerjs.path.dogbone(connectorPaths.left3 as IPathLine, connectorPaths.left4 as IPathLine, dogboneRadius),
				dogboneLeft3: makerjs.path.dogbone(connectorPaths.left6 as IPathLine, connectorPaths.left7 as IPathLine, dogboneRadius),
				dogboneLeft4: makerjs.path.dogbone(connectorPaths.left7 as IPathLine, connectorPaths.left8 as IPathLine, dogboneRadius),
				
			}

			c.paths = {...c.paths, ...connedctorDogBones}
		}



		return c;
	}

	/**
	 * Function to create the Coordinates of a ground Component of the Box, includes top & bottom Component
	 *
	 * @param box Box of wich the Component should be created for
	 * @param material Material of the Box
	 * @param tenonWidth width of the Tenons of the Box
	 * @param offSetEdgeX offSet on the X-Axis of the Tenons to the Outer Edge
	 * @param connectorTenonWidth width of the Connector Tenon (Connector Component to Connect 2 Boxes vertically)
	 * @param connectorTenonLength length of the Connector Tenon (Connector Component to Connect 2 Boxes vertically)
	 */
	function boxGround(box: Box, material: Material, tenonWidth: number, offSetEdgeX: number, connectorTenonWidth: number, connectorTenonLength: number): IModel{
		const mTchickness = material.thickness ? material.thickness : 0;
		const tenonLength = mTchickness;
        // const sideTenonWidth = slotWidth;
		const connector = box.connector;
		
		const backSlotWidth = boxHeight / boxTenonsSum;
		const backSlotHeight = slotHeight;
		const offSetEdgeY = slotOffSetEdgeX;

		// Sides
		const frontLine = new makerjs.paths.Line([tenonLength, 0], [boxWidth - tenonLength, 0]);
		const backLine = new makerjs.paths.Line([tenonLength, boxDepth], [boxWidth - tenonLength, boxDepth]);

        let leftLine: IPathMap = {
			left1: new makerjs.paths.Line([tenonLength, 0], [tenonLength, offSetEdgeX]),
			left2: new makerjs.paths.Line([tenonLength, offSetEdgeX], [0, offSetEdgeX]),
			left3: new makerjs.paths.Line([0, offSetEdgeX], [0, offSetEdgeX + tenonWidth]),
			left4: new makerjs.paths.Line([0, offSetEdgeX + tenonWidth], [tenonLength, offSetEdgeX + tenonWidth]),
			left5: new makerjs.paths.Line([tenonLength, offSetEdgeX + tenonWidth], [tenonLength, boxDepth - tenonWidth - offSetEdgeX]),
			left6: new makerjs.paths.Line([tenonLength, boxDepth - tenonWidth - offSetEdgeX], [0, boxDepth - tenonWidth - offSetEdgeX]),
			left7: new makerjs.paths.Line([0, boxDepth - tenonWidth - offSetEdgeX], [0, boxDepth - offSetEdgeX]),
			left8: new makerjs.paths.Line([0, boxDepth - offSetEdgeX], [tenonLength, boxDepth - offSetEdgeX]),
			left9: new makerjs.paths.Line([tenonLength, boxDepth - offSetEdgeX], [tenonLength, boxDepth]),
		}

		
		let rightLine: IPathMap = {
			right1: new makerjs.paths.Line([boxWidth - tenonLength, 0], [boxWidth - tenonLength, offSetEdgeX]),
			right2: new makerjs.paths.Line([boxWidth - tenonLength, offSetEdgeX], [boxWidth, offSetEdgeX]),
			right3: new makerjs.paths.Line([boxWidth, offSetEdgeX], [boxWidth, offSetEdgeX + tenonWidth]),
			right4: new makerjs.paths.Line([boxWidth, offSetEdgeX + tenonWidth], [boxWidth - tenonLength, offSetEdgeX + tenonWidth]),
			right5: new makerjs.paths.Line([boxWidth - tenonLength, offSetEdgeX + tenonWidth], [boxWidth - tenonLength, boxDepth - tenonWidth - offSetEdgeX]),
			right6: new makerjs.paths.Line([boxWidth - tenonLength, boxDepth - tenonWidth - offSetEdgeX], [boxWidth, boxDepth - tenonWidth - offSetEdgeX]),
			right7: new makerjs.paths.Line([boxWidth, boxDepth - tenonWidth - offSetEdgeX], [boxWidth, boxDepth - offSetEdgeX]),
			right8: new makerjs.paths.Line([boxWidth, boxDepth - offSetEdgeX], [boxWidth - tenonLength, boxDepth - offSetEdgeX]),
			right9: new makerjs.paths.Line([boxWidth - tenonLength, boxDepth - offSetEdgeX], [boxWidth - tenonLength, boxDepth]),
		}
		
		
		// if machine is from type CNC (future: if a machine needs dogbones) 
		if (machine.name === machines.CNC.name) {

			const leftLineDogBones: IPathMap = {
				dogboneLeft1: makerjs.path.dogbone(leftLine.left1 as IPathLine, leftLine.left2 as IPathLine, dogboneRadius),
				dogboneLeft2: makerjs.path.dogbone(leftLine.left4 as IPathLine, leftLine.left5 as IPathLine, dogboneRadius),
				dogboneLeft3: makerjs.path.dogbone(leftLine.left5 as IPathLine, leftLine.left6 as IPathLine, dogboneRadius),
				dogboneLeft4: makerjs.path.dogbone(leftLine.left8 as IPathLine, leftLine.left9 as IPathLine, dogboneRadius),
			}

			const rightLineDogBones: IPathMap = {
				dogboneRight1: makerjs.path.dogbone(rightLine.right1 as IPathLine, rightLine.right2 as IPathLine, dogboneRadius),
				dogboneRight2: makerjs.path.dogbone(rightLine.right4 as IPathLine, rightLine.right5 as IPathLine, dogboneRadius),
				dogboneRight3: makerjs.path.dogbone(rightLine.right5 as IPathLine, rightLine.right6 as IPathLine, dogboneRadius),
				dogboneRight4: makerjs.path.dogbone(rightLine.right8 as IPathLine, rightLine.right9 as IPathLine, dogboneRadius),
			}

			leftLine = {...leftLine, ...leftLineDogBones};
			rightLine = {...rightLine, ...rightLineDogBones};
		} 

		let connectorSlotLeft: IPathMap = {
			leftC1: new makerjs.paths.Line([tenonLength, box.depth / 2 - connectorTenonWidth / 4], [tenonLength + connectorTenonLength / 2, box.depth / 2 - connectorTenonWidth / 4]),
			leftC2: new makerjs.paths.Line([tenonLength + connectorTenonLength / 2, box.depth / 2 - connectorTenonWidth / 4], [tenonLength + connectorTenonLength / 2, box.depth / 2 - connectorTenonWidth / 2]),
			leftC3: new makerjs.paths.Line([tenonLength + connectorTenonLength / 2, box.depth / 2 - connectorTenonWidth / 2], [tenonLength + connectorTenonLength + connectorTenonLength / 2, box.depth / 2 - connectorTenonWidth / 2]),
			leftC4: new makerjs.paths.Line([tenonLength + connectorTenonLength + connectorTenonLength / 2, box.depth / 2 - connectorTenonWidth / 2], [tenonLength + connectorTenonLength + connectorTenonLength / 2, box.depth / 2 + connectorTenonWidth / 2]),
			leftC5: new makerjs.paths.Line([tenonLength + connectorTenonLength + connectorTenonLength / 2, box.depth / 2 + connectorTenonWidth / 2], [tenonLength + connectorTenonLength / 2, box.depth / 2 + connectorTenonWidth / 2]),
			leftC6: new makerjs.paths.Line([tenonLength + connectorTenonLength / 2, box.depth / 2 + connectorTenonWidth / 2], [tenonLength + connectorTenonLength / 2, box.depth / 2 + connectorTenonWidth / 4]),
			leftC7: new makerjs.paths.Line([tenonLength + connectorTenonLength / 2, box.depth / 2 + connectorTenonWidth / 4], [tenonLength, box.depth / 2 + connectorTenonWidth / 4]),
		};

		// needed correction of 1 on x-Axis needs recheck or test in real life
		let connectorSlotRight: IPathMap = {
			rightC1: new makerjs.paths.Line([1 + box.width - tenonLength, box.depth / 2 - connectorTenonWidth / 4], [1 + box.width - tenonLength - connectorTenonLength / 2, box.depth / 2 - connectorTenonWidth / 4]),
			rightC3: new makerjs.paths.Line([1 + box.width - tenonLength - connectorTenonLength / 2, box.depth / 2 - connectorTenonWidth / 4], [1 + box.width - tenonLength - connectorTenonLength / 2, box.depth / 2 - connectorTenonWidth / 2]),
			rightC4: new makerjs.paths.Line([1 + box.width - tenonLength - connectorTenonLength / 2, box.depth / 2 - connectorTenonWidth / 2], [1 + box.width - tenonLength - connectorTenonLength - connectorTenonLength / 2, box.depth / 2 - connectorTenonWidth / 2]),
			rightC5: new makerjs.paths.Line([1 + box.width - tenonLength - connectorTenonLength - connectorTenonLength / 2, box.depth / 2 - connectorTenonWidth / 2], [1 + box.width - tenonLength - connectorTenonLength - connectorTenonLength / 2, box.depth / 2 + connectorTenonWidth / 2]),
			rightC6: new makerjs.paths.Line([1 + box.width - tenonLength - connectorTenonLength - connectorTenonLength / 2, box.depth / 2 + connectorTenonWidth / 2], [1 + box.width - tenonLength - connectorTenonLength / 2, box.depth / 2 + connectorTenonWidth / 2]),
			rightC7: new makerjs.paths.Line([1 + box.width - tenonLength - connectorTenonLength / 2, box.depth / 2 + connectorTenonWidth / 2], [1 + box.width - tenonLength - connectorTenonLength / 2, box.depth / 2 + connectorTenonWidth / 4]),
			rightC8: new makerjs.paths.Line([1 + box.width - tenonLength - connectorTenonLength / 2, box.depth / 2 + connectorTenonWidth / 4], [1 + box.width - tenonLength, box.depth / 2 + connectorTenonWidth / 4]),
		}

		// if machine is from type CNC (future: if a machine needs dogbones) 
		if (machine.name === machines.CNC.name) {
			const leftConnectorDogBones: IPathMap = {
				dogboneLeftC1: makerjs.path.dogbone(connectorSlotLeft.leftC2 as IPathLine, connectorSlotLeft.leftC3 as IPathLine, dogboneRadius),
				dogboneLeftC2: makerjs.path.dogbone(connectorSlotLeft.leftC3 as IPathLine, connectorSlotLeft.leftC4 as IPathLine, dogboneRadius),
				dogboneLeftC3: makerjs.path.dogbone(connectorSlotLeft.leftC4 as IPathLine, connectorSlotLeft.leftC5 as IPathLine, dogboneRadius),
				dogboneLeftC4: makerjs.path.dogbone(connectorSlotLeft.leftC5 as IPathLine, connectorSlotLeft.leftC6 as IPathLine, dogboneRadius),
			};

			const rightConnectorDogBones: IPathMap = {
				dogboneRightC1: makerjs.path.dogbone(connectorSlotRight.rightC3 as IPathLine, connectorSlotRight.rightC4 as IPathLine, dogboneRadius),
				dogboneRightC2: makerjs.path.dogbone(connectorSlotRight.rightC4 as IPathLine, connectorSlotRight.rightC5 as IPathLine, dogboneRadius),
				dogboneRightC3: makerjs.path.dogbone(connectorSlotRight.rightC5 as IPathLine, connectorSlotRight.rightC6 as IPathLine, dogboneRadius),
				dogboneRightC4: makerjs.path.dogbone(connectorSlotRight.rightC6 as IPathLine, connectorSlotRight.rightC7 as IPathLine, dogboneRadius),
			};

			connectorSlotLeft = {...connectorSlotLeft, ...leftConnectorDogBones};
			connectorSlotRight = {...connectorSlotRight, ...rightConnectorDogBones};
		}

		// Slots
		let slotBack: IModel;
		
		// if machine is from type CNC (future: if a machine needs dogbones) 
		if (machine.name === machines.CNC.name) {

			slotBack = new makerjs.models.Dogbone(backSlotWidth, backSlotHeight, dogboneRadius);
		} else {
			// normal Rectangles e.g for lasercutting
			slotBack = new makerjs.models.Rectangle(connectorTenonLength, backSlotHeight);
		}


		slotBack.origin = [boxWidth / 2 - backSlotWidth, boxDepth - offSetEdgeY - backSlotHeight];


		// if ([Connector.LEFT, Connector.BOTH].includes(connector)) slotLeftLine = slotLeft;
		if ([Connector.LEFT, Connector.BOTH].includes(connector)) leftLine = {...leftLine, ...connectorSlotLeft};
		if ([Connector.RIGHT, Connector.BOTH].includes(connector)) rightLine = {...rightLine, ...connectorSlotRight};


		let backSlotLine: IModel = {};

		if (box.backSide) {
			backSlotLine = slotBack;
		}

		const boxGroundPaths: IModel = {
			models: {
				backSlot: backSlotLine,
			},
			paths: {
				front: frontLine,
				back: backLine,
			},
		};

		boxGroundPaths.paths = {...boxGroundPaths.paths, ...leftLine, ...rightLine};
		return boxGroundPaths;
	}

	/**
	 * Function to create the Coordinates of the Backside of the Box
	 *
	 * @param tenonWidth width of the Tenons of the Backside to connect with the other sides
	 * @param tenonLength length of the Tenons of the Backside to connect with the other sides
	 * @param backTenonOffSetEdgeY offset to the outer Edge of the Component from the Tenons
	 * @param box Box the Backside Component
	 */
	function backSide(tenonWidth: number, tenonLength: number, backTenonOffSetEdgeY: number) {

		const left: IPathMap = {
			left1: new makerjs.paths.Line([tenonLength, tenonLength], [tenonLength, backTenonOffSetEdgeY]),
			left2: new makerjs.paths.Line([tenonLength, backTenonOffSetEdgeY], [0, backTenonOffSetEdgeY]),
			left3: new makerjs.paths.Line([0, backTenonOffSetEdgeY], [0, backTenonOffSetEdgeY + tenonWidth]),
			left4: new makerjs.paths.Line([0, backTenonOffSetEdgeY + tenonWidth], [tenonLength, backTenonOffSetEdgeY + tenonWidth]),
			left5: new makerjs.paths.Line([tenonLength, backTenonOffSetEdgeY + tenonWidth], [tenonLength, boxHeight - backTenonOffSetEdgeY - tenonWidth]),
			left6: new makerjs.paths.Line([tenonLength, boxHeight - backTenonOffSetEdgeY - tenonWidth], [0, boxHeight - backTenonOffSetEdgeY - tenonWidth]),
			left7: new makerjs.paths.Line([0, boxHeight - backTenonOffSetEdgeY - tenonWidth], [0, boxHeight - backTenonOffSetEdgeY]),
			left8: new makerjs.paths.Line([0, boxHeight - backTenonOffSetEdgeY], [tenonLength, boxHeight - backTenonOffSetEdgeY]),
			left9: new makerjs.paths.Line([tenonLength, boxHeight - backTenonOffSetEdgeY], [tenonLength, boxHeight - tenonLength]),
		}

		const right: IPathMap = {
			right1: new makerjs.paths.Line([boxWidth - tenonLength, tenonLength], [boxWidth - tenonLength, backTenonOffSetEdgeY]),
			right2: new makerjs.paths.Line([boxWidth - tenonLength, backTenonOffSetEdgeY], [boxWidth, backTenonOffSetEdgeY]),
			right3: new makerjs.paths.Line([boxWidth, backTenonOffSetEdgeY], [boxWidth, backTenonOffSetEdgeY + tenonWidth]),
			right4: new makerjs.paths.Line([boxWidth, backTenonOffSetEdgeY + tenonWidth], [boxWidth - tenonLength, backTenonOffSetEdgeY + tenonWidth]),
			right5: new makerjs.paths.Line([boxWidth - tenonLength, backTenonOffSetEdgeY + tenonWidth], [boxWidth - tenonLength, boxHeight - backTenonOffSetEdgeY - tenonWidth]),
			right6: new makerjs.paths.Line([boxWidth - tenonLength, boxHeight - backTenonOffSetEdgeY - tenonWidth], [boxWidth, boxHeight - backTenonOffSetEdgeY - tenonWidth]),
			right7: new makerjs.paths.Line([boxWidth, boxHeight - backTenonOffSetEdgeY - tenonWidth], [boxWidth, boxHeight - backTenonOffSetEdgeY]),
			right8: new makerjs.paths.Line([boxWidth, boxHeight - backTenonOffSetEdgeY], [boxWidth - tenonLength, boxHeight - backTenonOffSetEdgeY]),
			right9: new makerjs.paths.Line([boxWidth - tenonLength, boxHeight - backTenonOffSetEdgeY], [boxWidth - tenonLength, boxHeight - tenonLength]),
		}

		const top: IPathMap = {
			top1: new makerjs.paths.Line([tenonLength, boxHeight - tenonLength], [boxWidth / 2 - tenonWidth / 2, boxHeight - tenonLength]),
			top2: new makerjs.paths.Line([boxWidth / 2 - tenonWidth / 2, boxHeight - tenonLength], [boxWidth / 2 - tenonWidth / 2, boxHeight]),
			top3: new makerjs.paths.Line([boxWidth / 2 - tenonWidth / 2, boxHeight], [boxWidth / 2 + tenonWidth / 2, boxHeight]),
			top4: new makerjs.paths.Line([boxWidth / 2 + tenonWidth / 2, boxHeight], [boxWidth / 2 + tenonWidth / 2, boxHeight - tenonLength]),
			top5: new makerjs.paths.Line([boxWidth / 2 + tenonWidth / 2, boxHeight - tenonLength], [boxWidth - tenonLength, boxHeight - tenonLength]),
		}

		const bottom: IPathMap = {
			bottom1: new makerjs.paths.Line([tenonLength, tenonLength], [boxWidth / 2 - tenonWidth / 2, tenonLength]),
			bottom2: new makerjs.paths.Line([boxWidth / 2 - tenonWidth / 2, tenonLength], [boxWidth / 2 - tenonWidth / 2, 0]),
			bottom3: new makerjs.paths.Line([boxWidth / 2 - tenonWidth / 2, 0], [boxWidth / 2 + tenonWidth / 2, 0]),
			bottom4: new makerjs.paths.Line([boxWidth / 2 + tenonWidth / 2, 0], [boxWidth / 2 + tenonWidth / 2, tenonLength]),
			bottom5: new makerjs.paths.Line([boxWidth / 2 + tenonWidth / 2, tenonLength], [boxWidth - tenonLength, tenonLength]),
		}

		const boxBack = {
			paths: {},
		};

		boxBack.paths = {...boxBack.paths, ...left, ...right, ...top, ...bottom};

		// if machine is from type CNC (future: if a machine needs dogbones) 
		if (machine.name === machines.CNC.name) {
			const dogBonesLeft: IPathMap = {
				dogboneLeft1: makerjs.path.dogbone(left.left1 as IPathLine, left.left2 as IPathLine, dogboneRadius),
				dogboneLeft2: makerjs.path.dogbone(left.left4 as IPathLine, left.left5 as IPathLine, dogboneRadius),
				dogboneLeft3: makerjs.path.dogbone(left.left5 as IPathLine, left.left6 as IPathLine, dogboneRadius),
				dogboneLeft4: makerjs.path.dogbone(left.left8 as IPathLine, left.left9 as IPathLine, dogboneRadius),
			}

			const dogBonesRight: IPathMap = {
				dogboneRight1: makerjs.path.dogbone(right.right1 as IPathLine, right.right2 as IPathLine, dogboneRadius),
				dogboneRight2: makerjs.path.dogbone(right.right4 as IPathLine, right.right5 as IPathLine, dogboneRadius),
				dogboneRight3: makerjs.path.dogbone(right.right5 as IPathLine, right.right6 as IPathLine, dogboneRadius),
				dogboneRight4: makerjs.path.dogbone(right.right8 as IPathLine, right.right9 as IPathLine, dogboneRadius),
			}

			const dogBonesTop: IPathMap = {
				dogboneTop1: makerjs.path.dogbone(top.top1 as IPathLine, top.top2 as IPathLine, dogboneRadius),
				dogboneTop2: makerjs.path.dogbone(top.top3 as IPathLine, top.top4 as IPathLine, dogboneRadius),
			}

			const dogBonesBottom: IPathMap = {
				dogboneBottom1: makerjs.path.dogbone(bottom.bottom1 as IPathLine, bottom.bottom2 as IPathLine, dogboneRadius),
				dogboneBottom2: makerjs.path.dogbone(bottom.bottom3 as IPathLine, bottom.bottom4 as IPathLine, dogboneRadius),
			}

			boxBack.paths = { ...boxBack.paths, ...dogBonesLeft, ...dogBonesRight, ...dogBonesTop, ...dogBonesBottom};
		}

		return boxBack;
	}

	return {
		leftSide: boxSide(box.connector, 'LEFT'),
		rightSide: boxSide(box.connector, 'RIGHT'),
		connector: connector(connectorTenonWidth, connectorTenonLength),
		groundSide: boxGround(box, material, slotWidth, slotOffSetEdgeX, connectorTenonWidth, connectorTenonLength),
		backSide: backSide(backTenonWidth, backTenonLength, backTenonOffSetEdgeY),
	};
}
