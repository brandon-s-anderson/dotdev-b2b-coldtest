# Activating the Plus payment customization Function

The `prebooking-payment-terms` Function (Plus use case) flips a mixed cart from Net 30 to
due-on-fulfillment when a pre-book item is present, and hides "Choose payment method at a
later time" so a card or bank account is vaulted. Implementing the Function is not enough: it
does not run at checkout until you create a **payment customization** that points at it.

You do this with **one GraphQL mutation** in your **app's own GraphiQL**, the GraphiQL that
`shopify app dev` opens when you press **`g`**. That runs in your app's context, so it can see and
own your Function, and you reference the Function by its stable **handle** (no id lookup). It's a
one-time activation per store, and **no `shopify app deploy` is needed**: the mutation activates the
development Function that `dev` is already serving.

## Steps

1. Keep `shopify app dev` running (the tab you started it in). Your Function is served there.
2. In that tab, press **`g`**. Your app's GraphiQL opens in the browser.
3. Set the **API version** field to the latest stable version.
4. Run this mutation. It's **the same for everyone**, the handle is defined in the repo
   (`extensions/prebooking-payment-terms/shopify.extension.toml` -> `handle = "prebooking-payment-terms"`),
   so there's nothing to fill in:

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

A successful response returns the new `paymentCustomization.id` and an empty `userErrors` array. The
Function is now live at checkout for the store.

> **`Could not find Function`?** Confirm `shopify app dev` is running (that's what serves the
> Function) and that the handle above matches the one in `shopify.extension.toml`.

> **An access-denied / scope error?** The app needs `write_payment_customizations` (declared in
> `shopify.app.toml`), granted when you install the app in Part 1. If the mutation reports a scope
> error, the app was created without that scope actually seated (the CLI can blank the local scopes
> when it first creates the app). Seat it once: confirm `shopify.app.toml` still lists
> `scopes = "read_payment_customizations,write_payment_customizations"` (restore it if blanked), run
> `pnpm shopify app deploy` and approve the release, then re-approve the app install in the browser and
> re-run the mutation. This is the only time you'd `deploy` in the session.

## Verify

Logged in as a B2B buyer on the combined (Plus) company location:

- Mixed cart (an available-now item plus a pre-book item): payment terms switch to
  due-on-fulfillment and "Choose payment method at a later time" is hidden.
- Available-now only: terms stay on the location default (Net 30) and pay-later still shows.

Watch the `shopify app dev` tab as you hit checkout, it prints each Function execution, which
confirms your Function (not a stale one) ran.

## Notes

- **This activates the dev Function**, which lives only while `shopify app dev` runs, exactly what
  you want for the session. To keep the customization working after you close `dev`, run
  `pnpm shopify app deploy` once to release a persistent app version (optional take-home step).
- The Function hides payment methods whose name matches the deferred option ("Deferred"). If your
  store shows a different underlying name, update `DEFERRED_METHOD_PATTERNS` in
  `starter/b2b-prebooking-workshop/extensions/prebooking-payment-terms/src/cart_payment_methods_transform_run.ts`
  (`dev` picks the change up on save).
- To pause it, run `paymentCustomizationUpdate` with `enabled: false`; to remove it,
  `paymentCustomizationDelete`. Both run the same way in the app's GraphiQL.
- A store can have up to 25 active payment customization Functions.
