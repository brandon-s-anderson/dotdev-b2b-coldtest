#!/usr/bin/env node
// One-time activation for the Plus payment customization Function.
//
// Registers a payment customization pointing at this app's payment-terms Function, so it
// runs at checkout. Deploying the app registers the Function; this makes it live. Idempotent-ish:
// it warns (does not duplicate) if a customization with the same title already exists.
//
// Usage:
//   STORE=<your-store>.myshopify.com pnpm run activate
//
// Prereq: `shopify store auth` was run for the store WITH read_payment_customizations and
// write_payment_customizations in the scope list (see workshop-assets/setup/README.md).
//
// Provided as-is for the workshop; run it against a dev store.

import { spawnSync } from "node:child_process";

const STORE = process.env.STORE;
const TITLE = process.env.TITLE || "B2B Prebooking Payment Terms";
if (!STORE) {
  console.error("Set STORE, e.g. STORE=your-store.myshopify.com pnpm run activate");
  process.exit(1);
}

function execute(query, mutate = false) {
  const args = ["store", "execute", "--store", STORE, "--json", "--query", query];
  if (mutate) args.push("--allow-mutations");
  const r = spawnSync("shopify", args, { encoding: "utf8" });
  const clean = (s) => (s || "").replace(/\x1b\[[0-9;]*[A-Za-z]/g, "");
  const out = clean(r.stdout);
  const i = out.indexOf("{");
  const j = out.lastIndexOf("}");
  if (i < 0 || j < 0) {
    const err = clean(r.stderr).replace(/[│╭╮╰╯─]/g, "").trim();
    throw new Error("No JSON from `shopify store execute` (auth or GraphQL error?).\n" + err.slice(0, 1500));
  }
  return JSON.parse(out.slice(i, j + 1));
}

// 1) Find this app's payment-customization Function.
const fnData = execute(
  `query { shopifyFunctions(first: 100) { nodes { id title apiType app { title } } } }`
);
const nodes = fnData?.data?.shopifyFunctions?.nodes || [];
let candidates = nodes.filter((n) => /payment/i.test(n.apiType || ""));
if (candidates.length > 1) {
  const preferred = candidates.filter((n) => /b2b-prebooking/i.test(n.app?.title || ""));
  if (preferred.length) candidates = preferred;
}
if (candidates.length === 0) {
  console.error("No payment-customization Function found. Did you run `pnpm shopify app deploy` first?");
  console.error("Functions on the store:", JSON.stringify(nodes, null, 2));
  process.exit(1);
}
if (candidates.length > 1) {
  console.error("Multiple payment Functions matched; set FUNCTION_ID or narrow the app name.");
  console.error(JSON.stringify(candidates, null, 2));
  process.exit(1);
}
const fn = candidates[0];
console.log(`Function: ${fn.title} (${fn.apiType}) from app "${fn.app?.title}"\n  id: ${fn.id}`);

// 2) Skip if a customization with our title already exists.
const existing = execute(
  `query { paymentCustomizations(first: 50) { nodes { id title enabled } } }`
);
const already = (existing?.data?.paymentCustomizations?.nodes || []).find((c) => c.title === TITLE);
if (already) {
  console.log(`Already active: "${already.title}" (${already.id}, enabled=${already.enabled}). Nothing to do.`);
  process.exit(0);
}

// 3) Create + enable the customization.
const created = execute(
  `mutation {
    paymentCustomizationCreate(paymentCustomization: {
      title: ${JSON.stringify(TITLE)}
      enabled: true
      functionId: ${JSON.stringify(fn.id)}
    }) {
      paymentCustomization { id title enabled }
      userErrors { field message }
    }
  }`,
  true
);
const res = created?.data?.paymentCustomizationCreate;
const errs = res?.userErrors || [];
if (errs.length) {
  console.error("paymentCustomizationCreate returned errors:", JSON.stringify(errs, null, 2));
  process.exit(1);
}
const pc = res?.paymentCustomization;
console.log(`Activated: "${pc?.title}" (${pc?.id}, enabled=${pc?.enabled}).`);
console.log("Verify as a B2B buyer on the combined location: a mixed cart flips to due-on-fulfillment.");
