import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    lectureId: { type: String, required: true },
    lectureTitle: { type: String, required: true },
    lectureDuration: { type: Number, required: true },
    lectureUrl: { type: String, required: true },
    isPreviewFree: { type: Boolean, required: true },
    lectureOrder: { type: Number, required: true }
}, { _id: false });

const chapterSchema = new mongoose.Schema({
    chapterId: { type: String, required: true },
    chapterTitle: { type: String, required: true },
    chapterOrder: { type: Number, required: true },
    chapterContent: [lectureSchema]
}, { _id: false });

const ratingSchema = new mongoose.Schema({
    userId: { type: String, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 }
}, { _id: false });

const courseSchema = new mongoose.Schema({
    courseTitle: { type: String, required: true },
    courseDescription: { type: String, required: true },
    courseThumbnail: { type: String, required: true },
    coursePrice: { type: Number, required: true },
    isPublished: { type: Boolean, default: false },
    discount: { type: Number, required: true },
    courseContent: [chapterSchema],
    educator: { type: String, ref: 'User', required: true },
    enrolledStudents: { type: [String], default: [], ref: 'User' },
    courseRatings: [ratingSchema],
}, { timestamps: true, minimize: false });

export default mongoose.model('Course', courseSchema);

