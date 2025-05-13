import { RtkUiBuilder, UIConfig } from "@cloudflare/realtimekit-ui";
import { Meeting } from "@cloudflare/realtimekit-ui/dist/types/types/rtk-client";
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

    register(config: UIConfig, meeting: Meeting, getBuilder: (c: UIConfig) => RtkUiBuilder) {
        if (!customElements.get("rtk-custom-menu-item")) {
            customElements.define(
                "rtk-custom-menu-item",
                CustomMenuItem
            );
        }

        this.meeting = meeting;
        if (!config.root["rtk-participant"]) {
            config.root["rtk-participant"] = {};
        }

        // Add buttons with config
        const builder = getBuilder(config);
        const rtkParticipant = builder.find(`rtk-participant`);
        rtkParticipant.add("rtk-custom-menu-item", {
            label: this.label,
            icon: this.icon,
            styles: this.styles,
            // @ts-ignore
            onStateChange: this.onStateChange,
            // @ts-ignore
            onClick: this.onClick
        });

        // Return the updated config
        return builder.build();
    }
}
