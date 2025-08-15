import mongoose  from "mongoose";

const PurchaseSchema = new mongoose.Schema({

    courseId:{type:mongoose.Schema.Types.ObjectId,
        ref:'Course',
        required:true 
    },
    userId:{
        type:String,
        ref:'User',
        required:true
    },
    amount:{type:Number,required:true} ,
    status :{type:String,enum:['pending','completed',
        'failed' ] ,default:'pending'},
    // payment bookkeeping
    paymentIntentId: { type: String },
    stripeSessionId: { type: String },
    completedAt: { type: Date },
    failedAt: { type: Date }
},{timestamps:true}) ;
 const Purchase = mongoose.model('Purchase',PurchaseSchema)
export default  Purchase