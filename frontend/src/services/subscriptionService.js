import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const subscriptionService = {
  getPlans: async () => {
    const response = await axios.get(`${API_URL}/plans`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getMySubscription: async () => {
    const response = await axios.get(`${API_URL}/subscriptions/my`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  createCheckoutSession: async (planId) => {
    const response = await axios.post(
      `${API_URL}/subscriptions/checkout`,
      { planId },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  confirmCheckoutSession: async (sessionId) => {
    const response = await axios.post(
      `${API_URL}/subscriptions/confirm`,
      { sessionId },
      { headers: getAuthHeader() }
    );
    return response.data;
  },

  cancelSubscription: async () => {
    const response = await axios.post(
      `${API_URL}/subscriptions/cancel`,
      {},
      { headers: getAuthHeader() }
    );
    return response.data;
  },
};
