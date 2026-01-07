import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Verify admin access
        const user = await base44.auth.me();
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // Get first active location
        const locations = await base44.asServiceRole.entities.Location.filter({ is_active: true });
        if (locations.length === 0) {
            return Response.json({ error: 'No active locations found' }, { status: 400 });
        }
        const location = locations[0];

        // Test users data
        const testUsers = [
            {
                email: 'sarah_test@hirl.com',
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
                email: 'jessica_test@hirl.com',
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
                email: 'mike_test@hirl.com',
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
            // Check if user already exists
            const existingUsers = await base44.asServiceRole.entities.User.filter({ 
                email: userData.email 
            });

            let userId;
            if (existingUsers.length > 0) {
                // Update existing user
                userId = existingUsers[0].id;
                await base44.asServiceRole.entities.User.update(userId, userData);
                createdUsers.push({ ...userData, id: userId, status: 'updated' });
            } else {
                // Create new user
                const newUser = await base44.asServiceRole.entities.User.create(userData);
                userId = newUser.id;
                createdUsers.push({ ...userData, id: userId, status: 'created' });
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
            message: `Test squad generated at ${location.name}`,
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
            error: error.message,
            details: error.stack 
        }, { status: 500 });
    }
});