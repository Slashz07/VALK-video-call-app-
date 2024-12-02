import React, { useContext, useState } from 'react'
import "../App.css"
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, IconButton } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../context/AuthContext';
import { Snackbar } from '@mui/material';
import Alert from '@mui/material/Alert';
import HomeIcon from "@mui/icons-material/Home";

function NavigationBar() {

    const isLoggedIn = useSelector((state) => state.auth.status)
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const { userLogout } = useContext(AuthContext)
    const [message, setMessage] = useState("")
    const [open, setOpen] = useState(false)
    const [randomCode, setRandomCode] = useState("")
    const location = useLocation()

    const getRandomCode=()=>{
        let code=crypto.randomUUID().slice(0, Math.floor(Math.random() * 6) + 5)
        setRandomCode(code)
        code!= "" && navigate(`/call/${code}`)
    }

    const guestJoin = () => {
        console.log(location.pathname)
        console.log("random Code: ",randomCode)
        location.pathname !== `/call/${randomCode}` && getRandomCode()
}
return (
    <div className='navBar'>
        <div className='landingPageLogo'>
            <Link to={"/"}>
            <h2>VALK</h2>
            </Link>
        </div>
        <div className='navOptions'>
            {
                !isLoggedIn && <p onClick={() => guestJoin()} style={{ color: "white" }}>Join as Guest</p>
            }
            {
                !isLoggedIn && <Link to={"/signIn"}>Register</Link>
            }
            {
                !isLoggedIn && <Link to={"/signIn"}>
                    <button className="login-button">Login</button>
                </Link>
            }
            {
                isLoggedIn && <IconButton onClick={() => {
                    navigate("/home")
                }}>
                    <HomeIcon fontSize="large" style={{ color: "gold" }} />
                    <p style={{ color: "white" }}>Home</p>
                </IconButton>
            }
            {
                isLoggedIn && <IconButton onClick={() => {
                    navigate("/history")
                }}>
                    <RestoreIcon style={{ color: "gold" }} />
                    <p style={{ color: "white" }}>History</p>
                </IconButton>
            }
            {
                isLoggedIn && <button className='logout-button' onClick={async () => {
                    try {
                        setError("")
                        const msg = await userLogout()
                        setMessage(msg)
                        setOpen(true)
                        navigate("/")

                    } catch (error) {
                        setError(error.response.data.message)
                    }
                }}>
                    Logout
                </button>
            }

            {error === "" ? <Snackbar
                open={open}
                autoHideDuration={2000}
                onClose={() => {
                    setOpen(false)
                }}
                message={message}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}

            /> : <Snackbar
                open={open}
                autoHideDuration={2000}
                onClose={() => {
                    setOpen(false)
                }}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={"error"} sx={{ width: "100%" }}>
                    {message}
                </Alert>
            </Snackbar>
            }
        </div>
    </div>
)
}

export default NavigationBar