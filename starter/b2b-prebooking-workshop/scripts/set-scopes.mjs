#!/usr/bin/env node
// set-scopes: re-add the app access scopes that the Shopify CLI blanks when it first
// CREATES your app, then redeploy so the app is registered WITH the scopes before you
// install it. This is why Part 3 (activating the payment Function) works on the first try.
//
// Run order (once, at app setup):
//   1. shopify app deploy   -> creates/links your app (this is where scopes get blanked)
//   2. pnpm run set-scopes  -> puts the scopes back + api_version, then redeploys
//   3. pnpm run dev         -> approve the install (now includes the scope); press g
//
// Safe to re-run: it just re-asserts the scope line and redeploys.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const SCOPES = "read_payment_customizations,write_payment_customizations";
const API_VERSION = "2026-07";

const appDir = fileURLToPath(new URL("..", import.meta.url));
const tomlPath = fileURLToPath(new URL("../shopify.app.toml", import.meta.url));

let toml;
try {
  toml = readFileSync(tomlPath, "utf8");
} catch {
  console.error("Could not read shopify.app.toml. Run this from the starter app: pnpm run set-scopes");
  process.exit(1);
}

// The app must already exist (client_id present). If not, the create step hasn't run yet,
// and running deploy now would just blank the scopes again.
if (!/^client_id\s*=/m.test(toml)) {
  console.error(
    "No client_id in shopify.app.toml yet, so your app hasn't been created.\n" +
      "Run `shopify app deploy` first to create it, then re-run `pnpm run set-scopes`."
  );
  process.exit(1);
}

// Re-assert the access scopes (replace whatever is there now, blank or not).
if (/^scopes\s*=.*$/m.test(toml)) {
  toml = toml.replace(/^scopes\s*=.*$/m, `scopes = "${SCOPES}"`);
} else {
  console.error("Couldn't find a `scopes = ...` line under [access_scopes]; aborting so nothing is corrupted.");
  process.exit(1);
}

// Pin the webhooks api_version (the CLI likes to bump it on create).
if (/^api_version\s*=.*$/m.test(toml)) {
  toml = toml.replace(/^api_version\s*=.*$/m, `api_version = "${API_VERSION}"`);
}

writeFileSync(tomlPath, toml);
console.log(`set scopes    = "${SCOPES}"`);
console.log(`set api_version = "${API_VERSION}"`);
console.log("\nRedeploying so your app is registered with these scopes before you install...\n");

const res = spawnSync("shopify", ["app", "deploy"], { stdio: "inherit", cwd: appDir });
if (res.error) {
  console.error("\nCould not run `shopify app deploy`. Run it yourself from the app folder.");
  process.exit(1);
}
process.exit(res.status ?? 0);
