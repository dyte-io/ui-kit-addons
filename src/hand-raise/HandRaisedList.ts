const STYLES = `
    :host {
        display: flex;
        width: 100%;
        flex-direction: column;
        line-height: initial;
        font-family: var(--dyte-font-family, sans-serif);
        font-feature-settings: normal;
        font-variation-settings: normal;
        margin-top: var(--dyte-space-2, 8px);
        margin-bottom: var(--dyte-space-2, 8px);
        box-sizing: border-box;
        padding-left: var(--dyte-space-3, 12px);
        padding-right: var(--dyte-space-3, 12px);
        padding-top: var(--dyte-space-0, 0px);
        padding-bottom: var(--dyte-space-0, 0px);
        flex-basis: 0px;
    }

    .container {
        margin-bottom: var(--dyte-space-4, 16px);
        width: 100%;
    }

    .heading-count {
        margin: var(--dyte-space-0, 0px);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--dyte-space-0, 0px);
        font-size: 14px;
        font-weight: 400;
        color: rgb(var(--dyte-colors-text-900, 255 255 255 / 0.88));
        text-align: center;
    }

    .participants {
        margin-top: var(--dyte-space-2, 8px);
        margin-bottom: var(--dyte-space-0, 0px);
        padding: var(--dyte-space-0, 0px);
        list-style-type: none;
    }

    :host dyte-avatar {
      height: var(--dyte-space-8, 32px);
      width: var(--dyte-space-8, 32px);
      margin-right: var(--dyte-space-2, 8px);
    }

    .participant-details {
      display: flex;
      height: var(--dyte-space-14, 56px);
      align-items: center;
      justify-content: space-between;
    }

    .left {
      display: flex;
      align-items: center;
    }

    .right {
      display: flex;
      align-items: center;
    }
`;

const removeIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m4.397 4.554.073-.084a.75.75 0 0 1 .976-.073l.084.073L12 10.939l6.47-6.47a.75.75 0 1 1 1.06 1.061L13.061 12l6.47 6.47a.75.75 0 0 1 .072.976l-.073.084a.75.75 0 0 1-.976.073l-.084-.073L12 13.061l-6.47 6.47a.75.75 0 0 1-1.06-1.061L10.939 12l-6.47-6.47a.75.75 0 0 1-.072-.976l.073-.084-.073.084Z" fill="currentColor"/></svg>';


export class HandRaisedList extends HTMLElement {
    shadow;

    _meeting = undefined;

    _raised = window.DyteHandRaiseAddon.list || [];

    _onRemove = undefined;

    constructor() {
        super();
        // Create a shadow root
        this.shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.innerHTML = STYLES;
        this.shadow.appendChild(style);
    }

    static get observedAttributes() {
        return ["meeting", "raised", "onRemove"];
    }

    set meeting(meeting) {
        this._meeting = meeting;
        this.updateContent();
    }

    get meeting() {
        return this._meeting;
    }

    set raised(raised) {
        this._raised = raised;
        this.updateContent();
    }

    get raised() {
        return this._raised;
    }

    set onRemove(onRemove) {
        this._onRemove = onRemove;
    }

    get onRemove() {
        return this._onRemove;
    }

    attributeChangedCallback(attr: string, _oldVal: any, newVal: any) {
        if (attr === "meeting") {
            this.meeting = newVal;
        } else if (attr === "raised") {
            this.raised = newVal;
        }

        this.updateContent();
    }

    createElement(name: string, className: string, id?: string) {
        const ele = document.createElement(name);
        ele.setAttribute("class", className);
        if (id) {
            ele.setAttribute("id", id);
        }
        return ele;
    }

    participantItem(participant) {
        const part = this.createElement("li", "participant");
        const participantDetails = this.createElement(
            "div",
            "participant-details"
        );

        const left = this.createElement("div", "left");
        const avatar = this.createElement("dyte-avatar", "avatar");
        avatar.setAttribute("participant", participant);
        avatar.setAttribute("size", "sm");
        left.appendChild(avatar);
        const name = this.createElement("p", "name");
        name.innerText = participant.name;
        left.appendChild(name);
        participantDetails.appendChild(left);

        const right = this.createElement("div", "right");
        const controls = this.createElement("div", "controls");
        const lowerHand = this.createElement("dyte-button", "lower-hand");
        // @ts-ignore
        lowerHand.label = 'Lower Hand';
        // @ts-ignore
        lowerHand.kind = 'icon';
        // @ts-ignore
        lowerHand.variant = 'ghost';
        // @ts-ignore
        lowerHand.onclick = () => {
            console.log('lower hand', participant.id, this._onRemove);
            this._onRemove ? this._onRemove(participant.id) : null;
        };

        const i = this.createElement('dyte-icon', 'icon');
        // @ts-ignore
        i.icon = removeIcon;
        // @ts-ignore
        i.size = 'sm';

        lowerHand.appendChild(i);
        controls.appendChild(lowerHand);
        right.appendChild(controls);
        participantDetails.appendChild(right);
        part.appendChild(participantDetails);
        return part;
    }

    updateContent() {
        const ul = this.shadow.querySelector("ul.participants");
        ul.innerHTML = "";
        this.raised.map((participantId) => {
            const participant =
                this.meeting.participants.joined.get(participantId);
            const self = this.meeting.self;
            if (participant) {
                ul.appendChild(this.participantItem(participant));
            } else if (self.id === participantId) {
                ul.appendChild(this.participantItem(this.meeting.self));
            }
        });
    }

    updateShowHandList() {
      const list = window.DyteHandRaiseAddon.list ?? [];
      this.raised = list;
    }

    createContainer() {
      const container = this.createElement(
        "div",
        "container",
        "hand-raised-list"
      );
      const heading = this.createElement("div", "heading-count");
      heading.innerText = "Raised Hands";
      container.appendChild(heading);
      const ul = this.createElement("ul", "participants");
      container.appendChild(ul);
      this.shadow.appendChild(container);
    }

    connectedCallback() {
        this.createContainer();
        this.updateContent();
        window.DyteHandRaiseAddon.pubsub?.subscribe("update-raise-hand", this.updateShowHandList.bind(this));
    }
}
