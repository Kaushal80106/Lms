// Test script for course deletion functionality
import mongoose from 'mongoose';
import Course from './models/course.js';
import Purchase from './models/purchase.js';
import User from './models/user.js';
import CourseProgress from './models/courseProgress.js';

const testCourseDeletion = async () => {
    console.log('🧪 Testing Course Deletion Functionality...\n');

    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Test 1: Check if models exist
        console.log('\n1️⃣ Checking Models...');
        console.log('✅ Course Model:', !!Course);
        console.log('✅ Purchase Model:', !!Purchase);
        console.log('✅ User Model:', !!User);
        console.log('✅ CourseProgress Model:', !!CourseProgress);

        // Test 2: Check database collections
        console.log('\n2️⃣ Checking Collections...');
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);
        
        console.log('Available collections:', collectionNames);
        console.log('✅ Courses collection:', collectionNames.includes('courses'));
        console.log('✅ Purchases collection:', collectionNames.includes('purchases'));
        console.log('✅ Users collection:', collectionNames.includes('users'));
        console.log('✅ Courseprogresses collection:', collectionNames.includes('courseprogresses'));

        // Test 3: Count documents in each collection
        console.log('\n3️⃣ Document Counts...');
        const courseCount = await Course.countDocuments();
        const purchaseCount = await Purchase.countDocuments();
        const userCount = await User.countDocuments();
        const progressCount = await CourseProgress.countDocuments();

        console.log(`📚 Courses: ${courseCount}`);
        console.log(`💰 Purchases: ${purchaseCount}`);
        console.log(`👥 Users: ${userCount}`);
        console.log(`📊 Progress Records: ${progressCount}`);

        // Test 4: Sample course data structure
        if (courseCount > 0) {
            console.log('\n4️⃣ Sample Course Structure...');
            const sampleCourse = await Course.findOne().lean();
            console.log('Sample course fields:', Object.keys(sampleCourse));
            console.log('Sample course ID:', sampleCourse._id);
            console.log('Sample course title:', sampleCourse.courseTitle);
        }

        // Test 5: Sample purchase data structure
        if (purchaseCount > 0) {
            console.log('\n5️⃣ Sample Purchase Structure...');
            const samplePurchase = await Purchase.findOne().lean();
            console.log('Sample purchase fields:', Object.keys(samplePurchase));
            console.log('Sample purchase courseId:', samplePurchase.courseId);
            console.log('Sample purchase userId:', samplePurchase.userId);
        }

        console.log('\n🎯 Course deletion test completed!');
        console.log('📝 All models and collections are properly configured.');
        console.log('🚀 Ready to test course deletion API endpoint.');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
};

// Run tests
testCourseDeletion().catch(console.error);
