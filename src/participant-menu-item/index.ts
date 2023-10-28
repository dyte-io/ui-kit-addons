import { DyteUIBuilder, UIConfig } from "@dytesdk/ui-kit";
import { Meeting } from "@dytesdk/ui-kit/dist/types/types/dyte-client";
import CustomMenuItem from "./CustomMenuItem";

interface ParticipantMenuItemArgs {
    label: string;
    icon?: string;
    onClick: () => void;
}

export default class ParticipantMenuItem {
    meeting?: Meeting;

    onClick: () => void;

    label: string;

    icon?: string;

    constructor(args: ParticipantMenuItemArgs) {
        this.label = args.label;
        this.icon = args.icon;
        this.onClick = args.onClick;
    }

    async unregister() {
        return;
    }

    register(config: UIConfig, meeting: Meeting) {
        if (!customElements.get("dyte-custom-menu-item")) {
            customElements.define(
                "dyte-custom-menu-item",
                CustomMenuItem
            );
        }

        this.meeting = meeting;
        if (!config.root["dyte-participant"]) {
            config.root["dyte-participant"] = [];
        }

        // Add buttons with config
        const builder = new DyteUIBuilder(config);
        const participants = builder.find(`dyte-participant`);
        participants.add("dyte-custom-menu-item", {
            label: this.label,
            icon: this.icon,
            // @ts-ignore
            onClick: this.onClick
        });

        // Return the updated config
        return builder.build();
    }
}