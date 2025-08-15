import { clerkClient } from '@clerk/express';
import { safeCloudinaryUpload, isCloudinaryAvailable } from '../configs/cloudinary.js';
import Course from '../models/course.js';
import Purchase from '../models/purchase.js';
import User from '../models/user.js';
import mongoose from 'mongoose';
import CourseProgress from '../models/courseProgress.js';

export const updateRoleToEducator = async (req, res) => {
    try {
        const userId = req.auth().userId;

        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                role: 'educator',
            }
        });

        res.status(200).json({ success: true, message: 'You can publish a course now' });
    } catch (error) {
        console.error('❌ Error in updateRoleToEducator:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Add new course
export const addCourse = async (req, res) => {
    try {
        console.log('🔄 Starting addCourse function');
        console.log('📁 Request file:', req.file);
        console.log('📝 Request body:', req.body);
        
        const imageFile = req.file;
        const educatorId = req.auth().userId;

        if (!imageFile) {
            console.log('❌ No image file found in request');
            return res.status(400).json({ success: false, message: 'Thumbnail not attached' });
        }

        console.log('✅ Image file received:', {
            originalname: imageFile.originalname,
            size: imageFile.size,
            mimetype: imageFile.mimetype
        });

        // Check if Cloudinary is available
        if (!isCloudinaryAvailable()) {
            console.log('❌ Cloudinary not available');
            return res.status(500).json({ 
                success: false, 
                message: 'Image upload service is not available. Please try again later.' 
            });
        }

        // Parse all course data from courseContent key
        let courseData;
        try {
            courseData = JSON.parse(req.body.courseContent);
            console.log('✅ Course data parsed successfully:', courseData);
        } catch (err) {
            console.log('❌ PARSE ERROR:', err, req.body.courseContent);
            return res.status(400).json({ success: false, message: 'Invalid courseContent format' });
        }

        const {
            courseTitle,
            courseDescription,
            coursePrice,
            discount,
            courseContent
        } = courseData;

        // Validate required fields
        if (!courseTitle || !courseDescription || !courseContent || courseContent.length === 0) {
            console.log('❌ Missing required fields:', { courseTitle, courseDescription, courseContentLength: courseContent?.length });
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: title, description, and at least one chapter required' 
            });
        }

        console.log('🔄 Uploading image to Cloudinary...');
        
        // Upload image to Cloudinary using safe function (with Buffer from memory storage)
        const imageUpload = await safeCloudinaryUpload(imageFile.buffer);
        console.log('✅ Image uploaded to Cloudinary:', imageUpload.secure_url);

        console.log('🔄 Creating course in database...');
        
        // Create a new course
        const newCourse = await Course.create({
            courseTitle,
            courseDescription,
            courseThumbnail: imageUpload.secure_url,
            coursePrice: Number(coursePrice),
            isPublished: true,
            discount: Number(discount),
            courseContent,
            educator: educatorId,
            enrolledStudents: [],
            courseRatings: []
        });

        console.log('✅ Course created successfully:', newCourse._id);

        // Note: File cleanup skipped in serverless environment (Vercel)
        console.log('✅ Course created successfully');

        res.status(201).json({ success: true, message: 'Course Added', course: newCourse });

    } catch (error) {
        console.error('❌ Error in addCourse:', error);
        
        // Note: File cleanup skipped in serverless environment (Vercel)
        
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get educator courses
export const getEducatorCourses = async (req, res) => {
    try {
        const educator = req.auth().userId;

        const courses = await Course.find({ educator });

        res.json({ success: true, courses });
    } catch (error) {
        console.error('❌ Error in getEducatorCourses:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get educator dashboard data
export const educatorDashboardData = async (req, res) => {
    try {
        const educator = req.auth().userId;

        const courses = await Course.find({ educator });
        const totalCourses = courses.length;

        const courseIds = courses.map(course => course._id);

        // Calculate total earnings from purchase
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        });

        const totalEarnings = purchases.reduce((sum, purchase) => sum + purchase.amount, 0);

        // Collect unique enrolled students id with course title
        const enrolledStudentsData = [];
        for (const course of courses) {
            const students = await User.find({
                _id: { $in: course.enrolledStudents }
            }, 'name imageUrl');

            students.forEach(student => {
                enrolledStudentsData.push({
                    courseTitle: course.courseTitle,
                    student
                });
            });
        }

        res.json({
            success: true,
            dashboardData: {
                totalEarnings,
                enrolledStudentsData,
                totalCourses
            }
        });

    } catch (error) {
        console.error('❌ Error in educatorDashboardData:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get enrolled students data with purchase data
export const getEnrolledStudentsData = async (req, res) => {
    try {
        console.log('🔄 Fetching enrolled students data...');
        const educator = req.auth().userId;
        
        // Get all courses by this educator
        const courses = await Course.find({ educator });
        console.log(`📚 Found ${courses.length} courses for educator`);
        
        if (courses.length === 0) {
            console.log('ℹ️ No courses found for educator');
            return res.json({ 
                success: true, 
                enrolledStudents: [],
                message: 'No courses found. Create a course first to see enrolled students.'
            });
        }

        const courseIds = courses.map(course => course._id);
        console.log(`🔍 Looking for purchases in courses:`, courseIds);
        
        // Find all completed purchases for these courses
        const purchases = await Purchase.find({
            courseId: { $in: courseIds },
            status: 'completed'
        }).populate('userId', 'name imageUrl email').populate('courseId', 'courseTitle courseThumbnail');
        
        console.log(`💰 Found ${purchases.length} completed purchases`);
        
        // Group purchases by student to avoid duplicates
        const studentMap = new Map();
        
        purchases.forEach(purchase => {
            const studentId = purchase.userId._id.toString();
            
            if (!studentMap.has(studentId)) {
                studentMap.set(studentId, {
                    student: purchase.userId,
                    courses: [],
                    totalSpent: 0,
                    firstEnrollment: purchase.createdAt,
                    lastEnrollment: purchase.createdAt
                });
            }
            
            const studentData = studentMap.get(studentId);
            studentData.courses.push({
                courseTitle: purchase.courseId.courseTitle,
                courseThumbnail: purchase.courseId.courseThumbnail,
                purchaseDate: purchase.createdAt,
                amount: purchase.amount
            });
            studentData.totalSpent += purchase.amount;
            
            if (purchase.createdAt < studentData.firstEnrollment) {
                studentData.firstEnrollment = purchase.createdAt;
            }
            if (purchase.createdAt > studentData.lastEnrollment) {
                studentData.lastEnrollment = purchase.createdAt;
            }
        });
        
        // Convert map to array and format data
        const enrolledStudents = Array.from(studentMap.values()).map((studentData, index) => ({
            id: index + 1,
            student: studentData.student,
            courses: studentData.courses,
            totalSpent: studentData.totalSpent,
            firstEnrollment: studentData.firstEnrollment,
            lastEnrollment: studentData.lastEnrollment,
            totalCourses: studentData.courses.length
        }));
        
        console.log(`👥 Returning ${enrolledStudents.length} unique enrolled students`);
        
        res.json({ 
            success: true, 
            enrolledStudents,
            summary: {
                totalStudents: enrolledStudents.length,
                totalCourses: courses.length,
                totalPurchases: purchases.length,
                totalRevenue: purchases.reduce((sum, p) => sum + p.amount, 0)
            }
        });

    } catch (error) {
        console.error('❌ Error in getEnrolledStudentsData:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch enrolled students data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete course and all related data
export const deleteCourse = async (req, res) => {
    try {
        console.log('🔄 Starting deleteCourse function...');
        const educator = req.auth().userId;
        const { courseId } = req.params;

        if (!courseId) {
            return res.status(400).json({
                success: false,
                message: 'Course ID is required'
            });
        }

        // Find the course and verify ownership
        const course = await Course.findById(courseId);
        
        if (!course) {
            console.log('❌ Course not found:', courseId);
            return res.status(404).json({
                success: false,
                message: 'Course not found'
            });
        }

        // Verify the educator owns this course
        if (course.educator !== educator) {
            console.log('❌ Unauthorized: Educator does not own this course');
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own courses'
            });
        }

        console.log('✅ Course ownership verified, proceeding with deletion...');

        // Start a database session for transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Delete all purchases related to this course
            const purchaseResult = await Purchase.deleteMany(
                { courseId: courseId },
                { session }
            );
            console.log(`🗑️ Deleted ${purchaseResult.deletedCount} purchases`);

            // 2. Delete all course progress records
            const progressResult = await CourseProgress.deleteMany(
                { courseId: courseId },
                { session }
            );
            console.log(`🗑️ Deleted ${progressResult.deletedCount} progress records`);

            // 3. Remove course from all users' enrolledCourses arrays
            const userUpdateResult = await User.updateMany(
                { enrolledCourses: courseId },
                { $pull: { enrolledCourses: courseId } },
                { session }
            );
            console.log(`👥 Updated ${userUpdateResult.modifiedCount} users' enrolled courses`);

            // 4. Delete the course itself
            const courseResult = await Course.findByIdAndDelete(courseId, { session });
            console.log('✅ Course deleted successfully');

            // Commit the transaction
            await session.commitTransaction();
            console.log('✅ Transaction committed successfully');

            res.json({
                success: true,
                message: 'Course deleted successfully',
                deletedData: {
                    course: courseResult._id,
                    purchases: purchaseResult.deletedCount,
                    progressRecords: progressResult.deletedCount,
                    updatedUsers: userUpdateResult.modifiedCount
                }
            });

        } catch (error) {
            // If any operation fails, abort the transaction
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('❌ Error in deleteCourse:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete course',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

