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
        DyteChatHostControlAddon: {
            overrides: Overrides;
            blockAll: boolean;
            pubsub?: PubSub;
        };
    }
}

export interface ChatHostToggleArgs {
    hostPresets: string[];
    targetPresets: string[];
}


const chatOffIcon = `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3.28 2.22a.75.75 0 1 0-1.06 1.06l2.198 2.2A9.96 9.96 0 0 0 2 12a9.96 9.96 0 0 0 1.115 4.592l-1.068 3.823a1.25 1.25 0 0 0 1.54 1.54l3.826-1.067A9.96 9.96 0 0 0 12 22c2.491 0 4.77-.911 6.52-2.418l2.2 2.198a.75.75 0 0 0 1.06-1.06L3.28 2.22Zm14.177 16.298A8.466 8.466 0 0 1 12 20.5a8.458 8.458 0 0 1-4.133-1.07l-.27-.15-3.986 1.111 1.113-3.984-.151-.27A8.458 8.458 0 0 1 3.5 12c0-2.077.745-3.98 1.983-5.457l3.004 3.005A.75.75 0 0 0 8.75 11h1.19l2 2H8.75l-.102.007A.75.75 0 0 0 8.75 14.5h4.498l.102-.007a.76.76 0 0 0 .07-.013l4.037 4.038ZM15.255 9.5h-2.573l1.5 1.5h1.072l.102-.007a.75.75 0 0 0-.101-1.493Z" fill="currentColor"/><path d="M20.5 12c0 1.53-.404 2.966-1.112 4.206l1.094 1.094A9.953 9.953 0 0 0 22 12c0-5.523-4.477-10-10-10a9.953 9.953 0 0 0-5.3 1.518l1.094 1.094A8.5 8.5 0 0 1 20.5 12Z" fill="currentColor"/></svg>`;
const chatOnIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10a9.96 9.96 0 0 1-4.587-1.112l-3.826 1.067a1.25 1.25 0 0 1-1.54-1.54l1.068-3.823A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2Zm0 1.5A8.5 8.5 0 0 0 3.5 12c0 1.47.373 2.883 1.073 4.137l.15.27-1.112 3.984 3.987-1.112.27.15A8.5 8.5 0 1 0 12 3.5ZM8.75 13h4.498a.75.75 0 0 1 .102 1.493l-.102.007H8.75a.75.75 0 0 1-.102-1.493L8.75 13h4.498H8.75Zm0-3.5h6.505a.75.75 0 0 1 .101 1.493l-.101.007H8.75a.75.75 0 0 1-.102-1.493L8.75 9.5h6.505H8.75Z" fill="currentColor"/></svg>`;
window.DyteChatHostControlAddon = {
    overrides: {},
    blockAll: false,
    pubsub: undefined
};

/**
 * This class is used to add a public chat enable / disable host control
 *
 * @param {Array} args.hostPresets - The host presets who can trigger this control
 *
 * @param {Array} args.targetPresets - The presets whose chat will controlled
 *
 * @returns {UIConfig} modified config
 *
 * @example
 *  action = new ChatHostToggle({
 *     hostPresets: ["instructors", "moderators"],
 *     targetPresets: ["students"]
 *   });
 *  pass the action to the addon register function
 */
export default class ChatHostToggle {
    meeting?: Meeting;

    hostPresets: string[];

    targetPresets: string[];

    sendTimeout: any;

    state = true;

    button = new DyteToggle({
        position: "start",
        label: "Chat",
        initialValue: () => this.state,
        onEnabled: () => {
            this.state = true;
            if (this.sendTimeout) {
                clearInterval(this.sendTimeout);
            }
            this.targetPresets.forEach((p) => {
                this.meeting?.participants.broadcastMessage(
                    "chatPermissionUpdate",
                    { targetPreset: p, canSend: true }
                );
            });
            this.updateBlockedParticipants(!this.state);
        },
        onDisabled: () => {
            this.state = false;
            if (this.sendTimeout) {
                clearInterval(this.sendTimeout);
            }
            const disableChat = () => {
                this.targetPresets.forEach((p) => {
                    this.meeting?.participants.broadcastMessage(
                        "chatPermissionUpdate",
                        { targetPreset: p, canSend: false }
                    );
                });
            };
            this.sendTimeout = setInterval(disableChat, 5000);
            disableChat();
            this.updateBlockedParticipants(!this.state);
        }
    });

    menuItem = new ParticipantMenuItem({
        label: "Disable Chat",
        icon: chatOffIcon,
        onStateChange: (participantId, callback) => {
            return window.DyteChatHostControlAddon.pubsub?.subscribe(
                'chatPermissionUpdate',
                () => {
                    const isBlocked = this.isParticipantBlocked(participantId);
                    callback({
                        label: isBlocked ? "Enable Chat": "Disable Chat",
                        icon: isBlocked ? chatOnIcon : chatOffIcon,
                        class: isBlocked ? "" : "red-icon"
                    });
                });
        },

        onClick: (participantId) => {
            let isBlocked = this.isParticipantBlocked(participantId);
            this.meeting?.participants.broadcastMessage(
                "chatPermissionUpdate",
                { targetId: participantId, canSend: isBlocked }
            );
            // toggle the state
            this.updateBlockedParticipants(!isBlocked, participantId);
        }
    });

    constructor(args: ChatHostToggleArgs) {
        this.targetPresets = args.targetPresets;
        this.hostPresets = args.hostPresets;
        window.DyteChatHostControlAddon.pubsub = new PubSub();
    }

    // if overrides are present, and the participant is not blocked, return false
    // if overrides are present, and the participant is blocked, return true
    // if overrides are not present, and blockAll is true, return true
    // if overrides are not present, and blockAll is false, return false

    isParticipantBlocked(participantId: string) {
        if (window.DyteChatHostControlAddon.overrides[participantId] !== undefined) {
            return window.DyteChatHostControlAddon.overrides[participantId];
        }
        return window.DyteChatHostControlAddon.blockAll;
    }

    updateBlockedParticipants(state: boolean, participantId?: string) {
        if (participantId) {
            window.DyteChatHostControlAddon.overrides[participantId] = state;
        } else {
            window.DyteChatHostControlAddon.blockAll = state;
        }
        window.DyteChatHostControlAddon.pubsub.publish('chatPermissionUpdate', {});
    }

    onBroadcastMessage({ type, payload }: { type: string; payload: any }) {
        if (
            type === "chatPermissionUpdate" &&
            (payload.targetPreset === this.meeting?.self.presetName ||
                payload.targetId === this.meeting?.self.id)
        ) {
            const state = payload.canSend;
            Object.defineProperty(
                this.meeting?.self.permissions.chatPublic,
                "canSend",
                {
                    value: state
                }
            );
            Object.defineProperty(
                this.meeting?.self.permissions.chatPublic,
                "text",
                {
                    value: state
                }
            );
            Object.defineProperty(
                this.meeting?.self.permissions.chatPublic,
                "files",
                {
                    value: state
                }
            );
            this.meeting?.self.permissions.emit("*");
        }
    }

    async unregister() {
        // TODO: Remove the changer from the body
    }

    register(config: UIConfig, meeting: Meeting, getBuilder: (c: UIConfig) => any) {
        this.meeting = meeting;
        meeting.participants.on(
            "broadcastedMessage",
            this.onBroadcastMessage.bind(this)
        );
        if (this.hostPresets.includes(meeting.self.presetName)) {
            config = this.button.register(config, meeting, () => getBuilder(config));
            // return this.menuItem.register(config, meeting , () => getBuilder(config));
        }

        return config;
    }
}
