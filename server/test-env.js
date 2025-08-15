import 'dotenv/config';

console.log('🔍 Environment Variables Check:');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Set' : '❌ Missing');
console.log('CLERK_WEBHOOK_SECRET:', process.env.CLERK_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing');
console.log('STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing');
console.log('STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing');
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Missing');
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

// Test if we can import the server
try {
    console.log('\n🧪 Testing server imports...');
    import('./server.js').then(() => {
        console.log('✅ Server imports successfully');
    }).catch(error => {
        console.log('❌ Server import failed:', error.message);
    });
} catch (error) {
    console.log('❌ Import error:', error.message);
}
