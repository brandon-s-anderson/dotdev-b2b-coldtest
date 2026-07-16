# Building this app (AI build rules + facts)

AI-assisted workshop build. When you implement the theme block or the payment Function from the prompt
(`SESSION.md` Part 1 / Part 2), follow these so the build stays fast and correct. **Everything you need
is in the prompt and here; do NOT search the repo for a prompts file or for the data model.**

## Rules

- **Edit-only.** `shopify app dev` is running and serves both extensions. Only edit files (`blocks/`,
  `src/`). Do NOT run `shopify app deploy`, `shopify app function build`, codegen, or any CLI command.
- **Do not wait on the environment.** `dev` here does NOT auto-run typegen or rebuild the wasm on save
  (the Function rebuilds when it's invoked at checkout). Do NOT poll/sleep waiting for regeneration, do
  NOT inspect running processes, and do NOT wait for or read `generated/api.ts`.
- **Trust the given facts.** The field keys and GraphQL query in the prompt are correct; use them as-is.
  Do not verify them against the repo (the data model lives on the store, not here). If something looks
  off, note it in one line and proceed.
- **Trust the validator.** Validate Liquid/GraphQL once with the Shopify validator if available; do NOT
  spelunk `schema.graphql`.

## Data model contract (seeded on the store in prework, not in this repo)

- Metaobject `b2b_prebooking`, display field `season_name`; date fields `order_start_date`,
  `order_end_date`, `delivery_start_date`, `delivery_end_date`.
- Product metafield `custom.b2b-prebooking`, a metaobject reference to a `b2b_prebooking` entry. Its
  presence on a product marks it "pre-book."
- Read it in Liquid as `product.metafields["custom"]["b2b-prebooking"].value`.
- Source of truth for the definitions: `../../workshop-assets/setup/setup-store.mjs`.

## Payment Function facts

- The purchasing company is `cart.buyerIdentity.purchasingCompany.company.id` (NOT `cart.purchasingCompany`).
- The deferred B2B method's underlying `name` is `"Deferred"` (checkout label: "Choose payment method at a later time").
- Type the function input/output **locally** (mirror the query) in the `.ts`. Do NOT import from
  `../generated/api`: tsconfig `rootDir` is `./src`, so that import breaks the typecheck, and codegen may
  be stale.

The complete reference implementation is on the `finished` branch.
