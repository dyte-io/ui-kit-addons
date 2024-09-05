import { DyteUIBuilder, UIConfig } from "@dytesdk/ui-kit";
import { Meeting } from "@dytesdk/ui-kit/dist/types/types/dyte-client";
import CustomMenu, { ParticipantMenuItemArgs } from "./CustomMenuItem";


/**
 * A class that represents a custom menu item in the participant menu.
 * @class ParticipantTileMenu
 * @example
 * ```typescript
 * const participantMenu = new ParticipantTileMenu([{
 *   label: "Custom Toggle",
 *   onClick: (participantId) => {
 *     console.log('Clicked on custom toggle for ', participantId);
 *   }
 * }], 'top-right');
 *
 * const config = registerAddons([participantMenu], meeting);
 * ```
 */
export default class ParticipantTileMenu {
    meeting?: Meeting;

    args: ParticipantMenuItemArgs[] = []

    position: string;


    constructor(args: ParticipantMenuItemArgs[], position: 'top-left' | 'top-right' | 'bottom-right' | 'bottom-left') {
        this.args = args;
        this.position = position;
    }

    async unregister() {
        return;
    }

    register(config: UIConfig, meeting: Meeting, getBuilder: (c: UIConfig) => DyteUIBuilder) {
        if (!customElements.get("dyte-participant-tile-menu")) {
            customElements.define(
                "dyte-participant-tile-menu",
                CustomMenu
            );
        }

        this.meeting = meeting;

        // Add buttons with config
        const builder = getBuilder(config);
        const dyteParticipant = builder.find(`dyte-participant-tile`);
        dyteParticipant.add("dyte-participant-tile-menu", {
            items: this.args as any,
            position: this.position
        });

        // Return the updated config
        return builder.build();
    }
}
