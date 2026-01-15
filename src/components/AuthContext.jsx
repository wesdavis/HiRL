import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

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

    const checkUserAuth = async () => {
        try {
            const userData = await base44.auth.me();
            setUser(userData);
        } catch (error) {
            setUser(null);
        } finally {
            setIsLoadingAuth(false);
        }
    };

    useEffect(() => {
        // Manually parse and save token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        
        if (accessToken) {
            // Save token immediately to localStorage
            localStorage.setItem('base44_access_token', accessToken);
            
            // Clean URL to remove token
            window.history.replaceState({}, document.title, window.location.pathname);
        }
        
        // Now check auth after token is saved
        checkUserAuth();
    }, []);

    const logout = () => {
        localStorage.clear();
        window.location.href = '/';
    };

    return (
        <AuthContext.Provider value={{ user, isLoadingAuth, logout, refreshUser: checkUserAuth }}>
            {children}
        </AuthContext.Provider>
    );
};