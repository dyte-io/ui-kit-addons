import { DyteUIBuilder, UIConfig } from "@dytesdk/ui-kit";
import { Meeting } from "@dytesdk/ui-kit/dist/types/types/dyte-client";
import { HandRaisedList } from "./HandRaisedList";
import RaisedHand from "./RaisedHand";
import { HandRaiseButton, HandRaiseIcon } from "./HandRaiseButton";

export interface Props {
    canRaiseHand?: boolean;
    canManageRaisedHand?: boolean;
    handRaiseIcon?: string;
}

/**
 * HandRaiseAddon
 * @description
 * This addon allows participants to raise their hand and the host to manage the raised hands.
 * @param {Props} props
 * @returns {HandRaiseAddon}
 * @example
 * const handRaiseAddon = new HandRaiseAddon({
 *    canRaiseHand: true,
 *    canManageRaisedHand: true
 *    handRaiseIcon: string // optional, svg as string
 * });
 * config = registerAddon([handRaiseAddon], meeting);
 */

class HandRaiseAddon {
    canRaiseHand = true;
    canManageRaisedHand = false;

    constructor({ canRaiseHand, canManageRaisedHand, handRaiseIcon }: Props) {
        this.canRaiseHand = canRaiseHand ?? true;
        this.canManageRaisedHand = canManageRaisedHand ?? false;
        if (customElements.get("dyte-raised-hand")) return;
        RaisedHand.icon = handRaiseIcon ?? HandRaiseIcon;
        customElements.define("dyte-raised-hand", RaisedHand);
        if (customElements.get("dyte-hand-raise-toggle")) return;
        customElements.define("dyte-hand-raise-toggle", HandRaiseButton);
        if (customElements.get("dyte-hand-raised-list")) return;
        customElements.define("dyte-hand-raised-list", HandRaisedList);
    }

    register(config: UIConfig, meeting: Meeting, getBuilder: (c: UIConfig) => DyteUIBuilder) {
        const builder = getBuilder(config);

        const participants = builder.find(`dyte-participants`);

        if (this.canManageRaisedHand) {
            // add the raised hand list
            participants.add("dyte-hand-raised-list", {
                slot: "start",
                meeting: meeting as any as string,
                // @ts-ignore
                onRemove: (participantId: string) => {

                    meeting.stores.stores.get('handRaise')?.set(participantId, false, true, true);

                    // meeting.participants.broadcastMessage(
                    //     "update-raise-hand",
                    //     data
                    // );
                }
            });
        }


        // Add buttons with config
        const controlBarLeft = builder.find("div#controlbar-left");
        if (!controlBarLeft) return config;
        const controlBarMobile = builder.find("div#controlbar-mobile");
        if (!controlBarMobile) return config;
        const participantTile = builder.find("dyte-participant-tile");
        if (!participantTile) return config;

        // show the raised hand icon on the participant tile
        participantTile.add("dyte-raised-hand", {
            meeting: meeting as any as string,
            raised: false as any as string,
        });

        if (this.canRaiseHand) {
            // add the raise hand toggle
            controlBarLeft.add("dyte-hand-raise-toggle", {
                meeting: meeting as any as string,
            });
            controlBarMobile.add("dyte-hand-raise-toggle", {
                meeting: meeting as any as string,
            });
        }

        // Return the updated config
        return builder.build();
    }

    unregister() {
    }
}

export default HandRaiseAddon;
