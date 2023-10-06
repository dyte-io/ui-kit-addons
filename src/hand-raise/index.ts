import { DyteUIBuilder, UIConfig } from "@dytesdk/ui-kit";
import { Meeting } from "@dytesdk/ui-kit/dist/types/types/dyte-client";

function getRoots(ele: any) {
    return [...ele.querySelectorAll("*")]
        .filter((e) => !!e.shadowRoot)
        .flatMap((e) => [e.shadowRoot, ...getRoots(e.shadowRoot)]);
}

function getParticipantTile(participantId: string) {
    const roots = getRoots(document.body);
    let tile = null;
    roots
        .filter((e: ShadowRoot) => e.host.tagName === "DYTE-PARTICIPANT-TILE")
        .forEach((e: ShadowRoot) => {
            // @ts-ignore
            if (e.host.dataset.participant === participantId) {
                tile = e.host;
            }
        });
    return tile;
}

function getRaiseHandElement(participantId: string) {
    const tile = getParticipantTile(participantId);
    if (!tile) return null;
    return tile.getElementsByTagName("raised-hand")[0];
}

let handRaised = false;

// svg string of raised hand
const icon =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10.8 10.2V3.3a.9.9 0 111.8 0v6.9a.6.6 0 001.2 0V4.5a.9.9 0 111.8 0v7.8c.795-.511 1.671-.9 2.4-.9 1.166 0 2.146.389 2.382 1.338.014.058.019.117.019.175 0 .18-.085.35-.23.459l-1.574 1.181c-1.275.956-2.476 2.239-3.314 3.587-.453.729-.861 1.483-1.264 2.241-.432.813-.706 1.219-2.018 1.219H8.346c-1.145 0-1.58-.64-2.345-2.4-.765-1.76-1.2-3.533-1.2-4.2V6.3a.9.9 0 011.8 0v4.5a.6.6 0 101.2 0V4.5a.9.9 0 011.8 0v5.7a.6.6 0 101.2 0z" fill="currentColor"/></svg>';

class RaisedHand extends HTMLElement {
    _shadowRoot = undefined;

    static get observedAttributes() {
        return ["raised"];
    }

    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        this.updateContent();
    }

    attributeChangedCallback() {
        this.updateContent();
    }

    updateContent() {
        this._shadowRoot.innerHTML = `
	  <style>
		:host {
		  display: none;
		}
		:host([raised="true"]) {
		  display: flex;
		  color: var(--dyte-colors-brand-500, 33 96 253);
		}
	  </style>
	  <div style="position: absolute; top: 5px; right: 5px; height: 16px; width: 16px;">
		  ${icon}
	  </div>
	`;
    }
}

class RaiseHandAddon {
    constructor() {
        if (customElements.get("raised-hand")) return;
        customElements.define("raised-hand", RaisedHand);
    }

    register(config: UIConfig, meeting: Meeting) {
        // listen for broadcasted messages
        meeting.participants.on(
            "broadcastedMessage",
            (event: {
                type: string;
                payload: { participantId: string; raised: boolean };
            }) => {
                if (event.type === "update-raise-hand") {
                    const { participantId, raised } = event.payload;
                    const participant =
                        meeting.participants.joined.get(participantId);
                    if (participant) {
                        participant.raised = raised;
                        // trigger update on participant tile
                        const raisedHand = getRaiseHandElement(participantId);
                        raisedHand.setAttribute("raised", raised);
                    }
                }
            }
        );

        // Add buttons with config
        const builder = new DyteUIBuilder(config);
        const controlBar = builder.find("div#controlbar-left");
        if (!controlBar) return config;
        const participantTile = builder.find("dyte-participant-tile");
        if (!participantTile) return config;

        participantTile.add("raised-hand", {
            meeting,
            raised: "false" // default value for all participants
        });

        controlBar.add("dyte-controlbar-button", {
            id: "raise-hand",
            label: "Raise Hand",
            icon,
            // @ts-ignore
            onClick: () => {
                handRaised = !handRaised;
                const data = {
                    participantId: meeting.self.id,
                    raised: handRaised
                };
                meeting.participants.broadcastMessage(
                    "update-raise-hand",
                    data
                );
            }
        });

        // Return the updated config
        return builder.build();
    }

    unregister() {}
}

export default RaiseHandAddon;
