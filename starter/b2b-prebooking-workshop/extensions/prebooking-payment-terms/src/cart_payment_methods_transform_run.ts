// Plus payment-terms Function. STARTER STUB (you build this in the session).
//
// TODO: implement this from the workshop prompt (SESSION.md Part 2). Everything you need is in that
// prompt and in AGENTS.md; do NOT search the repo or read generated/api.ts.
//
// On a B2B cart, if any line's product has the custom.b2b-prebooking metafield set,
// return a `paymentTermsSet` operation with a FULFILLMENT_CREATED event trigger (due on
// fulfillment) plus `paymentMethodHide` for the deferred method (input name "Deferred").
// Fail open: return no changes for non-B2B carts and carts with no pre-book line.
//
// Notes: purchasingCompany is cart.buyerIdentity.purchasingCompany.company.id (not cart.*).
// Type the input/output LOCALLY here; do NOT import ../generated/api (tsconfig rootDir is ./src,
// so that import breaks tsc). Wire up the input query in cart_payment_methods_transform_run.graphql.

export function cartPaymentMethodsTransformRun(_input: unknown): { operations: unknown[] } {
  return { operations: [] };
}
