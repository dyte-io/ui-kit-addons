class ActionToggle extends HTMLElement {
    shadow;
    label = "Click me";    
    initialValue = () => false;
    state = false;
    onEnabled = () => {};
    onDisabled = () => {};
    onStateChange: (cb: (state: boolean) => void) => void = () => {};

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
        const style = this.createElement("style", "invite-action-style");
        style.innerText = `
        :host {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 30px;
          position: relative;
          padding: var(--dyte-space-3, 12px);
          padding-bottom: var(--dyte-space-1, 4px);
        }

        .action-container {
          flex-grow: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
        }

        .action-button {
          box-sizing: border-box;
          background-color: transparent;
          color: rgb(var(--dyte-colors-text-on-brand-1000, var(--dyte-colors-text-1000, 255 255 255)));
          background-color: rgba(var(--dyte-colors-brand-500, 33 96 253) / var(--tw-bg-opacity));
          border: 0 solid transparent;
          border-radius: var(--dyte-border-radius-sm, 4px);
          display: inline-flex;
          height: var(--dyte-space-8, 32px);
          width: 100%;
          line-height: var(--dyte-space-8, 32px);
          flex-grow: 1;
          justify-content: center;
          vertical-align: baseline;
          gap: var(--dyte-space-1, 4px);
          transition-property: var(--transition-property);
          transition-duration: var(--transition-duration);
          outline: none;
          font-family: inherit;
          cursor: pointer;
        }
      `;
        this.shadow.appendChild(style);
    }

    static get observedAttributes() {
        return ["label"];
    }

    attributeChangedCallback(attr: any, oldVal: any, newVal: string) {
        if (oldVal === newVal) return; // nothing to do
        switch (attr) {
            case "label":
                this.label = newVal;
                break;
        }
    }

    createElement(name: string, className: string, id?: string) {
        const ele = document.createElement(name);
        ele.setAttribute("class", className);
        if (id) {
            ele.setAttribute("id", id);
        }
        return ele;
    }

    render() {        
        const container = this.createElement("div", "action-container");
        const button = this.createElement(
            "dyte-switch",
            "action-switch"
        ) as HTMLDyteSwitchElement;
        this.state = this.initialValue();
        button.checked = this.state;
        button.addEventListener("dyteChange", () => {
            if (button.checked == this.state) return;
            this.state = button.checked;
            if (button.checked) {
                this.onEnabled();
            }
            if (!button.checked) {
                this.onDisabled();
            }
        });
        container.innerText = this.label;
        container.appendChild(button);
        this.shadow.appendChild(container);
        this.onStateChange((state) => {
            this.state = state;
            button.checked = state;
        });
    }

    connectedCallback() {
        this.render();
    }
}

export default ActionToggle;
