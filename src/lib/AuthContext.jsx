import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    checkUserAuth();
  }, []);

  const checkUserAuth = async () => {
    try {
      // If there is a 'code' in the URL (returning from login), ensure we stay loading
      // until the SDK processes it.
      setIsLoadingAuth(true);
      
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    // Force hard reload to prevent React state crashes
    window.location.href = '/'; 
  };

  const navigateToLogin = () => {
    // Use origin to ensure mobile returns to the correct domain
    base44.auth.redirectToLogin(window.location.origin);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoadingAuth, 
      logout,
      navigateToLogin,
      checkUserAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
