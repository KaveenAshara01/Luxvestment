import axios from 'axios';

const API_URL = '/api/products';
const AUTH_URL = '/api/auth';

// Helper for auth headers
const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        return { Authorization: `Bearer ${user.token}` };
    }
    return {};
};

export const login = async (email, password) => {
    const response = await axios.post(`${AUTH_URL}/login`, { email, password });
    return response.data;
};

export const register = async (userData) => {
    const response = await axios.post(`${AUTH_URL}/register`, userData);
    return response.data;
};

export const fetchProducts = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const fetchProductById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

export const createProduct = async (formData) => {
    const response = await axios.post(API_URL, formData, {
        headers: { 
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data' 
        }
    });
    return response.data;
};

export const updateProduct = async (id, formData) => {
    const response = await axios.put(`${API_URL}/${id}`, formData, {
        headers: { 
            ...getAuthHeader(),
            'Content-Type': 'multipart/form-data' 
        }
    });
    return response.data;
};

export const deleteProduct = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeader()
    });
    return response.data;
};
