// svg string of raised hand
export const HandRaiseIcon =
    '<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M4 12.02c0 1.06.2 2.1.6 3.08l.6 1.42c.22.55.64 1.01 1.17 1.29.27.14.56.21.86.21h2.55c.77 0 1.49-.41 1.87-1.08.5-.87 1.02-1.7 1.72-2.43l1.32-1.39c.44-.46.97-.84 1.49-1.23l.59-.45a.6.6 0 0 0 .23-.47c0-.75-.54-1.57-1.22-1.79a3.34 3.34 0 0 0-2.78.29V4.5a1.5 1.5 0 0 0-2.05-1.4 1.5 1.5 0 0 0-2.9 0A1.5 1.5 0 0 0 6 4.5v.09A1.5 1.5 0 0 0 4 6v6.02ZM8 4.5v4a.5.5 0 0 0 1 0v-5a.5.5 0 0 1 1 0v5a.5.5 0 0 0 1 0v-4a.5.5 0 0 1 1 0v6a.5.5 0 0 0 .85.37h.01c.22-.22.44-.44.72-.58.7-.35 2.22-.57 2.4.5l-.53.4c-.52.4-1.04.78-1.48 1.24l-1.33 1.38c-.75.79-1.31 1.7-1.85 2.63-.21.36-.6.58-1.01.58H7.23a.87.87 0 0 1-.4-.1 1.55 1.55 0 0 1-.71-.78l-.59-1.42a7.09 7.09 0 0 1-.53-2.7V6a.5.5 0 0 1 1 0v3.5a.5.5 0 0 0 1 0v-5a.5.5 0 0 1 1 0Z" fill="currentColor"></path></svg>';

let handRaised = false;

export class HandRaiseButton extends HTMLElement {
    shadow;

    _meeting = undefined;

    _onclick = undefined;

    constructor() {
        super();
        // Create a shadow root
        this.shadow = this.attachShadow({ mode: "open" });
    }

    static get observedAttributes() {
        return ["meeting", "onclick", "size"];
    }

    attributeChangedCallback(name: string, _, newValue: string) {
        if (name === 'size') {
            const button = this.shadowRoot.querySelector('dyte-controlbar-button');
            switch(newValue) {
                case 'sm':
                case 'md':
                    button?.setAttribute("label", "");
                    break;
                default:
                    button?.setAttribute("label", "Raise Hand");
                    break;
            }
        }
    }
    

    set meeting(meeting) {
        this._meeting = meeting;
    }

    get meeting() {
        return this._meeting;
    }

    set onclick(onclick) {
        this._onclick = onclick;
    }

    get onclick() {
        return this._onclick;
    }

    onClick (e: any) {
        e.stopPropagation();
        e.preventDefault();
        handRaised = !handRaised;
        const button = this.shadowRoot.querySelector('dyte-controlbar-button');
        if (handRaised) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }

        const data = {
            participantId: this.meeting.self.id,
            raised: handRaised
        };

        this.meeting.participants.broadcastMessage(
            "update-raise-hand",
            data
        );
    }

    connectedCallback() {
        const button = document.createElement("dyte-controlbar-button");
        button.setAttribute("id", "raise-hand");
        button.setAttribute("label", "Raise Hand");
        button.setAttribute("icon", HandRaiseIcon);
        button.onclick = this.onClick.bind(this);
        this.shadow.appendChild(button);
    }
}