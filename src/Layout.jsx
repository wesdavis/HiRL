import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils'; 
import { Home, User } from 'lucide-react';

export default function Layout({ children }) {
    const location = useLocation();
    
    // Only show the bottom buttons if we are NOT on the main login screen
    // Since 'Landing' and 'Home' are both at '/', we hide nav on '/' for safety 
    // until you are logged in.
    const showNav = location.pathname !== '/' && location.pathname !== '/landing';

    const navItems = [
        { name: 'Home', icon: Home, page: 'Home' },
        { name: 'Profile', icon: User, page: 'Profile' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            <main>{children}</main>
            
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
    );
}
