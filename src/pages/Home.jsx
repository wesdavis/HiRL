import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Zap, ArrowLeft, RefreshCw, Loader2, Search } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';

import Landing from './Landing'; 
import LocationCard from '@/components/location/LocationCard';
import UserGrid from '@/components/location/UserGrid';
import PingNotifications from '@/components/notifications/PingNotifications';
import MatchNotifications from '@/components/notifications/MatchNotifications';

// Mock Data
const MOCK_LOCATIONS = [
    {
        id: 'loc_1',
        name: 'The Velvet Lounge',
        address: '123 Main St, Denver, CO',
        latitude: 39.7392,
        longitude: -104.9903,
        image_url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
        category: 'lounge',
        is_active: true,
        vibe_tags: ['upscale', 'cocktails', 'live music']
    },
    {
        id: 'loc_2',
        name: 'Skyline Bar',
        address: '456 Broadway, Denver, CO',
        latitude: 39.7490,
        longitude: -104.9876,
        image_url: 'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=800',
        category: 'bar',
        is_active: true,
        vibe_tags: ['rooftop', 'views', 'casual']
    },
    {
        id: 'loc_3',
        name: 'Electric Nights',
        address: '789 Club Ave, Denver, CO',
        latitude: 39.7556,
        longitude: -104.9942,
        image_url: 'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=800',
        category: 'club',
        is_active: true,
        vibe_tags: ['dance', 'electronic', 'energetic']
    }
];

const MOCK_USERS = [
    {
        id: 'user_1',
        user_email: 'sarah@example.com',
        user_name: 'Sarah',
        user_photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        user_gender: 'female',
        user_bio: 'Love dancing and meeting new people',
        location_id: 'loc_1',
        is_active: true
    },
    {
        id: 'user_2',
        user_email: 'emily@example.com',
        user_name: 'Emily',
        user_photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        user_gender: 'female',
        user_bio: 'Cocktail enthusiast',
        location_id: 'loc_1',
        is_active: true
    },
    {
        id: 'user_3',
        user_email: 'jessica@example.com',
        user_name: 'Jessica',
        user_photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
        user_gender: 'female',
        user_bio: 'Looking for good vibes',
        location_id: 'loc_2',
        is_active: true
    }
];

const DISPLAY_RADIUS_METERS = 48280; // 30 miles

// Helper to calc distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export default function Home() {
    const { user, isLoadingAuth } = useAuth();
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [userLocation, setUserLocation] = useState(() => {
        const saved = localStorage.getItem('userLocation');
        return saved ? JSON.parse(saved) : { latitude: 39.7392, longitude: -104.9903 }; // Default Denver
    });
    const [myCheckIn, setMyCheckIn] = useState(null);
    const [locations] = useState(MOCK_LOCATIONS);
    const [checkIns] = useState(MOCK_USERS);
    const [pings] = useState([]);
    const [matches] = useState([]);

    // Geolocation
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (pos) => {
                    const newLocation = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                    setUserLocation(newLocation);
                    localStorage.setItem('userLocation', JSON.stringify(newLocation));
                },
                (err) => console.log('Geo error:', err)
            );
        }
    }, []);

    // Bouncer Logic
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

    const isFemale = user.gender === 'female';

    // Helpers
    const getDistanceToLocation = (loc) => userLocation && loc?.latitude ? calculateDistance(userLocation.latitude, userLocation.longitude, loc.latitude, loc.longitude) : null;
    const getCheckInsForLocation = (locId) => checkIns.filter(c => c.location_id === locId && c.is_active && c.user_email !== user.email);
    
    const handleCheckIn = (loc) => {
        setMyCheckIn({ location_id: loc.id, location_name: loc.name });
        toast.success(`Checked in at ${loc.name}`);
    };
    
    const handleCheckOut = () => {
        setMyCheckIn(null);
        setSelectedLocation(null);
        toast.success('Checked out');
    };

    const nearbyLocations = userLocation 
        ? locations.filter(loc => {
            const distance = getDistanceToLocation(loc);
            return distance !== null && distance <= DISPLAY_RADIUS_METERS;
          })
        : locations;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            <div className="max-w-lg mx-auto px-4 py-6 pb-24">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    {selectedLocation ? (
                        <Button variant="ghost" onClick={() => setSelectedLocation(null)} className="text-white">
                            <ArrowLeft className="w-5 h-5 mr-2" /> Back
                        </Button>
                    ) : (
                        <div>
                            <h1 className="text-2xl font-bold text-white">Discover</h1>
                            <p className="text-slate-400 text-sm">Find your vibe</p>
                        </div>
                    )}
                    <Button size="icon" variant="ghost" className="text-slate-400">
                        <RefreshCw className="w-5 h-5" />
                    </Button>
                </div>

                {matches.length > 0 && !selectedLocation && (
                    <div className="mb-6"><MatchNotifications matches={matches} onDismiss={() => {}} /></div>
                )}
                {pings.length > 0 && !selectedLocation && (
                    <div className="mb-6"><PingNotifications pings={pings} onDismiss={() => {}} /></div>
                )}

                <AnimatePresence mode="wait">
                    {!selectedLocation ? (
                        <motion.div key="locations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            {nearbyLocations.length === 0 ? (
                                <div className="text-center py-12 backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-8">
                                    <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-white mb-2">No Nearby Locations</h3>
                                    <p className="text-slate-400 mb-6">No venues found within 30 miles of your location.</p>
                                </div>
                            ) : (
                                nearbyLocations.map(loc => (
                                    <LocationCard 
                                        key={loc.id} 
                                        location={loc} 
                                        activeCount={getCheckInsForLocation(loc.id).length} 
                                        isCheckedIn={myCheckIn?.location_id === loc.id} 
                                        isNearby={true}
                                        distance={getDistanceToLocation(loc)} 
                                        onClick={() => setSelectedLocation(loc)} 
                                    />
                                ))
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="relative rounded-2xl overflow-hidden h-48">
                                <img src={selectedLocation.image_url} className="w-full h-full object-cover" alt={selectedLocation.name} />
                            </div>
                            {myCheckIn?.location_id !== selectedLocation.id ? (
                                <Button onClick={() => handleCheckIn(selectedLocation)} className="w-full h-14 bg-amber-500 text-black font-bold rounded-xl">
                                    Check In Here
                                </Button>
                            ) : (
                                <Button onClick={handleCheckOut} variant="outline" className="w-full h-14 border-red-500 text-red-400">
                                    Leave Location
                                </Button>
                            )}
                            {isFemale && (
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-amber-500"/> People Here
                                    </h3>
                                    <UserGrid 
                                        users={getCheckInsForLocation(selectedLocation.id)} 
                                        currentUser={user} 
                                        locationId={selectedLocation.id} 
                                        locationName={selectedLocation.name} 
                                        existingPings={[]} 
                                        onPingSent={() => toast.success('Ping sent!')} 
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