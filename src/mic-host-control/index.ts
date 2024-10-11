import { UIConfig } from "@dytesdk/ui-kit";
import { Meeting } from "@dytesdk/ui-kit/dist/types/types/dyte-client";
import DyteToggle from "../participants-tab-toggle";
import ParticipantMenuItem from "../participant-menu-item";
import DyteClient, { DyteStore } from "@dytesdk/web-core";

export interface MicHostToggleProps {
    hostPresets: string[];
    targetPresets: string[];
    addActionInParticipantMenu?: boolean;
    meeting: DyteClient
}

const micOffIcon = `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M11.175 15.996A6.513 6.513 0 0 1 15 11.498V6a4 4 0 0 0-8 0v6a4 4 0 0 0 4.175 3.996Z" fill="currentColor"/><path d="M11 17.5c0 1.096.271 2.129.75 3.035v.715a.75.75 0 0 1-1.493.102l-.007-.102v-2.268a6.75 6.75 0 0 1-6.246-6.496L4 12.25v-.5a.75.75 0 0 1 1.493-.102l.007.102v.5a5.25 5.25 0 0 0 5.034 5.246l.216.004H11ZM23 17.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0Zm-9.5 0c0 .834.255 1.608.691 2.248l5.557-5.557A4 4 0 0 0 13.5 17.5Zm4 4a4 4 0 0 0 3.309-6.248l-5.557 5.557c.64.436 1.414.691 2.248.691Z" fill="currentColor"/></svg>`;
const micOnIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.25 11a.75.75 0 0 1 .743.648l.007.102v.5a6.75 6.75 0 0 1-6.249 6.732l-.001 2.268a.75.75 0 0 1-1.493.102l-.007-.102v-2.268a6.75 6.75 0 0 1-6.246-6.496L5 12.25v-.5a.75.75 0 0 1 1.493-.102l.007.102v.5a5.25 5.25 0 0 0 5.034 5.246l.216.004h.5a5.25 5.25 0 0 0 5.246-5.034l.004-.216v-.5a.75.75 0 0 1 .75-.75ZM12 2a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4Zm0 1.5A2.5 2.5 0 0 0 9.5 6v6a2.5 2.5 0 0 0 5 0V6A2.5 2.5 0 0 0 12 3.5Z" fill="currentColor"/></svg>`;

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
 *     targetPresets: ["students"],
 *     addActionInParticipantMenu: true, // default false
 *   });
 *  pass the action to the addon register function
 */
export default class MicHostToggle {
    meeting?: Meeting;

    hostPresets: string[];

    targetPresets: string[];

    state = true;

    micPermissionsStore: DyteStore = undefined;

    addActionInParticipantMenu = false;

    updateToggleWithoutAction: (state: boolean) => void = () => {};

    button = new DyteToggle({
        position: "start",
        label: "Microphone",
        onEnabled: () => {
            this.state = true;
            this.updateBlockedParticipantsInStore(false);
        },
        onDisabled: () => {
            this.state = false;
            this.updateBlockedParticipantsInStore(true);
        },
        onStateChange: (cb) => {
            this.updateToggleWithoutAction = cb;
            cb(this.state);
        }
    });

    menuItem = new ParticipantMenuItem({
        label: "Disable Mic",
        icon: micOffIcon,
        styles: `
        .disabled{
            cursor: not-allowed;
        }
        .red-icon{
            color: red;
        }
        `,
        onStateChange: (participantId, callback) => {
            const isBlocked = this.isParticipantBlocked(participantId);
            callback({
                label: isBlocked ? "Enable Mic" : "Disable Mic",
                icon: isBlocked ? micOnIcon : micOffIcon,
                iconClass: isBlocked ? "" : "red-icon",
                labelClass: `${isBlocked ? "" : "red"} ${this.canBlockParticipant(participantId) ? '' : 'disabled'}`
            });
            return this.micPermissionsStore.subscribe(
                'overrides',
                () => {
                    const isBlocked = this.isParticipantBlocked(participantId);
                    callback({
                        label: isBlocked ? "Enable Mic" : "Disable Mic",
                        icon: isBlocked ? micOnIcon : micOffIcon,
                        iconClass: isBlocked ? "" : "red-icon",
                        labelClass: `${isBlocked ? "" : "red"} ${this.canBlockParticipant(participantId) ? '' : 'disabled'}`
                    });
                });
        },

        onClick: (participantId) => {
            const isBlocked = this.isParticipantBlocked(participantId);
            this.updateBlockedParticipantsInStore(!isBlocked, participantId);
        }
    });

