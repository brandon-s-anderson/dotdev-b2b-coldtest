# 5. Flow (optional): tag pre-book B2B orders  [both]

Tag every B2B order that contains a pre-book item so the store owner can filter their Orders list to
just the pre-book orders. Shopify Flow is available on all plans. This is **Part 4b** of the workshop and
it's **optional**: it's a merchant-visibility nicety, not required for the pre-order flow to work. Build
it in session if there's time, or as a take-home. The charge Flow (Part 4a) runs off the payment
schedule, not this tag, so the two are independent.

## Prompt (copy into Sidekick)

```text
Create a new Flow to tag orders with the tag "Prebooking"
if the order is a B2B order
and the order has a product tagged "prebook".
```

### While Sidekick builds: talk this through

1. **B2B guard:** only tag when the order has a purchasing company, so DTC stays clean.
2. **Product tag `prebook`:** detects pre-book lines; order tag **`Prebooking`** is what merchants filter on to see just their pre-book orders.

## What it builds

- **Trigger:** Order created
- **Conditions (all true):**
  - `order.purchasingEntity.PurchasingCompany.company.id` is not empty (the order is B2B,
    placed by a purchasing company)
  - at least one line item where `product.tags` contains `prebook`
- **Action:** add order tag `Prebooking`

## You should see

A new B2B order containing a `prebook`-tagged product gets the `Prebooking` order tag. A DTC
order with the same product does not (the B2B guard). Filter the Orders list by tag
`Prebooking` to get a clean pre-book view.

## Teach (deeper, optional)

Iterate the prompt and review what Sidekick generates. A first, simpler prompt produced a
version without the B2B guard; adding "if the order is a B2B order" is what produced the
`company.id` condition. `prebook` (lowercase) is the product tag that drives the line-item
condition; `Prebooking` is the merchant-facing order tag.
