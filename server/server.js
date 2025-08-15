import express from 'express';
import cors from 'cors' 
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js'

const app = express() 

await connectDB()
await connectCloudinary()

// middlewares

app.use(cors()) 
// Stripe webhook must receive the raw body for signature verification
app.post('/stripe', express.raw({type:'application/json'}), stripeWebhooks)
// JSON parser for the rest of the API
app.use(express.json());
app.use(clerkMiddleware()) ;

// routes
app.get('/',(req,res)=> res.send("API working")) 

app.post('/clerk',express.json(),clerkWebhooks)
app.use('/api/educator',express.json(),educatorRouter) 
app.use('/api/course',express.json(),courseRouter)
app.use('/api/user',express.json(),userRouter)
// (Stripe route already registered above to preserve raw body)

// port 
const PORT  = process.env.PORT || 5000 

app.listen(PORT , ()=>{
    console.log(`server is running on port ${PORT}`)
})