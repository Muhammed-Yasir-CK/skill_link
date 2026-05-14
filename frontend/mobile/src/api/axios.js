import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
    // Using your Local Network IP for the fastest, most stable connection
    baseURL: 'http://192.168.172.2:8000/api/',
    headers: {
        "Content-Type": "application/json",
        "Bypass-Tunnel-Reminder": "true"
    },
});

let logoutUser = null;

// This will be set from AuthContext
export const setLogoutHandler = (logoutFn) => {
    logoutUser = logoutFn;
};



// 🔹 REQUEST INTERCEPTOR
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('access');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);



// 🔹 RESPONSE INTERCEPTOR
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't retried yet
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refresh');

                if (refreshToken) {
                    // Try to get a new access token
                    const response = await axios.post(`${api.defaults.baseURL}accounts/token/refresh/`, {
                        refresh: refreshToken
                    });

                    if (response.data.access) {
                        const newAccessToken = response.data.access;

                        // Save new token
                        await AsyncStorage.setItem('access', newAccessToken);

                        // Update header and retry
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return api(originalRequest);
                    }
                }
            } catch (refreshError) {
                console.error("Refresh token expired or invalid. Logging out...");
                if (logoutUser) {
                    await logoutUser();
                }
                return Promise.reject(refreshError);
            }
        }

        // Handle other 401s (where retry failed)
        if (error.response && error.response.status === 401) {
            if (logoutUser) {
                await logoutUser();
            }
        }

        return Promise.reject(error);
    }
);

export default api;
