import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form'
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
import { useNavigate } from 'react-router-dom';
import "../App.css"
import NavigationBar from '../Utils/NavigationBar.jsx';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const defaultTheme = createTheme();

export default function Authentication() {

  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [formState, setFormState] = useState("signIn")
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState("")
  const [fileUrl, setFileUrl] = useState("")

  const { handleSubmit, register } = useForm()


  const { handleRegister, handleLogin } = useContext(AuthContext)
  const navigate = useNavigate()

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
    } else if (type === 'error') {
      toast.error(msg!=""?msg:'An error occurred!', {
        position: "top-center",
      });
    }
  };

  const handleAuth = async (data) => {
    try {
      setError("")
      console.log(data)
      if (formState === "signIn") {
        let result = await handleLogin(data.userName, data.password)
        notify("success",result)
        navigate("/home")
      }
      
      if (formState === "signUp") {
        const formData = new FormData()
        file&&formData.append("file", file)
        formData.append("fullName", data.fullName)
        formData.append("userName", data.userName)
        formData.append("password", data.password)
        
        let result = await handleRegister(formData)
        notify("success",result)
        navigate("/home")
      }

    } catch (error) {
      console.log(error)
      setError(error.response.data.message)
    }
  }

  const onFileUpload = (event) => {
    const file = event.target.files[0]
    setFile(file)
    const url = URL.createObjectURL(file)
    setFileUrl(url)
  }

  return (
    <>
      <NavigationBar />
      <div style={{ marginTop: "7vh" }}>
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
                  'url("/signInImage.jpg")',
                backgroundColor: (t) =>
                  t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                backgroundSize: 'contain',
                backgroundPosition: 'left',
                backgroundRepeat: "no-repeat"
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
                  <Button variant={formState === "signIn" ? "contained" : ""}
                    onClick={() => {
                      setError("")
                      setFormState("signIn")
                    }
                    }>
                    Sign In
                  </Button>
                  <Button variant={formState === "signUp" ? "contained" : ""}
                    onClick={() => {
                      setError("")
                      setFormState("signUp")
                    }
                    }>
                    Sign Up
                  </Button>
                </div>
                <form onSubmit={handleSubmit(handleAuth)}>
                  <Box noValidate sx={{ mt: 1 }}>
                    {formState == "signUp" &&
                      <div>
                        <TextField
                          margin="normal"
                          required
                          fullWidth
                          id="fullName"
                          label="Full Name"
                          name="fullName"
                          {...register("fullName", {
                            required: true
                          })}
                          autoFocus
                        />
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid rgba(0, 0, 0, 0.23)',
                            borderRadius: '4px',
                            padding: '10px 14px',
                            marginTop: '8px',
                            cursor: 'pointer',
                            '&:hover': {
                              borderColor: 'rgba(0, 0, 0, 0.87)',
                            },
                          }}
                        >
                          <input
                            type="file"
                            accept="image/jpg,image/png,image/jpeg,image/gif"
                            name="image"
                            {...register("image", { required: false })}
                            style={{
                              display: 'none',
                            }}
                            id="fileInput"
                            onChange={onFileUpload}
                          />
                          <label htmlFor="fileInput" style={{ flex: 1, cursor: 'pointer' }}>
                            {file.name || 'Set Profile Pic'}
                          </label>
                          {fileUrl && (
                            <Box
                              sx={{
                                marginTop: '10px',
                                marginLeft: "5px",
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <img
                                src={fileUrl}
                                alt="Preview"
                                style={{
                                  width: '100px',
                                  height: '100px',
                                  objectFit: 'cover',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(0, 0, 0, 0.23)',
                                }}
                              />
                            </Box>
                          )}
                        </Box>

                      </div>

                    }
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="userName"
                      label="userName"
                      name="userName"
                      {...register("userName", {
                        required: true
                      })}
                      autoFocus
                    />
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      {...register("password", {
                        required: true
                      })}
                      label="Password"
                      type="password"
                      id="password"
                    />

                    <p style={{ color: "red" }}>{error}</p>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                    >
                      {formState == "signIn" ? "LOGIN" : "REGISTER"}
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
                </form>
              </Box>
            </Grid>
          </Grid>
        </ThemeProvider>

      </div>
    </>
  );
}