import { useContext, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../context/AuthContext.jsx';
import { Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import "../App.css"
import NavigationBar from '../Utils/NavigationBar.jsx';

const defaultTheme = createTheme();

export default function Authentication() {
  
  const [userName,setUserName]=useState("")
  const [fullName,setFullName]=useState("")
  const [password,setPassword]=useState("")
  const [error,setError]=useState("")
  const [message,setMessage]=useState("")
  const [formState,setFormState]=useState("signIn")
  const [open,setOpen]=useState(false)


  const {handleRegister,handleLogin}=useContext(AuthContext)
  const navigate=useNavigate()

  const handleAuth=async()=>{
    try {
      setError("")

      if(formState==="signIn"){
        let result=await handleLogin(userName,password)
        setMessage(result)
        setOpen(true)
        navigate("/home")
      }
      if(formState==="signUp"){
        let result=await handleRegister(fullName,userName,password)
        setMessage(result)
        setOpen(true)
        navigate("/home")
      }

      setUserName("")
      setPassword("")

    } catch (error) {
      console.log(error)
      setError(error.response.data.message)
    }
  }

  return (
    <>
    <NavigationBar/>
    <ThemeProvider theme={defaultTheme}>
      <Grid container component="main" sx={{ height: '89vh' }}>
        <CssBaseline />
        <Grid
          item
          xs={false}
          sm={4}
          md={7}
          sx={{
            backgroundImage:
              'url("../../public/signInImage.jpg")',
            backgroundColor: (t) =>
              t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
            backgroundSize: 'contain',
            backgroundPosition: 'left',
            backgroundRepeat:"no-repeat"
          }}
        />
        <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
       <div>
        <Button variant={formState==="signIn"?"contained":""} 
          onClick={()=>{
            setError("")
            setPassword("")
            setFormState("signIn")}
          }>
          Sign In
        </Button>
        <Button variant={formState==="signUp"?"contained":""}
         onClick={()=>{
          setError("")
          setPassword("")
          setFormState("signUp")}
          }>
          Sign Up
        </Button>
       </div>
            <Box component="form" noValidate sx={{ mt: 1 }}>
              {formState=="signUp"&&<TextField
                margin="normal"
                required
                fullWidth
                id="fullName"
                label="Full Name"
                name="fullName"
                value={fullName}
                autoFocus
                onChange={(e)=>setFullName(e.target.value)}
              />
              }
              <TextField
                margin="normal"
                required
                fullWidth
                id="userName"
                label="userName"
                name="userName"
                value={userName}
                autoFocus
                onChange={(e)=>setUserName(e.target.value)}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                value={password}
                id="password"
                onChange={(e)=>setPassword(e.target.value)}
              />

              <p style={{color:"red"}}>{error}</p>

              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleAuth}
              >
               {formState=="signIn"?"LOGIN":"REGISTER"}
              </Button>

              {/* For future upgradation --> */}

              {/* <Grid container>
                <Grid item xs>
                  <Link href="#" variant="body2">
                    Forgot password?
                  </Link>
                </Grid>
                <Grid item>
                  <Link href="#" variant="body2">
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Grid>
              </Grid> */}
            </Box>
          </Box>
        </Grid>
      </Grid>

       {error==="" && <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={()=>setOpen(false)}
        message={message}
        />}

    </ThemeProvider>
    </>
   
  );
}