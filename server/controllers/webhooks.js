import { Webhook } from 'svix';
import User from '../models/user.js';
import Purchase from '../models/purchase.js';
import Stripe from 'stripe';
import Course from '../models/course.js';

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

// Clerk webhook
export const clerkWebhooks = async (req, res) => {
  try {
    console.log('📩 Clerk Webhook received');

    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    await whook.verify(JSON.stringify(req.body), {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    });

    const { data, type } = req.body;

    switch (type) {
      case 'user.created':
      case 'user.updated': {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0]?.email_address || '',
          name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          imageUrl: data.image_url || '',
        };
        await User.findByIdAndUpdate(data.id, userData, { upsert: true, new: true });
        console.log(`✅ User ${type === 'user.created' ? 'created' : 'updated'}: ${userData.email}`);
        break;
      }

      case 'user.deleted':
        await User.findByIdAndDelete(data.id);
        console.log(`🗑️ User deleted: ${data.id}`);
        break;

      default:
        console.log(`ℹ️ Unhandled Clerk event type: ${type}`);
    }

    res.status(200).json({});
  } catch (error) {
    console.error('❌ Clerk Webhook error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Enhanced Stripe webhook with better debugging
export const stripeWebhooks = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOKS_SECRET
    );
  } catch (err) {
    console.error("❌ Stripe signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`📦 Stripe Event: ${event.type}`);
  console.log(`📋 Event ID: ${event.id}`);

  if (event.type === 'checkout.session.completed') {
    try {
      const session = event.data.object;
      
      // Enhanced debugging
      console.log(`🔍 Session ID: ${session.id}`);
      console.log(`🔍 Session metadata:`, JSON.stringify(session.metadata, null, 2));
      console.log(`🔍 Session payment_status: ${session.payment_status}`);
      console.log(`🔍 Session status: ${session.status}`);
      
      const purchaseId = session.metadata?.purchaseId;

      if (!purchaseId) {
        console.error("⚠️ purchaseId missing in metadata");
        console.log("Available metadata keys:", Object.keys(session.metadata || {}));
        return res.json({ received: true });
      }

      console.log(`🔍 Processing purchase: ${purchaseId}`);

      // Check if purchase exists and log current status
      const purchaseData = await Purchase.findById(purchaseId);
      if (!purchaseData) {
        console.error("⚠️ Purchase not found in database:", purchaseId);
        // Try to find purchase with different query methods
        const allPurchases = await Purchase.find({}).select('_id status');
        console.log("📋 Available purchases:", allPurchases.map(p => ({ id: p._id.toString(), status: p.status })));
        return res.json({ received: true });
      }

      console.log(`📋 Current purchase status: ${purchaseData.status}`);
      console.log(`📋 Purchase details:`, {
        id: purchaseData._id,
        userId: purchaseData.userId,
        courseId: purchaseData.courseId,
        status: purchaseData.status,
        createdAt: purchaseData.createdAt
      });

      // Only update if payment is actually successful
      if (session.payment_status === 'paid') {
        // Update purchase status
        const previousStatus = purchaseData.status;
        purchaseData.status = 'completed';
        const savedPurchase = await purchaseData.save();
        
        console.log(`✅ Purchase status updated from '${previousStatus}' to '${savedPurchase.status}'`);
        console.log(`✅ Purchase ${purchaseId} marked as completed`);

        // Verify the update worked
        const updatedPurchase = await Purchase.findById(purchaseId);
        console.log(`🔍 Verification - Updated purchase status: ${updatedPurchase?.status}`);

        // Get user & course with better error handling
        const [userData, courseData] = await Promise.all([
          User.findById(purchaseData.userId),
          Course.findById(purchaseData.courseId)
        ]);

        if (!userData) {
          console.error(`⚠️ User not found: ${purchaseData.userId}`);
        } else {
          console.log(`👤 User found: ${userData.email}`);
        }

        if (!courseData) {
          console.error(`⚠️ Course not found: ${purchaseData.courseId}`);
        } else {
          console.log(`📚 Course found: ${courseData.title || courseData.name || 'Unnamed Course'}`);
        }

        // Handle course enrollment
        if (courseData && userData) {
          let courseUpdated = false;
          let userUpdated = false;

          if (!courseData.enrolledStudents.includes(userData._id)) {
            courseData.enrolledStudents.push(userData._id);
            await courseData.save();
            courseUpdated = true;
            console.log(`✅ User added to course enrolled students`);
          } else {
            console.log(`ℹ️ User already enrolled in course`);
          }

          if (!userData.enrolledCourses.includes(courseData._id)) {
            userData.enrolledCourses.push(courseData._id);
            await userData.save();
            userUpdated = true;
            console.log(`✅ Course added to user enrolled courses`);
          } else {
            console.log(`ℹ️ Course already in user's enrolled courses`);
          }

          console.log(`🎉 Enrollment completed for purchase ${purchaseId} (Course: ${courseUpdated}, User: ${userUpdated})`);
        }
      } else {
        console.log(`⚠️ Payment not completed yet. Payment status: ${session.payment_status}`);
      }

    } catch (error) {
      console.error("❌ Error processing checkout.session.completed:", error);
      console.error("❌ Error stack:", error.stack);
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    try {
      const paymentIntent = event.data.object;
      const purchaseId = paymentIntent.metadata?.purchaseId;

      console.log(`💳 Payment failed for purchase: ${purchaseId}`);

      if (purchaseId) {
        const purchaseData = await Purchase.findById(purchaseId);
        if (purchaseData) {
          const previousStatus = purchaseData.status;
          purchaseData.status = 'failed';
          await purchaseData.save();
          console.log(`❌ Purchase ${purchaseId} status updated from '${previousStatus}' to 'failed'`);
        } else {
          console.error(`⚠️ Purchase not found for failed payment: ${purchaseId}`);
        }
      }
    } catch (error) {
      console.error("❌ Error processing payment_intent.payment_failed:", error);
    }
  }

  res.json({ received: true });
};