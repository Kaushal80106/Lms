import User from '../models/user.js';
import Course from '../models/course.js';
import Purchase from '../models/purchase.js';
import Stripe from 'stripe';


// ===============================
// Get logged-in user data
// ===============================
export const getUserData = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: 'User not found' });
    }

    // Explicitly include imgUrl in the response
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
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
    return res.json({ success: false, message: 'User not found' });
    }

   res.json({ success: true, enrolledCourses: userData.enrolledCourses });
  } catch (error) {
   res.json({ success: false, message: error.message });
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
      return res.json({ success: false, message: 'Course ID and authentication required' });
    }

    const [userData, courseData] = await Promise.all([
      User.findById(userId),
      Course.findById(courseId)
    ]);

    if (!userData) return res.json({ success: false, message: 'User not found' });
    if (!courseData) return res.json({ success: false, message: 'Course not found' });

    // Already enrolled

   

     const purchaseData = {
        courseId:courseData._id ,
        userId,
        amount:(courseData.coursePrice - courseData
            .discount * courseData.coursePrice / 100
        ).toFixed(2),
     }
      const newPurchase = await Purchase.create(purchaseData)
      

      // stripe gatway 
      const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY )

    // Create Stripe session
    const currency = process.env.CURRENCY?.toLowerCase() || 'usd';
   
     const line_items = [{
        price_data:{
            currency,
            product_data:{
                name:courseData.courseTitle
            },
            unit_amount:Math.floor(newPurchase.amount)*100 
        },
        quantity:1
     }]

     //session creation 
      const session = await stripeInstance.checkout.sessions.create({
        success_url : `${origin}/loading/my-enrollments` ,
        cancel_url: `${origin}/` ,
        line_items:line_items,
        mode:'payment',
        metadata:{
            purchaseId: newPurchase._id.toString()
        }
      })
    
    res.json({ success: true, session_url: session.url });

  } catch (error) {
    console.error('❌ Error in purchaseCourse:', error);
    res.json({ success: false, message: error.message });
  }
};
