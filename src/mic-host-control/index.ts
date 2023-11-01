import { UIConfig } from "@dytesdk/ui-kit";
import { Meeting } from "@dytesdk/ui-kit/dist/types/types/dyte-client";
import DyteToggle from "../participants-tab-toggle";
import ParticipantMenuItem from "../participant-menu-item";
import PubSub from "../utils/PubSub";

interface Overrides {
    [key: string]: boolean;
}

declare global {
    interface Window {
        DyteMicHostControlAddon: {
            overrides: Overrides;
            blockAll: boolean;
            pubsub?: PubSub;
        };
    }
}

export interface MicHostToggleArgs {
    hostPresets: string[];
    targetPresets: string[];
}

const micOffIcon = `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.175 15.996A6.513 6.513 0 0 1 15 11.498V6a4 4 0 0 0-8 0v6a4 4 0 0 0 4.175 3.996Z" fill="currentColor"/><path d="M11 17.5c0 1.096.271 2.129.75 3.035v.715a.75.75 0 0 1-1.493.102l-.007-.102v-2.268a6.75 6.75 0 0 1-6.246-6.496L4 12.25v-.5a.75.75 0 0 1 1.493-.102l.007.102v.5a5.25 5.25 0 0 0 5.034 5.246l.216.004H11ZM23 17.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Zm-9.5 0c0 .834.255 1.608.691 2.248l5.557-5.557A4 4 0 0 0 13.5 17.5Zm4 4a4 4 0 0 0 3.309-6.248l-5.557 5.557c.64.436 1.414.691 2.248.691Z" fill="currentColor"/></svg>`;
const micOnIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.25 11a.75.75 0 0 1 .743.648l.007.102v.5a6.75 6.75 0 0 1-6.249 6.732l-.001 2.268a.75.75 0 0 1-1.493.102l-.007-.102v-2.268a6.75 6.75 0 0 1-6.246-6.496L5 12.25v-.5a.75.75 0 0 1 1.493-.102l.007.102v.5a5.25 5.25 0 0 0 5.034 5.246l.216.004h.5a5.25 5.25 0 0 0 5.246-5.034l.004-.216v-.5a.75.75 0 0 1 .75-.75ZM12 2a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Zm0 1.5A2.5 2.5 0 0 0 9.5 6v6a2.5 2.5 0 0 0 5 0V6A2.5 2.5 0 0 0 12 3.5Z" fill="currentColor"/></svg>`;

window.DyteMicHostControlAddon = {
    overrides: {},
    blockAll: false,
    pubsub: undefined
};

/**
 * This class is used to add a microphone enable / disable host control
 *
 * @param {Array} args.hostPresets - The host presets who can trigger this control
 *
 * @param {Array} args.targetPresets - The presets whose mic will controlled
 *
 * @returns {UIConfig} modified config
 *
 * @example
 *  action = new MicHostToggle({
 *     hostPresets: ["instructors", "moderators"],
 *     targetPresets: ["students"]
 *   });
 *  pass the action to the addon register function
 */
export default class MicHostToggle {
    meeting?: Meeting;

    hostPresets: string[];

    targetPresets: string[];

    sendTimeout: any;

    state = true;

    button = new DyteToggle({
        position: "start",
        label: "Microphone",
        initialValue: () => this.state,
        onEnabled: () => {
            this.state = true;
            if (this.sendTimeout) {
                clearInterval(this.sendTimeout);
            }
            this.targetPresets.forEach((p) => {
                this.meeting?.participants.broadcastMessage(
                    "micPermissionUpdate",
                    { targetPreset: p, canProduce: "ALLOWED" }
                );
            });
            this.updateBlockedParticipants(!this.state);
        },
        onDisabled: () => {
            this.state = false;
            if (this.sendTimeout) {
                clearInterval(this.sendTimeout);
            }
            const disableMic = () => {
                this.targetPresets.forEach((p) => {
                    this.meeting?.participants.broadcastMessage(
                        "micPermissionUpdate",
                        { targetPreset: p, canProduce: "NOT_ALLOWED" }
                    );
                });
            };
            this.sendTimeout = setInterval(disableMic, 2000);
            disableMic();
            this.updateBlockedParticipants(!this.state);
        }
    });

    menuItem = new ParticipantMenuItem({
        label: "Disable Mic",
        icon: micOffIcon,
        onStateChange: (participantId, callback) => {
            return window.DyteMicHostControlAddon.pubsub?.subscribe(
                'micPermissionUpdate',
                () => {
                    const isBlocked = this.isParticipantBlocked(participantId);
                    callback({
                        label: isBlocked ? "Enable Mic" : "Disable Mic",
                        icon: isBlocked ? micOnIcon : micOffIcon,
                        class: isBlocked ? "" : "red-icon"
                    });
                });
        },

        onClick: (participantId) => {
            const isBlocked = this.isParticipantBlocked(participantId);
            this.meeting?.participants.broadcastMessage("micPermissionUpdate", {
                targetId: participantId,
                canProduce: isBlocked ? "ALLOWED" : "NOT_ALLOWED"
            });
            // toggle the state
            this.updateBlockedParticipants(!isBlocked, participantId);
        }
    });

    constructor(args: MicHostToggleArgs) {
        this.targetPresets = args.targetPresets;
        this.hostPresets = args.hostPresets;
        window.DyteMicHostControlAddon.pubsub = new PubSub();
    }

    // if overrides are present, and the participant is not blocked, return false
    // if overrides are present, and the participant is blocked, return true
    // if overrides are not present, and blockAll is true, return true
    // if overrides are not present, and blockAll is false, return false
    isParticipantBlocked(participantId: string) {
        if (window.DyteMicHostControlAddon.overrides[participantId] !== undefined) {
            return window.DyteMicHostControlAddon.overrides[participantId];
        }
        return window.DyteMicHostControlAddon.blockAll;
    }

    updateBlockedParticipants(state: boolean, participantId?: string) {
        if (participantId) {
            window.DyteMicHostControlAddon.overrides[participantId] = state;
        } else {
            window.DyteMicHostControlAddon.blockAll = state;
        }
        window.DyteMicHostControlAddon.pubsub.publish('micPermissionUpdate', {});
    }

    onBroadcastMessage({ type, payload }: { type: string; payload: any }) {
        if (
            type === "micPermissionUpdate" &&
            (payload.targetPreset === this.meeting?.self.presetName ||
                payload.targetId === this.meeting?.self.id)
        ) {
            const state = payload.canProduce;
            Object.defineProperty(
                this.meeting?.self.permissions,
                "canProduceAudio", {
                    value: state,
                    configurable: true
                }
            );
            // @ts-ignore
            this.meeting?.self.permissions.emit("micPermissionUpdate");
        }
    }

    async unregister() {
        this.button.unregister();

        this.meeting.participants.off(
            "broadcastedMessage",
            this.onBroadcastMessage.bind(this)
        );
    }

    register(config: UIConfig, meeting: Meeting, getBuilder: (c: UIConfig) => any) {
        this.meeting = meeting;
        meeting.participants.on(
            "broadcastedMessage",
            this.onBroadcastMessage.bind(this)
        );

        if (this.hostPresets.includes(meeting.self.presetName)) {
            config = this.button.register(config, meeting, () => getBuilder(config));
            // return this.menuItem.register(config, meeting, () => getBuilder(config));
        }

        return config;
    }
}
