
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
    {
        _id: { type: String, required: true },
        name: { type: String, required: false, default: 'Anonymous User' },
        email: { type: String, required: true },
        imageUrl: { type: String, required: false, default: '' },
        isProfileComplete: { type: Boolean, default: false },
        profileCompletedAt: { type: Date },
        
        enrolledCourses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course'
            }
        ],
    }, 
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User 