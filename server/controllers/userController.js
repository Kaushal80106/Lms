import User from '../models/user.js';
import Stripe from 'stripe';
import Purchase from '../models/purchase.js';
import Course from '../models/course.js';

// Get logged-in user data
export const getUserData = async (req, res) => {
  try {
    const userId = req.auth().userId;
    console.log(`🔍 Getting user data for: ${userId}`);
    
    const user = await User.findById(userId);

    if (!user) {
      console.log(`❌ User not found: ${userId}`);
      return res.json({ success: false, message: 'User not found' });
    }

    console.log(`✅ User data retrieved for: ${user.email}`);
    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    return res.json({ success: false, message: error.message });
  }
};

// Get enrolled courses for user
export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth().userId;
    console.log(`🔍 Getting enrolled courses for user: ${userId}`);
    
    const userData = await User.findById(userId).populate('enrolledCourses');

    if (!userData) {
      console.log(`❌ User not found: ${userId}`);
      return res.json({ success: false, message: 'User not found' });
    }

    console.log(`✅ Found ${userData.enrolledCourses?.length || 0} enrolled courses for user`);
    res.json({ success: true, enrolledCourses: userData.enrolledCourses });
  } catch (error) {
    console.error('❌ Error getting enrolled courses:', error);
    return res.json({ success: false, message: error.message });
  }
};

// Purchase course
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth().userId;

    console.log(`🛒 Purchase attempt - User: ${userId}, Course: ${courseId}`);
    console.log(`🌐 Origin: ${origin}`);

    // Validate inputs
    if (!courseId) {
      console.log(`❌ Missing courseId in request`);
      return res.json({ success: false, message: 'Course ID is required' });
    }

    if (!userId) {
      console.log(`❌ Missing userId from auth`);
      return res.json({ success: false, message: 'Authentication required' });
    }

    const [userData, courseData] = await Promise.all([
      User.findById(userId),
      Course.findById(courseId)
    ]);

    if (!userData) {
      console.log(`❌ User not found: ${userId}`);
      return res.json({ success: false, message: 'User not found' });
    }

    if (!courseData) {
      console.log(`❌ Course not found: ${courseId}`);
      return res.json({ success: false, message: 'Course not found' });
    }

    console.log(`👤 User: ${userData.email}`);
    console.log(`📚 Course: ${courseData.courseTitle}`);
    console.log(`💰 Course Price: ${courseData.coursePrice}, Discount: ${courseData.discount}%`);

    // Check if user is already enrolled
    if (userData.enrolledCourses && userData.enrolledCourses.includes(courseId)) {
      console.log(`⚠️ User already enrolled in course`);
      return res.json({ success: false, message: 'Already enrolled in this course' });
    }

    // Check if there's already a pending purchase for this user/course
    const existingPurchase = await Purchase.findOne({
      userId,
      courseId,
      status: 'pending'
    });

    if (existingPurchase) {
      console.log(`⚠️ Existing pending purchase found: ${existingPurchase._id}`);
      // You might want to reuse this purchase or cancel it and create a new one
    }

    // Calculate final amount
    const originalPrice = courseData.coursePrice;
    const discountAmount = (courseData.discount * originalPrice) / 100;
    const finalAmount = Number((originalPrice - discountAmount).toFixed(2));

    console.log(`💰 Price calculation - Original: ${originalPrice}, Discount: ${discountAmount}, Final: ${finalAmount}`);

    // Create purchase in DB with status pending
    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount: finalAmount,
      status: 'pending'
    };

    console.log(`📝 Creating purchase record:`, purchaseData);

    const newPurchase = await Purchase.create(purchaseData);
    
    console.log(`✅ Purchase record created with ID: ${newPurchase._id}`);
    console.log(`📋 Purchase details:`, {
      id: newPurchase._id.toString(),
      userId: newPurchase.userId,
      courseId: newPurchase.courseId.toString(),
      amount: newPurchase.amount,
      status: newPurchase.status,
      createdAt: newPurchase.createdAt
    });

    // Stripe instance
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
    const currency = process.env.CURRENCY?.toLowerCase() || 'usd';

    console.log(`💳 Using currency: ${currency}`);

    // Validate amount for Stripe (minimum 50 cents/paise)
    const stripeAmount = Math.round(finalAmount * 100);
    if (stripeAmount < 50) {
      console.log(`❌ Amount too small for Stripe: ${stripeAmount} ${currency}`);
      return res.json({ success: false, message: 'Amount too small for processing' });
    }

    console.log(`💳 Stripe amount (in cents/paise): ${stripeAmount}`);

    // Stripe line items
    const line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: courseData.courseTitle,
            description: `Course purchase - ${courseData.courseTitle}`
          },
          unit_amount: stripeAmount
        },
        quantity: 1
      }
    ];

    console.log(`📦 Line items:`, JSON.stringify(line_items, null, 2));

    // Create checkout session with purchaseId in metadata
    const sessionData = {
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}`,
      line_items,
      mode: 'payment',
      metadata: {
        purchaseId: newPurchase._id.toString(),
        userId: userId,
        courseId: courseId
      },
      customer_email: userData.email
    };

    console.log(`🔧 Creating Stripe session with metadata:`, sessionData.metadata);

    const session = await stripeInstance.checkout.sessions.create(sessionData);

    console.log(`✅ Stripe session created: ${session.id}`);
    console.log(`🔗 Checkout URL: ${session.url}`);

    // Optionally update the purchase record with Stripe session ID
    newPurchase.stripeSessionId = session.id;
    await newPurchase.save();

    console.log(`🎉 Purchase flow initiated successfully`);

    res.json({ success: true, session_url: session.url, purchaseId: newPurchase._id });
  } catch (error) {
    console.error('❌ Error in purchaseCourse:', error);
    console.error('❌ Error stack:', error.stack);
    return res.json({ success: false, message: error.message });
  }
};