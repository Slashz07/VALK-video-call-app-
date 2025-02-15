import mongoose,{ Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema=new Schema({
    fullName:{
        type:String,
        required:true
    },
    userName:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    refreshToken:{
        type:String
    },
    userImg:{
        type: String,
        default:"https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg",
        set:(img)=>img==="" ? "https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg":img
    },
    userImgId:{
        type:String
    }
})

userSchema.pre("save",async function (next){

    if(!this.isModified("password")) return next()

   this.password= await bcrypt.hash(this.password,10)
   next()
})

userSchema.methods.checkPassword=async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function (){
    return jwt.sign(
        {
            _id:this._id,
            fullName:this.fullName,
            userName:this.userName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken=function (){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model("User",userSchema)