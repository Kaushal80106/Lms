import { Webhook } from "svix";
import User from "../models/user.js";
import Purchase from "../models/purchase.js";
import Stripe from 'stripe';
import course from "../models/course.js";
import { server1 } from "svix/dist/openapi/servers.js";


export const clerkWebhooks = async (req, res) => {
    try {
        console.log("Webhook received:", req.body);
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
        await whook.verify(JSON.stringify(req.body), {
            "svix-id": req.headers["svix-id"],
            "svix-timestamp": req.headers["svix-timestamp"],
            "svix-signature": req.headers["svix-signature"]
        });

        const { data, type } = req.body;

        switch (type) {
            case 'user.created': {
                const userData = {
                    _id: data.id,
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                };
                await User.findByIdAndUpdate(
                    data.id,
                    userData,
                    { upsert: true, new: true }
                );
                console.log("User created or updated:", userData.email);
                return res.status(200).json({});
            }
            case 'user.updated': {
                const userData = {
                    email: data.email_addresses[0].email_address,
                    name: data.first_name + " " + data.last_name,
                    imageUrl: data.image_url,
                };
                await User.findByIdAndUpdate(data.id, userData);
                console.log("User updated:", userData.email);
                return res.status(200).json({});
            }
            case 'user.deleted': {
                await User.findByIdAndDelete(data.id);
                console.log("User deleted:", data.id);
                return res.status(200).json({});
            }
            default:
                console.log("Unhandled webhook type:", type);
                return res.status(200).json({});
        }
    } catch (error) {
        console.error("Webhook error:", error);
        return res.status(500).json({ success: false, message: error.message })
    }
}


const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY) 

export const stripeWebhooks = async (req , res) =>{
    const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = Stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOKS_SECRET);
  }
  catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
  }

    switch (event.type) {
    case 'payment_intent.succeeded':{
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id ;
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent:paymentIntentId
      })
const { purchaseId } = session.data[0].metadata ;
const purchaseData = await Purchase.findById(purchaseId) 
const userData = await User.findById(purchaseData.userId)
const courseData = await Course.findById(purchaseData.courseid.toString())

courseData.enrolledStudents.push(userData) 
await courseData.save() 

userData.enrolledCourses.push(courseData._id)
await userData.save() 

purchaseData.status = 'completed' 
await purchaseData.save() 

break;
}
    case 'payment_intent.payment_failed':{
     
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id ;
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent:paymentIntentId
      })
      const { purchaseId } = session.data[0].metadata ;
      const purchaseData = await Purchase.findById(purchaseId) 
      purchaseData.status = 'failed' 
      await purchaseData.save()

      break;
    }
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  response.json({received: true});
}