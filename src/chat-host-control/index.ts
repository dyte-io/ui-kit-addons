import { UIConfig } from "@dytesdk/ui-kit";
import { Meeting } from "@dytesdk/ui-kit/dist/types/types/dyte-client";
import DyteToggle from "../participants-tab-toggle";

export interface ChatHostToggleArgs {
    hostPresets: string[]
    targetPresets: string[]
}

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

    hostPresets: string[]

    targetPresets: string[]

    sendTimeout: any;

    state = true;

    button = new DyteToggle({
        position: "start",
        label: "Chat",
        initialValue: () => this.state,
        onEnabled: () => {
            this.state = true;
            if(this.sendTimeout) {
                clearInterval(this.sendTimeout);
            }
            this.targetPresets.forEach((p) => {
                this.meeting?.participants.broadcastMessage("chatPermissionUpdate", { targetPreset: p, canSend: true })
            })
        },
        onDisabled: () => {
            this.state = false;
            if(this.sendTimeout) {
                clearInterval(this.sendTimeout);
            }
            const disableChat = () => {
                this.targetPresets.forEach((p) => {
                    this.meeting?.participants.broadcastMessage("chatPermissionUpdate", { targetPreset: p, canSend: false })
                })
            };
            this.sendTimeout = setInterval(disableChat, 5000);
            disableChat();
        }
    });

    constructor(args: ChatHostToggleArgs) {
        this.targetPresets = args.targetPresets
        this.hostPresets = args.hostPresets
        
    }

    onBroadcastMessage({ type, payload }: { type: string, payload: any}) {
        if(type === "chatPermissionUpdate" && payload.targetPreset === this.meeting?.self.presetName) {
            const state = payload.canSend;
            Object.defineProperty(this.meeting?.self.permissions.chatPublic, 'canSend', {
                value: state
            })
            Object.defineProperty(this.meeting?.self.permissions.chatPublic, 'text', {
                value: state
            })
            Object.defineProperty(this.meeting?.self.permissions.chatPublic, 'files', {
                value: state
            })
            this.meeting?.self.permissions.emit('*')
        }
    }

    async unregister() {
        // TODO: Remove the changer from the body
    }

    register(config: UIConfig, meeting: Meeting) {
        this.meeting = meeting;
        meeting.participants.on("broadcastedMessage", this.onBroadcastMessage.bind(this))
        if(this.hostPresets.includes(meeting.self.presetName)) {
            return this.button.register(config, meeting)
        }
        return  config;
    }
}
