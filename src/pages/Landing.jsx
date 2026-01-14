import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { Zap, MapPin, Shield, Sparkles, Heart, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Landing() {
    const handleGetStarted = () => {
        // FIX: Use full URL (origin) to ensure mobile redirects return correctly
        base44.auth.redirectToLogin(window.location.origin);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 overflow-hidden">
            {/* Animated background orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] bg-amber-600/20 rounded-full blur-3xl"
                />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-300 text-sm font-medium">Female-First Dating</span>
                    </div>
                    
                    <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
                        Meet IRL, <br />
                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Make It Real</span>
                    </h1>
                    
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        The only dating app where women are in control. Check into real venues, 
                        discover people nearby, and connect face-to-face—safely and authentically.
                    </p>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Button
                            onClick={handleGetStarted}
                            className="h-14 px-10 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold rounded-2xl shadow-2xl shadow-amber-500/25"
                        >
                            <Zap className="w-5 h-5 mr-2" />
                            Get Started
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Features Grid (Simplified for brevity - keep your existing grid code here if you want) */}
                <div className="text-center text-slate-500 text-sm mb-20">
                    <p>Secure. Verified. Real.</p>
                </div>

                {/* Social Proof */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9, duration: 0.8 }}
                    className="text-center"
                >
                    <Button
                        onClick={handleGetStarted}
                        className="h-14 px-10 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold rounded-2xl shadow-2xl shadow-amber-500/25"
                    >
                        <Zap className="w-5 h-5 mr-2" />
                        Get Started Free
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
