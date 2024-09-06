import { DyteUIBuilder, UIConfig } from '@dytesdk/ui-kit';
import { Meeting } from '@dytesdk/ui-kit/dist/types/types/dyte-client';

export interface CustomControlbarButtonArgs {
	position: 'left' | 'right' | 'center' | 'more-menu';
	icon: string;
	label: string;
	onClick: () => void;
	attributes?: { [key: string]: any };
}


// hack for now to get a reference to dyte-controlbar-button
const querySelectorAll = (node, selector) => {
	const nodes = [...node.querySelectorAll(selector)],
	  nodeIterator = document.createNodeIterator(node, Node.ELEMENT_NODE);
	let currentNode;
	while ((currentNode = nodeIterator.nextNode())) {
	  if (currentNode.shadowRoot) {
		nodes.push(...querySelectorAll(currentNode.shadowRoot, selector));
	  }
	}
	return nodes;
};

export default class CustomControlbarButton {
	meeting?: Meeting;

	id = "custom" + (Math.random() + 1).toString(36).substring(7);

	position: 'left' | 'right' | 'center' | 'more-menu';

	icon: string;

	label: string;

	onClick: () => void;

	attributes: { [key: string]: any };

	config: UIConfig;

	updates = [];

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

	#addControlBarButton(selector: any, attributes: { [key: string]: any }) {
		const x = {
			id: this.id,
			label: this.label,
			icon: this.icon,
			// @ts-ignore
			onClick: this.onClick,
			...attributes,
		};
		this.updates.push(x);
		selector.add('dyte-controlbar-button', x);
	}

	update(args: Pick<CustomControlbarButtonArgs, 'icon' | 'label'>) {
		const buttons = querySelectorAll(document.body,'dyte-controlbar-button');
		const button = buttons.find((e) => e.id === this.id);
		this.updates.forEach((u) => {
			u.label  = args.label;
			u.icon = args.icon;
		});
		if(button) {
			button.icon = args.icon;
			button.label = args.label;
		}
	}

	register(config: UIConfig, meeting: Meeting, getBuilder: (c: UIConfig) => DyteUIBuilder) {
		this.meeting = meeting;
		// Add buttons with config
		const builder = getBuilder(config);

		if (this.position === 'more-menu') {
			const lgMoreItems = builder.find('dyte-more-toggle', {
				activeMoreMenu: true,
			});
			this.#addControlBarButton(lgMoreItems, {
				variant: 'horizontal',
				slot: 'more-elements',
			});
		} else {
			const controlBar = builder.find(`div#controlbar-${this.position}`);
			if (!controlBar) return config;
			this.#addControlBarButton(controlBar, this.attributes);
		}

		// Add button in more menu for different screen sizes
		const mdMoreItems = builder.find('dyte-more-toggle', {
			activeMoreMenu: true,
			md: true,
		});
		this.#addControlBarButton(mdMoreItems, {
			variant: 'horizontal',
			slot: 'more-elements',
		});

		const smMoreItems = builder.find('dyte-more-toggle', {
			activeMoreMenu: true,
			sm: true,
		});
		this.#addControlBarButton(smMoreItems, {
			variant: 'horizontal',
			slot: 'more-elements',
		});
		this.config = builder.build();
		// Return the updated config
		return this.config;
	}
}
