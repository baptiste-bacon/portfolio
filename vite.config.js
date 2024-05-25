import { resolve } from "path";

import glsl from "vite-plugin-glsl";
import sassGlobImports from "vite-plugin-sass-glob-import";

export default {
  root: "src/",
  publicDir: "../static/",
  base: "./",
  server: {
    host: true, // Open to local network and display URL
    open: !("SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env), // Open if it's not a CodeSandbox
  },
  build: {
    outDir: "../dist", // Output in the dist/ folder
    emptyOutDir: true, // Empty the folder first
    sourcemap: true, // Add sourcemap
    rollupOptions: {
      input: {
        main: resolve(__dirname, "./src/index.html"),
        lipton: resolve(__dirname, "./src/lipton.html"),
        aeko: resolve(__dirname, "./src/aeko.html"),
        plantgrape: resolve(__dirname, "./src/plantgrape.html"),
        mfk: resolve(__dirname, "./src/mfk.html"),
        farret: resolve(__dirname, "./src/farret.html"),
      },
    },
  },
  plugins: [glsl(), sassGlobImports()],
};
