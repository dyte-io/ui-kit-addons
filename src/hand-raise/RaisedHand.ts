import { HandRaiseIcon } from "./HandRaiseButton";

export default class RaisedHand extends HTMLElement {
    _shadowRoot = undefined;
    _participant = undefined;
    _raised = false;

    static get observedAttributes() {
        return ["raised"];
    }

    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: "open" });
    }

    get participant() {
        return this._participant;
    }

    set participant(participant) {
        this._participant = participant;
    }

    get raised() {
        return this._raised;
    }

    set raised(raised) {
        this._raised = raised;
    }

    disconnectedCallback() {
        window.DyteHandRaiseAddon.pubsub?.unsubscribe("update-raise-hand", this.updateShowHand.bind(this));
    }

    updateShowHand(data: any) {
        if (data.participantId === this.participant.id) {
            this.raised = data.raised;
            this.updateContent();
        }
    }

    connectedCallback() {
        window.DyteHandRaiseAddon.pubsub?.subscribe("update-raise-hand", this.updateShowHand.bind(this));
        this.raised = window.DyteHandRaiseAddon.list?.includes(this.participant.id);
    }

    attributeChangedCallback() {
        this.updateContent();
    }

    updateContent() {
        this._shadowRoot.innerHTML = `
	  <style>
		:host {
		  display: ${this.raised ? 'flex': 'none'};
          color: var(--dyte-colors-brand-500, 33 96 253);
		}
	  </style>
	  <div style="position: absolute; top: 5px; right: 5px; height: 32px; width: 32px;">
		  ${HandRaiseIcon}
	  </div>
	`;
    }
}
