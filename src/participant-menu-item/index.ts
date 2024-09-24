import { DyteUIBuilder, UIConfig } from "@dytesdk/ui-kit";
import { Meeting } from "@dytesdk/ui-kit/dist/types/types/dyte-client";
import CustomMenuItem, { MenuState } from "./CustomMenuItem";

interface ParticipantMenuItemArgs {
    label: string;
    icon?: string;
    styles?: string;
    onClick: (participantId: string) => void;
    onStateChange: (participantId: string, callback: (state: MenuState) => void) => void;
}

/**
 * A class that represents a custom menu item in the participant menu.
 * @class ParticipantMenuItem
 * @example
 * ```typescript
 * const participantMenuItem = new ParticipantMenuItem({
 *   label: "My Custom Menu Item",
 *   icon: "<svg> </svg>",
 *   styles: ".customClass { color: red; }",
 *   onClick: () => {
 *     console.log('Clicked on custom menu item');
 *   }
 * });
 *
 * const config = registerAddons([participantMenuItem], meeting);
 * ```
 */
export default class ParticipantMenuItem {
    meeting?: Meeting;

    onClick: (participantId: string) => void;

    label: string;

    icon?: string;

    styles?: string;

    onStateChange: (participantId: string, callback: (state: MenuState) => void) => void;

    constructor(args: ParticipantMenuItemArgs) {
        this.label = args.label;
        this.icon = args.icon;
        this.styles = args.styles;
        this.onClick = args.onClick;
        this.onStateChange = args.onStateChange;
    }

    async unregister() {
        return;
    }

    register(config: UIConfig, meeting: Meeting, getBuilder: (c: UIConfig) => DyteUIBuilder) {
        if (!customElements.get("dyte-custom-menu-item")) {
            customElements.define(
                "dyte-custom-menu-item",
                CustomMenuItem
            );
        }

        this.meeting = meeting;
        if (!config.root["dyte-participant"]) {
            config.root["dyte-participant"] = {};
        }

        // Add buttons with config
        const builder = getBuilder(config);
        const dyteParticipant = builder.find(`dyte-participant`);
        dyteParticipant.add("dyte-custom-menu-item", {
            label: this.label,
            icon: this.icon,
            styles: this.styles,
            // @ts-ignore
            onStateChange: this.onStateChange,
            // @ts-ignore
            onClick: this.onClick,
        });

        // Return the updated config
        return builder.build();
    }
}
