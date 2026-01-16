import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // 1. Load user from memory on startup
    const storedUser = localStorage.getItem('local_user');
    if (storedUser) {
        try {
            setUser(JSON.parse(storedUser));
        } catch (e) {
            console.error("Failed to parse local user", e);
        }
    }
    setIsLoadingAuth(false);
  }, []);

  // 2. The Missing Login Function (Saves to Memory)
  const login = (userData) => {
    console.log("Local Login:", userData);
    setUser(userData);
    localStorage.setItem('local_user', JSON.stringify(userData));
  };

  // 3. The Logout Function (Clears Memory)
  const logout = () => {
    setUser(null);
    localStorage.removeItem('local_user');
    window.location.href = '/'; 
  };

  return (
    <AuthContext.Provider value={{ user, isLoadingAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};