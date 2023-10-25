import { DyteUIBuilder, UIConfig } from "@dytesdk/ui-kit";
import { Meeting } from "@dytesdk/ui-kit/dist/types/types/dyte-client";
import ActionToggle from "./ActionToggle";

export interface ParticipantTabToggleArgs {
    position: "start" | "end";
    label: string;
    initialValue?: boolean;
    onEnabled: () => void;
    onDisabled: () => void;
    attributes?: { [key: string]: any };
}

/**
 * This class is used to add a button to the participants tab.
 * The button can be added to the start or end of the tab.
 *
 * @param {string} args.position - The position of the button. Can be 'start' or 'end'.
 * @param {string} args.label - The label of the button.
 * @param {Function} args.onClick - The function to be called when the button is clicked.
 * @param {Object} args.attributes - The attributes to be added to the button.
 *
 * @returns {UIConfig} modified config
 *
 * @example
 *  action = new ParticipantTabAction({
 *     onClick: () => {
 *       alert('Clicked!');
 *     },
 *     label: 'Click me',
 *     position: 'start',
 *   });
 *  pass the action to the addon register function
 */
export default class ParticipantTabToggle {
    meeting?: Meeting;

    onEnabled: () => void;

    onDisabled: () => void;

    label: string;

    position = "start";

    initialValue = false;

    constructor(args: ParticipantTabToggleArgs) {
        this.position = args.position;
        this.label = args.label;
        this.onEnabled = args.onEnabled;
        this.onDisabled = args.onDisabled;
        this.initialValue = args.initialValue ?? false;
    }

    async unregister() {
        // TODO: Remove the changer from the body
    }

    register(config: UIConfig, meeting: Meeting) {
        if (!customElements.get("participant-tab-toggle")) {
            customElements.define(
                "participant-tab-toggle",
                ActionToggle
            );
        }

        this.meeting = meeting;
        if(!config.root) return config;

        if (!config.root["dyte-participants"]) {
            config.root["dyte-participants"] = {};
        }

        // Add buttons with config
        const builder = new DyteUIBuilder(config);
        const participants = builder.find(`dyte-participants`);
        participants?.add("participant-tab-toggle", {
            slot: this.position,
            label: this.label,
            // @ts-ignore
            state: this.initialValue,
            // @ts-ignore
            onEnabled: this.onEnabled,
            // @ts-ignore
            onDisabled: this.onDisabled,
        });

        // Return the updated config
        return builder.build();
    }
}
