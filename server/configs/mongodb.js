import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('✅ Database Connected'))
        mongoose.connection.on('error', (err) => console.error('❌ Database connection error:', err))
        mongoose.connection.on('disconnected', () => console.log('⚠️ Database disconnected'))
        
        await mongoose.connect(`${process.env.MONGODB_URI}/lms`)
        console.log('📊 Connected to MongoDB database: lms')
    } catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error.message)
        throw error
    }
}

export default connectDB 