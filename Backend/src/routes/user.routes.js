import { Router } from "express";
import { login, logout, refreshAccessToken, register,getCurrentUser,getUserHistory, updateMeetingHistory, updateUserAccount, deleteAccountImg } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router=Router()

router.route("/register").post(
    upload.single("file"),
    register
)
router.route("/login").post(
    login    
)
router.route("/refreshAccessToken").post(
    refreshAccessToken
)
router.route("/verify").post(
    verifyJwt,
    getCurrentUser
)
router.route("/history").post(
    verifyJwt,
    getUserHistory
)
router.route("/addMeeting").post(
    verifyJwt,
    updateMeetingHistory
)

router.route("/myAccount/updateAccount").post(
    verifyJwt,
    upload.single("file"),
    updateUserAccount
)
router.route("/myAccount/deleteAccountImage").delete(
    verifyJwt,
    deleteAccountImg
)

router.route("/logout").post(
    verifyJwt,
    logout
)
export default router