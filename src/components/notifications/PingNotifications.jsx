import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, User, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { base44 } from '@/api/base44Client';
import moment from 'moment';

export default function PingNotifications({ pings, onDismiss }) {
    const handleMarkSeen = async (ping) => {
        await base44.entities.Ping.update(ping.id, { status: 'seen' });
        onDismiss(ping.id);
    };

    if (pings.length === 0) return null;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
                <Zap className="w-5 h-5" />
                <h3 className="font-semibold">New Pings</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-xs">{pings.length}</span>
            </div>
            <AnimatePresence>
                {pings.map((ping) => (
                    <motion.div
                        key={ping.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="backdrop-blur-xl bg-white/5 rounded-xl border border-white/10 p-4"
                    >
                        <div className="flex items-center gap-3">
                            {ping.from_user_photo ? (
                                <img
                                    src={ping.from_user_photo}
                                    alt={ping.from_user_name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/30"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                                    <User className="w-6 h-6 text-slate-500" />
                                </div>
                            )}
                            <div className="flex-1">
                                <p className="text-white font-medium">{ping.from_user_name || 'Someone'}</p>
                                <p className="text-slate-400 text-sm">
                                    pinged you at {ping.location_name}
                                </p>
                                <p className="text-slate-500 text-xs mt-0.5">
                                    {moment(ping.created_date).fromNow()}
                                </p>
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleMarkSeen(ping)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}