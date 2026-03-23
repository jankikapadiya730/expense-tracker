import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_URL = 'http://localhost:8000/api';

export const useGroups = () => {
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const getGroups = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/groups/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    enabled: !!token,
  });

  const createGroup = useMutation({
    mutationFn: async (groupData) => {
      const { data } = await axios.post(`${API_URL}/groups/`, groupData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const joinGroup = useMutation({
    mutationFn: async (inviteCode) => {
      const { data } = await axios.post(`${API_URL}/groups/join/${inviteCode}/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });

  const getGroupDetail = (id) => useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/groups/${id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    },
    enabled: !!token && !!id,
  });

  return { getGroups, getGroupDetail, createGroup, joinGroup };

};
