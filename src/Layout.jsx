import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils'; 
import { Home, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { AuthProvider } from '@/components/AuthContext';

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
    // 2. Hide on Auth page (always)
    // 3. Hide on Root ('/') IF we are NOT logged in (that's the Landing Page view)
    // 4. Otherwise (like on /location/123), SHOW it if we are logged in.
    const isDevTools = location.pathname === '/dev-tools';
    const isAuth = location.pathname === '/auth';
    const isRoot = location.pathname === '/';
    
    // Show Nav if: Not DevTools AND Not Auth AND (Not Root OR User is Logged In)
    const showNav = !isDevTools && !isAuth && (!isRoot || isLoggedIn);

    const navItems = [
        { name: 'Home', icon: Home, page: 'Home' },
        { name: 'Profile', icon: User, page: 'Profile' }
    ];

    return (
        <AuthProvider>
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
                <main className={showNav ? "pb-20" : ""}>{children}</main>
                
                {showNav && (
                    <nav className="fixed bottom-0 left-0 right-0 z-50">
                        <div className="max-w-lg mx-auto px-4 pb-4">
                            <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/10 p-2">
                                <div className="flex justify-around">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            to={createPageUrl(item.page)}
                                            className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                                        >
                                            <item.icon className="w-5 h-5" />
                                            <span className="text-xs font-medium">{item.name}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </nav>
                )}
            </div>
        </AuthProvider>
    );
}