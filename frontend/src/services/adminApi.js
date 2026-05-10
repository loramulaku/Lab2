import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminApi = {
  getStats: async () => {
    const response = await axios.get(`${API_URL}/admin/stats`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getUsers: async (params) => {
    const response = await axios.get(`${API_URL}/admin/users`, {
      params,
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await axios.get(`${API_URL}/admin/users/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  createUser: async (data) => {
    const response = await axios.post(`${API_URL}/admin/users`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await axios.put(`${API_URL}/admin/users/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await axios.delete(`${API_URL}/admin/users/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getJobs: async (params) => {
    const response = await axios.get(`${API_URL}/admin/jobs`, {
      params,
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getJobById: async (id) => {
    const response = await axios.get(`${API_URL}/admin/jobs/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updateJob: async (id, data) => {
    const response = await axios.put(`${API_URL}/admin/jobs/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await axios.delete(`${API_URL}/admin/jobs/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getCompanies: async (params) => {
    const response = await axios.get(`${API_URL}/admin/companies`, {
      params,
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getCompanyById: async (id) => {
    const response = await axios.get(`${API_URL}/admin/companies/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  updateCompany: async (id, data) => {
    const response = await axios.put(`${API_URL}/admin/companies/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  deleteCompany: async (id) => {
    const response = await axios.delete(`${API_URL}/admin/companies/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getApplications: async (params) => {
    const response = await axios.get(`${API_URL}/admin/applications`, {
      params,
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getRoles: async () => {
    const response = await axios.get(`${API_URL}/admin/roles`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};
