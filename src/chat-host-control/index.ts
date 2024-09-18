import { UIConfig } from "@dytesdk/ui-kit";
import { Meeting } from "@dytesdk/ui-kit/dist/types/types/dyte-client";
import DyteToggle from "../participants-tab-toggle";
import ParticipantMenuItem from "../participant-menu-item";
import { DyteStore } from "../hand-raise/type";

export interface ChatHostToggleArgs {
    hostPresets: string[];
    targetPresets: string[];
    addActionInParticipantMenu: boolean;
}


const chatOffIcon = `<svg width="24" height="24" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M3.28 2.22a.75.75 0 1 0-1.06 1.06l2.198 2.2A9.96 9.96 0 0 0 2 12a9.96 9.96 0 0 0 1.115 4.592l-1.068 3.823a1.25 1.25 0 0 0 1.54 1.54l3.826-1.067A9.96 9.96 0 0 0 12 22c2.491 0 4.77-.911 6.52-2.418l2.2 2.198a.75.75 0 0 0 1.06-1.06L3.28 2.22Zm14.177 16.298A8.466 8.466 0 0 1 12 20.5a8.458 8.458 0 0 1-4.133-1.07l-.27-.15-3.986 1.111 1.113-3.984-.151-.27A8.458 8.458 0 0 1 3.5 12c0-2.077.745-3.98 1.983-5.457l3.004 3.005A.75.75 0 0 0 8.75 11h1.19l2 2H8.75l-.102.007A.75.75 0 0 0 8.75 14.5h4.498l.102-.007a.76.76 0 0 0 .07-.013l4.037 4.038ZM15.255 9.5h-2.573l1.5 1.5h1.072l.102-.007a.75.75 0 0 0-.101-1.493Z" fill="currentColor"/><path d="M20.5 12c0 1.53-.404 2.966-1.112 4.206l1.094 1.094A9.953 9.953 0 0 0 22 12c0-5.523-4.477-10-10-10a9.953 9.953 0 0 0-5.3 1.518l1.094 1.094A8.5 8.5 0 0 1 20.5 12Z" fill="currentColor"/></svg>`;
const chatOnIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10a9.96 9.96 0 0 1-4.587-1.112l-3.826 1.067a1.25 1.25 0 0 1-1.54-1.54l1.068-3.823A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2Zm0 1.5A8.5 8.5 0 0 0 3.5 12c0 1.47.373 2.883 1.073 4.137l.15.27-1.112 3.984 3.987-1.112.27.15A8.5 8.5 0 1 0 12 3.5ZM8.75 13h4.498a.75.75 0 0 1 .102 1.493l-.102.007H8.75a.75.75 0 0 1-.102-1.493L8.75 13h4.498H8.75Zm0-3.5h6.505a.75.75 0 0 1 .101 1.493l-.101.007H8.75a.75.75 0 0 1-.102-1.493L8.75 9.5h6.505H8.75Z" fill="currentColor"/></svg>`;

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
 *     targetPresets: ["students"],
 *     addActionInParticipantMenu: true, // default false
 *   });
 *  pass the action to the addon register function
 */
export default class ChatHostToggle {
    meeting?: Meeting;

    hostPresets: string[];

    targetPresets: string[];

    sendTimeout: any;

    state = true;

    chatPermissionsStore: DyteStore = undefined;

    addActionInParticipantMenu = false;

    updateToggleWithoutAction: (state: boolean) => void = () => {};

    button = new DyteToggle({
        position: "start",
        label: "Chat",
        onEnabled: () => {
            this.state = true;
            if (this.sendTimeout) {
                clearInterval(this.sendTimeout);
            }
            this.chatPermissionsStore.set('chatPermissionUpdate', {
                targetPresets: this.targetPresets, canSend: true
            }, true, true);
            this.updateBlockedParticipants(!this.state);
        },
        onDisabled: () => {
            this.state = false;
            if (this.sendTimeout) {
                clearInterval(this.sendTimeout);
            }
            const disableChat = () => {
                this.chatPermissionsStore.set('chatPermissionUpdate', {
                    targetPresets: this.targetPresets, canSend: false
                }, true, true);
            };
            this.sendTimeout = setInterval(disableChat, 5000);
            disableChat();
            this.updateBlockedParticipants(!this.state);
        },
        updateToggleSetterFn: (cb) => {
            this.updateToggleWithoutAction = cb;
            cb(this.state);
        }
        
    });

