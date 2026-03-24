import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:8000/api';

export const useCurrencies = () => {
  const { token } = useAuthStore();

  const getSupportedCurrencies = useQuery({
    queryKey: ['supported-currencies'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/currencies/supported_currencies/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    enabled: !!token,
  });

  return { getSupportedCurrencies };
};
