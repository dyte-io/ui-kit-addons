import { DyteStore } from "@dytesdk/web-core";
import { HandRaiseIcon } from "./HandRaiseButton";

export default class RaisedHand extends HTMLElement {
    _shadowRoot = undefined;
    _participant = undefined;
    _raised = false;
    _meeting = undefined;
    
    handRaisedStore: DyteStore = undefined;
    
    static icon = HandRaiseIcon;

    static get observedAttributes() {
        return ["raised"];
    }

    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: "open" });
        this.updateShowHand = this.updateShowHand.bind(this);
    }

    get participant() {
        return this._participant;
    }

    set participant(participant) {
        this._participant = participant;
    }

    set meeting(meeting) {
        this._meeting = meeting;
    }

    get meeting() {
        return this._meeting;
    }

    get raised() {
        return this._raised;
    }

    set raised(raised) {
        this._raised = raised;
    }

    disconnectedCallback() {
        this.handRaisedStore.unsubscribe(this.participant.id, this.updateShowHand);
    }

    updateShowHand() {
        this.raised = !!this.handRaisedStore.get(this.participant.id)?.raised;
        this.updateContent();
    }

    connectedCallback() {
        this.handRaisedStore = this.meeting.stores.stores.get('handRaise');
        this.raised = !!this.handRaisedStore.get(this.participant.id)?.raised;
        this.handRaisedStore.subscribe(this.participant.id, this.updateShowHand);
        this.updateContent();
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
		  ${RaisedHand.icon}
	  </div>
	`;
    }
}
