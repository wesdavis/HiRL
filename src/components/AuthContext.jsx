import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    useEffect(() => {
        // Load user from localStorage on mount
        const savedUser = localStorage.getItem('local_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error('Failed to parse saved user:', e);
            }
        }
        setIsLoadingAuth(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('local_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('local_user');
        window.location.href = '/';
    };

    const refreshUser = () => {
        const savedUser = localStorage.getItem('local_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoadingAuth, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};