import { RtkUiBuilder, UIConfig } from "@cloudflare/realtimekit-ui";
import { Meeting } from "@cloudflare/realtimekit-ui/dist/types/types/rtk-client";
import { ReactionPicker } from "./ReactionPicker";
import ReactionOverlay from "./ReactionOverlay";
import ReactionBadge from "./ReactionBadge";
import RTKClient from "@cloudflare/realtimekit";

export interface ReactionsManagerProps {
    canSendReactions?: boolean;
    meeting: RTKClient;
}

/**
 * ReactionsManagerAddon
 * @description
 * This addon allows participants to send emoji reactions (similar to Google Meet) that appear as floating animations.
 * Reactions float up from the participant's video tile and disappear after a few seconds.
 * @param {ReactionsManagerProps} props
 * @returns {ReactionsManagerAddon}
 * @example
 * const reactionsAddon = new ReactionsManagerAddon({
 *    canSendReactions: true
 * });
 * config = registerAddon([reactionsAddon], meeting);
 */

class ReactionsManagerAddon {
    canSendReactions = true;

    private constructor({ canSendReactions }: ReactionsManagerProps) {
        this.canSendReactions = canSendReactions ?? true;
        
        if (customElements.get("rtk-reaction-overlay")) return;
        customElements.define("rtk-reaction-overlay", ReactionOverlay);
        
        if (customElements.get("rtk-reaction-badge")) return;
        customElements.define("rtk-reaction-badge", ReactionBadge);
        
        if (customElements.get("rtk-reaction-picker")) return;
        customElements.define("rtk-reaction-picker", ReactionPicker);
    }

    static async init(
        { meeting, canSendReactions = true }: ReactionsManagerProps
    ) {
        return new ReactionsManagerAddon({
            canSendReactions,
            meeting,
        });
    }

    register(config: UIConfig, meeting: Meeting, getBuilder: (c: UIConfig) => RtkUiBuilder) {
        const builder = getBuilder(config);

        // Add buttons with config
        const controlBarLeft = builder.find("div#controlbar-left");
        if (!controlBarLeft) return config;
        const controlBarMobile = builder.find("div#controlbar-mobile");
        if (!controlBarMobile) return config;
        const participants = builder.find("rtk-stage");
        if (!participants) return config;
        const participantTile = builder.find("rtk-participant-tile");
        if (!participantTile) return config;

        // Add a single global reaction overlay on the participants container
        // so that reactions appear from the bottom-left of the meeting area
        participants.add("rtk-reaction-overlay", {
            //@ts-ignore
            meeting: meeting,
        });

        // Add reaction badge on participant tiles to show last reaction (for PIP mode)
        participantTile.add("rtk-reaction-badge", {
            //@ts-ignore
            meeting: meeting,
        });

        if (this.canSendReactions) {
            // Add the reaction picker button to control bar
            controlBarLeft.add("rtk-reaction-picker", {
                //@ts-ignore
                meeting: meeting,
            });
            controlBarMobile.add("rtk-reaction-picker", {
                //@ts-ignore
                meeting: meeting,
            });
        }

        // Return the updated config
        return builder.build();
    }

    unregister() {
        // Cleanup if needed
    }
}

export default ReactionsManagerAddon;
