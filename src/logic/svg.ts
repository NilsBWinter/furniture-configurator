import makerjs from 'makerjs';
import { unitType } from 'makerjs';

import { Box, Material, Connector, Machine } from './calculator';
import { boxCoordinates, Components } from './boxCoordinates';


export interface DownloadSVG {
	left: string;
	right: string;
	ground: string;
	back: string;
	connector: string;
}

/**
 * Function to create a SVG as string of a Component(Side) of a Box
 *
 * @param box Box of the Component(Side)
 * @param material material that will be used to process
 * @param component component(Side) that should be given back as an SVG as a String
 * @param svgOptions Optional render Options of the SVG see maker.js Docu
 */
export function getSVG(box: Box, material: Material, machine: Machine, component: Components, svgOptions?: makerjs.exporter.ISVGRenderOptions): string {
	return makerjs.exporter.toSVG(boxCoordinates(box, material, machine)[component], svgOptions);
}


/**
 * Function to Download all box Components(Side) as SVG
 * @param box Box of the Components
 * @param material Material to be processed
 */
export function downloadBoxSVG(box: Box, material: Material, machine: Machine, unit: string): void {
	const mTchickness = material.thickness ? material.thickness : 0;

	const svgOptions: makerjs.exporter.ISVGRenderOptions = {
		// strokeWidth: '0.1',
		units: unitType[unit],
	};
	const svgOptionsGround: makerjs.exporter.ISVGRenderOptions = {
		// strokeWidth: '0.1',
		units: unitType[unit],
	}
	const svgOptionsConnector: makerjs.exporter.ISVGRenderOptions = {
		// strokeWidth: '0.1',
		origin: [0, mTchickness * 8],
		units: unitType[unit],
	}
	const downloadSVGs: DownloadSVG= {
		left: getSVG(box, material, machine, Components.leftSide, svgOptions),
		right: '',
		ground: getSVG(box, material, machine, Components.groundSide, svgOptionsGround),
		back: '',
		connector: '',
	};

	if (box.connector === Connector.RIGHT || box.connector === Connector.BOTH)
		downloadSVGs.right = getSVG(box, material, machine, Components.rightSide, svgOptions);
	if (box.connector !== Connector.NONE) downloadSVGs.connector = getSVG(box, material, machine, Components.connector, svgOptionsConnector);
	if (box.backSide) downloadSVGs.back = getSVG(box, material, machine, Components.backSide, svgOptions);

	(Object.keys(downloadSVGs) as Array<keyof typeof downloadSVGs>).forEach((key) => {
		const element: string = downloadSVGs[key];
		if (element.length <= 0) return;

		// console.log(element);

		const a = document.createElement('a');
		a.href = 'data:image/svg; base64, ' + btoa(unescape(encodeURIComponent(element)));
		a.download = `${box.content}(${box.height}X${box.width})-${key}.svg`;
		// a.setAttribute('target', '_blank');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	});
}

/**
 * Function to download all SVGs of an Boxes Array
 *
 * @param boxes
 * @param material
 */
export function downloadBoxesSVG(boxes: Box[], material: Material, machine: Machine, unit: string) {
	boxes.forEach(box => downloadBoxSVG(box, material, machine, unit));
}