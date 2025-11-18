# Reactions Manager
A reactions feature that allows participants to send emoji reactions that appear as floating animations on participant video tiles.

## Features
- 6 default emoji reactions (👍, ❤️, 😂, 😮, 👏, 🎉)
- Floating animations that rise up from the participant tile
- Real-time synchronization across all participants
- Emoji Badge appears during PIP

## Usage

### 1. Initialize the addon

```ts
import ReactionsManagerAddon from '@cloudflare/realtimekit-ui-addons/reactions-manager';

const reactionsAddon = await ReactionsManagerAddon.init({
    meeting,
    canSendReactions: true, // optional, defaults to true
});
```

### 2. Register the addon

```ts
import { registerAddons } from "@cloudflare/realtimekit-ui";

const newConfig = registerAddons([reactionsAddon], meeting);
```

### 3. Pass the config to meeting UI

```tsx
<rtk-meeting meeting={meeting} config={newConfig}></rtk-meeting>
```


## How it works
1. **Reaction Picker**: A button in the control bar that opens a popup with available emoji reactions
2. **Broadcast API**: Uses RealtimeKit's participant broadcast API to sync reactions across all participants
3. **Reaction Overlay**: Custom element overlaid on each participant tile that displays floating animations

## Components
- **ReactionPicker**: Control bar button with emoji picker dropdown
- **ReactionOverlay**: Overlay on participant tiles that displays animated reactions
- **ReactionsManagerAddon**: Main addon class that orchestrates the feature
- **ReactionsBadge**: Badge that appears on the top right of the participant tile (Helpfull especially during PIP)
