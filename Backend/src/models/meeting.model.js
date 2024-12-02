import mongoose,{Schema} from "mongoose";

const meetingSchema=new Schema({
    userId:{
        type:String
    },
    meetingCode:{
        type:String,
        required:true
    },
    date:{
        default:Date.now,
        type:Date,
        required:true
    }
})

meetingSchema.index({ date: 1 }, { expireAfterSeconds: 3600*24*2 });


export const Meeting=mongoose.model("Meeting",meetingSchema)