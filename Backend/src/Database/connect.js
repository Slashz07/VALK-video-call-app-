import mongoose from "mongoose"
import {DB_NAME} from "../constants.js"

const dbConnect=async ()=>{
    try {
    let connectObj=await mongoose.connect(`${process.env.CONNECTION_STRING}/${DB_NAME}`)
    console.log(`Connected to database at host: ${connectObj.connection.host}`)
    } catch (error) {
        console.log(`Error connecting to database,Error: ${error}`)
    }
}
await dbConnect()
export default dbConnect