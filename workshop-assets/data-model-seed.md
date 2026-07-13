# Seed the pre-booking data model (in-session)

The pre-booking **data model** is **store-owned**. Its **definitions** (the `b2b_prebooking`
metaobject and the `custom.b2b-prebooking` product metafield) were created by the pre-work seed script
(`setup/setup-store.mjs`), so they already exist on your store. You don't create the definitions in the
session, you can see them in Admin under **Settings, Custom data**.

You do create the **values**: one season entry and the per-product references. Because the definitions
are store-owned (admin read/write), you author the values right in the **Shopify admin**, no GraphQL
needed.

## 1. Create the season (Admin)

1. **Settings, Custom data, Metaobjects, B2B Pre-booking.**
2. Click **Add entry**.
3. Fill the fields and **Save**:
   - **Season name:** `Spring/Summer 2027`
   - **Order start date:** `2026-07-01`
   - **Order end date:** `2026-09-30`
   - **Delivery start date:** `2027-01-15`
   - **Delivery end date:** `2027-02-28`

## 2. Assign the season to your pre-book products (Admin, bulk)

1. **Products**, then tick your pre-book products (they carry the `(Pre-book)` suffix / `prebook` tag).
2. Click **Edit products** to open the bulk editor.
3. **Columns, Metafields, B2B Pre-booking** to add the column.
4. Click the first product's **B2B Pre-booking** cell, then **Shift-click the last product's cell** to
   select the whole column range. Pick the **Spring/Summer 2027** season once, and it applies to every
   selected cell.
5. **Save.**

> Assigning one at a time instead? Open a product, then **Metafields**, then **B2B Pre-booking**, and
> pick the season. (Store-owned metafields are pinnable, so you can pin **B2B Pre-booking** to the top
> of the product page if you'd rather not click **Show all** each time.)

## Checkpoint

On a pre-book product, `product.metafield(namespace: "custom", key: "b2b-prebooking")` resolves to the
season and its dates. The theme block (which reads `product.metafields["custom"]["b2b-prebooking"]`)
and the Plus Function (which reads `metafield(namespace: "custom", key: "b2b-prebooking")`) will now
see it.

## Optional: do it in GraphQL instead

Prefer code, or want to script it across many products? Because the data model is store-owned, either
the app's GraphiQL (press `g` in `shopify app dev`) or `shopify store execute` works. Upsert the
season, then bulk-set the references.

```graphql
mutation {
  metaobjectUpsert(
    handle: { type: "b2b_prebooking", handle: "spring-summer-2027" }
    metaobject: {
      fields: [
        { key: "season_name", value: "Spring/Summer 2027" }
        { key: "order_start_date", value: "2026-07-01" }
        { key: "order_end_date", value: "2026-09-30" }
        { key: "delivery_start_date", value: "2027-01-15" }
        { key: "delivery_end_date", value: "2027-02-28" }
      ]
    }
  ) {
    metaobject { id handle }
    userErrors { field message }
  }
}
```

Copy the returned `metaobject.id`, list your pre-book products (`products(first: 50, query: "tag:prebook")`),
then set each product's metafield to that id:

```graphql
mutation {
  metafieldsSet(metafields: [
    { ownerId: "gid://shopify/Product/AAA", namespace: "custom", key: "b2b-prebooking", type: "metaobject_reference", value: "gid://shopify/Metaobject/SEASON" }
    { ownerId: "gid://shopify/Product/BBB", namespace: "custom", key: "b2b-prebooking", type: "metaobject_reference", value: "gid://shopify/Metaobject/SEASON" }
  ]) {
    userErrors { field message }
  }
}
```

> Editing dates later: re-open the season entry in Admin (or re-run the upsert, which is idempotent on
> the handle). Both the block and the Function read from this one place.
