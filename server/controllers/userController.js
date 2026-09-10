import User from '../models/user.js';
import Course from '../models/course.js';
import Purchase from '../models/purchase.js';
import Stripe from 'stripe';
import CourseProgress from '../models/courseProgress.js';
import { clerkClient } from '@clerk/express';
import mongoose from 'mongoose';

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

const getClientUrl = (req) =>
  req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5175';

const getAuthUserId = (req) => {
  const userId = req.auth()?.userId;
  if (!userId) throw new Error('Authentication required');
  return userId;
};

const ensureUserExists = async (req) => {
  const userId = getAuthUserId(req);
  let user = await User.findById(userId);

  if (!user) {
    let email = 'unknown@email.com';
    let name = 'Anonymous User';
    let imageUrl = '';

    try {
      const clerkUser = await clerkClient.users.getUser(userId);
      email = clerkUser.emailAddresses[0]?.emailAddress || email;
      name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || clerkUser.username || name;
      imageUrl = clerkUser.imageUrl || '';
    } catch {
      const claims = req.auth().sessionClaims || {};
      email = claims.email || email;
      name = claims.name || claims.full_name || name;
      imageUrl = claims.image_url || '';
    }

    user = await User.create({
      _id: userId,
      email,
      name,
      imageUrl,
      isProfileComplete: true,
      enrolledCourses: [],
    });
  }

  return user;
};

const completePurchase = async ({ purchaseId, userId, courseId, stripeSessionId, paymentIntentId }) => {
  const mongoSession = await mongoose.startSession();
  mongoSession.startTransaction();
  try {
    const purchase = await Purchase.findById(purchaseId).session(mongoSession);
    if (!purchase || purchase.status === 'completed') {
      await mongoSession.commitTransaction();
      return purchase;
    }

    await Purchase.findByIdAndUpdate(
      purchaseId,
      {
        status: 'completed',
        completedAt: new Date(),
        paymentIntentId,
        stripeSessionId,
      },
      { session: mongoSession }
    );

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { enrolledCourses: courseId } },
      { session: mongoSession }
    );

    await Course.findByIdAndUpdate(
      courseId,
      { $addToSet: { enrolledStudents: userId } },
      { session: mongoSession }
    );

    await mongoSession.commitTransaction();
    return purchase;
  } catch (error) {
    await mongoSession.abortTransaction();
    throw error;
  } finally {
    mongoSession.endSession();
  }
};

const isEnrolled = (user, courseId) =>
  user?.enrolledCourses?.some((id) => String(id) === String(courseId));

// ===============================
// Get logged-in user data
// ===============================
export const getUserData = async (req, res) => {
  try {
    const user = await ensureUserExists(req);

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
    await ensureUserExists(req);
    const userData = await User.findById(req.auth().userId).populate('enrolledCourses');

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
    const userId = getAuthUserId(req);
    const clientUrl = getClientUrl(req);

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID required' });
    }

    const userData = await ensureUserExists(req);
    if (isEnrolled(userData, courseId)) {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this course' });
    }

    const courseData = await Course.findById(courseId);
    if (!courseData) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const grossPrice = Number(courseData.coursePrice);
    const discountPct = Number(courseData.discount) || 0;
    const netAmount = Number((grossPrice - (discountPct * grossPrice) / 100).toFixed(2));

    if (netAmount < 0.5) {
      return res.status(400).json({ success: false, message: 'Course price must be at least $0.50' });
    }

    const newPurchase = await Purchase.create({
      courseId: courseData._id,
      userId,
      amount: netAmount,
      status: 'pending',
    });

    const currency = process.env.CURRENCY?.toLowerCase() || 'usd';

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${clientUrl}/loading/my-enrollments?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/`,
      line_items: [{
        price_data: {
          currency,
          product_data: { name: courseData.courseTitle },
          unit_amount: Math.round(netAmount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      metadata: {
        purchaseId: newPurchase._id.toString(),
        userId,
        courseId: courseData._id.toString(),
      },
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error('❌ Error in purchaseCourse:', error);
    const status = error.message === 'Authentication required' ? 401 : 500;
    res.status(status).json({ success: false, message: error.message });
  }
};

export const verifyPurchase = async (req, res) => {
  try {
    const { session_id: sessionId } = req.query;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: 'Session ID required' });
    }

    const session = await stripeInstance.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ success: false, message: 'Payment not completed' });
    }

    const { purchaseId, userId, courseId } = session.metadata || {};
    if (!purchaseId || !userId || !courseId) {
      return res.status(400).json({ success: false, message: 'Invalid checkout session' });
    }

    const authUserId = req.auth()?.userId;
    if (authUserId && authUserId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized purchase verification' });
    }

    await completePurchase({
      purchaseId,
      userId,
      courseId,
      stripeSessionId: session.id,
      paymentIntentId: session.payment_intent,
    });

    res.json({ success: true, message: 'Purchase verified and enrollment completed' });
  } catch (error) {
    console.error('❌ Error in verifyPurchase:', error);
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
