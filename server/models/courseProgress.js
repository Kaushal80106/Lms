import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema({
    userId: { 
        type: String, 
        ref: 'User',
        required: true 
    },
    courseId: { 
        type: String, 
        ref: 'Course',
        required: true 
    },
    completed: { 
        type: Boolean, 
        default: false 
    },
    lectureCompleted: [{
        type: String,
        required: true
    }],
    lastAccessedAt: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true,
    minimize: false 
});

// Create compound index for efficient queries
courseProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);

export default CourseProgress;