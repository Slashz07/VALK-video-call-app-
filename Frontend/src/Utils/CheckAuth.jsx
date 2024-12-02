import { useEffect } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

const CheckAuth=(WrappedComponent)=>{
    const AuthComponent=(props)=>{
        const router=useNavigate()
        const isAuthenticated=useSelector((state)=>state.auth.status)

        useEffect(()=>{
            console.log(isAuthenticated)
            if(!isAuthenticated){
                router("/signIn")
            }
        },[])
        return <WrappedComponent {...props}/>
    }
    return AuthComponent
}

export default CheckAuth;