
// svg string for reaction/emoji icon (smiling face)
export const ReactionIcon =
    '<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16Zm0 1a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM7.5 7a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm5 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM6.5 12a.5.5 0 0 1 .5.5 3 3 0 0 0 6 0 .5.5 0 0 1 1 0 4 4 0 0 1-8 0 .5.5 0 0 1 .5-.5Z" fill="currentColor"></path></svg>';

// Available reactions similar to Google Meet
export const REACTIONS = [
    { emoji: '👍', label: 'thumbs up' },
    { emoji: '❤️', label: 'heart' },
    { emoji: '😂', label: 'laugh' },
    { emoji: '😮', label: 'surprised' },
    { emoji: '👏', label: 'clap' },
    { emoji: '🎉', label: 'celebrate' },
];

const PICKER_STYLES = `
    .reaction-picker {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        margin-bottom: 8px;
        background: rgb(var(--rtk-colors-background-700, 38 38 38));
        border-radius: 12px;
        padding: 8px;
        display: flex;
        gap: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 1000;
    }

    .reaction-picker.hidden {
        display: none;
    }

    .reaction-button {
        width: 40px;
        height: 40px;
        border: none;
        background: transparent;
        border-radius: 8px;
        cursor: pointer;
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, background-color 0.2s;
    }

    .reaction-button:hover {
        background: rgb(var(--rtk-colors-background-800, 48 48 48));
        transform: scale(1.1);
    }

    .reaction-button:active {
        transform: scale(0.95);
    }
`;

export class ReactionPicker extends HTMLElement {
    shadow;
    _meeting = undefined;
    pickerVisible = false;

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: "open" });
        this.togglePicker = this.togglePicker.bind(this);
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    static get observedAttributes() {
        return ["meeting", "size"];
    }

    attributeChangedCallback(name: string, _, newValue: string) {
        if (name === 'size') {
            const button = this.shadowRoot.querySelector('rtk-controlbar-button');
            switch(newValue) {
                case 'sm':
                case 'md':
                    button?.setAttribute("label", "");
                    break;
                default:
                    button?.setAttribute("label", "React");
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

    togglePicker(event) {
        event.stopPropagation();
        this.pickerVisible = !this.pickerVisible;
        const picker = this.shadowRoot.querySelector('.reaction-picker');
        if (this.pickerVisible) {
            picker.classList.remove('hidden');
            // Add document click listener to close picker
            setTimeout(() => {
                document.addEventListener('click', this.handleClickOutside);
            }, 0);
        } else {
            picker.classList.add('hidden');
            document.removeEventListener('click', this.handleClickOutside);
        }
    }

    handleClickOutside(event) {
        if (!this.contains(event.target)) {
            this.pickerVisible = false;
            const picker = this.shadowRoot.querySelector('.reaction-picker');
            picker.classList.add('hidden');
            document.removeEventListener('click', this.handleClickOutside);
        }
    }

    sendReaction(emoji: string) {
        // Broadcast reaction using broadcastMessage API
        this.meeting.participants.broadcastMessage('reaction', {
            emoji,
            peerId: this.meeting.self.id
        });
    }

    connectedCallback() {
        // Create styles
        const style = document.createElement('style');
        style.textContent = PICKER_STYLES;
        this.shadow.appendChild(style);

        // Create container
        const container = document.createElement('div');
        container.style.position = 'relative';
        container.style.display = 'inline-block';

        // Create the reaction picker dropdown
        const picker = document.createElement('div');
        picker.className = 'reaction-picker hidden';
        
        REACTIONS.forEach(reaction => {
            const btn = document.createElement('button');
            btn.className = 'reaction-button';
            btn.textContent = reaction.emoji;
            btn.title = reaction.label;
            btn.onclick = (e) => {
                e.stopPropagation();
                this.sendReaction(reaction.emoji);
            };
            picker.appendChild(btn);
        });

        container.appendChild(picker);

        // Create the main button
        const button = document.createElement("rtk-controlbar-button");
        button.setAttribute("id", "reactions");
        button.setAttribute("label", "React");
        button.setAttribute("icon", ReactionIcon);
        button.onclick = this.togglePicker;
        
        container.appendChild(button);
        this.shadow.appendChild(container);
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.handleClickOutside);
    }
}
