import { defineComponent, h } from 'vue';

export interface IconDefinition {
	[index: string]: string;
}

const iconList: IconDefinition = {};

/**
 * Registers Icons to be used via o-icon
 *
 * To use an icon named `mdiBell`, you need to do the following:
 * ```ts
 * import {mdiBell} from '@mdi/js';
 * import {registerIcons} from '@/Icons';
 *
 * registerIcons({
 *  mdiBell,
 * });
 * ```
 * Now you can use the icon like this:
 * ```html
 * <o-icon name="bell" />
 * ```
 *
 * This also works for any component internally using o-icon.
 *
 * Example of components which use o-icon are:
 * * FAB
 * * o-select
 * * o-button
 *
 * @param icons Object containing icon names as key and paths as values
 */
export function registerIcons(icons: IconDefinition): void {
	Object.keys(icons).forEach((key) => {
		const newKey = key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);

		icons[newKey] = icons[key];
	});

	Object.keys(icons).forEach((key) => (iconList[key] = icons[key]));
}

export default iconList;

export const iconMdi = defineComponent({
	name: 'icon-mdi',

	props: {
		icon: {
			required: true,
			type: Object as () => [string, string],
			validator: (value: [string, string]): boolean => Array.isArray(value) && value.length === 2 && typeof iconList[value[1]] === 'string',
		},
	},

	render() {
		return h(
			'svg',
			{
				class: 'icon',
				viewBox: '0 0 24 24',
			},
			[
				h('path', {
					d: iconList[this.icon[1]],
					fill: 'currentColor',
				}),
			],
		);
	},
});
