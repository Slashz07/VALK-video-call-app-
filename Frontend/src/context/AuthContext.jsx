import React, { createContext, useContext, useState } from 'react'
import axios from 'axios'
import httpStatus from "http-status"
import { useDispatch } from 'react-redux'
import { login, logout } from '../reduxFeatures/AuthSlice'
import isBackendProd from '../Environment'

export const AuthContext = createContext({})

const client = axios.create({
    baseURL: `${isBackendProd(true)}/api/v1/users`,
    withCredentials: true
})

export const AuthProvider = ({ children }) => {
    const userContext = useContext(AuthContext)

    const [userData, setUserData] = useState(userContext)
    const dispatch = useDispatch()

    const handleRegister = async (formData) => {
        try {  
            const request = await client.post("/register",formData,{
                headers:{
                    "Content-Type":"multipart/form-data"
                },
            })
            console.log(request)
            if (request.data.statusCode === httpStatus.CREATED) {
                dispatch(login({ userData: request.data.data }))
                return request.data.message
            } else {
                dispatch(logout())
            }
        } catch (error) {
            throw error
        }
    }

    const verifyLogin = async () => {
        try {
            const request = await client.post("/verify")
            console.log(request)
            return request.data

        } catch (error) {
            throw error;
        }
    }

    const handleLogin = async (userName, password) => {
        try {
            const request = await client.post("/login", {
                userName,
                password
            })

            if (request.data.statusCode === httpStatus.OK) {
                dispatch(login({ userData: request.data.data }))
                return request.data.message
            } 

        } catch (error) {
            throw error
        }
    }

    const getHistory=async ()=>{
        try {
            const request=await client.post("/history")
            console.log(request)
            if (request.data.statusCode === httpStatus.OK) {
                return request.data.data
            } 
        } catch (error) {
            throw error
        }
    }

    const updateMeetingHistory=async (meetingCode)=>{
        try {
            const request=await client.post("/addMeeting",{
                meetingCode
            })
            if (request.data.statusCode === httpStatus.OK) {
                return request.data.success
            } 
        } catch (error) {
            throw error
        }
    }

    const confirmPassAndUpdate= async (formData)=>{
        try {
            const request=await client.post("/myAccount/updateAccount",formData,{
                headers:{
                    "Content-Type":"multipart/form-data"
                },
            })
    console.log("requuest: ",request)
            if(request.data.statusCode===httpStatus.OK){
                return request.data.data
            }
    
        } catch (error) {
            throw error
        }
    }
    const deleteAccountImage= async ()=>{
        try {
            const request=await client.delete("/myAccount/deleteAccountImage")
    
            if(request.data.statusCode===httpStatus.OK){
                return request.data.data
            }
    
        } catch (error) {
            throw error
        }
    }

    const userLogout = async () => {
        try {
            const request = await client.post("/logout")
            if (request.data.statusCode === httpStatus.OK) {
                dispatch(logout())
                return request.data.message
            }
        } catch (error) {
            throw error
        }
    }

    const data = { userData, setUserData, handleRegister, handleLogin, userLogout, verifyLogin,updateMeetingHistory,confirmPassAndUpdate,deleteAccountImage,getHistory }
    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider >
    )

}