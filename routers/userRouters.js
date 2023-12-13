import {Router} from "express";
import {home,register,login,getUser,logOut,forgetPassword,resetPassword,changePassword} from"../controllers/userControllers.js"
import isLoggedIn  from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.middleware.js";
const router = Router();

router.get('/home',home)
router.post('/register',upload.single("avatar"),register)
router.post('/login',login)
router.get('/getUser',isLoggedIn,getUser)
router.get('/logout',isLoggedIn,logOut)
router.post('/forget',forgetPassword)
router.post('/reset/:resetToken',resetPassword)
router.post('/changepassword',isLoggedIn,changePassword)


export default router; 