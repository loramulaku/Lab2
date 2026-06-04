/** Stripe API v2025+ exposes billing period on subscription items, not the root object. */
function getSubscriptionPeriodEnd(stripeSub) {
  if (!stripeSub) return null;

  const ts =
    stripeSub.current_period_end ??
    stripeSub.items?.data?.[0]?.current_period_end;

  if (!ts) return null;

  const date = new Date(ts * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
}

function resolveStripeSubscriptionId(value) {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id ?? null;
}

module.exports = { getSubscriptionPeriodEnd, resolveStripeSubscriptionId };
