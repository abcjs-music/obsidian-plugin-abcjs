import esbuild from "esbuild";
import process from "process";
import { copy } from "esbuild-plugin-copy";

const prod = process.argv[2] === "production";

esbuild
  .build({
    entryPoints: ["main.ts"],
    bundle: true,
    external: ["obsidian"],
    format: "cjs",
    target: "es2016",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    treeShaking: true,
    minify: true,
    outfile: "build/main.js",
    plugins: [
      copy({
        resolveFrom: "cwd",
        assets: {
          from: ["./src/assets/*"],
          to: ["./build"],
        },
        watch: true,
      }),
    ],
  })
  .then((r) => {
    console.log("✨ Build succeeded ✨");
    if (!prod) {
      r.watch();
      console.log("watching...");
    }
  })
  .catch(() => process.exit(1));
