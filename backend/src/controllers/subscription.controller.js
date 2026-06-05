const stripe                          = require('../config/stripe');
const CreateCheckoutSessionCommand    = require('../application/subscription/commands/CreateCheckoutSession.command');
const CancelSubscriptionCommand       = require('../application/subscription/commands/CancelSubscription.command');
const HandleStripeWebhookCommand      = require('../application/subscription/commands/HandleStripeWebhook.command');
const GetMySubscriptionQuery          = require('../application/subscription/queries/GetMySubscription.query');
const GetAllSubscriptionsQuery        = require('../application/subscription/queries/GetAllSubscriptions.query');
const createCheckoutSessionHandler    = require('../application/subscription/handlers/CreateCheckoutSessionHandler');
const cancelSubscriptionHandler       = require('../application/subscription/handlers/CancelSubscriptionHandler');
const handleStripeWebhookHandler      = require('../application/subscription/handlers/HandleStripeWebhookHandler');
const getMySubscriptionHandler        = require('../application/subscription/handlers/GetMySubscriptionHandler');
const getAllSubscriptionsHandler       = require('../application/subscription/handlers/GetAllSubscriptionsHandler');
const confirmCheckoutHandler          = require('../application/subscription/handlers/ConfirmCheckoutHandler');
const RecruiterProfile                = require('../models/sql/RecruiterProfile');
const SubscriptionDTO                 = require('../dtos/subscription.dto');

// JWT carries companyId at login time. If the recruiter set up their company
// in the same session (before the token was refreshed), companyId may be absent.
// Fall back to the DB row so subscription routes always work.
async function resolveCompanyId(req) {
  if (req.user.companyId) return req.user.companyId;
  const profile = await RecruiterProfile.findOne({ where: { userId: req.user.id } });
  return profile?.companyId ?? null;
}

const webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).json({ message: `Webhook error: ${err.message}` });
  }

  try {
    await handleStripeWebhookHandler.handle(new HandleStripeWebhookCommand(event));
    res.json({ received: true });
  } catch (err) {
    console.error('[webhook] Handler error:', err.message);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};

const checkout = async (req, res, next) => {
  try {
    const companyId = await resolveCompanyId(req);
    if (!companyId) return res.status(400).json({ message: 'Company profile not found. Please complete company setup first.' });
    const result = await createCheckoutSessionHandler.handle(new CreateCheckoutSessionCommand({
      companyId,
      planId:      req.body.planId,
      userEmail:   req.user.email,
      companyName: req.user.companyName,
    }));
    res.json(result);
  } catch (err) { next(err); }
};

const getMy = async (req, res, next) => {
  try {
    const companyId = await resolveCompanyId(req);
    if (!companyId) return res.json(null);
    const result = await getMySubscriptionHandler.handle(new GetMySubscriptionQuery(companyId));
    res.json(result ? SubscriptionDTO.from(result) : null);
  } catch (err) { next(err); }
};

const cancel = async (req, res, next) => {
  try {
    const companyId = await resolveCompanyId(req);
    if (!companyId) return res.status(400).json({ message: 'Company profile not found.' });
    const result = await cancelSubscriptionHandler.handle(new CancelSubscriptionCommand(companyId));
    res.json(result);
  } catch (err) { next(err); }
};

const getAll = (req, res, next) =>
  getAllSubscriptionsHandler.handle(new GetAllSubscriptionsQuery(req.query))
    .then(r => res.json(r))
    .catch(next);

const confirmCheckout = (req, res, next) =>
  confirmCheckoutHandler.handle({ sessionId: req.body.sessionId })
    .then(r => res.json(r))
    .catch(next);

module.exports = { webhook, checkout, confirmCheckout, getMy, cancel, getAll };
