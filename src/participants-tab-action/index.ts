import { RtkUiBuilder, UIConfig } from "@cloudflare/realtimekit-ui";
import { Meeting } from "@cloudflare/realtimekit-ui/dist/types/types/rtk-client";
import ActionButton from "./ActionButton";

export interface ParticipantTabActionArgs {
    position: "start" | "end";
    label: string;
    onClick: () => void;
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
export default class ParticipantTabAction {
    meeting?: Meeting;

    onClick: () => void;

    label: string;

    position = "start";

    constructor(args: ParticipantTabActionArgs) {
        this.position = args.position;
        this.label = args.label;
        this.onClick = args.onClick;
    }

    async unregister() {
        // TODO: Remove the changer from the body
    }

    register(config: UIConfig, meeting: Meeting, getBuilder: (c: UIConfig) => RtkUiBuilder) {
        if (!customElements.get("participant-tab-action-button")) {
            customElements.define(
                "participant-tab-action-button",
                ActionButton
            );
        }

        this.meeting = meeting;
        if (!config.root["rtk-participants"]) {
            config.root["rtk-participants"] = {};
        }

        // Add buttons with config
        const builder = getBuilder(config);
        const participants = builder.find(`rtk-participants`);
        participants.add("participant-tab-action-button", {
            slot: this.position,
            label: this.label,
            // @ts-ignore
            onClick: this.onClick
        });

        // Return the updated config
        return builder.build();
    }
}
