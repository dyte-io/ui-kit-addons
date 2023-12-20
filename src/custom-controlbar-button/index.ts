import { DyteUIBuilder, UIConfig } from '@dytesdk/ui-kit';
import { Meeting } from '@dytesdk/ui-kit/dist/types/types/dyte-client';

export interface CustomControlbarButtonArgs {
	position: 'left' | 'right' | 'center' | 'more-menu';
	icon: string;
	label: string;
	onClick: () => void;
	attributes?: { [key: string]: any };
}

export default class CustomControlbarButton {
	meeting?: Meeting;

	position: 'left' | 'right' | 'center' | 'more-menu';

	icon: string;

	label: string;

	onClick: () => void;

	attributes: { [key: string]: any };

	constructor(args: CustomControlbarButtonArgs) {
		this.icon = args.icon;
		this.label = args.label;
		this.onClick = args.onClick;
		this.position = args.position;
		this.attributes = args.attributes || {};
	}

	async unregister() {
		// TODO: Remove the changer from the body
	}

	addControlBarButton(selector: any, attributes: { [key: string]: any }) {
		selector.add('dyte-controlbar-button', {
			id: this.label,
			label: this.label,
			icon: this.icon,
			// @ts-ignore
			onClick: this.onClick,
			...attributes,
		});
	}

	register(config: UIConfig, meeting: Meeting, getBuilder: (c: UIConfig) => DyteUIBuilder) {
		this.meeting = meeting;
		// Add buttons with config
		const builder = getBuilder(config);

		if (this.position === 'more-menu') {
			const lgMoreItems = builder.find('dyte-more-toggle', {
				activeMoreMenu: true,
			});
			this.addControlBarButton(lgMoreItems, {
				variant: 'horizontal',
				slot: 'more-elements',
			});
		} else {
			const controlBar = builder.find(`div#controlbar-${this.position}`);
			if (!controlBar) return config;
			this.addControlBarButton(controlBar, this.attributes);
		}

		// Add button in more menu for different screen sizes
		const mdMoreItems = builder.find('dyte-more-toggle', {
			activeMoreMenu: true,
			md: true,
		});
		this.addControlBarButton(mdMoreItems, {
			variant: 'horizontal',
			slot: 'more-elements',
		});

		const smMoreItems = builder.find('dyte-more-toggle', {
			activeMoreMenu: true,
			sm: true,
		});
		this.addControlBarButton(smMoreItems, {
			variant: 'horizontal',
			slot: 'more-elements',
		});

		// Return the updated config
		return builder.build();
	}
}
