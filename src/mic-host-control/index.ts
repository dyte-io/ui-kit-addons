import { UIConfig } from "@dytesdk/ui-kit";
import { Meeting } from "@dytesdk/ui-kit/dist/types/types/dyte-client";
import DyteToggle from "../participants-tab-toggle";
import ParticipantMenuItem from "../participant-menu-item";
import { DyteStore } from "../hand-raise/type";

export interface MicHostToggleArgs {
    hostPresets: string[];
    targetPresets: string[];
    addActionInParticipantMenu: boolean;
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

    sendTimeout: any;

    state = true;

    micPermissionsStore: DyteStore = undefined;

    addActionInParticipantMenu = false;

    updateToggleWithoutAction: (state: boolean) => void = () => {};

    button = new DyteToggle({
        position: "start",
        label: "Microphone",
        onEnabled: () => {
            this.state = true;
            if (this.sendTimeout) {
                clearInterval(this.sendTimeout);
            }
            this.micPermissionsStore.set('micPermissionUpdate', {
                targetPresets: this.targetPresets, canProduce: "ALLOWED"
            }, true, true);

            this.updateBlockedParticipants(!this.state);
        },
        onDisabled: () => {
            this.state = false;
            if (this.sendTimeout) {
                clearInterval(this.sendTimeout);
            }
            const disableMic = () => {
                this.micPermissionsStore.set('micPermissionUpdate', {
                    targetPresets: this.targetPresets, canProduce: "NOTE_ALLOWED"
                }, true, true);
            };
            this.sendTimeout = setInterval(disableMic, 2000);
            disableMic();
            this.updateBlockedParticipants(!this.state);
        },
        updateToggleSetterFn: (cb) => {
            this.updateToggleWithoutAction = cb;
            cb(this.state);
        }
    });

    menuItem = new ParticipantMenuItem({
        label: "Disable Mic",
        icon: micOffIcon,
        onStateChange: (participantId, callback) => {
            const isBlocked = this.isParticipantBlocked(participantId);
            callback({
                label: isBlocked ? "Enable Mic" : "Disable Mic",
                icon: isBlocked ? micOnIcon : micOffIcon,
                iconClass: isBlocked ? "" : "red-icon"
            });
            return this.micPermissionsStore.subscribe(
                '*',
                () => {
                    const isBlocked = this.isParticipantBlocked(participantId);
                    callback({
                        label: isBlocked ? "Enable Mic" : "Disable Mic",
                        icon: isBlocked ? micOnIcon : micOffIcon,
                        iconClass: isBlocked ? "" : "red-icon"
                    });
                });
        },

        onClick: (participantId) => {
            const isBlocked = this.isParticipantBlocked(participantId);
            this.micPermissionsStore.set(
                "micPermissionUpdate",
                { 
                    targetId: participantId,
                    canProduce: isBlocked? "ALLOWED": "NOTE_ALLOWED"
                },
                true,
                true,
            );
            // toggle the state
            this.updateBlockedParticipants(!isBlocked, participantId);
        }
    });

    constructor(args: MicHostToggleArgs) {
        this.targetPresets = args.targetPresets;
        this.hostPresets = args.hostPresets;
        this.addActionInParticipantMenu = args.addActionInParticipantMenu || false;
    }

    // if overrides are present, and the participant is not blocked, return false
    // if overrides are present, and the participant is blocked, return true
    // if overrides are not present, and blockAll is true, return true
    // if overrides are not present, and blockAll is false, return false
    isParticipantBlocked(participantId: string) {
        if (this.micPermissionsStore.get('overrides')?.[participantId] !== undefined) {
            return this.micPermissionsStore.get('overrides')?.[participantId];
        }
        return this.micPermissionsStore.get('blockAll');
    }

    updateBlockedParticipants(state: boolean, participantId?: string) {
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
    updatePermissions({state}: {state: 'ALLOWED' | 'NOT_ALLOWED'}){
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
    onOverrideUpdate(){
        if(this.state === !this.micPermissionsStore.get('overrides')?.blockAll){
            return;
        }
        this.state = !this.micPermissionsStore.get('overrides')?.blockAll;
        this.updateToggleWithoutAction(this.state);
        this.updatePermissions({
            state: this.state? 'ALLOWED' : 'NOT_ALLOWED',
        });
    }

    async onMicPermissionUpdate() {
        const payload = this.meeting.stores.stores.get('micPermissionsStore').get('micPermissionUpdate');
        if(!payload){
            return;
        }
        if (
            (payload.targetPresets?.includes(this.meeting?.self.presetName) ||
                payload.targetId === this.meeting?.self.id)
        ) {
            this.updatePermissions({
                state:  payload.canProduce
            });
        }
    }

    async unregister() {
        this.button.unregister();

        this.micPermissionsStore.unsubscribe('micPermissionUpdate', this.onMicPermissionUpdate.bind(this));
        this.micPermissionsStore.unsubscribe('overrides', this.onOverrideUpdate.bind(this));
    }

    register(config: UIConfig, meeting: Meeting, getBuilder: (c: UIConfig) => any) {
        this.meeting = meeting;
        this.micPermissionsStore = meeting.stores.stores.get('micPermissionsStore');
        this.state = !this.micPermissionsStore.get('overrides')?.blockAll;
        this.micPermissionsStore.subscribe('micPermissionUpdate', this.onMicPermissionUpdate.bind(this));
        this.micPermissionsStore.subscribe('overrides', this.onOverrideUpdate.bind(this));

        if (this.hostPresets.includes(meeting.self.presetName)) {
            config = this.button.register(config, meeting, () => getBuilder(config));
            if(this.addActionInParticipantMenu){
                return this.menuItem.register(config, meeting , () => getBuilder(config));
            }
        }

        return config;
    }
}
