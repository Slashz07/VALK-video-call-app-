import express from "express"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
// import meetingsRouter from "./routes/meeting.routes.js"
import cookieParser from "cookie-parser"
const app=express()

app.use(cors({
    origin: "http://localhost:5173", // Specify frontend's origin
    credentials: true, // Allow cookies and credentials
}));
app.use(express.json({limit:"40kb"}))
app.use(express.urlencoded({limit:"40kb",extended:true}))
app.use(cookieParser())



app.use("/api/v1/users",userRouter)
// app.use("/api/v1/meeting",meetingsRouter)
app.use("/",(req,res,next)=>{
    res.send("hey")
    next()
})
export default app