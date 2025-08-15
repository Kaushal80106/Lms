import { Webhook } from "svix";
import User from "../models/user.js";
import Purchase from "../models/purchase.js";
import Stripe from 'stripe';
import Course from "../models/course.js";
import mongoose from 'mongoose';

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
        return res.status(500).json({ success: false, message: error.message });
    }
};

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;

    try {
        event = Stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Stripe signature verification failed:', err.message);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const sessionObj = event.data.object;
                const { purchaseId, userId, courseId } = sessionObj.metadata || {};
                console.log('🔄 Processing checkout.session.completed:', { purchaseId, userId, courseId });
                
                if (!purchaseId || !userId || !courseId) {
                    console.warn('Missing metadata on checkout.session.completed', sessionObj.id);
                    break;
                }

                const mongoSession = await mongoose.startSession();
                mongoSession.startTransaction();
                try {
                    const existingPurchase = await Purchase.findById(purchaseId).session(mongoSession);
                    if (!existingPurchase) {
                        console.warn('Purchase not found for webhook', purchaseId);
                        await mongoSession.abortTransaction();
                        break;
                    }

                    if (existingPurchase.status === 'completed') {
                        console.log('Purchase already completed, skipping idempotently', purchaseId);
                        await mongoSession.commitTransaction();
                        break;
                    }

                    console.log('✅ Updating purchase status to completed');
                    await Purchase.findByIdAndUpdate(
                        purchaseId,
                        {
                            status: 'completed',
                            completedAt: new Date(),
                            paymentIntentId: sessionObj.payment_intent,
                            stripeSessionId: sessionObj.id
                        },
                        { new: true, session: mongoSession }
                    );

                    console.log('✅ Adding course to user enrolled courses');
                    await User.findByIdAndUpdate(
                        userId,
                        { $addToSet: { enrolledCourses: courseId } },
                        { new: true, session: mongoSession }
                    );

                    console.log('✅ Adding user to course enrolled students');
                    await Course.findByIdAndUpdate(
                        courseId,
                        { $addToSet: { enrolledStudents: userId } },
                        { new: true, session: mongoSession }
                    );

                    await mongoSession.commitTransaction();
                    console.log('✅ Successfully processed checkout.session.completed for purchase', purchaseId);
                } catch (err) {
                    await mongoSession.abortTransaction();
                    console.error('❌ Error during transactional webhook handling:', err);
                    throw err;
                } finally {
                    mongoSession.endSession();
                }
                break;
            }
            case 'payment_intent.succeeded': {
                // Fallback in case Stripe fires only the PI event; derive session and process similarly
                const paymentIntent = event.data.object;
                const paymentIntentId = paymentIntent.id;
                console.log('🔄 Processing payment_intent.succeeded:', paymentIntentId);
                
                const sessions = await stripeInstance.checkout.sessions.list({ payment_intent: paymentIntentId });
                const sessionObj = sessions?.data?.[0];
                const { purchaseId, userId, courseId } = sessionObj?.metadata || {};
                if (!purchaseId || !userId || !courseId) {
                    console.warn('Missing metadata for payment_intent.succeeded', paymentIntentId);
                    break;
                }

                const mongoSession = await mongoose.startSession();
                mongoSession.startTransaction();
                try {
                    const existingPurchase = await Purchase.findById(purchaseId).session(mongoSession);
                    if (!existingPurchase || existingPurchase.status === 'completed') {
                        console.log('Purchase already completed or not found, skipping', purchaseId);
                        await mongoSession.commitTransaction();
                        break;
                    }

                    console.log('✅ Updating purchase status to completed via payment_intent.succeeded');
                    await Purchase.findByIdAndUpdate(
                        purchaseId,
                        {
                            status: 'completed',
                            completedAt: new Date(),
                            paymentIntentId: paymentIntentId,
                            stripeSessionId: sessionObj?.id
                        },
                        { new: true, session: mongoSession }
                    );

                    console.log('✅ Adding course to user enrolled courses via payment_intent.succeeded');
                    await User.findByIdAndUpdate(
                        userId,
                        { $addToSet: { enrolledCourses: courseId } },
                        { new: true, session: mongoSession }
                    );

                    console.log('✅ Adding user to course enrolled students via payment_intent.succeeded');
                    await Course.findByIdAndUpdate(
                        courseId,
                        { $addToSet: { enrolledStudents: userId } },
                        { new: true, session: mongoSession }
                    );

                    await mongoSession.commitTransaction();
                    console.log('✅ Successfully processed payment_intent.succeeded for purchase', purchaseId);
                } catch (err) {
                    await mongoSession.abortTransaction();
                    console.error('❌ Error during transactional PI handling:', err);
                    throw err;
                } finally {
                    mongoSession.endSession();
                }
                break;
            }
            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object;
                const paymentIntentId = paymentIntent.id;
                const sessions = await stripeInstance.checkout.sessions.list({ payment_intent: paymentIntentId });
                const metadata = sessions?.data?.[0]?.metadata;
                const purchaseId = metadata?.purchaseId;
                if (!purchaseId) break;

                await Purchase.findByIdAndUpdate(
                    purchaseId,
                    { status: 'failed', failedAt: new Date(), paymentIntentId: paymentIntentId },
                    { new: true }
                );
                console.log('⚠️ Marked purchase as failed', purchaseId);
                break;
            }
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return response.json({ received: true });
    } catch (err) {
        console.error('❌ Webhook handling error:', err);
        return response.status(500).json({ success: false });
    }
};