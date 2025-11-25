
// svg string for reaction/emoji icon (smiling face)
export const ReactionIcon = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="200px" width="200px" xmlns="http://www.w3.org/2000/svg"><g id="Face_Smile"><g><path d="M12,21.942A9.942,9.942,0,1,1,21.942,12,9.953,9.953,0,0,1,12,21.942ZM12,3.058A8.942,8.942,0,1,0,20.942,12,8.952,8.952,0,0,0,12,3.058Z"></path><path d="M16.693,13.744a5.041,5.041,0,0,1-9.387,0c-.249-.59-1.111-.081-.863.505a6.026,6.026,0,0,0,11.114,0c.247-.586-.614-1.1-.864-.505Z"></path><circle cx="9" cy="9.011" r="1.25"></circle><circle cx="15" cy="9.011" r="1.25"></circle></g></g></svg>`
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
        flex-wrap: wrap;
        gap: 4px;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        min-width: 400px;
        max-width: min(360px, 90vw);
        box-sizing: border-box;
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
    _reactions = REACTIONS;
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

    set reactions(reactions) {
        this._reactions = Array.isArray(reactions) && reactions.length > 0 ? reactions : REACTIONS;
    }

    get reactions() {
        return this._reactions;
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
        
        this.reactions.forEach(reaction => {
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
