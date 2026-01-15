import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils'; 
import { Home, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Layout({ children }) {
    const location = useLocation();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    // Check if we have a session whenever the URL changes
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // If we can get user data, we are logged in
                const user = await base44.auth.me();
                setIsLoggedIn(!!user);
            } catch {
                setIsLoggedIn(false);
            }
        };
        checkAuth();
    }, [location.pathname]);

    // LOGIC: 
    // 1. Hide on DevTools (always)
    // 2. Hide on Root ('/') IF we are NOT logged in (that's the Landing Page view)
    // 3. Otherwise (like on /location/123), SHOW it if we are logged in.
    const isDevTools = location.pathname === '/dev-tools';
    const isRoot = location.pathname === '/';
    
    // Show Nav if: Not DevTools AND (Not Root OR User is Logged In)
    const showNav = !isDevTools && (!isRoot || isLoggedIn);

    const navItems = [
        { name: 'Home', icon: Home, page: 'Home' },
        { name: 'Profile', icon: User, page: 'Profile' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            <main>{children}</main>
        </div>
    );
}