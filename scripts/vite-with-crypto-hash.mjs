#!/usr/bin/env node
import crypto from "node:crypto";

// Vite 7 calls `crypto.hash()`, which is only available on newer Node builds.
// Add a small compatibility shim so dev/build/preview still work on older runtimes.
if (typeof crypto.hash !== "function") {
  crypto.hash = (algorithm, data, outputEncoding) =>
    crypto.createHash(algorithm).update(data).digest(outputEncoding);
}

await import(new URL("../node_modules/vite/bin/vite.js", import.meta.url));
