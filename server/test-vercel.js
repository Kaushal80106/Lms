// Simple test script to verify Vercel deployment
// Run this locally to test your API endpoints

const testAPI = async () => {
  const baseURL = 'https://your-backend-domain.vercel.app'; // Replace with your actual Vercel URL
  
  try {
    // Test health check
    console.log('🔍 Testing health check...');
    const healthResponse = await fetch(`${baseURL}/`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check response:', healthData);
    
    // Test API routes
    console.log('\n🔍 Testing API routes...');
    const apiResponse = await fetch(`${baseURL}/api/courses`);
    const apiData = await apiResponse.json();
    console.log('✅ API response:', apiData);
    
    console.log('\n🎉 All tests passed! Your Vercel deployment is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure to:');
    console.log('1. Replace the baseURL with your actual Vercel domain');
    console.log('2. Set up all required environment variables in Vercel');
    console.log('3. Deploy your project to Vercel');
  }
};

// Run the test
testAPI();
