import { Router } from "express";
import {
  getAllCourses,
  getLectureByCourseId,
} from "../controllers/course.controllers.js";
const router = new Router();
import isLoggedIn from "../middleware/authMiddleware.js";

router.get("/", getAllCourses);
router.get("/course/:id", isLoggedIn, getLectureByCourseId);

export default router;
