import { UIConfig } from "@dytesdk/ui-kit";
import { Meeting } from "@dytesdk/ui-kit/dist/types/types/dyte-client";
import DyteToggle from "../participants-tab-toggle";

export interface ChatHostToggleArgs {
    hostPresets: string[]
    targetPresets: string[]
}

/**
 * This class is used to add a microphone enable / disable host control
 *
 * @param {Array} args.hostPresets - The host presets who can trigger this control
 * 
 * @param {Array} args.targetPresets - The presets whose chat will controlled
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

    hostPresets: string[]

    targetPresets: string[]

    sendTimeout: any;

    state = true;

    button = new DyteToggle({
        position: "start",
        label: "Microphone",
        initialValue: () => this.state,
        onEnabled: () => {
            this.state = true;
            if(this.sendTimeout) {
                clearInterval(this.sendTimeout);
            }
            this.targetPresets.forEach((p) => {
                this.meeting?.participants.broadcastMessage("micPermissionUpdate", { targetPreset: p, canProduce: "ALLOWED" })
            })
        },
        onDisabled: () => {
            this.state = false;
            if(this.sendTimeout) {
                clearInterval(this.sendTimeout);
            }
            const disableMic = () => {
                this.targetPresets.forEach((p) => {
                    this.meeting?.participants.broadcastMessage("micPermissionUpdate", { targetPreset: p, canProduce: "NOT_ALLOWED" })
                })
            };
            this.sendTimeout = setInterval(disableMic, 5000);
            disableMic();
        }
    });

    constructor(args: ChatHostToggleArgs) {
        this.targetPresets = args.targetPresets
        this.hostPresets = args.hostPresets
        
    }

    onBroadcastMessage({ type, payload }: { type: string, payload: any}) {
        if(type === "micPermissionUpdate" && payload.targetPreset === this.meeting?.self.presetName) {
            const state = payload.canProduce;
            Object.defineProperty(this.meeting?.self.permissions, 'canProduceAudio', {
                value: state,
                configurable: true
            })
            // @ts-ignore
            this.meeting?.self.permissions.emit('micPermissionUpdate')
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
