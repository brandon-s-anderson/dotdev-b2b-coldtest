# Presenter runbook (live-build cue card)

The tactical companion to [`delivery-guide.md`](delivery-guide.md). The delivery guide is the
narrative + clock; **this is the do-this-next card you keep beside you while building live.** Every
step lists the exact command/tab, the prompt to paste (linked), what to verify, and the one gotcha.
Built for the **Monday dry run**, run it start to finish once and time it.

Attendee-facing source of truth is the repo [`README.md`](../README.md) ("How the workshop runs") and
[`prompts/`](../prompts). This runbook never contradicts those; it just sequences them for the stage.

---

## Before you start (pre-flight, do this cold before the room fills)

- [ ] **Prereqs done on your demo store** (per [`prerequisites.md`](prerequisites.md)): US Plus sandbox,
      B2B on, Shopify Payments test mode (capture NOT at checkout), Flow installed, repo cloned, CLI
      authed, **store seeded**, AI assistant with Dev MCP + AI Toolkit.
- [ ] **Fresh build state.** Re-running a store you already built on? Wipe it back to the seeded
      baseline first with [`reset.md`](reset.md) (delete the payment customization, both Flows, the
      season entry + product metafields, the theme block, cancel/archive test orders).
- [ ] **Storefront login ready.** You test as the B2B buyer **Maya Cruz** via the storefront (one-time
      emailed code), on the **Combined** location. Have that inbox open. Admin preview and DTC do NOT
      trigger the block or the B2B payment behavior.
- [ ] **Storefront password handy** (Admin, Online Store, Preferences, Password protection), `dev` asks
      for it.
- [ ] **Two terminal tabs** (below). **Do NOT be in OS dark mode** if you can avoid it, or you'll hit
      the block-CSS gotcha in Part 1 (see 1c).
- [ ] **Screen legibility:** terminal >= 18pt, editor at 150%, high-contrast.

### Tab setup (this is the whole model, no third tab, no deploy)

| Tab | What runs | Rule |
|---|---|---|
| **Tab 1** | `shopify app dev` (via `pnpm run dev`) | Starts in Part 1, **stays running all session**. Press **`g`** here to open GraphiQL (browser opens, `dev` keeps running). Restart = `q` then `pnpm run dev`. |
| **Tab 2** | Your AI assistant | Where you edit code (paste the prompts). |

You never run `shopify app deploy` in the session, `dev` serves everything live.

---

## Opening + framing (~8 min, no build)

Run the Opening demo and the "why the obvious approaches fail" framing from
[`delivery-guide.md`](delivery-guide.md) (Opening ~3 min, Framing ~5 min) and the Toolkit slide
(~4 min). Then start building.

---

## PART 1 - Data model + theme block (~11 min) [both]

### 1a. Start the app (tab 1)
```bash
cd starter/b2b-prebooking-workshop
pnpm install
pnpm run dev
```
- First run: pick org -> **create a new app** (accept default name, don't reuse) -> pick your dev store
  -> approve the browser install (grants scopes). Enter the **storefront password** and the
  **sudo/mkcert** password if asked.
- **Gotcha:** if the first run exits with `[product]: Requires ... write_products`, finish the browser
  install then `pnpm run dev` again. Prompt: [`01`](../prompts/01-scaffold-app.md).

### 1b. Show the data model synced (no code)
- In `shopify.app.toml`, point at the `[metaobjects.app.b2b-prebooking]` + `[product.metafields.app.b2b-prebooking]` blocks.
- **Verify:** Admin, Settings, Custom data, the "B2B Pre-booking" metaobject and product metafield exist (app-managed).
- **Say:** "We declared the season data model in the app config, so `dev` created it on the store, no mutations. The schema versions with the app."

### 1c. Seed one season + tag the pre-book products (Admin)
- Follow [`data-model-seed.md`](data-model-seed.md): create one **season** metaobject entry, then bulk-assign it to the 5 pre-book products (Products, select them, Edit products, B2B Pre-booking column; shift-select the range and set once).
- **Verify:** a pre-book product's metafield shows the season (under Metafields, Show all, it isn't pinnable).

### 1d. Build the theme block (tab 2, paste prompt)
- Paste [`prompts/02`](../prompts/02-theme-app-block.md) into your AI assistant.
- **Place it:** with `dev` running, add the block in the theme editor (a pre-book product template, Add block, Apps, B2B Pre-booking). **No deploy.**
- **Gotcha (dark mode):** if the block looks great in the theme editor but washed-out on the storefront, your AI added a `prefers-color-scheme: dark` media query and your OS is dark. Delete that media query. (`finished` branch CSS is the reference.)
- **Say (2 lines):** (1) `product.metafields["$app"]["b2b-prebooking"]`, "one line reads the season, nothing hardcoded." (2) the `<script>`, "writes Season + Delivery window onto the cart line so they reach checkout on any plan."
- **Verify (as Maya Cruz on the storefront):** pre-book PDP shows the windows; add to cart -> `Season` + `Delivery window` appear on the cart line and at checkout; an available-now product shows nothing.

---

