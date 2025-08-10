import express from 'express' 
import cors from 'cors' 
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks } from './controllers/webhooks.js'



const app = express() 

await connectDB()

// middlewares

app.use(cors()) 
app.use(express.json());

// routes
app.get('/',(req,res)=> res.send("API working")) 

app.post('/clerk',express.json(),clerkWebhooks)

const PORT  = process.env.PORT || 5000 


app.listen(PORT , ()=>{
    console.log(`server is running on port ${PORT}`)
})