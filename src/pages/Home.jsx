import React, { useState, useEffect, useCallback, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Zap, ArrowLeft, Eye, EyeOff, RefreshCw, Search, Navigation, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

// 1. SAFE IMPORTS ONLY (Removed ProfileSetup)
import Landing from './Landing'; 
import LocationCard from '@/components/location/LocationCard';
import UserGrid from '@/components/location/UserGrid';
import CheckInStatus from '@/components/location/CheckInStatus';
import PingNotifications from '@/components/notifications/PingNotifications';
import MatchNotifications from '@/components/notifications/MatchNotifications';

const CHECKIN_RADIUS_METERS = 5000;

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
    // 2. HOOKS AT THE TOP (Fixed the "Rendered more hooks" error)
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [checkingIn, setCheckingIn] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [geoError, setGeoError] = useState(null);
    const [loadingGeo, setLoadingGeo] = useState(true);
    const checkInIdRef = useRef(null);
    const queryClient = useQueryClient();

    // 3. User Load Effect
    useEffect(() => {
        const loadUser = async () => {
            try {
                const userData = await base44.auth.me();
                setUser(userData);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    // 4. Geolocation Effect
    useEffect(() => {
        if (!navigator.geolocation) {
            setGeoError('Geolocation not supported');
            setLoadingGeo(false);
            return;
        }
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
                setLoadingGeo(false);
                setGeoError(null);
            },
            (error) => {
                setGeoError('Location access denied');
                setLoadingGeo(false);
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // 5. Data Queries (Enabled only when user exists)
    const { data: locations = [] } = useQuery({
        queryKey: ['locations'],
        queryFn: () => base44.entities.Location.filter({ is_active: true }),
        enabled: !!user
    });

    const { data: allCheckIns = [], refetch: refetchCheckIns } = useQuery({
        queryKey: ['checkins'],
        queryFn: () => base44.entities.CheckIn.filter({ is_active: true }),
        enabled: !!user,
        refetchInterval: 5000
    });

    const { data: myPings = [], refetch: refetchPings } = useQuery({
        queryKey: ['my-pings', user?.email],
        queryFn: () => base44.entities.Ping.filter({ to_user_email: user?.email, status: 'pending' }),
        enabled: !!user?.email,
        refetchInterval: 3000 
    });

    const { data: sentPings = [], refetch: refetchSentPings } = useQuery({
        queryKey: ['sent-pings', user?.email],
        queryFn: () => base44.entities.Ping.filter({ from_user_email: user?.email }),
        enabled: !!user?.email
    });

    const { data: myBlocks = [] } = useQuery({
        queryKey: ['my-blocks', user?.email],
        queryFn: () => base44.entities.Block.filter({ blocker_email: user?.email }),
        enabled: !!user?.email
    });

    const { data: blockedByOthers = [] } = useQuery({
        queryKey: ['blocked-by-others', user?.email],
        queryFn: () => base44.entities.Block.filter({ blocked_email: user?.email }),
        enabled: !!user?.email
    });

    const { data: matchedPings = [], refetch: refetchMatches } = useQuery({
        queryKey: ['matched-pings', user?.email],
        queryFn: () => base44.entities.Ping.filter({ from_user_email: user?.email, status: 'matched' }),
        enabled: !!user?.email,
        refetchInterval: 3000
    });

    // 6. Helpers
    const blockedUsers = new Set([
        ...myBlocks.map(b => b.blocked_email),
        ...blockedByOthers.map(b => b.blocker_email)
    ]);
    const myActiveCheckIn = allCheckIns.find(c => c.user_email === user?.email && c.is_active);

    useEffect(() => {
        checkInIdRef.current = myActiveCheckIn?.id || null;
    }, [myActiveCheckIn?.id]);

    // 7. Handlers
    const getDistanceToLocation = (location) => {
        if (!userLocation || !location.latitude || !location.longitude) return null;
        return calculateDistance(userLocation.latitude, userLocation.longitude, location.latitude, location.longitude);
    };

    const isNearLocation = (location) => {
        const distance = getDistanceToLocation(location);
        return distance !== null && distance <= CHECKIN_RADIUS_METERS;
    };
    
    const getCheckInsForLocation = (locationId, applyFilters = false) => {
        return allCheckIns.filter(c => {
            if (c.location_id !== locationId || !c.is_active || c.user_email === user?.email) return false;
            if (!applyFilters) return true;
            if (blockedUsers.has(c.user_email)) return false;
            if (c.user_private_mode) return false;
            const userSeeking = user?.seeking;
            if (userSeeking === 'everyone') return true;
            return c.user_gender === userSeeking;
        });
    };

    const handleCheckIn = async (location) => {
        if (!user) return toast.error('Please log in');
        setCheckingIn(true);
        if (myActiveCheckIn) {
            await base44.entities.CheckIn.update(myActiveCheckIn.id, { is_active: false, checked_out_at: new Date().toISOString() });
        }
        await base44.entities.CheckIn.create({
            user_email: user?.email,
            user_name: user?.full_name,
            user_photo: user?.photo_url,
            user_gender: user?.gender,
            user_bio: user?.bio,
            user_private_mode: user?.private_mode || false,
            location_id: location.id,
            location_name: location.name,
            is_active: true
        });
        await refetchCheckIns();
        setCheckingIn(false);
        toast.success(`Checked in at ${location.name}`);
    };

    const handleCheckOut = async () => {
        if (!myActiveCheckIn) return;
        setCheckingOut(true);
        await base44.entities.CheckIn.update(myActiveCheckIn.id, { is_active: false, checked_out_at: new Date().toISOString() });
        await refetchCheckIns();
        setSelectedLocation(null);
        setCheckingOut(false);
        toast.success('Checked out successfully');
    };

    const handleDismissPing = async (pingId) => { await refetchPings(); };

    // ------------------------------------------------------------------
    // 8. THE BOUNCER (Conditional Rendering happens LAST)
    // ------------------------------------------------------------------

    // A. Show Loading Spinner
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // B. Show Landing Page (Logged Out)
    if (!user) {
        return <Landing />;
    }

    // C. Redirect to Profile Setup (Incomplete Profile)
    // Using window.location to redirect, we don't need to import the component.
    if (!user.gender || !user.full_name) {
        window.location.href = '/profile-setup';
        return null;
    }

    // D. Main App Render (Logged In)
    const isFemale = user?.gender === 'female';
    const locationCheckIns = selectedLocation ? getCheckInsForLocation(selectedLocation.id, true) : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            <div className="max-w-lg mx-auto px-4 py-6 pb-24">
                {/* Simplified Header for brevity, keep your full UI here */}
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
                    <Button size="icon" variant="ghost" onClick={() => { refetchCheckIns(); refetchPings(); }} className="text-slate-400">
                        <RefreshCw className="w-5 h-5" />
                    </Button>
                </div>
                
                {/* If selectedLocation is active, show details, else show list. 
                    (Re-using the logic from your previous file to ensure UI renders) 
                */}
                <AnimatePresence mode="wait">
                    {!selectedLocation ? (
                         <motion.div key="locations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                            {/* Render Locations List */}
                            {locations.map(loc => (
                                <LocationCard 
                                    key={loc.id} 
                                    location={loc} 
                                    activeCount={getCheckInsForLocation(loc.id).length} 
                                    isCheckedIn={myActiveCheckIn?.location_id === loc.id}
                                    isNearby={isNearLocation(loc)}
                                    distance={getDistanceToLocation(loc)}
                                    onClick={() => setSelectedLocation(loc)} 
                                />
                            ))}
                            {locations.length === 0 && <p className="text-center text-slate-500">No locations found</p>}
                         </motion.div>
                    ) : (
                        <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            {/* Render Location Detail (Simplified for safety) */}
                            <div className="relative rounded-2xl overflow-hidden h-48">
                                <img src={selectedLocation.image_url || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800'} className="w-full h-full object-cover" />
                            </div>
                            <Button onClick={() => handleCheckIn(selectedLocation)} className="w-full h-14 bg-amber-500 text-black font-bold rounded-xl">Check In</Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
