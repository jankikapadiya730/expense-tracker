import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const auth = JSON.parse(localStorage.getItem('auth-storage'));
  const token = auth?.state?.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const sendReminder = async (groupId, userId) => {
  return api.post(`/notifications/remind/`, { group_id: groupId, user_id: userId });
};

export const getNotifications = async () => {
  return api.get('/notifications/');
};
