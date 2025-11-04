import { collection, addDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../config/firebase';

export const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...');

        // 1. Create Admin Users
        console.log('Creating admin users...');
        
        const admins = [
            {
                email: 'admin@safesphere.com',
                password: 'admin123456',
                name: 'Admin User',
                phone: '555-0100',
                unit: 'Admin Office'
            },
            {
                email: 'superadmin@safesphere.com',
                password: 'super123456',
                name: 'Super Admin',
                phone: '555-0200',
                unit: 'Admin Office'
            }
        ];

        for (const admin of admins) {
            try {
                const adminUser = await createUserWithEmailAndPassword(
                    auth,
                    admin.email,
                    admin.password
                );

                await setDoc(doc(db, 'users', adminUser.user.uid), {
                    name: admin.name,
                    email: admin.email,
                    role: 'admin',
                    phone: admin.phone,
                    unit: admin.unit,
                    createdAt: serverTimestamp()
                });
                console.log(`✅ Admin created: ${admin.name}`);
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    console.log(`⚠️ Admin already exists: ${admin.name}`);
                } else {
                    console.error(`Error creating ${admin.name}:`, error);
                }
            }
        }

        // 2. Create Sample Residents
        console.log('Creating sample residents...');
        const residents = [
            { email: 'john.doe@example.com', password: 'password123', name: 'John Doe', unit: 'A-101', phone: '555-0101' },
            { email: 'jane.smith@example.com', password: 'password123', name: 'Jane Smith', unit: 'A-102', phone: '555-0102' },
            { email: 'mike.wilson@example.com', password: 'password123', name: 'Mike Wilson', unit: 'B-201', phone: '555-0103' }
        ];

        for (const resident of residents) {
            try {
                const userCred = await createUserWithEmailAndPassword(
                    auth,
                    resident.email,
                    resident.password
                );

                await setDoc(doc(db, 'users', userCred.user.uid), {
                    name: resident.name,
                    email: resident.email,
                    role: 'resident',
                    phone: resident.phone,
                    unit: resident.unit,
                    createdAt: serverTimestamp()
                });
                console.log(`✅ Created resident: ${resident.name}`);
            } catch (error) {
                if (error.code === 'auth/email-already-in-use') {
                    console.log(`⚠️ Resident already exists: ${resident.name}`);
                }
            }
        }

        // 3. Add Emergency Contacts
        console.log('Adding emergency contacts...');
        const contacts = [
            {
                name: 'Security Office',
                type: 'Security',
                phone: '555-SECURITY',
                email: 'security@safesphere.com',
                icon: '🔒',
                unit: 'Ground Floor'
            },
            {
                name: 'Maintenance Team',
                type: 'Maintenance',
                phone: '555-MAINTAIN',
                email: 'maintenance@safesphere.com',
                icon: '🔧',
                unit: 'Basement'
            },
            {
                name: 'Emergency Services',
                type: 'Emergency',
                phone: '911',
                email: 'emergency@local.gov',
                icon: '🚨',
                unit: 'External'
            },
            {
                name: 'Building Manager',
                type: 'Management',
                phone: '555-MANAGER',
                email: 'manager@safesphere.com',
                icon: '👔',
                unit: 'Office 1'
            },
            {
                name: 'Front Desk',
                type: 'Reception',
                phone: '555-FRONTDESK',
                email: 'frontdesk@safesphere.com',
                icon: '📞',
                unit: 'Lobby'
            },
            {
                name: 'Ambulance',
                type: 'Medical',
                phone: '911',
                email: 'ambulance@local.gov',
                icon: '🚑',
                unit: 'External'
            },
            {
                name: 'Fire Department',
                type: 'Fire',
                phone: '911',
                email: 'fire@local.gov',
                icon: '🚒',
                unit: 'External'
            },
            {
                name: 'Police Department',
                type: 'Police',
                phone: '911',
                email: 'police@local.gov',
                icon: '👮',
                unit: 'External'
            }
        ];

        for (const contact of contacts) {
            await addDoc(collection(db, 'contacts'), {
                ...contact,
                createdAt: serverTimestamp()
            });
            console.log(`✅ Added contact: ${contact.name}`);
        }

        // 4. Add Sample Help Posts
        console.log('Adding sample help posts...');
        const helpPosts = [
            {
                title: 'Need help moving furniture',
                description: 'Moving a heavy couch to the 3rd floor. Could use an extra pair of hands this weekend.',
                category: 'General',
                status: 'open',
                userEmail: 'john.doe@example.com',
                userId: 'sample-user-1'
            },
            {
                title: 'Lost cat - Orange tabby',
                description: 'My orange tabby cat "Whiskers" has been missing since yesterday. Last seen near building B.',
                category: 'Community',
                status: 'open',
                userEmail: 'jane.smith@example.com',
                userId: 'sample-user-2'
            },
            {
                title: 'Leaking pipe in bathroom',
                description: 'Water is leaking from the bathroom ceiling. Need urgent maintenance assistance.',
                category: 'Maintenance',
                status: 'open',
                userEmail: 'mike.wilson@example.com',
                userId: 'sample-user-3'
            },
            {
                title: 'Organizing community BBQ',
                description: 'Planning a community BBQ next Saturday. Looking for volunteers to help organize!',
                category: 'Community',
                status: 'open',
                userEmail: 'john.doe@example.com',
                userId: 'sample-user-1'
            }
        ];

        for (const post of helpPosts) {
            await addDoc(collection(db, 'helpPosts'), {
                ...post,
                createdAt: serverTimestamp()
            });
            console.log(`✅ Added help post: ${post.title}`);
        }

        // 5. Add Sample Emergency (resolved)
        console.log('Adding sample emergency records...');
        await addDoc(collection(db, 'emergencies'), {
            type: 'Security',
            userId: 'sample-user-1',
            userEmail: 'john.doe@example.com',
            status: 'resolved',
            timestamp: serverTimestamp(),
            notes: 'Suspicious person reported - Security responded and resolved'
        });
        console.log('✅ Added sample emergency record');

        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📋 Summary:');
        console.log('\n👑 ADMIN ACCOUNTS:');
        console.log('1. admin@safesphere.com / admin123456');
        console.log('2. superadmin@safesphere.com / super123456');
        console.log('\n👥 USER ACCOUNTS:');
        console.log('- 3 Sample residents created');
        console.log('\n📊 DATA:');
        console.log('- 8 Emergency contacts added');
        console.log('- 4 Help board posts added');
        console.log('- 1 Emergency record added');

        return {
            success: true,
            message: 'Database seeded successfully'
        };

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        return {
            success: false,
            error: error.message
        };
    }
};
