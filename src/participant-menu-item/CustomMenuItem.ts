interface MenuState { 
    label: string;
    icon: string;
    class: string;
}

export default class CustomMenuItem extends HTMLElement {
    shadow: ShadowRoot;

    state = {
        label: null,
        icon: null,
        class: null
    };

    icon: string = '';

    label: string;

    participant: any;

    _onClick: (participantId: string) => void;

    _onStateChange: (participantId: string, callback: (state: MenuState) => void ) => void;

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
    }

    set onClick(onClick: (participantId: string) => void) {
        this._onClick = onClick;
    }

    get onClick() {
        return this._onClick;
    }

    set onStateChange(method) {
        this._onStateChange = method;
    }

    get onStateChange() {
        return this._onStateChange;
    }

    static get observedAttributes() {
        return ["label", "icon"];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (oldValue === newValue) return;
        if (name === "label") {
            this.label = newValue;
        }
        if (name === "icon") {
            this.icon = newValue;
        }
    }

    updateLabel(container: any) {
        container.innerHTML = "";
        if (this.icon || this.state.icon) {
            const icon = document.createElement("dyte-icon");
            icon.setAttribute("icon", this.state.icon || this.icon);
            icon.className = this.state.class || "red-icon";
            icon.setAttribute("size", "md");
            icon.setAttribute("slot", "start");
            container.appendChild(icon);
        }

        const textNode = document.createTextNode(this.state.label ?? this.label);
        container.appendChild(textNode);
    }

    render() {
        const container = document.createElement("dyte-menu-item");
        container.onclick = () => {
            if (this.participant) {
                this._onClick(this.participant.id);
            }
        }
        this.updateLabel(container);
        this.onStateChange(this.participant.id, (state) => {
            this.state = state;
            this.updateLabel(container);
        });

        this.shadow.appendChild(container);
    }

    connectedCallback() {
        this.render();
    }
}