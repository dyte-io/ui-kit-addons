const OVERLAY_STYLES = `
    :host {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
        overflow: hidden;
        z-index: 10;
    }

    .reaction-animation {
        position: absolute;
        font-size: 32px;
        animation: float-up 3s ease-out forwards;
        pointer-events: none;
    }

    @keyframes float-up {
        0% {
            transform: translateY(0) translateX(0) scale(0.5);
            opacity: 0;
        }
        20% {
            transform: translateY(-60px) translateX(calc(var(--drift-x, 20px) * 0.2)) scale(1);
            opacity: 1;
        }
        90% {
            transform: translateY(-270px) translateX(calc(var(--drift-x, 20px) * 0.9)) scale(1);
            opacity: 1;
        }
        100% {
            transform: translateY(-300px) translateX(var(--drift-x, 20px)) scale(0.5);
            opacity: 0;
        }
    }
`;

export default class ReactionOverlay extends HTMLElement {
    _shadowRoot = undefined;
    _participant = undefined;
    _meeting = undefined;
    messageHandler = undefined;

    static get observedAttributes() {
        return ["participant", "meeting"];
    }

    constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: "open" });
        this.handleReactionUpdate = this.handleReactionUpdate.bind(this);
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

    handleReactionUpdate({ type, payload }) {
        // Only handle reaction messages for this participant
        if (type === 'reaction' && payload.peerId === this.participant.id) {
            this.showReaction(payload.emoji);
        }
        const pip = this.meeting.participants.pip;
        pip.updateSource && pip.updateSource(this.participant.id, {
            reaction: payload.emoji
        });
    }

    showReaction(emoji: string) {
        const reactionEl = document.createElement('div');
        reactionEl.className = 'reaction-animation';
        reactionEl.textContent = emoji;
        
        // Random starting position (bottom 20% of the tile, horizontally centered with slight variation)
        const startX = 5 + (Math.random() * 10); // 5-15% from left
        const startY = 80 + (Math.random() * 10); // 80-90% from top
        reactionEl.style.left = `${startX}%`;
        reactionEl.style.top = `${startY}%`;
        
        // Random drift direction
        const driftX = (Math.random() - 0.5) * 50; // -25px to +25px
        reactionEl.style.setProperty('--drift-x', `${driftX}px`);
        
        this._shadowRoot.appendChild(reactionEl);
    }

    connectedCallback() {
        // Add styles
        const style = document.createElement('style');
        style.textContent = OVERLAY_STYLES;
        this._shadowRoot.appendChild(style);

        // Listen to broadcasted messages
        this.messageHandler = this.handleReactionUpdate.bind(this);
        this.meeting.participants.on('broadcastedMessage', this.messageHandler);
    }

    disconnectedCallback() {
        if (this.messageHandler) {
            this.meeting.participants.off('broadcastedMessage', this.messageHandler);
        }
    }

    attributeChangedCallback() {
        // Handle attribute changes if needed
    }
}
