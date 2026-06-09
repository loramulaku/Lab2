import api from './api';

export const subscriptionService = {
  getPlans: () =>
    api.get('/plans').then(r => r.data),

  getMySubscription: () =>
    api.get('/subscriptions/my').then(r => r.data),

  createCheckoutSession: (planId) =>
    api.post('/subscriptions/checkout', { planId }).then(r => r.data),

  cancelSubscription: () =>
    api.post('/subscriptions/cancel').then(r => r.data),

  confirmCheckout: (sessionId) =>
    api.post('/subscriptions/confirm-checkout', { sessionId }).then(r => r.data),

  getMyInvoices: () =>
    api.get('/subscriptions/my-invoices').then(r => r.data),
};
