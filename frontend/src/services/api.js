import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/api` : 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Gắn token vào mọi request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auto-refresh token khi bị 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Nếu bị 401 và chưa thử refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
                try {
                    const res = await axios.post('http://localhost:8000/api/auth/token/refresh/', {
                        refresh: refreshToken,
                    });

                    const newAccess = res.data.access;
                    localStorage.setItem('access_token', newAccess);

                    // Nếu server trả refresh token mới (rotate)
                    if (res.data.refresh) {
                        localStorage.setItem('refresh_token', res.data.refresh);
                    }

                    // Gửi lại request gốc với token mới
                    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh cũng hết hạn → logout
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;
