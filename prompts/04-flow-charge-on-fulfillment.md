# 4. Flow: charge the vaulted card on fulfillment  [both]

Automatically charge the buyer's vaulted card / bank account **on fulfillment**: it fires when a B2B
order's payment schedule comes due, which for due-on-fulfillment terms is at fulfillment (and **per
fulfillment** on Plus). This is **Part 3a** of the workshop and the **only required Flow**. It's
**independent of the tagging Flow** (Part 3b): it acts on the payment schedule, not the `Prebooking` tag,
so it never waits on tagging. The same Flow serves both plans.

## Prompt (copy into Sidekick)

```text
Create a new Flow to automatically charge a saved B2B payment method when a payment schedule
becomes due.

When a payment schedule due date is reached, capture the vaulted payment method associated with
that payment schedule.
```

### While Sidekick builds: talk this through

1. **Trigger = payment schedule due:** for a due-on-fulfillment order that fires when you fulfill; a Net 30 order would fire 30 days out.
2. **Just trigger and action:** no condition needed, the charge action skips already-paid schedules itself.
3. **Independent of the tagging Flow:** it keys off the payment schedule, not the `Prebooking` tag, so there's nothing to wait for.
4. **One Flow, both plans:** non-Plus charges once at full fulfillment; Plus charges per fulfillment because the platform creates a schedule per shipment.

## What it builds

- **Trigger:** Payment schedule is due (fires when a payment schedule's due date is reached;
  for due-on-fulfillment that is when fulfillment happens)
- **Action:** Charge vaulted payment for B2B order
- **No condition:** the charge action already skips schedules that have been paid, so it won't
  double-charge, no separate guard is needed.

## One Flow, both plans

- **Non-Plus:** one payment schedule at full fulfillment, so it charges once for the full balance.
- **Plus:** the platform generates a payment schedule per fulfillment, so it charges per shipment.

You do not author that difference; it comes from how each plan generates payment schedules.

## You should see

Fulfilling a pre-book order (fully on non-Plus, or a shipment at a time on Plus) automatically
charges the vaulted method for the due amount, once, with no waiting on any tag.

## Teach (deeper, optional)

- **No explicit "already paid" guard is needed.** The **Charge vaulted payment for B2B order** action
  skips schedules that have already been collected, so a re-run or re-fulfillment can't double-charge.
  (Earlier iterations added a `paymentSchedule.completedAt is nil` condition for this; it turned out to
  be redundant with the action's built-in check, so the Flow is just trigger, then action.)
- It's inherently **B2B-scoped** without an explicit "is B2B" condition: the trigger fires on a payment
  schedule (which only B2B / net-terms orders have) and the action charges a vaulted B2B method. It keys
  off the schedule, not the `Prebooking` tag, so the charge never depends on the optional tagging Flow. In
  this store's model every B2B order that should auto-charge is on terms, so "charge any B2B schedule when
  it's due" is the right rule.
- The action charges the vaulted method through the order's payment schedule, independent of the
  store's payment-capture setting, so either "capture on fulfillment" or "manual capture" is fine
  (just not "automatically at checkout," which collects up front and defeats the model).
- This depends on the buyer having a vaulted method, which is what the force-vault piece
  (App Store app on non-Plus, or the Plus Function in Part 2) guarantees.
