import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from 'framer-motion';
import { Zap, Mail, ArrowRight, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';

export default function Auth() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (!email || !password) {
            toast.error('Please enter email and password');
            return;
        }

        setLoading(true);
        
        // Check if user exists in localStorage
        const storedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
        const foundUser = storedUsers.find(u => u.email === email && u.password === password);
        
        if (foundUser) {
            // Remove password before storing in session
            const { password: _, ...userWithoutPassword } = foundUser;
            login(userWithoutPassword);
            toast.success('Welcome back!');
            
            // Get user location before redirecting
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const location = {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        };
                        localStorage.setItem('userLocation', JSON.stringify(location));
                        window.location.href = '/';
                    },
                    () => window.location.href = '/'
                );
            } else {
                window.location.href = '/';
            }
        } else {
            toast.error('Invalid email or password');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 mb-4">
                        <Zap className="w-8 h-8 text-amber-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-slate-400">
                        Sign in to continue
                    </p>
                </div>

                <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-slate-300 text-sm font-medium mb-2 block">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="pl-12 bg-white/5 border-white/10 text-white h-14 rounded-xl"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-slate-300 text-sm font-medium mb-2 block">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="pl-12 bg-white/5 border-white/10 text-white h-14 rounded-xl"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold rounded-xl disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                            {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
                        </Button>
                    </form>

                    <button
                        onClick={() => window.location.href = '/profile-setup'}
                        className="text-slate-400 text-sm text-center mt-6 w-full hover:text-white transition-colors"
                    >
                        Don't have an account? Sign up
                    </button>
                </div>
            </motion.div>
        </div>
    );
}