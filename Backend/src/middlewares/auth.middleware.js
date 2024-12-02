import jwt, { decode } from "jsonwebtoken"
import { wrapper } from "../utilities/wrapper.js"
import { apiError } from "../utilities/apiError.js"
import { User } from "../models/user.model.js"

const verifyJwt=wrapper(async (req,res,next)=>{
    const accessToken=req.cookies?.accessToken
    if(!accessToken){
        throw new apiError(400,"User doesnt have an account,please register first")
    }
    const decodedToken=jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
    const user=await User.findById(decodedToken._id)
    req.user=user
    next()
})

export {verifyJwt}