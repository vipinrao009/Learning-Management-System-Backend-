import {Router} from "express";
import {home,register,login,getUser,logOut} from"../controllers/userControllers.js"
import isLoggedIn  from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.middleware.js";
const router = Router();

router.get('/home',home)
router.post('/user/register',upload.single("avatar"),register)
router.post('/user/login',login)
router.get('/getUser',isLoggedIn,getUser)
router.get('/logout',isLoggedIn,logOut)


export default router; 