import { User } from "../models/user.model.js";
import { apiError } from "../utilities/apiError.js";
import { wrapper } from "../utilities/wrapper.js";
import jwt from "jsonwebtoken";
import httpStatus from "http-status";
import {apiResponse} from "../utilities/apiResponse.js"
import { Meeting } from "../models/meeting.model.js";

const generateAccessAndRefreshTokens = async (user) => {
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

const register = wrapper(async (req, res) => {
    const { fullName, userName, password } = req.body;

    
  if ([fullName, userName, password].some((field) => field?.trim() === "" || field === undefined)) {
    throw new apiError(400, "All fields are required to be filled")
  }
  const userNameTaken = await User.findOne({
    userName
  })
  if (userNameTaken) {
    throw new apiError(409, "This userName is already taken")
  }

    const user = await User.create({
        fullName,
        userName,
        password
    });

    if (!user) {
        throw new apiError(httpStatus.BAD_REQUEST, "Error creating user in database");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);
  
    if(!(accessToken&&refreshToken)){
        throw new apiError(httpStatus.BAD_REQUEST,"Error creating the tokens ")
    }

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(httpStatus.CREATED)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(httpStatus.CREATED,user,"User registered and Logged in successfully" )
        );

});

const login = wrapper(async (req, res) => {
    const { userName, password } = req.body;
    let user = await User.findOne({ userName });
    if (!user) {
        throw new apiError(httpStatus.NOT_FOUND, "User not found with provided userName");
    }
    const isPasswordCorrect=await user.checkPassword(password)
    if (!isPasswordCorrect) {
        throw new apiError(httpStatus.UNAUTHORIZED, "Incorrect password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);
  
    if(!(accessToken&&refreshToken)){
        throw new apiError(httpStatus.BAD_REQUEST,"Error creating the tokens for user authentication")
    }

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(httpStatus.OK)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(httpStatus.OK,user,"Login successful" )
        );
});

const refreshAccessToken = wrapper(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken;
    if (!incomingRefreshToken) {
        throw new apiError(httpStatus.UNAUTHORIZED, "User session does not exist");
    }

    const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedRefreshToken._id);

    if (incomingRefreshToken !== user.refreshToken) {
        throw new apiError(httpStatus.FORBIDDEN, "Incorrect refresh token");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user);

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(httpStatus.OK)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(httpStatus.OK,user,"Access token refreshed successfully" )
        );
});

const getCurrentUser=wrapper(async (req,res)=>{
    return res.status(httpStatus.OK)
    .json(
        new apiResponse(httpStatus.OK,req.user,"User loggedIn details fetched")
    )
})

const getUserHistory=wrapper(async (req,res)=>{
    const meetings=await Meeting.find({
        userId:req.user._id
    })

    return res.status(httpStatus.OK).json(
        new apiResponse(httpStatus.OK,meetings,"Meeting history fetched")
    )
})

const updateMeetingHistory=wrapper(async (req,res)=>{
    const {meetingCode}=req.body
    const newMeeting=await Meeting.create({
        meetingCode,
        userId:req.user._id
    })
    return res.status(httpStatus.OK).json(
        new apiResponse(httpStatus.OK,newMeeting,"meeting history updated successfully")
    )
})


const logout = wrapper(async (req, res) => {
    console.log("logout ran")
    const user= await User.findByIdAndUpdate(
        req.user._id,
        { $unset: { refreshToken: 1 } },
        { new: true }
    );

    const options = {
        secure: true,
        httpOnly: true
    };

    return res.status(httpStatus.OK)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new apiResponse(httpStatus.OK,{},"Logout successful")
    )

});

export {
    register,
    login,
    refreshAccessToken,
    getCurrentUser,
    getUserHistory,
    updateMeetingHistory,
    logout
};
