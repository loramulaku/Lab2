const stripe = require('../../../config/stripe');
const { activateFromCheckoutSession } = require('./HandleStripeWebhookHandler');
const getMySubscriptionHandler = require('./GetMySubscriptionHandler');
const GetMySubscriptionQuery = require('../queries/GetMySubscription.query');

class ConfirmCheckoutSessionHandler {
  async handle(command) {
    if (!command.sessionId) {
      const err = new Error('Missing checkout session');
      err.status = 400;
      throw err;
    }

    const session = await stripe.checkout.sessions.retrieve(command.sessionId, {
      expand: ['subscription'],
    });

    if (session.payment_status !== 'paid') {
      const err = new Error('Payment not completed');
      err.status = 400;
      throw err;
    }

    if (Number(session.metadata?.companyId) !== command.companyId) {
      const err = new Error('Checkout session does not belong to this company');
      err.status = 403;
      throw err;
    }

    await activateFromCheckoutSession(session);

    return getMySubscriptionHandler.handle(
      new GetMySubscriptionQuery(command.companyId)
    );
  }
}

module.exports = new ConfirmCheckoutSessionHandler();
