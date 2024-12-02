import { Router } from "express";
import { login, logout, refreshAccessToken, register,getCurrentUser,getUserHistory, updateMeetingHistory } from "../controllers/user.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router=Router()

router.route("/register").post(
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
router.route("/logout").post(
    verifyJwt,
    logout
)
export default router