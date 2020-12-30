import makerjs from 'makerjs';

import { Box, Material, Connector } from './calculator';
import { Sides } from './boxCoordinates';
import { boxCoordinates } from '../store/boxCoordinates';

export interface DownloadSVG {
	left: string;
	right: string;
	ground: string;
	back: string;
	connector: string;
}

export function getSVG(box: Box, material: Material, side: Sides, svgOptions?: makerjs.exporter.ISVGRenderOptions): string {
	return makerjs.exporter.toSVG(boxCoordinates(box, material)[side], svgOptions);
}

export function downloadSVG(box: Box, material: Material): void {
	const svgOptions: makerjs.exporter.ISVGRenderOptions = {
		strokeWidth: '0.1',
		units: 'mm',
	};
	const svgOptionsGround: makerjs.exporter.ISVGRenderOptions = {
		strokeWidth: '0.1',
		origin: [0, box.width * 2],
		units: 'mm',
	}
	const svgOptionsConnector: makerjs.exporter.ISVGRenderOptions = {
		strokeWidth: '0.1',
		origin: [0, material.thickness * 8],
		units: 'mm',
	}
	const downloadSVGs: DownloadSVG= {
		left: getSVG(box, material, Sides.leftSide, svgOptions),
		right: '',
		ground: getSVG(box, material, Sides.groundSide, svgOptionsGround),
		back: '',
		connector: '',
	};

	if (box.connector === Connector.RIGHT || box.connector === Connector.BOTH)
		downloadSVGs.right = getSVG(box, material, Sides.rightSide, svgOptions);
	if (box.connector !== Connector.NONE) downloadSVGs.connector = getSVG(box, material, Sides.connector, svgOptionsConnector);
	if (box.backSide) downloadSVGs.back = getSVG(box, material, Sides.backSide, svgOptions);

	(Object.keys(downloadSVGs) as Array<keyof typeof downloadSVGs>).forEach((key) => {
		const element: string = downloadSVGs[key];
		if (element.length <= 0) return;

		// console.log(element);

		const a = document.createElement('a');
		a.href = 'data:image/svg; base64, ' + btoa(unescape(encodeURIComponent(element)));
		a.download = `${box.name}-${key}.svg`;
		// a.setAttribute('target', '_blank');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	});
}