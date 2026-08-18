import api from './axios';

export const tablesApi = {
  getTables: async () => {
    const response = await api.get('tables/');
    return response.data;
  },
  createTable: async (data) => {
    const response = await api.post('tables/', data);
    return response.data;
  },
  updateTable: async (id, data) => {
    const response = await api.put(`tables/${id}/`, data);
    return response.data;
  },
  deleteTable: async (id) => {
    const response = await api.delete(`tables/${id}/`);
    return response.data;
  },
  updateStatus: async (id, status) => {
    const response = await api.patch(`tables/${id}/status/`, { status });
    return response.data;
  },
  getByQRToken: async (qrToken) => {
    const response = await api.get(`tables/qr/${qrToken}/`);
    return response.data;
  },
};
