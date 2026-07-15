# Prompts

**In the live session, attendees follow [`SESSION.md`](../SESSION.md)** (one doc: talk track, clicks,
paste prompts, while-it-builds teach notes). These files are the same paste prompts with optional
deeper notes if you want them open separately.

Work through these in order. Each file has the exact CLI command and/or AI prompt to use,
plus what you should see when it works. They are labelled:

- **[non-Plus]** works on plans below Plus (no Plus-tier features needed)
- **[Plus]** needs Plus-tier capabilities
- **[both]** works on either

You build all of them on your dev store (dev stores include Plus features). The labels tell you
which merchant plan a capability requires, so you can build for and advise merchants on each.

Philosophy: these prompts are the **primary build path** for this workshop, not a take-home shortcut.
You build live by prompting an AI assistant, then reading and understanding what it produced (AI is the
accelerator, you're the author). The `starter/` app ships the extensions as **stubs** you implement
(see `../starter/b2b-prebooking-workshop/README.md`); a complete reference lives on the `finished`
branch if you want to compare.

| File | Scope | Where it's used |
|---|---|---|
| `00-store-setup.md` | non-Plus + Plus | Prework (optional AI path for the store seed) |
| `01-scaffold-app.md` | both | Part 0 (set up the app) |
| `02-theme-app-block.md` | both | Part 1 (theme block) |
| `03-plus-payment-terms-function.md` | Plus | Part 2 (payment Function) |
| `04-flow-charge-on-fulfillment.md` | both | Part 3, charge Flow (required) |
| `05-flow-tag-prebook-orders.md` | both | Part 3, tag Flow (optional) |

Part 3 is the "Flows" beat. **The charge Flow is required, build it first.** **The tag Flow is
optional**, a merchant-visibility nicety you can build if there's time or leave as a take-home; the
charge Flow doesn't depend on it. Build order after the app is set up: theme block (buyer sees pre-book
context) → payment Function (right checkout) → Flows (merchant manages orders and payments).

`00-store-setup.md` provisions the store structure (products, collections, B2B catalogs, markets,
company locations, payment terms, and the pre-booking data model). It's the same work the seed script
does; see [`../PREWORK.md`](../PREWORK.md).
