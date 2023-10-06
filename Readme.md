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

This repository consists of all the different ways in which you can use Dyte's
React UI Kit and other packages to its full extent to get the best live
audio/video experience.

## Samples

Here are the list of available samples at the moment.

1. [Custom Controlbar button](./src/custom-controlbar-button/)
2. [Video Background](./src/video-background/)
3. [Hand Raise](./src/hand-raise/)
4. [Participants Tab Action](./src/participants-tab-action/)


## Usage

To use these addons you would need to do the following steps:

1. Install the addon package:

```sh
npm install @dytesdk/ui-kit-addons
```

2. Import the addon that you need, for example:
   `custom-controlbar-button`:

```ts
import CustomControlbarButton from '@dytesdk/uikit-addon/dist/esm/custom-controlbar-button';
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


## About

This project is created & maintained by dyte, Inc. You can find us on Twitter - [@dyte_io](https://twitter.com/dyte_io) or write to us at `dev@dyte.io`.

The names and logos for Dyte are trademarks of dyte, Inc.

We love open source software! See [our other projects](https://github.com/dyte-io) and [our products](https://dyte.io).