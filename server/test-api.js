// Simple test script to verify backend API endpoints
import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

const testEndpoints = async () => {
    console.log('🧪 Testing Backend API Endpoints...\n');

    try {
        // Test 1: Basic server health
        console.log('1️⃣ Testing server health...');
        const healthResponse = await axios.get(`${BASE_URL}/`);
        console.log('✅ Server health:', healthResponse.data);
    } catch (error) {
        console.log('❌ Server health failed:', error.message);
    }

    try {
        // Test 2: Get all courses
        console.log('\n2️⃣ Testing get all courses...');
        const coursesResponse = await axios.get(`${BASE_URL}/api/course/all`);
        console.log('✅ Get courses:', coursesResponse.data.success ? 'Success' : 'Failed');
        if (coursesResponse.data.success) {
            console.log(`   Found ${coursesResponse.data.courses.length} courses`);
        }
    } catch (error) {
        console.log('❌ Get courses failed:', error.message);
    }

    try {
        // Test 3: Test educator routes (without auth)
        console.log('\n3️⃣ Testing educator routes (should fail without auth)...');
        const educatorResponse = await axios.get(`${BASE_URL}/api/educator/courses`);
        console.log('❌ Educator routes should require auth');
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('✅ Educator routes properly protected (401 Unauthorized)');
        } else {
            console.log('❌ Unexpected error:', error.message);
        }
    }

    console.log('\n🎯 Backend API test completed!');
    console.log('📝 Check the console above for results.');
};

// Run tests
testEndpoints().catch(console.error);
