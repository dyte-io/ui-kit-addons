<!-- PROJECT LOGO -->
<p align="center">
  <a href="https://dyte.in">
    <img src="https://dyte-uploads.s3.ap-south-1.amazonaws.com/dyte-logo-dark.svg" alt="Logo" width="80">
  </a>
  <h3 align="center">Dyte Ui Kit addon</h3>

  <p align="center">
    A collection of ui-kit addons that extends the Dyte's prebuilt ui-kit capability.
    <br />
    <a href="https://docs.dyte.io"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://demo.dyte.io">View Demo</a>
    ·
    <a href="https://docs.dyte.io/discuss">Report Bug</a>
    ·
    <a href="https://docs.dyte.io/discuss">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->

## Table of Contents

- [Table of Contents](#table-of-contents)
- [About The Project](#about-the-project)
- [Samples](#samples)
- [Usage](#usage)
- [About](#about)


<!-- ABOUT THE PROJECT -->
## About The Project

This [repository](https://github.com/dyte-io/ui-kit-addons) contains all the ui-kit addons available for the Dyte Web SDK.

A comprehensive guide detailing the usage of these ui-kit addons is available [here](https://dyte.io/blog/ui-kit-add-ons/).

## Samples

Here are the list of available samples at the moment.

1. [Camera Host Control](./src/camera-host-control/)
2. [Chat Host Control](./src/chat-host-control/)
3. [Custom Controlbar button](./src/custom-controlbar-button/)
4. [Hand Raise](./src/hand-raise/)
5. [Mic Host Control](./src/mic-host-control/)
6. [Participant Menu Item](./src/participant-menu-item/)
7. [Participant Tile Menu](./src/participant-tile-menu/)
8. [Participants Tab Action](./src/participants-tab-action/)
9. [Participant Tab Toggle](./src/participants-tab-toggle/)
10. [Video Background](./src/video-background/)

## Usage

To use these addons you would need to do the following steps:

1. Install the addon package:

```sh
npm install @dytesdk/ui-kit-addons
```

2. Import the addon that you need, for example:
   `custom-controlbar-button`:

```ts
import CustomControlbarButton from '@dytesdk/ui-kit-addons/custom-controlbar-button';
```

3. Configure the addon

```ts
const myButton = new CustomControlbarButton({
   position: 'left',
   icon: svgIcon,
   label: 'Click Me!',
   onClick: () => alert('Clicked!')
});
```

4. Register addon

```ts
import { registerAddons } from dytesdk/ui-kit;
...
const newConfig = registerAddons([myButton], meeting);
```

5. Pass the config to meeting UI

```
<dyte-meeting meeting={meeting} config={newConfig}></dyte-meeting> 
```

## Version Compatibility

This version of UI Kit addon requires Web Core 2.x for Video Background addon to work properly. Without Web Core 2.x, a blank screen might get shown instead of the user's video.

If in case you haven't migrated to Web Core 2.x yet, Please use [1.1.13](https://www.npmjs.com/package/@dytesdk/ui-kit-addons/v/1.1.13) of this UI Kit addon package instead.

Few of the addons such as HandRaise, Chat Host Control & Mic Host Control have been migrated to use an `async static init` method instead of the constructor, to utilise meeting store APIs, with async await.

For all such addons, rather than calling their constructor, init method should be called.

```tsx
const handRaise = await HandRaise.init({
    meeting,
    canRaiseHand: true,
    canManageRaisedHand: true,
    handRaiseIcon: '<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M4 12.02c0 1.06.2 2.1.6 3.08l.6 1.42c.22.55.64 1.01 1.17 1.29.27.14.56.21.86.21h2.55c.77 0 1.49-.41 1.87-1.08.5-.87 1.02-1.7 1.72-2.43l1.32-1.39c.44-.46.97-.84 1.49-1.23l.59-.45a.6.6 0 0 0 .23-.47c0-.75-.54-1.57-1.22-1.79a3.34 3.34 0 0 0-2.78.29V4.5a1.5 1.5 0 0 0-2.05-1.4 1.5 1.5 0 0 0-2.9 0A1.5 1.5 0 0 0 6 4.5v.09A1.5 1.5 0 0 0 4 6v6.02ZM8 4.5v4a.5.5 0 0 0 1 0v-5a.5.5 0 0 1 1 0v5a.5.5 0 0 0 1 0v-4a.5.5 0 0 1 1 0v6a.5.5 0 0 0 .85.37h.01c.22-.22.44-.44.72-.58.7-.35 2.22-.57 2.4.5l-.53.4c-.52.4-1.04.78-1.48 1.24l-1.33 1.38c-.75.79-1.31 1.7-1.85 2.63-.21.36-.6.58-1.01.58H7.23a.87.87 0 0 1-.4-.1 1.55 1.55 0 0 1-.71-.78l-.59-1.42a7.09 7.09 0 0 1-.53-2.7V6a.5.5 0 0 1 1 0v3.5a.5.5 0 0 0 1 0v-5a.5.5 0 0 1 1 0Z" fill="#ff0000"></path></svg>'
});

const chatHostControl = await ChatHostControl.init({
    meeting,
    hostPresets: ['webinar_presenter'],
    targetPresets: ['webinar_viewer'],
    addActionInParticipantMenu: true,

});

const micHostControl = await MicHostControl.init({
    meeting,
    hostPresets: ['webinar_presenter'],
    targetPresets: ['webinar_viewer'],
    addActionInParticipantMenu: true,
});

const cameraHostControl = await CameraHostControl.init({
    meeting,
    hostPresets: ['webinar_presenter'],
    targetPresets: ['webinar_viewer'],
    addActionInParticipantMenu: true,
});
```

Starting v4.0.0, Video Background Addon also has been migrated to the same structure to make it easier to handle state internally.

```tsx
  const videoBackground = await DyteVideoBackground.init({
      modes: ["blur", "virtual", "random"],
      blurStrength: 30, // 0 - 100 for opacity
      meeting,
      images: [
          "https://images.unsplash.com/photo-1487088678257-3a541e6e3922?q=80&w=2874&auto=format&fit=crop&ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1496715976403-7e36dc43f17b?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3",
          "https://images.unsplash.com/photo-1600431521340-491eca880813?q=80&w=2938&auto=format&fit=crop&ixlib=rb-4.0.3"
      ],
      randomCount: 10,
  });
```

## About

This project is created & maintained by dyte, Inc. You can find us on Twitter - [@dyte_io](https://twitter.com/dyte_io) or write to us at `dev@dyte.io`.

The names and logos for Dyte are trademarks of dyte, Inc.

We love open source software! See [our other projects](https://github.com/dyte-io) and [our products](https://dyte.io).