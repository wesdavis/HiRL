import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Zap, ArrowLeft, RefreshCw, Loader2, Search, Navigation } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';

import Landing from './Landing'; 
import LocationCard from '@/components/location/LocationCard';
import UserGrid from '@/components/location/UserGrid';

// 1. MOCK DATA (No API Calls)
const MOCK_LOCATIONS = [
    { id: 1, name: "The Velvet Room", address: "123 Main St", latitude: 40.7128, longitude: -74.0060, image_url: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800" },
    { id: 2, name: "Neon Nights", address: "456 Downtown Blvd", latitude: 40.7138, longitude: -74.0070, image_url: "https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800" },
    { id: 3, name: "Skyline Lounge", address: "789 High Rise", latitude: 40.7148, longitude: -74.0080, image_url: "https://images.unsplash.com/photo-1570876050997-2fdefb00c004?w=800" }
];

const MOCK_USERS = [
    { id: 1, full_name: "Sarah", photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400", gender: "female", bio: "Here for the vibes" },
    { id: 2, full_name: "Mike", photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", gender: "male", bio: "Anyone want a drink?" }
];

export default function Home() {
    const { user, isLoadingAuth } = useAuth();
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [checkingIn, setCheckingIn] = useState(false);
    const [loadingGeo, setLoadingGeo] = useState(true);
    
    // Fake GPS loader
    useEffect(() => {
        const timer = setTimeout(() => setLoadingGeo(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const handleCheckIn = async (loc) => {
        setCheckingIn(true);
        setTimeout(() => {
            setCheckingIn(false);
            toast.success(`Checked in at ${loc.name}`);
        }, 800);
    };

    // BOUNCER: Check Context
    if (isLoadingAuth) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>;
    if (!user) return <Landing />;
    
    // Safety check for profile data
    if (!user.gender || !user.full_name) {
        window.location.href = '/profile-setup';
        return null;
    }

    const isFemale = user.gender === 'female';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            <div className="max-w-lg mx-auto px-4 py-6 pb-24">
                <div className="flex items-center justify-between mb-6">
                    {selectedLocation ? (
                        <Button variant="ghost" onClick={() => setSelectedLocation(null)} className="text-white"><ArrowLeft className="w-5 h-5 mr-2" /> Back</Button>
                    ) : (
                        <div>
                            <h1 className="text-2xl font-bold text-white">Discover</h1>
                            <div className="flex items-center gap-2">
                                <p className="text-slate-400 text-sm">Local Mock Mode</p>
                                {loadingGeo && <span className="text-amber-500 text-xs animate-pulse">Locating...</span>}
                            </div>
                        </div>
                    )}
                    <Button size="icon" variant="ghost" className="text-slate-400"><RefreshCw className="w-5 h-5" /></Button>
                </div>

                <AnimatePresence mode="wait">
                    {!selectedLocation ? (
                        <motion.div key="locations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            {MOCK_LOCATIONS.map(loc => (
                                <LocationCard 
                                    key={loc.id} 
                                    location={loc} 
                                    activeCount={Math.floor(Math.random() * 20)} 
                                    isNearby={true} 
                                    distance={500} 
                                    onClick={() => setSelectedLocation(loc)} 
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="relative rounded-2xl overflow-hidden h-48"><img src={selectedLocation.image_url} className="w-full h-full object-cover" alt={selectedLocation.name} /></div>
                            <Button onClick={() => handleCheckIn(selectedLocation)} disabled={checkingIn} className="w-full h-14 bg-amber-500 text-black font-bold rounded-xl">
                                {checkingIn ? 'Checking In...' : 'Check In Here'}
                            </Button>
                            {isFemale && (
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500"/> People Here</h3>
                                    <UserGrid 
                                        users={MOCK_USERS} 
                                        currentUser={user} 
                                        locationId={selectedLocation.id} 
                                        locationName={selectedLocation.name} 
                                        existingPings={[]} 
                                        onPingSent={() => toast.success("Ping sent!")} 
                                    />
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}