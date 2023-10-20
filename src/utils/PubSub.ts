export default class PubSub {
    events = {};

    constructor() {
        this.events;
    }

    // Subscribe to an event
    subscribe(event: string, callback: (data?: any) => void) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    // Unsubscribe from an event
    unsubscribe(event: string, callback: (data?: any) => void) {
        if (!this.events[event]) return;

        const index = this.events[event].indexOf(callback);
        if (index > -1) {
            this.events[event].splice(index, 1);
        }
    }

    // Publish an event
    publish(event: string, data: any) {
        if (!this.events[event]) return;

        this.events[event].forEach((callback: (data?: any) => void) => {
            callback(data);
        });
    }
}
