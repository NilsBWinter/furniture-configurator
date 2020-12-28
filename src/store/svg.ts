import makerjs from 'makerjs';

import { Box, Material } from './calculator';
import { Sides } from './boxCoordinates';
import { boxCoordinates } from '../store/boxCoordinates';

export function getSVG(box: Box, material: Material, side: Sides, svgOptions?: makerjs.exporter.ISVGRenderOptions): string {
	return makerjs.exporter.toSVG(boxCoordinates(box, material)[side], svgOptions);
}

export function downloadSVG(box: Box, material: Material): void {
	const svgOptions: makerjs.exporter.ISVGRenderOptions = {
		// strokeWidth: '0.1',
		// viewBox: false,
		// origin: [0, -box.width],
		// svgAttrs: {width: box.width, height: box.height},
		// units: 'mm',
	};
	const downloadSVGs = {
		left: getSVG(box, material, Sides.leftSide, svgOptions),
		right: '',
		ground: getSVG(box, material, Sides.groundSide, svgOptions),
		back: '',
		connector: '',
	};

	if (box.connector === 'RIGHT' || box.connector === 'BOTH')
		downloadSVGs.right = getSVG(box, material, Sides.rightSide, svgOptions);
	if (box.connector !== 'NONE') downloadSVGs.connector = getSVG(box, material, Sides.connector, svgOptions);
	if (box.backSide) downloadSVGs.back = getSVG(box, material, Sides.backSide, svgOptions);

	Object.keys(downloadSVGs).forEach((key) => {
		const element = downloadSVGs[key];
		if (element.length <= 0) return;

		console.log(element);

		const a = document.createElement('a');
		a.href = 'data:image/svg; base64, ' + btoa(unescape(encodeURIComponent(element)));
		a.download = `${box.name}-${key}.svg`;
		// a.setAttribute('target', '_blank');
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	});
}