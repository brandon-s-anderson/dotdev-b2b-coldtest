# 5. Plus payment-terms Function  [Plus]

This is the Plus differentiator for the single-location mixed cart. A payment-customization
Function detects a pre-book item in the cart and, for that checkout only:

1. switches payment terms from Net 30 to due-on-fulfillment (`paymentTermsSet`), and
2. hides the deferred "choose payment method at a later time" option to force a vaulted card.

## Why Plus

- The `paymentTermsSet` operation is Plus + B2B only.
- On non-Plus, a static location default handles the terms (the pre-book location is set to
  due-on-fulfillment), and force-vaulting comes from an **App Store (public) app**, because
  custom apps that contain Functions require Plus.

## Open the scaffolded extension

The starter already includes `extensions/prebooking-payment-terms/` with a **stubbed**
`src/cart_payment_methods_transform_run.ts` (returns no changes) and a stub input query in
`src/cart_payment_methods_transform_run.graphql`. You implement the query + logic there.

(Building from scratch instead? `shopify app generate extension --template payment_customization --name prebooking-payment-terms`.)

## Prompt (Cursor / your AI tool)

```text
Implement the `cart.payment-methods.transform.run` target. Input query: the cart's purchasing company id, each line's `merchandise ... on ProductVariant { product { metafield(namespace:"$app", key:"b2b-prebooking"){ value } } }`, and the available `paymentMethods { id name }`. Logic: if there's no purchasing company, return no changes. If any line's product has the app-owned `$app` `b2b-prebooking` metafield set, it's a pre-book cart: return a `paymentTermsSet` operation with an event trigger of `FULFILLMENT_CREATED` (due on fulfillment), plus `paymentMethodHide` for any payment method whose name matches the deferred option. Match the deferred method by name; on B2B checkout the underlying name is "Deferred" (the label shown to buyers is "Choose payment method at a later time"). Keep the match configurable.
```

## No deploy needed

`shopify app dev` is already serving this Function (it rebuilds on every save). You don't run
`shopify app deploy` in the session, you activate the **development** Function directly. (Optional
local unit test, no store: `cat src/*.test.json | pnpm shopify app function run`.)

## Activate

Activation is one GraphQL mutation in your **app's own GraphiQL**. In the tab where `shopify app dev`
runs, press **`g`** to open GraphiQL, then run:

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

The `functionHandle` comes from `shopify.extension.toml`, so this mutation is identical for everyone,
nothing to fill in. Expect an `id` back and empty `userErrors`. Full context and troubleshooting
(`Could not find Function`, scope errors) are in `../workshop-assets/payment-customization-activation.md`.

## You should see

On the combined (Plus) location, a mixed cart (an available-now item plus a pre-book item)
switches to due-on-fulfillment and hides the deferred payment option; an available-now-only
cart stays on Net 30 with the deferred option visible. The `shopify app dev` tab prints each
Function execution as you check out. Flow (Part 3) then charges the vaulted card per fulfillment.

## Teach

- The deferred method's `name` ("Deferred") is not the checkout display label ("Choose payment
  method at a later time"). Match against real Function input, not the visible text. Watch the
  `shopify app dev` output to see the actual input each checkout hands your Function.
- A Function only runs at checkout once a **payment customization** points at it. Only the app that
  owns the Function can create that customization, which is why you activate in the app's own
  GraphiQL (press `g`), not the CLI or a standalone GraphiQL app (those are a different app identity
  and can't see your Function). The stable `functionHandle` means no id lookup and the same mutation
  for every attendee.
