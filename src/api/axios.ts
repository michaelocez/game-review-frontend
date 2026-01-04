import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:4941/api/v1', headers: {'Content-Type': 'application/json',},
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers['X-Authorization'] = token;
    }
    return config;
})

export default api;
