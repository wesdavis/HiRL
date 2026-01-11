import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify admin access
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Get or create a location
        let location = (await base44.asServiceRole.entities.Location.filter({ is_active: true }))[0];
        if (!location) {
            // Create a dummy location if none exist
            location = await base44.asServiceRole.entities.Location.create({
                name: 'Test Lounge',
                address: '123 Test St, Test City',
                category: 'lounge',
                latitude: 34.052235,
                longitude: -118.243683,
                is_active: true
            });
        }

        // Test users data
        const testUsers = [
            {
                email: 'west9@protonmail.com',
                full_name: 'Sarah Martinez',
                gender: 'female',
                seeking: 'male',
                bio: 'Coffee addict & adventure seeker ☕️✨',
                age: 26,
                star_sign: 'Leo',
                is_verified: true,
                private_mode: false,
                photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'
            },
            {
                email: 'cloud989_2000@yahoo.com',
                full_name: 'Jessica Chen',
                gender: 'female',
                seeking: 'male',
                bio: 'Artist & music lover 🎨🎵',
                age: 24,
                star_sign: 'Gemini',
                is_verified: true,
                private_mode: false,
                photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'
            },
            {
                email: 'statafarion@me.com',
                full_name: 'Mike Thompson',
                gender: 'male',
                seeking: 'female',
                bio: 'Fitness enthusiast & foodie 💪🍜',
                age: 28,
                star_sign: 'Aries',
                is_verified: false,
                private_mode: false,
                photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
            }
        ];

        const createdUsers = [];
        const createdCheckIns = [];

        for (const userData of testUsers) {
            // Try to invite the user (will fail silently if already exists)
            try {
                await base44.users.inviteUser(userData.email, 'user');
                createdUsers.push({ ...userData, status: 'invited' });
            } catch (error) {
                // User likely already exists
                createdUsers.push({ ...userData, status: 'existing' });
            }

            // Remove any existing active check-ins for this user
            const existingCheckIns = await base44.asServiceRole.entities.CheckIn.filter({
                user_email: userData.email,
                is_active: true
            });
            for (const checkIn of existingCheckIns) {
                await base44.asServiceRole.entities.CheckIn.update(checkIn.id, {
                    is_active: false,
                    checked_out_at: new Date().toISOString()
                });
            }

            // Create new check-in
            const checkIn = await base44.asServiceRole.entities.CheckIn.create({
                user_email: userData.email,
                user_name: userData.full_name,
                user_photo: userData.photo_url,
                user_gender: userData.gender,
                user_bio: userData.bio,
                user_private_mode: userData.private_mode,
                location_id: location.id,
                location_name: location.name,
                is_active: true
            });
            createdCheckIns.push(checkIn);
        }

        return Response.json({
            success: true,
            message: `Test squad generated at ${location.name}. Note: Test users must complete registration via invite email to appear in app.`,
            users: createdUsers,
            checkIns: createdCheckIns,
            location: {
                id: location.id,
                name: location.name
            }
        });

    } catch (error) {
        console.error('Seed error:', error);
        return Response.json({ 
            success: false, 
            error: error.message 
        }, { status: 200 });
    }
});