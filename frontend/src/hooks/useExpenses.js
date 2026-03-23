import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:8000/api';

export const useExpenses = (groupId) => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const getExpenses = useQuery({
    queryKey: ['expenses', groupId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/expenses/?group=${groupId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    enabled: !!token && !!groupId,
  });

  const createExpense = useMutation({
    mutationFn: async (expenseData) => {
      const { data } = await axios.post(`${API_URL}/expenses/`, expenseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', groupId] });
      queryClient.invalidateQueries({ queryKey: ['balances', groupId] });
    },
  });

  const getBalances = useQuery({
    queryKey: ['balances', groupId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/groups/${groupId}/balances/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    enabled: !!token && !!groupId,
  });

  return { getExpenses, createExpense, getBalances };
};
