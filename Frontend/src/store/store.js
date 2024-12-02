import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../reduxFeatures/AuthSlice.js"

const store=configureStore({
    reducer:{
        auth:authSlice
    }
})

export default store