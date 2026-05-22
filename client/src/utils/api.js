import axios from 'axios';

const API_URL = '/api/products';
const AUTH_URL = '/api/auth';
const CART_URL = '/api/cart';
const ORDERS_URL = '/api/orders';

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

// Cart APIs
export const fetchCartApi = async () => {
    const response = await axios.get(CART_URL, { headers: getAuthHeader() });
    return response.data;
};

export const addToCartApi = async (productId, quantity) => {
    const response = await axios.post(CART_URL, { productId, quantity }, { headers: getAuthHeader() });
    return response.data;
};

export const updateCartQtyApi = async (productId, quantity) => {
    const response = await axios.put(`${CART_URL}/${productId}`, { quantity }, { headers: getAuthHeader() });
    return response.data;
};

export const removeFromCartApi = async (productId) => {
    const response = await axios.delete(`${CART_URL}/${productId}`, { headers: getAuthHeader() });
    return response.data;
};

export const clearCartApi = async () => {
    const response = await axios.delete(CART_URL, { headers: getAuthHeader() });
    return response.data;
};

export const syncCartApi = async (items) => {
    const response = await axios.post(`${CART_URL}/sync`, { items }, { headers: getAuthHeader() });
    return response.data;
};

// Order APIs
export const createOrderApi = async (orderData) => {
    const response = await axios.post(ORDERS_URL, orderData, { headers: getAuthHeader() });
    return response.data;
};

export const fetchMyOrdersApi = async () => {
    const response = await axios.get(`${ORDERS_URL}/myorders`, { headers: getAuthHeader() });
    return response.data;
};
