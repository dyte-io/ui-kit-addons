

export default class CustomMenuItem extends HTMLElement {
    shadow: ShadowRoot;

    icon: string = '';

    label: string;

    onClick: () => void;

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
    }

    static get observedAttributes() {
        return ["label", "icon"];
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        console.log(name, oldValue, newValue);
        if (name === "label") {
            this.label = newValue;
        }
        if (name === "icon") {
            this.icon = newValue;
        }
    }

    render() {
        const container = document.createElement("dyte-menu-item");
        container.onclick = this.onClick;
        if (this.icon) {
            const icon = document.createElement("dyte-icon");
            icon.setAttribute("icon", this.icon);
            icon.setAttribute("size", "md");
            icon.setAttribute("slot", "start");
            container.appendChild(icon);
        }

        const textNode = document.createTextNode(this.label);
        container.appendChild(textNode);
        this.shadow.appendChild(container);
    }

    connectedCallback() {
        this.render();
    }
}