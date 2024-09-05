import { DyteUIBuilder, UIConfig } from "@dytesdk/ui-kit";
import { Meeting } from "@dytesdk/ui-kit/dist/types/types/dyte-client";
import { HandRaisedList } from "./HandRaisedList";
import RaisedHand from "./RaisedHand";
import { HandRaiseButton, HandRaiseIcon } from "./HandRaiseButton";
import PubSub from "../utils/PubSub";

let handRaised = false;

declare global {
    interface Window {
        DyteHandRaiseAddon: {
            list: any[];
            pubsub?: PubSub;
        };
    }
}

window.DyteHandRaiseAddon = {
    list: [],
    pubsub: undefined
};

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
 *   canManageRaisedHand: true
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
        window.DyteHandRaiseAddon.pubsub = new PubSub();
    }

    register(config: UIConfig, meeting: Meeting, getBuilder: (c: UIConfig) => DyteUIBuilder) {
        const builder = getBuilder(config);

        const participants = builder.find(`dyte-participants`);

        if (this.canManageRaisedHand) {
            // add the raised hand list
            participants.add("dyte-hand-raised-list", {
                slot: "start",
                // @ts-ignore
                onRemove: (participantId: string) => {
                    const data = {
                        participantId,
                        raised: false
                    };

                    if (meeting.self.id === participantId) {
                        handRaised = !handRaised;
                    }

                    meeting.participants.broadcastMessage(
                        "update-raise-hand",
                        data
                    );
                }
            });
        }

        // listen for broadcasted messages
        meeting.participants.on(
            "broadcastedMessage",
            (event: {
                type: string;
                payload: { participantId: string; raised: boolean };
            }) => {
                if (event.type !== "update-raise-hand") return;

                const { participantId, raised } = event.payload;

                // update the participant
                if (raised) {
                    window.DyteHandRaiseAddon.list = [
                        ...window.DyteHandRaiseAddon.list,
                        participantId
                    ];
                } else {
                    window.DyteHandRaiseAddon.list =
                        window.DyteHandRaiseAddon.list.filter(
                            (p) => p !== participantId
                        );
                }

                const participant =
                    meeting.participants.joined.get(participantId);
                if (participant) {
                    participant.raised = raised;
                } else if (participantId === meeting.self.id) {
                    meeting.self.raised = raised;
                }

                window.DyteHandRaiseAddon.pubsub?.publish("update-raise-hand", {
                    participantId,
                    raised
                });
            }
        );

        // Add buttons with config
        const controlBarLeft = builder.find("div#controlbar-left");
        if (!controlBarLeft) return config;
        const controlBarMobile = builder.find("div#controlbar-mobile");
        if (!controlBarMobile) return config;
        const participantTile = builder.find("dyte-participant-tile");
        if (!participantTile) return config;

        // show the raised hand icon on the participant tile
        participantTile.add("dyte-raised-hand", {
            meeting,
            raised: "false" // default value for all participants
        });

        if (this.canRaiseHand) {
            // add the raise hand toggle
            controlBarLeft.add("dyte-hand-raise-toggle");
            controlBarMobile.add("dyte-hand-raise-toggle");
        }

        // Return the updated config
        return builder.build();
    }

    unregister() {
        window.DyteHandRaiseAddon.pubsub = undefined;
        window.DyteHandRaiseAddon.list = [];
    }
}

export default HandRaiseAddon;
