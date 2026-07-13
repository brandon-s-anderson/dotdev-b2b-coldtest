# Prerequisites

**All required, and most can't be done in the session.** This workshop has heavier setup than most (a
US Plus sandbox with B2B, Shopify Payments in test mode, Shopify Flow, and a store seed script), and
some steps have approval delays, Payments especially. Finish everything below **before you arrive**; in
the room we only clone, install, and build. Give yourself a few days of lead time for Payments.

## 1. Accounts and tools

- **Shopify Partner account + a US Plus sandbox dev store** (Partner dashboard, Add store, Create
  development store, choose the Plus sandbox build). The Plus sandbox gives you B2B plus the Plus-only
  features the workshop uses.
  - **Create it as a United States store** (you pick the country at creation, wherever you're based).
    Keeps it consistent with the materials: USD pricing, US address, and the US SSN for Payments.
  - **B2B is on automatically**, just verify in **Settings, B2B**. You don't set up the company, buyer,
    locations, or products by hand, the seed script does that.
- **Node.js 20+** and **pnpm** (or npm). Node also runs the seed script.
- **Shopify CLI 4+** (`shopify version`; upgrade with `pnpm add -g @shopify/cli@latest`).
- **Shopify Flow** installed (free: `apps.shopify.com/flow`). You build the two workflows in-session.
- **An AI coding assistant** (Claude Code, Codex, Cursor, VS Code, Antigravity CLI, or Hermes) with
  **both** of these:
  - **Shopify Dev MCP**, docs + API schema while you build. The repo ships the config, so most
    assistants auto-load it (approve if prompted). Add it manually only if your tool doesn't read a
    project MCP file.
  - **Shopify AI Toolkit** plugin, Shopify skills + CLI store-execute (the seed step uses it). Cursor:
    `/add-plugin shopify`. Claude Code: `claude plugin install shopify-ai-toolkit@claude-plugins-official`.
  - Install links: [AI Toolkit](https://shopify.dev/docs/apps/build/ai-toolkit),
    [Dev MCP](https://shopify.dev/docs/apps/build/devmcp).

## 2. Shopify Payments (test mode)

Settings, Payments, **Activate Shopify Payments** (deactivate any test gateway first), then Manage,
Test mode, **Enable test mode**. Use **Shopify Payments, not the Bogus Gateway**, B2B vaulted cards are
Shopify-Payments-only and the pre-order flow vaults a card to charge later. Test card:
`4242 4242 4242 4242`.

Onboarding asks for account details first. These values pass on a US sandbox (use your own name/email
if you like, just not anyone else's real details; business type **Individual**):

| Field | Value |
| --- | --- |
| Name | any, e.g. `John Anderson` |
| Date of birth | any adult date, e.g. `10 / 01 / 1990` |
| Email | any inbox you control |
| Phone | `(415) 555-1234` |
| Address | `123 Brooklyn Ave`, `Brooklyn`, `New York` `11213`, US |
| SSN | `078-05-1120` (`000-00-0000` and the `987-65-...` range are rejected) |
| Store description | `this is a test store` |

After submitting you'll see "some details couldn't be verified" and a "select a plan" banner. **Ignore
both**, they only affect real payouts; test mode still works (cards charge, B2B cards vault). That
verify notice is a **~30-day window**, so do Payments **close to the workshop date**, not weeks early.

**Payment capture:** set it so payment is **not** taken at checkout (Settings, Payments, Payment
capture). Either "when fully fulfilled" or "manually" works, just not "automatically at checkout" (that
charges up front and defeats pay-on-fulfillment).

## 3. Clone the repo (before the session)

The seed step runs from it, so clone early (it's ~23 MB, mostly product images):

```bash
git clone https://github.com/brandon-s-anderson/dotdev-b2b-coldtest.git
```

`pnpm install` is an **in-session** step, not now (`cd starter/b2b-prebooking-workshop && pnpm install`,
under a minute on venue wifi). Clone and install are safe to do live; the store setup below is not.

## 4. Seed the store (before the session)

From the repo, authenticate the CLI (full scope string in `setup/README.md`), then run the seed script:

```bash
shopify store auth --store <store>.myshopify.com --scopes <see setup/README.md>
cd workshop-assets/setup
STORE=<store>.myshopify.com BUYER_EMAIL=you+us@example.com node setup-store.mjs
```

`BUYER_EMAIL` is the B2B buyer (Maria Cruz) you sign in as. Login is a one-time emailed code, so use an
inbox you control; the `+` alias trick (`you+us@example.com`) lets one inbox run several buyers.

The script creates the products, collections + navigation, the company and buyer, all three locations
(each sharing one address and the same buyer as admin), markets, catalogs, and payment terms (pre-book
due-on-fulfillment, Available Now Net 30). Products come from `products/products-import.csv` and carry
the tags that drive collections, catalogs, and Flow (`available-now`, `prebook`); bring your own
products only if they carry those tags. You **don't** vault a card in advance, that's part of the build.

The pre-booking **data model is not seeded here**, the app creates it on `shopify app dev` in the
session. (Optional: `../prompts/00-store-setup.md` walks the same setup via AI prompt if you'd rather
watch it run.)

## Plan note

B2B is now on **all plans** (Basic and up), not just Plus. You build on a Plus sandbox so you get every
feature; the only Plus-only pieces are dynamic payment terms at checkout (`paymentTermsSet`) and
per-fulfillment charging (a non-Plus merchant force-vaults with an App Store app instead). B2B also
needs new customer accounts and Shopify Markets.
