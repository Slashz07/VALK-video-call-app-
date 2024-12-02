import dotenv from "dotenv"
dotenv.config(
    {
        path:"../.env"
    }
)

import {createServer} from "node:http"
import dbConnect from "./Database/connect.js"
import {connectToSocket} from "./controllers/socketManager.js"
import app from "./app.js"

const server=createServer(app)
export const io= connectToSocket(server) 

app.set("port",(process.env.PORT||8000))

dbConnect().then(()=>{
    server.listen(app.get("port"),()=>{
        console.log(`Server is runing live at: http://localhost:${app.get("port")}`)
    })
}).catch((error)=>{
    console.log(error)
})
