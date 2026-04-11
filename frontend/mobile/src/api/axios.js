import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
    baseURL: 'http://192.168.196.2:8000/api/',  // Your laptop IP
    headers: {
        "Content-Type": "application/json",
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

        if (error.response && error.response.status === 401) {

            console.warn("Session expired. Logging out...");

            if (logoutUser) {
                await logoutUser();   // 🔥 Automatically logout from AuthContext
            }
        }

        return Promise.reject(error);
    }
);

export default api;
