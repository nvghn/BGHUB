import axios from 'axios';

// Create an instance of axios with default configurations
const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    timeout: 1000,
});

// Add a request interceptor to manage authentication tokens
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

// Add a response interceptor to handle errors or refresh tokens
apiClient.interceptors.response.use(response => {
    return response;
}, error => {
    // Handle error responses
    // You can add your refresh token logic here
    return Promise.reject(error);
});

export default apiClient;