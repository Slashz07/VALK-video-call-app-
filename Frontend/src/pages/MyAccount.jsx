import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { AuthContext } from "../context/AuthContext.jsx";
import { useContext } from "react";
import { Box, TextField } from "@mui/material";
import '../styles/myAccount.css'
import { login } from "../reduxFeatures/AuthSlice.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NavigationBar from "../Utils/NavigationBar.jsx";

function MyAccount() {
    const userData = useSelector((state) => state.auth.userData);
    const [imgUrl, setImgUrl] = useState();
    const [fileUrl, setFileUrl] = useState();
    const [file, setFile] = useState();
    const dispatch = useDispatch();
    const { confirmPassAndUpdate, deleteAccountImage } = useContext(AuthContext)

    useEffect(() => {
        console.log("userData",userData)
        setImgUrl(userData?.userImg);
    }, [userData]);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm();

    const notify = (type, msg = "") => {

        toast.dismiss();

        if (type === 'inProgress') {
            toast.info(msg != "" ? msg : 'Work in Progress...', {
                position: "top-center",
                autoClose: false,
                hideProgressBar: true,
            });
        } else if (type === 'success') {
            toast.success(msg != "" ? msg : 'Operation Successful!', {
                position: "top-center",
            });
        } else if (type === 'error') {
            toast.error(msg != "" ? msg : 'An error occurred!', {
                position: "top-center",
            });
        }
    };

    const removeImage = async () => {
        const updatedUser = await deleteAccountImage();
        notify("success", "User account image removed successfully")
        console.log(updatedUser)
        dispatch(login({ userData:updatedUser }));
    };

    async function updateAccountDetails(data) {
        notify("inProgress", "Updations are being made,\nPlease wait a moment")

        console.log(data)
        try {
            const formData = new FormData()

            const enterPass = window.prompt("Enter the current password");
            console.log(typeof (enterPass))
            file && formData.append("file", file)
            data.fullName && formData.append("fullName", data.fullName)
            data.userName && formData.append("userName", data.userName)
            data.password && formData.append("password", data.password)
            formData.append("confirmPassword", enterPass)

            const isConfirmedAndUpdated = await confirmPassAndUpdate(formData)

            if (!isConfirmedAndUpdated) {
                console.log(isConfirmedAndUpdated)
                notify("error","incorrect password")
            } else {
                notify("success", "Account updations  made successfully!");
                dispatch(login({ userData:isConfirmedAndUpdated }))
            }

            //   if (data.image[0] && data.image[0].size > 1024 * 1024) {
            //     const error = new Error("Image size must not exceed 1mb");
            //     error.status = 401;
            //     throw error;
            //   }


        } catch (error) {
            notify("error", error.message);
        } finally {
            reset({
                image: "",
                password: ""
            })
            setFile("")
            setFileUrl("")
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
            <div style={{marginTop:"6rem"}} className="container">
                <div className="center">
                    <img
                        src={imgUrl}
                        className="profile-img"
                    />

                    {imgUrl !== "https://img.freepik.com/free-vector/user-blue-gradient_78370-4692.jpg" && (
                        <button
                            type="button"
                            onClick={removeImage}
                            className="remove-btn"
                        >
                            Remove
                        </button>
                    )}
                </div>
                <div>
                    <form onSubmit={handleSubmit(updateAccountDetails)}>
                        <Box noValidate sx={{ mt: 1 }}>
                            <div>
                                {/* Full Name Field */}
                                <div className="form-row">
                                    <label htmlFor="fullName" className="form-label">Full Name:</label>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="fullName"
                                        name="fullName"
                                        {...register("fullName", { required: true })}
                                        defaultValue={userData?.fullName}
                                    />
                                    {errors.name && (
                                        <p className="text-red-600 text-sm mt-1">{errors.fullName.message}</p>
                                    )}
                                </div>

                                <div className="form-row">
                                    <label htmlFor="fileInput" className="form-label" style={{ marginRight: "-5px" }}>Profile Picture:</label>
                                    <Box className="input-container">
                                        <input
                                            type="file"
                                            accept="image/jpg,image/png,image/jpeg,image/gif"
                                            name="image"
                                            {...register("image", { required: false })}
                                            style={{ display: 'none' }}
                                            id="fileInput"
                                            onChange={onFileUpload}
                                        />
                                        <label htmlFor="fileInput" className="file-input-label">
                                            {file?.name || 'Set Profile Pic'}
                                        </label>
                                        {fileUrl && (
                                            <Box sx={{ marginTop: '10px', marginLeft: '5px' }}>
                                                <img
                                                    src={fileUrl}
                                                    alt="Preview"
                                                    className="preview-img"
                                                />
                                            </Box>
                                        )}
                                    </Box>
                                </div>

                                <div className="form-row">
                                    <label htmlFor="userName" className="form-label">Username:</label>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="userName"
                                        name="userName"
                                        defaultValue={userData?.userName}
                                        {...register("userName", { required: true })}
                                    />
                                    {errors.name && (
                                        <p className="text-red-600 text-sm mt-1">{errors.userName.message}</p>
                                    )}
                                </div>

                                <div className="form-row">
                                    <label htmlFor="password" className="form-label">New Password:</label>
                                    <TextField
                                        margin="normal"
                                        fullWidth
                                        name="password"
                                        {...register("password")}
                                        type="password"
                                        id="password"
                                    />
                                </div>


                                {/* Submit Button */}
                                <button type="submit" className="update-btn">
                                    Update
                                </button>
                            </div>
                        </Box>
                    </form>
                </div>
            </div>
        </>
    );

}
export default MyAccount