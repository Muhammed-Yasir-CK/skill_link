import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user_type');
    delete api.defaults.headers.common.Authorization;
    setUser(null);
    // Step 1: replace current protected page with home
    // window.history.replaceState(null, '', '/');
    // window.location.href = '/login';
    // window.location.replace('/login');

  };

  const loadUser = async () => {
    const token = localStorage.getItem('access');
    const userType = localStorage.getItem('user_type');

    if (!token || !userType) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      let response;

      if (userType === 'company') {
        response = await api.get('accounts/company/me/');
      } else {
        response = await api.get('accounts/me/');
      }

      // Normalize backend response
      setUser({
        ...response.data,
        role: response.data.user_type,
        name: response.data.full_name || response.data.company_name || response.data.username,
        avatar: response.data.profile_picture || response.data.brand_logo || null
      });
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, logout,loadUser  }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
