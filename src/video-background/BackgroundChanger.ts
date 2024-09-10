export type BackgroundMode = "blur" | "virtual" | "random" | "none";

const STYLE = `

:host {
  box-sizing: border-box;
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 60;
  backdrop-filter: blur(12px) saturate(180%);
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: inherit;
  container-type: inline-size;
  container-name: backgroundchanger;
  background-color: rgba(var(--dyte-colors-background-600, 60 60 60) / 0.5);
}

:host([data-open='true']) {
    display: flex;
}

button {
  box-sizing: border-box;
  background-color: transparent;
  color: white;
  border: var(--dyte-border-width-sm, 1px) solid transparent;
  display: inline-flex;
  flex-grow: 1;
  justify-content: center;
  vertical-align: baseline;
  gap: var(--dyte-space-1, 4px);
  transition-property: var(--transition-property);
  transition-duration: var(--transition-duration);
  outline: none;
}

.main {
  padding: 1rem;
  padding-left: 1.5rem;
  width: 34rem;
  max-height: 30rem;
  overflow: auto;

  scrollbar-width: thin;
  scrollbar-color: var(--dyte-scrollbar-color, rgb(var(--dyte-colors-background-600, 34 34 34))) var(--dyte-scrollbar-background, transparent);
}

img {
  max-width: 100%;
  height: auto;
}

.main .group img {
  width: 3.5rem;
  height: 3.5rem;
}

#dialog {
  position: relative;
  max-width: 100%;
  max-height: 100%;
  min-height: 320px;
  --tw-bg-opacity: 1;
  background-color: rgba(var(--dyte-colors-background-900, 26 26 26) / var(--tw-bg-opacity));
  padding: 15px;
  border-radius: 12px;
}

.section {
  display: inline-grid;
  margin-top: 0.5rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
}

#dismiss-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  height: 24px;
  cursor: pointer;
  color: rgb(var(--dyte-colors-text-1000, 255 255 255));
  display: flex;
  align-items: center;
}

#dismiss-btn:hover {
  --tw-bg-opacity: 1;
  background-color: rgba(var(--dyte-colors-background-600, 60 60 60) / var(--tw-bg-opacity));
  color: inherit;
}

#dismiss-btn svg {
  height: 16px;
  width: 16px;
}

.container {
  position: relative;
  background-color: rgba(var(--dyte-colors-background-800, 26 26 26) / var(--tw-bg-opacity));
  border-radius: var(--dyte-space-2, 8px);
  padding: var(--dyte-space-2, 8px);
  box-shadow: 0 0 0 0.0625rem rgb(var(--dyte-colors-background-800, 26 26 26)) inset;
  height: 72px;
  width: 72px;
  cursor: pointer;
}

.container svg {
    color: rgb(var(--dyte-colors-text-900, 238 238 238));
}

.image-container {
  height: 100px;
  width: 100px;
  background-image: var(--background);
  background-position: center center;
  background-size: cover;
  border: 2px solid rgb(var(--dyte-colors-background-800, 26 26 26));
}

.image-container:hover {
    border: 2px solid rgb(var(--dyte-colors-brand-500, 26 26 26));
}

.header {
  top: 0.75rem;
  left: 0.75rem;
  font-size: 1.4rem;
  margin: 0;
  color: rgb(var(--dyte-colors-text-1000, 255 255 255));
  font-family: var(--dyte-font-family);
  font-weight: bold;
}

::slotted(*) {
  max-height: 100%;
  max-width: 100%;
}

:host([data-open]) {
  visibility: visible;
  display: flex;
}

:host([data-open='false']) {
  visibility: hidden;
}

#dialog .children {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

@container backgroundchanger (max-width: 300px) {
  #dialog {
    padding: 2rem;
  }
}
`;

const DISMISS_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m4.397 4.554.073-.084a.75.75 0 0 1 .976-.073l.084.073L12 10.939l6.47-6.47a.75.75 0 1 1 1.06 1.061L13.061 12l6.47 6.47a.75.75 0 0 1 .072.976l-.073.084a.75.75 0 0 1-.976.073l-.084-.073L12 13.061l-6.47 6.47a.75.75 0 0 1-1.06-1.061L10.939 12l-6.47-6.47a.75.75 0 0 1-.072-.976l.073-.084-.073.084Z" fill="currentColor"/></svg>';
const BLUR_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="69px" width="69px" fill="currentColor"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm-3 .5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM6 5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm15 5.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM14 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0-3.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zm-11 10c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm7 7c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm0-17c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5zM10 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm0 5.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm8 .5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-8c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0-4c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm3 8.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zM14 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm0 3.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5zm-4-12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0 8.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1zm4-4.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-4c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/></svg>';
const NONE_ICON =
    '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" viewBox="0 0 24 24" height="68px" width="68px" fill="currentColor"><g><rect fill="none" height="24" width="24"/></g><g><g><path d="M2.81,2.81L1.39,4.22l2.27,2.27C2.61,8.07,2,9.96,2,12c0,5.52,4.48,10,10,10c2.04,0,3.93-0.61,5.51-1.66l2.27,2.27 l1.41-1.42L2.81,2.81z M12,20c-4.41,0-8-3.59-8-8c0-1.48,0.41-2.86,1.12-4.06l10.93,10.94C14.86,19.59,13.48,20,12,20z"/><path d="M12,4c4.41,0,8,3.59,8,8c0,1.48-0.41,2.86-1.12,4.05l1.45,1.45C21.39,15.93,22,14.04,22,12c0-5.52-4.48-10-10-10 C9.96,2,8.07,2.61,6.49,3.66l1.45,1.45C9.14,4.41,10.52,4,12,4z"/></g></g></svg>';