    private constructor({targetPresets, hostPresets, addActionInParticipantMenu}: MicHostToggleProps) {
        this.targetPresets = targetPresets;
        this.hostPresets = hostPresets;
        this.addActionInParticipantMenu = addActionInParticipantMenu;
        this.processMicPermissionStoreUpdate = this.processMicPermissionStoreUpdate.bind(this)
    }

    static async init(
        { targetPresets, hostPresets, addActionInParticipantMenu = false, meeting }: MicHostToggleProps
    ){
        await meeting.stores.create('micPermissionsStore');
        return new MicHostToggle({
            targetPresets,
            hostPresets,
            addActionInParticipantMenu,
            meeting
        });
    }

    canBlockParticipant(participantId: string){
        const participant = this.meeting.self.id === participantId ? this.meeting.self : this.meeting.participants.joined.get(participantId);
        return this.targetPresets.includes(participant.presetName);
    }

    isParticipantBlocked(participantId: string) {
        if(!this.canBlockParticipant(participantId)){
            return false;
        }
        if (this.micPermissionsStore.get('overrides')?.[participantId] !== undefined) {
            return !!(this.micPermissionsStore.get('overrides')?.[participantId]);
        }
        return !!this.micPermissionsStore.get('overrides')?.blockAll;
    }

    updateBlockedParticipantsInStore(state: boolean, participantId?: string) {
        
        if(participantId && !this.canBlockParticipant(participantId)){
            return;
        }
        if (participantId) {
            this.micPermissionsStore.set('overrides', {
                ...(this.micPermissionsStore.get('overrides') || {}),
                [participantId]: state,
            }, true, true);
        } else {
            this.micPermissionsStore.set('overrides', {
                blockAll: state,
            }, true, true);
        }
    }
    updatePermissionsInUILocally({state}: {state: 'ALLOWED' | 'NOT_ALLOWED'}){
        Object.defineProperty(
            this.meeting?.self.permissions,
            "canProduceAudio", {
                value: state,
                configurable: true
            }
        );
        // @ts-ignore
        this.meeting?.self.permissions.emit("permissionsUpdate", { media: { audio: { canProduce: state}}});
    }
    processMicPermissionStoreUpdate(){
        this.state = !this.micPermissionsStore.get('overrides')?.blockAll;
        this.updateToggleWithoutAction(this.state);

        if(!this.canBlockParticipant(this.meeting.self.id)){
            return;
        }
        
        const isBlocked = this.isParticipantBlocked(this.meeting.self.id);
        this.updatePermissionsInUILocally({
            state:  isBlocked ? "NOT_ALLOWED" : "ALLOWED"
        });
    }

    async unregister() {
        this.button.unregister();
        this.micPermissionsStore.unsubscribe('overrides', this.processMicPermissionStoreUpdate);
    }

    register(config: UIConfig, meeting: Meeting, getBuilder: (c: UIConfig) => any) {
        this.meeting = meeting;
        this.micPermissionsStore = meeting.stores.stores.get('micPermissionsStore');
        
        // Set default values
        this.state = !this.micPermissionsStore.get('overrides')?.blockAll;
        this.processMicPermissionStoreUpdate();

        // Subscribe to listen to new
        this.micPermissionsStore.subscribe('overrides', this.processMicPermissionStoreUpdate);

        if (this.hostPresets.includes(meeting.self.presetName)) {
            config = this.button.register(config, meeting, () => getBuilder(config));
            if(this.addActionInParticipantMenu){
                return this.menuItem.register(config, meeting , () => getBuilder(config));
            }
        }

        return config;
    }
}
