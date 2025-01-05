import React, { useContext, useState } from 'react'
import "../App.css"
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AuthContext } from '../context/AuthContext';
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function NavigationBar() {

    const isLoggedIn = useSelector((state) => state.auth.status)
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const { userLogout } = useContext(AuthContext)
    const [message, setMessage] = useState("")
    const [open, setOpen] = useState(false)
    const [randomCode, setRandomCode] = useState("")
    const location = useLocation()
    const [isCollapsed, setIsCollapsed] = useState(false);
    const toggleMenu = () => setIsCollapsed(!isCollapsed);

    // Toastify configuration--->
      const notify = (type,msg="") => {
    
        toast.dismiss();
    
        if (type === 'inProgress') {
          toast.info(msg!=""?msg:'Work in Progress...', {
            position: "top-center",
            autoClose: false, 
            hideProgressBar: true,
          });
        } else if (type === 'success') {
          toast.success(msg!=""?msg:'Operation Successful!', {
            position: "top-center",
          });
        } else if (type === '') {
          toast(msg!=""?msg:'Operation Successful!', {
            position: "top-center",
          });
        } else if (type === 'error') {
          toast.error(msg!=""?msg:'An error occurred!', {
            position: "top-center",
          });
        }
      };

    const getRandomCode = () => {
        let code = crypto.randomUUID().slice(0, Math.floor(Math.random() * 6) + 5)
        setRandomCode(code)
        code != "" && navigate(`/call/${code}`)
    }

    const guestJoin = () => {
        console.log(location.pathname)
        console.log("random Code: ", randomCode)
        location.pathname !== `/call/${randomCode}` && getRandomCode()
    }
    return (
        <div className="navBar">
            <div className="landingPageLogo">
                <Link to={"/"}>
                    <h2>VALK</h2>
                </Link>
            </div>

            {/* Collapsible Menu */}
            <div className={`navOptions ${isCollapsed ? "collapsed" : ""}`}>
                {!isLoggedIn && (
                    <p onClick={guestJoin} style={{ color: "white" }}>
                        Join as Guest
                    </p>
                )}
                {!isLoggedIn && <Link to={"/signIn"}>Register</Link>}
                {!isLoggedIn && (
                    <Link to={"/signIn"}>
                        <button className="login-button">Login</button>
                    </Link>
                )}
                {isLoggedIn && (
                    <div
                        className="navIcon"
                        onClick={() => navigate("/home")}
                        style={{ cursor: "pointer" }}
                    >
                        <p style={{ color: "white" }}>Home</p>
                    </div>
                )}
                {isLoggedIn && (
                    <div
                        className="navIcon"
                        onClick={() => navigate("/history")}
                        style={{ cursor: "pointer" }}
                    >
                        <p style={{ color: "white" }}>History</p>
                    </div>
                )}
                {isLoggedIn && (
                    <div
                        className="navIcon"
                        onClick={() => navigate("/myAccount")}
                        style={{ cursor: "pointer" }}
                    >
                        <p style={{ color: "white" }}>My Account</p>
                    </div>
                )}
                {isLoggedIn && (
                    <button
                        className="logout-button"
                        onClick={async () => {
                            try {
                                setError("")
                                const msg = await userLogout()
                                notify("",msg)
                                navigate("/")

                            } catch (error) {
                                setError(error)
                                console.error(error.response.data.message);
                            }
                        }}
                    >
                        Logout
                    </button>
                )}


            </div>
            {/* Hamburger Menu */}
            <div className="hamburgerMenu" onClick={toggleMenu}>
                {isCollapsed ? <CloseIcon style={{ color: "white" }} /> : <MenuIcon style={{ color: "white" }} />}
            </div>
        </div>
    )
}

export default NavigationBar