    menuItem = new ParticipantMenuItem({
        label: "Disable Chat",
        icon: chatOffIcon,
        onStateChange: (participantId, callback) => {
            const isBlocked = this.isParticipantBlocked(participantId);
            callback({
                label: isBlocked ? "Enable Chat": "Disable Chat",
                icon: isBlocked ? chatOnIcon : chatOffIcon,
                iconClass: isBlocked ? "" : "red-icon"
            });
            return this.chatPermissionsStore.subscribe(
                '*',
                () => {
                    const isBlocked = this.isParticipantBlocked(participantId);
                    callback({
                        label: isBlocked ? "Enable Chat": "Disable Chat",
                        icon: isBlocked ? chatOnIcon : chatOffIcon,
                        iconClass: isBlocked ? "" : "red-icon"
                    });
                });
        },

        onClick: (participantId) => {
            let isBlocked = this.isParticipantBlocked(participantId);
            this.chatPermissionsStore.set(
                "chatPermissionUpdate",
                { targetId: participantId, canSend: isBlocked },
                true,
                true,
            );
            // toggle the state
            this.updateBlockedParticipants(!isBlocked, participantId);
        }
    });

    constructor(args: ChatHostToggleArgs) {
        this.targetPresets = args.targetPresets;
        this.hostPresets = args.hostPresets;
        this.addActionInParticipantMenu = args.addActionInParticipantMenu || false;
    }

    // if overrides are present, and the participant is not blocked, return false
    // if overrides are present, and the participant is blocked, return true
    // if overrides are not present, and blockAll is true, return true
    // if overrides are not present, and blockAll is false, return false

    isParticipantBlocked(participantId: string) {
        if (this.chatPermissionsStore.get('overrides')?.[participantId] !== undefined) {
            return this.chatPermissionsStore.get('overrides')?.[participantId];
        }
        return this.chatPermissionsStore.get('blockAll');
    }

    updateBlockedParticipants(state: boolean, participantId?: string) {
        if (participantId) {
            this.chatPermissionsStore.set('overrides', {
                ...(this.chatPermissionsStore.get('overrides') || {}),
                [participantId]: state,
            }, true, true);
        } else {
            this.chatPermissionsStore.set('overrides', {
                blockAll: state,
            }, true, true);
        }
    }

    updatePermissions({state}: {state: 'ALLOWED' | 'NOT_ALLOWED'}){
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

    onChatPermissionUpdate() {
        const payload = this.meeting.stores.stores.get('chatPermissionsStore').get('chatPermissionUpdate');
        if(!payload){
            return;
        }
        if (
            (payload.targetPresets?.includes(this.meeting?.self.presetName) ||
                payload.targetId === this.meeting?.self.id)
        ) {
            const state = payload.canSend;
            this.updatePermissions({state});
        }
    }
    onOverrideUpdate(){
        if(this.state === !this.chatPermissionsStore.get('overrides')?.blockAll){
            return;
        }
        this.state = !this.chatPermissionsStore.get('overrides')?.blockAll;
        this.updateToggleWithoutAction(this.state);
        this.updatePermissions({state: this.state? 'ALLOWED' : 'NOT_ALLOWED'});
    }

    async unregister() {
        this.chatPermissionsStore.unsubscribe('chatPermissionUpdate', this.onChatPermissionUpdate.bind(this));
        this.chatPermissionsStore.unsubscribe('overrides', this.onOverrideUpdate.bind(this));
    }

    register(config: UIConfig, meeting: Meeting, getBuilder: (c: UIConfig) => any) {
        this.meeting = meeting;
        this.chatPermissionsStore = meeting.stores.stores.get('chatPermissionsStore');
        this.state = !this.chatPermissionsStore.get('overrides')?.blockAll;
        this.chatPermissionsStore.subscribe('chatPermissionUpdate', this.onChatPermissionUpdate.bind(this));
        this.chatPermissionsStore.subscribe('overrides', this.onOverrideUpdate.bind(this));
        
        if (this.hostPresets.includes(meeting.self.presetName)) {
            config = this.button.register(config, meeting, () => getBuilder(config));
            if(this.addActionInParticipantMenu){
                return this.menuItem.register(config, meeting , () => getBuilder(config));
            }
        }

        return config;
    }
}
