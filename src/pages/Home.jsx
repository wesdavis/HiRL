import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Zap, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

// Imports
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
    // =========================================================
    // SECTION 1: ALL HOOKS (MUST BE FIRST - NO RETURNS ALLOWED)
    // =========================================================
    
    // State Hooks
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [checkingIn, setCheckingIn] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [geoError, setGeoError] = useState(null);
    const [loadingGeo, setLoadingGeo] = useState(true);
    const checkInIdRef = useRef(null);

    // Effect Hook: Load User
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

    // Effect Hook: Geolocation
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
                // Don't block the app, just note the error
                setLoadingGeo(false);
            },
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
        );
        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    // Safe Fetch Logic
    const canFetch = !!user && !!user.email;

    // Query Hooks (These must run every time, use 'enabled' to toggle)
    const { data: locations = [] } = useQuery({
        queryKey: ['locations'],
        queryFn: () => base44.entities.Location.filter({ is_active: true }),
        enabled: canFetch
    });

    const { data: allCheckIns = [], refetch: refetchCheckIns } = useQuery({
        queryKey: ['checkins'],
        queryFn: () => base44.entities.CheckIn.filter({ is_active: true }),
        enabled: canFetch,
        refetchInterval: 5000
    });

    const { data: myPings = [], refetch: refetchPings } = useQuery({
        queryKey: ['my-pings', user?.email],
        queryFn: () => base44.entities.Ping.filter({ to_user_email: user?.email, status: 'pending' }),
        enabled: canFetch,
        refetchInterval: 3000 
    });

    const { data: sentPings = [], refetch: refetchSentPings } = useQuery({
        queryKey: ['sent-pings', user?.email],
        queryFn: () => base44.entities.Ping.filter({ from_user_email: user?.email }),
        enabled: canFetch
    });

    const { data: matchedPings = [], refetch: refetchMatches } = useQuery({
        queryKey: ['matched-pings', user?.email],
        queryFn: () => base44.entities.Ping.filter({ from_user_email: user?.email, status: 'matched' }),
        enabled: canFetch,
        refetchInterval: 3000
    });

    // Effect Hook: Cleanup Check-ins
    const myActiveCheckIn = allCheckIns?.find(c => c.user_email === user?.email && c.is_active) || null;
    useEffect(() => {
        checkInIdRef.current = myActiveCheckIn?.id || null;
    }, [myActiveCheckIn?.id]);

    // =========================================================
    // SECTION 2: LOGIC & HELPERS (NO RETURNS YET)
    // =========================================================

    const getDistanceToLocation = (location) => {
        if (!userLocation || !location?.latitude) return null;
        return calculateDistance(userLocation.latitude, userLocation.longitude, location.latitude, location.longitude);
    };

    const isNearLocation = (location) => {
        const distance = getDistanceToLocation(location);
        return distance !== null && distance <= CHECKIN_RADIUS_METERS;
    };
    
    const getCheckInsForLocation = (locationId) => {
        if (!allCheckIns) return [];
        return allCheckIns.filter(c => c.location_id === locationId && c.is_active && c.user_email !== user.email);
    };

    const handleCheckIn = async (location) => {
        setCheckingIn(true);
        if (myActiveCheckIn) {
            await base44.entities.CheckIn.update(myActiveCheckIn.id, { is_active: false, checked_out_at: new Date().toISOString() });
        }
        await base44.entities.CheckIn.create({
            user_email: user.email,
            user_name: user.full_name,
            user_photo: user.photo_url,
            user_gender: user.gender,
            user_bio: user.bio,
            user_private_mode: user.private_mode || false,
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

    // =========================================================
    // SECTION 3: THE BOUNCER (RETURNS START HERE)
    // =========================================================

    // 1. Still Loading Auth? Show Spinner.
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    // 2. Not Logged In? Show Landing Page.
    if (!user) {
        return <Landing />;
    }

    // 3. Incomplete Profile? Redirect.
    if (!user.gender || !user.full_name) {
        // Use standard redirect to avoid router conflicts
        window.location.href = '/profile-setup';
        return null; 
    }

    // 4. Main App Render (Logged In & Valid)
    const isFemale = user.gender === 'female';
    const locationCheckIns = selectedLocation ? getCheckInsForLocation(selectedLocation.id) : [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            <div className="max-w-lg mx-auto px-4 py-6 pb-24">
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
                
                {matchedPings.length > 0 && !selectedLocation && (
                    <div className="mb-6"><MatchNotifications matches={matchedPings} onDismiss={() => refetchMatches()} /></div>
                )}
                {myPings.length > 0 && !selectedLocation && (
                    <div className="mb-6"><PingNotifications pings={myPings} onDismiss={() => refetchPings()} /></div>
                )}

                <AnimatePresence mode="wait">
                    {!selectedLocation ? (
                         <motion.div key="locations" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
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
                         </motion.div>
                    ) : (
                        <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                            <div className="relative rounded-2xl overflow-hidden h-48">
                                <img src={selectedLocation.image_url || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800'} className="w-full h-full object-cover" alt={selectedLocation.name} />
                            </div>
                            
                            {myActiveCheckIn?.location_id !== selectedLocation.id ? (
                                isNearLocation(selectedLocation) ? (
                                    <Button onClick={() => handleCheckIn(selectedLocation)} disabled={checkingIn} className="w-full h-14 bg-amber-500 text-black font-bold rounded-xl">
                                        {checkingIn ? 'Checking In...' : 'Check In Here'}
                                    </Button>
                                ) : (
                                    <div className="p-4 bg-slate-800 rounded-xl text-center text-slate-400">Too far to check in</div>
                                )
                            ) : (
                                <Button onClick={handleCheckOut} disabled={checkingOut} variant="outline" className="w-full h-14 border-red-500 text-red-400">
                                    {checkingOut ? 'Leaving...' : 'Leave Location'}
                                </Button>
                            )}

                            {isFemale && (
                                <div className="space-y-4">
                                    <h3 className="text-white font-bold flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500"/> People Here</h3>
                                    <UserGrid 
                                        users={locationCheckIns} 
                                        currentUser={user} 
                                        locationId={selectedLocation.id} 
                                        locationName={selectedLocation.name}
                                        existingPings={sentPings}
                                        onPingSent={() => { refetchSentPings(); refetchMatches(); }}
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
