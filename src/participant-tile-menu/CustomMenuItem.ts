export interface MenuState {
    label: string;
    icon?: string;
    iconClass?: string;
    labelClass?: string;
}

export interface ParticipantMenuItemArgs {
    label: string;
    onClick: (participantId: string) => void;
}

export default class CustomMenu extends HTMLElement {
    shadow: ShadowRoot;

    items: ParticipantMenuItemArgs[] = []

    position: string = '';

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
        const style = document.createElement("style");
        style.innerText = `
            rtk-menu:hover {
                cursor: pointer;
            }
            rtk-menu-item {
                background: rgba(var(--rtk-colors-background-700, 50 50 50) / var(--tw-bg-opacity));
                width: max-content;
            }
            rtk-menu-item:hover {
                background: rgba(var(--rtk-colors-background-600, 50 50 50) / var(--tw-bg-opacity));
            }
        `;
        this.shadow.appendChild(style);
    }


    static get observedAttributes() {
        return ["label", "icon", "styles"];
    }

    render() {
        const container = document.createElement("rtk-menu");
        container.style.position = 'absolute';
        container.style.top = '8px';
        container.style.right = '8px';
    
        if (this.position === 'top-left') {
            container.style.top = '8px';
            container.style.left = '8px';
        } 
        if (this.position === 'bottom-left') {
            container.style.bottom = '8px';
            container.style.left = '8px';
        } 
        if (this.position === 'bottom-right') {
            container.style.bottom = '8px';
            container.style.right = '8px';
        } 
        const button = document.createElement('div');
        button.slot = 'trigger';
        button.className = 'actions';
        button.innerHTML = '<svg style="width: 20px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 7.75a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5ZM12 13.75a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5ZM10.25 18a1.75 1.75 0 1 0 3.5 0 1.75 1.75 0 0 0-3.5 0Z" fill="currentColor"/></svg>';
        container.appendChild(button);
        this.items.forEach((i) => {
            const menuItem = document.createElement("rtk-menu-item");
            menuItem.innerText = i.label;
            menuItem.onclick = () => {
                let parentNode = this.shadow.host;
                let c = 0
                let participantId = ''
                while (parentNode) {
                    if (c > 10) break;
                    if ('getAttribute' in parentNode && parentNode.getAttribute('data-participant')) {
                        participantId = parentNode.getAttribute('data-participant');
                        break;
                    }
                    c += 1;
                    parentNode = parentNode.parentNode || (parentNode as any).host;
                }
                i.onClick(participantId);
            }
            container.appendChild(menuItem);
        })

        this.shadow.appendChild(container);
    }

    connectedCallback() {
        this.render();
    }
}
