import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== Transactions =====

export const createTransaction = (data) =>
  API.post('/transactions', data).then((res) => res.data);

export const getAllTransactions = (status = '') => {
  const params = status ? { status } : {};
  return API.get('/transactions', { params }).then((res) => res.data);
};

export const getTransaction = (transactionId) =>
  API.get(`/transactions/${transactionId}`).then((res) => res.data);

export const updateTransactionStatus = (transactionId, status) =>
  API.put(`/transactions/${transactionId}/status`, { status }).then((res) => res.data);

export const getEscalationLogs = (transactionId) =>
  API.get(`/transactions/${transactionId}/logs`).then((res) => res.data);

export const getTransactionNotifications = (transactionId) =>
  API.get(`/transactions/${transactionId}/notifications`).then((res) => res.data);

// ===== Notifications =====

export const getAllNotifications = () =>
  API.get('/notifications').then((res) => res.data);

export default API;
