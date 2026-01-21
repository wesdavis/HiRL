import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Mail, ArrowRight, Lock } from 'lucide-react';
import { toast } from 'sonner';

export default function Auth() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // SIMULATE NETWORK DELAY
        setTimeout(() => {
            // Create a fake user object
            const mockUser = {
                id: 'local-user-123',
                email: email || 'test@example.com',
                full_name: 'Local Developer',
                gender: 'male',
                seeking: 'female',
                bio: 'I am running in local mode.',
                photo_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800'
            };

            // Call the Local Context function
            login(mockUser);
            
            toast.success('Signed in (Local Mode)');
            // Small delay to ensure state propagates
            setTimeout(() => {
                navigate('/');
            }, 100);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/20 mb-4">
                        <Zap className="w-8 h-8 text-amber-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Local Login</h1>
                    <p className="text-slate-400">Enter any email. No password needed.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-slate-300 text-sm font-medium mb-2 block">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="bg-white/5 border-white/10 text-white h-14 rounded-xl"
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-xl"
                    >
                        {loading ? 'Entering App...' : 'Enter App'}
                    </Button>
                </form>
            </div>
        </div>
    );
}