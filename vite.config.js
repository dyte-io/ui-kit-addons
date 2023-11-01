import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: "dist",
    sourcemap: false,
    lib: {
      formats: ["cjs", "es"],
      entry: {
        'custom-controlbar-button': "./src/custom-controlbar-button/index.ts",
        'hand-raise': "./src/hand-raise/index.ts",
        'video-background': "./src/video-background/index.ts",
        'participants-tab-action': "./src/participants-tab-action/index.ts",
        'participants-tab-toggle': "./src/participants-tab-toggle/index.ts",
        'chat-host-control': "./src/chat-host-control/index.ts",
        'mic-host-control': "./src/mic-host-control/index.ts",
        'participant-menu-item': "./src/participant-menu-item/index.ts"
      },
    },
  },
})
