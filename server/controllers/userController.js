import User from '../models/user.js';
import Course from '../models/course.js';
import Purchase from '../models/purchase.js';
import Stripe from 'stripe';
import CourseProgress from '../models/courseProgress.js';

// ===============================
// Get logged-in user data
// ===============================
export const getUserData = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('❌ Error in getUserData:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// Get enrolled courses for user
// ===============================
export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth().userId;
  
    const userData = await User.findById(userId).populate('enrolledCourses');

    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, enrolledCourses: userData.enrolledCourses });
  } catch (error) {
    console.error('❌ Error in userEnrolledCourses:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// Initiate Purchase Session
// ===============================
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth().userId;

    if (!courseId || !userId) {
      return res.status(400).json({ success: false, message: 'Course ID and authentication required' });
    }

    // Check if user is already enrolled in this course
    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (userData.enrolledCourses && userData.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this course' });
    }

    const courseData = await Course.findById(courseId);
    if (!courseData) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const grossPrice = Number(courseData.coursePrice);
    const discountPct = Number(courseData.discount) || 0;
    const netAmount = Number((grossPrice - (discountPct * grossPrice) / 100).toFixed(2));

    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount: netAmount,
      status: 'pending',
      createdAt: new Date()
    };
    
    console.log('Creating purchase with data:', purchaseData);
    const newPurchase = await Purchase.create(purchaseData);
    console.log('Purchase created successfully:', newPurchase._id);

    // Stripe gateway
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    console.log('Stripe instance created, creating checkout session...');

    // Create Stripe session
    const currency = process.env.CURRENCY?.toLowerCase() || 'usd';
    console.log('Using currency:', currency);
   
    const line_items = [{
      price_data: {
        currency,
        product_data: {
          name: courseData.courseTitle
        },
        unit_amount: Math.round(Number(newPurchase.amount) * 100)
      },
      quantity: 1
    }];

    console.log('Line items created:', line_items);
    console.log('Creating Stripe session with metadata:', {
      purchaseId: newPurchase._id.toString(),
      userId: userId,
      courseId: courseData._id.toString()
    });

    // Session creation
    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}/`,
      line_items: line_items,
      mode: 'payment',
      metadata: {
        purchaseId: newPurchase._id.toString(),
        userId: userId,
        courseId: courseData._id.toString()
      }
    });
    
    console.log('Stripe session created successfully:', session.id);
    res.json({ success: true, session_url: session.url });

  } catch (error) {
    console.error('❌ Error in purchaseCourse:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update User Course Progress
export const updateUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const { courseId, lectureId } = req.body;

    if (!courseId || !lectureId) {
      return res.status(400).json({ success: false, message: 'Course ID and Lecture ID are required' });
    }

    const progressData = await CourseProgress.findOne({ userId, courseId });
    
    // Check if the user is enrolled in the course
    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return res.json({ success: true, message: 'Lecture already completed' });
      }
      progressData.lectureCompleted.push(lectureId);
      await progressData.save();
    } else {
      await CourseProgress.create({ 
        userId,
        courseId,
        lectureCompleted: [lectureId] 
      });
    }

    res.json({ success: true, message: 'Lecture progress updated successfully' });
  } catch (error) {
    console.error('❌ Error in updateUserCourseProgress:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user course progress
export const getUserCourseProgress = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const { courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({ success: false, message: 'User ID and Course ID are required' });
    }

    const progressData = await CourseProgress.findOne({ userId, courseId });

    if (!progressData) {
      return res.status(404).json({ success: false, message: 'No progress found for this course' });
    }

    res.json({ success: true, progressData });
  } catch (error) {
    console.error('❌ Error in getUserCourseProgress:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add user rating to course
export const addUserRating = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const { courseId, rating } = req.body;

    if (!userId || !courseId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID, Course ID, and a valid Rating (1-5) are required' 
      });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const user = await User.findById(userId);
    if (!user || !user.enrolledCourses.includes(courseId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'User not found or not enrolled in this course' 
      });
    }

    const existingRatingIndex = course.courseRatings.findIndex(r => r.userId === userId);

    if (existingRatingIndex > -1) {
      // User has already rated this course, update the rating
      course.courseRatings[existingRatingIndex].rating = rating;
    } else {
      // User has not rated this course yet, add a new rating
      course.courseRatings.push({ userId, rating });
    }

    await course.save();
    
    res.json({ success: true, message: 'Rating added/updated successfully' });
  } catch (error) {
    console.error('❌ Error in addUserRating:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete user profile after Clerk signup
export const completeUserProfile = async (req, res) => {
    try {
        const userId = req.auth().userId;
        const { name, imageUrl } = req.body;

        // Validate required fields
        if (!name || name.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        // Check if user already exists
        let user = await User.findById(userId);

        if (!user) {
            // Create new user if doesn't exist (first time)
            user = await User.create({
                _id: userId,
                name: name.trim(),
                email: req.auth().sessionClaims?.email || 'unknown@email.com',
                imageUrl: imageUrl || '',
                isProfileComplete: true,
                profileCompletedAt: new Date(),
                enrolledCourses: []
            });
            
            console.log('✅ New user created:', user._id);
        } else {
            // Update existing user
            user.name = name.trim();
            if (imageUrl) user.imageUrl = imageUrl;
            user.isProfileComplete = true;
            user.profileCompletedAt = new Date();
            
            await user.save();
            console.log('✅ User profile updated:', user._id);
        }

        res.json({
            success: true,
            message: 'Profile completed successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                imageUrl: user.imageUrl,
                isProfileComplete: user.isProfileComplete
            }
        });

    } catch (error) {
        console.error('❌ Error in completeUserProfile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get user profile completion status
export const getUserProfileStatus = async (req, res) => {
    try {
        const userId = req.auth().userId;
        
        const user = await User.findById(userId);
        
        if (!user) {
            return res.json({
                success: true,
                profileComplete: false,
                message: 'User not found in database'
            });
        }

        res.json({
            success: true,
            profileComplete: user.isProfileComplete || false,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                imageUrl: user.imageUrl,
                isProfileComplete: user.isProfileComplete
            }
        });

    } catch (error) {
        console.error('❌ Error in getUserProfileStatus:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get profile status'
        });
    }
};