## PART 2 - Flow: tag pre-book orders (~4 min) [both]

- Build **Flow 1** with the Sidekick prompt in [`prompts/03`](../prompts/03-flow-tag-prebook-orders.md).
- **Say:** "B2B-guarded so DTC orders stay untagged. The `Prebooking` tag is both the merchant's filter and the signal Flow 2 keys on."
- **Verify:** a new B2B pre-book order gets `Prebooking`; a DTC order with the same product does not.
- **Gotcha (timing):** Flow 1 is async, the tag can take **2-3 min**. Don't wait on stage; you'll verify during the payoff.

---

## PART 3 - Flow: charge on fulfillment (~4 min) [both]

- Build **Flow 2** with the Sidekick prompt in [`prompts/04`](../prompts/04-flow-charge-on-fulfillment.md).
- **Say:** "One Flow serves both plans, non-Plus charges once at full fulfillment, Plus per fulfillment, driven by how each plan makes payment schedules. `completedAt does not exist` is the double-charge guard."
- **Verify:** fulfilling a pre-book order charges the vaulted method once (you'll show this in the payoff).

---

## PART 4 - Plus payment-terms Function (~7 min) [Plus] - the payoff

### 4a. Implement the Function (tab 2, paste prompt)
- Paste [`prompts/05`](../prompts/05-plus-payment-terms-function.md) into your AI assistant. `dev` rebuilds on save; **no deploy, no `function build`.**
- **Say (2 lines):** (1) the two `return NO_CHANGES` guards, "only acts on a B2B cart with a pre-book item, everything else passes through, fail-open." (2) the `operations`, "does exactly two things: set due-on-fulfillment, hide 'pay later' so a card gets vaulted."

### 4b. Activate it (tab 1, press `g`)
- In tab 1, press **`g`** to open the app's GraphiQL. Set API version to the latest stable.
- Run this (identical for everyone, handle is in the repo):
```graphql
mutation {
  paymentCustomizationCreate(paymentCustomization: {
    title: "B2B Prebooking Payment Terms"
    enabled: true
    functionHandle: "prebooking-payment-terms"
  }) {
    paymentCustomization { id title enabled }
    userErrors { field message }
  }
}
```
- **Verify:** response has an `id`, empty `userErrors`. Full troubleshooting: [`payment-customization-activation.md`](payment-customization-activation.md).
- **Gotcha:** `Could not find Function` -> `dev` isn't running. Scope error -> quit `dev`, rerun, approve the payment-customizations permission.

### 4c. Verify the payoff (as Maya Cruz on Combined)
- **Mixed cart** (available-now + pre-book) -> checkout flips to **due on fulfillment**, "pay later" hidden.
- **Available-now only** -> stays **Net 30**, "pay later" visible.
- Watch tab 1, it prints the Function execution each checkout.

---

## PART 2 payoff - full lifecycle (~4 min) - the money shot

Run on the **Combined** location. **Pacing (Flow is async):** place the mixed order at the *start* of
this section, narrate the rest while Flow 1's tag lands, then fulfill.

1. **Three carts, three behaviors** (same buyer/location): available-now = Net 30 + pay-later; pre-book only = due on fulfillment, no pay-later; mixed = due on fulfillment, no pay-later (point out `Season` / `Delivery window` on the line).
2. **Place the mixed order.** No "save card" checked -> buyer is prompted to add a card (order carries terms).
3. **Tagged + filterable.** Flow 1 tags it `Prebooking`; show the Orders list filtered by that tag.
4. **Two fulfillments, two auto-charges:** fulfil the available-now line -> Flow 2 charges the vaulted card for that fulfillment; later fulfil the pre-book line -> Flow 2 charges again.
- **Land it:** "Two automatic charges, one per fulfillment, no one touched the card. That's per-fulfillment charging + due-on-fulfillment terms + the Function + the Flow, together on one Plus order."

---

## PART 3 (adapt) - non-Plus (~8 min, show, no code)

Walk the pre-seeded two-location arrangement per [`delivery-guide.md`](delivery-guide.md) Part 3:
separate Available Now (Net 30) and Pre-book (due on fulfillment) locations, same theme block + both
Flows unchanged, force-vault via an App Store app (custom Functions need Plus).

---

## Close (~2 min) + Q&A (10 min, protected)

Close + take-home (pattern map + `finished` branch) per the delivery guide. Q&A list is there too
(8 anticipated); brief the TA to field Payments questions (the #1 support item).

---

## Dry-run debrief (capture Monday)

- [ ] Total time vs 60 min (Opening 3 + Framing 5 + Toolkit 4 + Build P1-4 25 + Payoff 4 + non-Plus 7 + Close 2 + Q&A 10).
- [ ] Part 1 first-run: did "create new app" + install grant scopes cleanly **without** a deploy? (If not, we keep the deploy fallback in `prompts/01`.)
- [ ] Flow 1 tag latency, did the payoff pacing hide it?
- [ ] Any AI prompt (02, 05) that produced code needing hand-fixing on stage.
- [ ] Confirm the pre-order / pre-book terminology split with Gita.
