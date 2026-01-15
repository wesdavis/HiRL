import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/components/AuthContext';
import Landing from './Landing';

const MOCK_LOCATIONS = [
    {
        id: 'loc_1',
        name: 'The Velvet Lounge',
        address: '123 Main St, Denver, CO',
        image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
        category: 'lounge'
    },
    {
        id: 'loc_2',
        name: 'Skyline Bar',
        address: '456 Broadway, Denver, CO',
        image_url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
        category: 'bar'
    }
];

export default function Home() {
    const { user, isLoadingAuth } = useAuth();
    const [selectedLocation, setSelectedLocation] = useState(null);

    if (isLoadingAuth) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <Landing />;
    }

    if (!user.gender || !user.full_name) {
        window.location.href = '/profile-setup';
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            <div className="max-w-lg mx-auto px-4 py-6 pb-24">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-white">Discover</h1>
                    <p className="text-slate-400 text-sm">Find your vibe</p>
                </div>

                <div className="space-y-4">
                    {MOCK_LOCATIONS.map(loc => (
                        <motion.div
                            key={loc.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 overflow-hidden cursor-pointer hover:bg-white/10 transition-all"
                            onClick={() => setSelectedLocation(loc)}
                        >
                            <div className="relative h-32">
                                <img src={loc.image_url} className="w-full h-full object-cover" alt={loc.name} />
                            </div>
                            <div className="p-4">
                                <h3 className="text-white font-bold text-lg">{loc.name}</h3>
                                <p className="text-slate-400 text-sm flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {loc.address}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}