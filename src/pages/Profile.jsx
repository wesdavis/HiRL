import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, Save, User, Zap, MapPin, LogOut, Eye, EyeOff } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { useAuth } from '@/components/AuthContext';

export default function Profile() {
    const { user, logout } = useAuth();
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                bio: user.bio || '',
                seeking: user.seeking || 'everyone',
                gender: user.gender || '',
                full_name: user.full_name || '',
                photo_url: user.photo_url || '',
                age: user.age || '',
                private_mode: user.private_mode || false
            });
        }
    }, [user]);

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        setUploading(true);
        setTimeout(() => {
            const mockUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800';
            setFormData(prev => ({ ...prev, photo_url: mockUrl }));
            toast.success('Photo uploaded (mock)');
            setUploading(false);
        }, 500);
    };

    const handleSave = async () => {
        setSaving(true);
        setTimeout(() => {
            const updatedUser = { ...user, ...formData };
            localStorage.setItem('local_user', JSON.stringify(updatedUser));
            toast.success('Profile updated!');
            setSaving(false);
        }, 500);
    };

    const handleLogout = () => {
        logout();
    };

    if (!user) return <div className='min-h-screen bg-slate-950' />;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
            <div className="max-w-lg mx-auto px-4 py-6 pb-24">
                <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-6 mb-6"
                >
                    {/* Photo Upload */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative mb-4">
                            {formData.photo_url ? (
                                <img
                                    src={formData.photo_url}
                                    alt="Profile"
                                    className="w-28 h-28 rounded-full object-cover border-4 border-amber-500/30"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-full bg-white/10 flex items-center justify-center">
                                    <User className="w-12 h-12 text-slate-500" />
                                </div>
                            )}
                            <label className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-colors">
                                <Upload className="w-5 h-5 text-black" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        {uploading && <p className="text-amber-400 text-sm">Uploading...</p>}
                        <h2 className="text-xl font-bold text-white">{user?.full_name}</h2>
                        <p className="text-slate-400 text-sm">{user?.email}</p>
                        <div className="mt-2 px-3 py-1 rounded-full bg-white/10 text-slate-300 text-sm capitalize">
                            {user?.gender}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                            <MapPin className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">0</p>
                            <p className="text-slate-400 text-sm">Check-ins</p>
                        </div>
                        <div className="bg-white/5 rounded-xl p-4 text-center">
                            <Zap className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                            <p className="text-2xl font-bold text-white">0</p>
                            <p className="text-slate-400 text-sm">Pings Received</p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-4">
                        <div>
                            <Label className="text-slate-300 mb-2 block">Age</Label>
                            <Input
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || '' }))}
                                className="bg-white/5 border-white/10 text-white h-12 rounded-xl"
                            />
                        </div>
                        <div>
                            <Label className="text-slate-300 mb-2 block">Bio</Label>
                            <Textarea
                                value={formData.bio}
                                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                placeholder="Tell others about yourself..."
                                className="bg-white/5 border-white/10 text-white rounded-xl resize-none"
                                rows={3}
                            />
                        </div>
                        
                        {/* Seeking Preference */}
                        {user?.gender === 'female' && (
                            <div>
                                <Label className="text-slate-300 mb-2 block">Seeking</Label>
                                <Select
                                    value={formData.seeking}
                                    onValueChange={(v) => setFormData(prev => ({ ...prev, seeking: v }))}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl">
                                        <SelectValue placeholder="Select preference" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                        <SelectItem value="everyone">Everyone</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Private Mode Toggle */}
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                            <div className="flex items-center gap-3">
                                {formData.private_mode ? (
                                    <EyeOff className="w-5 h-5 text-slate-400" />
                                ) : (
                                    <Eye className="w-5 h-5 text-green-400" />
                                )}
                                <div>
                                    <p className="text-white font-medium">Private Mode</p>
                                    <p className="text-slate-400 text-sm">
                                        {formData.private_mode 
                                            ? "You're hidden from discovery" 
                                            : "You're visible to others"}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={formData.private_mode}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, private_mode: checked }))}
                            />
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold rounded-xl"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </motion.div>

                {/* Logout */}
                <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full h-12 border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-xl"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                </Button>
            </div>
        </div>
    );
}