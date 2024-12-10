import React, { useContext, useState } from 'react'
import "../App.css"
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { AuthContext } from '../context/AuthContext';
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

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
                    <button
                        className="logout-button"
                        onClick={async () => {
                            try {
                                await userLogout();
                                navigate("/");
                            } catch (error) {
                                console.error(error);
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