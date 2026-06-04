const stripe                          = require('../config/stripe');
const CreateCheckoutSessionCommand    = require('../application/subscription/commands/CreateCheckoutSession.command');
const CancelSubscriptionCommand       = require('../application/subscription/commands/CancelSubscription.command');
const HandleStripeWebhookCommand      = require('../application/subscription/commands/HandleStripeWebhook.command');
const ConfirmCheckoutSessionCommand   = require('../application/subscription/commands/ConfirmCheckoutSession.command');
const GetMySubscriptionQuery          = require('../application/subscription/queries/GetMySubscription.query');
const GetAllSubscriptionsQuery        = require('../application/subscription/queries/GetAllSubscriptions.query');
const createCheckoutSessionHandler    = require('../application/subscription/handlers/CreateCheckoutSessionHandler');
const cancelSubscriptionHandler       = require('../application/subscription/handlers/CancelSubscriptionHandler');
const handleStripeWebhookHandler      = require('../application/subscription/handlers/HandleStripeWebhookHandler');
const confirmCheckoutSessionHandler   = require('../application/subscription/handlers/ConfirmCheckoutSessionHandler');
const getMySubscriptionHandler        = require('../application/subscription/handlers/GetMySubscriptionHandler');
const getAllSubscriptionsHandler       = require('../application/subscription/handlers/GetAllSubscriptionsHandler');
const SubscriptionDTO                 = require('../dtos/subscription.dto');

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

const checkout = (req, res, next) =>
  createCheckoutSessionHandler.handle(new CreateCheckoutSessionCommand({
    companyId:   req.user.companyId,
    planId:      req.body.planId,
    userEmail:   req.user.email,
    companyName: req.user.companyName,
  })).then(r => res.json(r)).catch(next);

const confirm = (req, res, next) =>
  confirmCheckoutSessionHandler.handle(new ConfirmCheckoutSessionCommand({
    companyId: req.user.companyId,
    sessionId: req.body.sessionId,
  }))
    .then(r => r ? res.json(SubscriptionDTO.from(r)) : res.json(null))
    .catch(next);

const getMy = (req, res, next) =>
  getMySubscriptionHandler.handle(new GetMySubscriptionQuery(req.user.companyId))
    .then(r => r ? res.json(SubscriptionDTO.from(r)) : res.json(null))
    .catch(next);

const cancel = (req, res, next) =>
  cancelSubscriptionHandler.handle(new CancelSubscriptionCommand(req.user.companyId))
    .then(r => res.json(r))
    .catch(next);

const getAll = (req, res, next) =>
  getAllSubscriptionsHandler.handle(new GetAllSubscriptionsQuery(req.query))
    .then(r => res.json(r))
    .catch(next);

module.exports = { webhook, checkout, confirm, getMy, cancel, getAll };
