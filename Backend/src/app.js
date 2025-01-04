import express from "express"
import cors from "cors"
import userRouter from "./routes/user.routes.js"

import cookieParser from "cookie-parser"
const app=express()

app.use(cors({
    origin: "https://valk-frontend.onrender.com", // Specify frontend's origin
    credentials: true, // Allow cookies and credentials
}));
app.use(express.json({limit:"40kb"}))
app.use(express.static('public'));
app.use(express.urlencoded({limit:"40kb",extended:true}))
app.use(cookieParser())



app.use("/api/v1/users",userRouter)


export default app