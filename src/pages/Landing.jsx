import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { Zap, MapPin, Shield, Sparkles, Heart, Users } from 'lucide-react';
import { createPageUrl } from '../components/utils';

export default function Landing() {
    const handleGetStarted = () => {
        // Navigate to auth page
        window.location.href = createPageUrl('Auth');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 overflow-hidden">
            {/* Background Animation */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-3xl"
                />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 text-center">
                {/* Hero */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-300 text-sm font-medium">Female-First Dating</span>
                    </div>
                    
                    <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
                        Meet IRL, <br />
                        <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Make It Real</span>
                    </h1>
                    
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                        Check into real venues, discover people nearby, and connect face-to-face.
                    </p>

                    <Button
                        onClick={handleGetStarted}
                        className="h-14 px-10 text-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold rounded-2xl"
                    >
                        <Zap className="w-5 h-5 mr-2" />
                        Get Started
                    </Button>
                </motion.div>

                {/* Footer Info */}
                <div className="grid md:grid-cols-3 gap-6 mb-20 text-left">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <MapPin className="w-8 h-8 text-purple-400 mb-4" />
                        <h3 className="text-white font-bold text-lg mb-2">Real Locations</h3>
                        <p className="text-slate-400">See who is actually at the venue right now.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <Shield className="w-8 h-8 text-amber-400 mb-4" />
                        <h3 className="text-white font-bold text-lg mb-2">Women Lead</h3>
                        <p className="text-slate-400">You control who sees you and who you connect with.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <Heart className="w-8 h-8 text-pink-400 mb-4" />
                        <h3 className="text-white font-bold text-lg mb-2">Instant Matches</h3>
                        <p className="text-slate-400">Ping someone nearby and meet them instantly.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}