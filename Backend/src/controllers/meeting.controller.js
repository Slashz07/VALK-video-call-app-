// import { Meeting } from "../models/meeting.model.js";
// import { apiResponse } from "../utilities/apiResponse.js";
// import { wrapper } from "../utilities/wrapper.js";


// const updateMeetingHistory=wrapper(async (req,res)=>{
//     const {meetingCode}=req.body
//     const newMeeting=await Meeting.create({
//         meetingCode,
//         userId:req.user._id
//     })
//     return res.status(httpStatus.OK).json(
//         new apiResponse(httpStatus.OK,newMeeting,"meeting history updated successfully")
//     )
// })

// export {updateMeetingHistory}