export class BackgroundChanger extends HTMLElement {
    shadow;
    _images = [];
    _randomImages = [];
    _modes = ["blur", "virtual"];
    _onchange: (mode: BackgroundMode, image?: string) => void = () => {};

    constructor() {
        super();
        // Create a shadow root
        this.shadow = this.attachShadow({ mode: "open" });
        this.createStyle();
    }

    set images(images) {
        this._images = images;
        this.updatedProps();
    }

    get images() {
        return this._images;
    }

    set modes(modes) {
        this._modes = modes;
        this.updatedProps();
    }

    get modes() {
        return this._modes;
    }

    set onChange(change: () => void) {
        this._onchange = change;
        this.updatedProps();
    }

    async updatedProps() {
        const imageContainer = this.shadow.getElementById("image-container");
        if (imageContainer) {
            imageContainer.remove();
        }

        const group = this.createGroup();
        this.shadow.getElementById("main")?.appendChild(group);
    }

    createElement(name: string, className: string, id?: string) {
        const ele = document.createElement(name);
        ele.setAttribute("class", className);
        if (id) {
            ele.setAttribute("id", id);
        }
        return ele;
    }

    createStyle() {
        const style = document.createElement("style");
        style.innerHTML = STYLE;
        this.shadow.appendChild(style);
    }

    createDialog() {
        return this.createElement("div", "DyteDialog", "dialog");
    }

    createHeader() {
        const header = this.createElement("header", "header");
        header.innerText = "Effects";
        return header;
    }

    createDismissButton() {
        const dismissButton = this.createElement(
            "button",
            "button",
            "dismiss-btn"
        );
        // adding close icon in button
        dismissButton.innerHTML = DISMISS_ICON;

        dismissButton.addEventListener("click", () => {
            // close
            this.setAttribute("data-open", "false");
        });

        return dismissButton;
    }

    getImageRows() {
        const imageRows: any[] = [];
        if (!this._images || this._images.length === 0) return imageRows;
        this._images.map((image, i) => {
            const row = document.createElement("div");
            row.setAttribute("class", "container image-container");
            row.setAttribute("key", i.toString());
            row.setAttribute("style", `--background: url('${image}')`);
            row.addEventListener("click", () => {
                this._onchange("virtual", image);
            });
            imageRows.push(row);
        });
        return imageRows;
    }

    createContainer(type: BackgroundMode = "none") {
        const container = this.createElement("div", "container", "");
        const box = document.createElement("div");
        if (type === "blur") {
            box.innerHTML = BLUR_ICON;
            box.addEventListener("click", () => {
                this._onchange("blur");
            });
        } else {
            box.innerHTML = NONE_ICON;
            box.addEventListener("click", () => {
                this._onchange("none");
            });
        }
        container.appendChild(box);
        return container;
    }

    createGroup() {
        const group = this.createElement(
            "div",
            "containerBox",
            "image-container"
        );
        const none = this.createContainer("none");
        const blur = this.createContainer("blur");

        const section = this.createElement("div", "section");
        section.appendChild(none);
        if (this._modes.includes("blur")) section.appendChild(blur);
        group.appendChild(section);

        const imageSection = this.createElement("div", "section", "images");
        if (this._modes.includes("virtual") && this._images.length > 0) {
            const images = this.getImageRows();
            images.map((image) => {
                imageSection.appendChild(image);
            });
            group.appendChild(imageSection);
        }

        return group;
    }

    createMain() {
        const main = this.createElement("div", "main", "main");
        const group = this.createGroup();
        main.appendChild(group);
        return main;
    }

    create() {
        const dialog = this.createDialog();
        const header = this.createHeader();
        const dismissButton = this.createDismissButton();
        const main = this.createMain();
        dialog.appendChild(header);
        dialog.appendChild(dismissButton);
        dialog.appendChild(main);
        this.shadow.appendChild(dialog);
    }

    static get observedAttributes() {
        return ["images", "modes"];
    }

    attributeChangedCallback(attr: string, oldVal: any, newVal: any) {
        if (oldVal === newVal) return;
        switch (attr) {
            case "images":
                break;
        }
    }

    connectedCallback() {
        this.create();
    }
}