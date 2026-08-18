import api from './axios';

export const menuApi = {
  getCategories: async () => {
    const response = await api.get('menu/categories/');
    return response.data;
  },
  createCategory: async (data) => {
    const response = await api.post('menu/categories/', data);
    return response.data;
  },
  deleteCategory: async (id) => {
    const response = await api.delete(`menu/categories/${id}/`);
    return response.data;
  },
  getMenuItems: async () => {
    const response = await api.get('menu/items/');
    return response.data;
  },
  createMenuItem: async (data) => {
    const isFormData = data instanceof FormData;
    const response = await api.post('menu/items/', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },
  updateMenuItem: async (id, data) => {
    const isFormData = data instanceof FormData;
    const response = await api.patch(`menu/items/${id}/`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    });
    return response.data;
  },
  deleteMenuItem: async (id) => {
    const response = await api.delete(`menu/items/${id}/`);
    return response.data;
  },
  toggleAvailability: async (id) => {
    const response = await api.post(`menu/items/${id}/toggle/`);
    return response.data;
  },
};
