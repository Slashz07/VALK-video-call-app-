import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

import dotenv from 'dotenv';
dotenv.config( {
  path:"../.env"
});


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (uploadFileUrl) => {
  try {
    if (!uploadFileUrl) return null
    console.log("cloudinary ran!")
    const response = await cloudinary.uploader.upload(uploadFileUrl, {//object here is used to set the upload options for the resource being uploaded
      
      resource_type: 'auto'//resource type tells what type of resource is being uploaded like it can be a video,image type etc,setting it "auto" means it detects the resource type on its own
    })

    fs.unlinkSync(uploadFileUrl)
    console.log(response)
    return response//we can access the url of the saved video from response.url

  } catch {
    fs.unlinkSync(uploadFileUrl)
    return null
  }

}

export {uploadOnCloudinary}