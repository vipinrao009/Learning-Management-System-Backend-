import { Router } from "express";
import {
  getAllCourses,
  getLectureByCourseId,
  createCourse,
  updateCourse,
  removeCourse,
} from "../controllers/course.controllers.js";
const router = new Router();
import isLoggedIn from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.middleware.js";

router.route("/")
   .get(getAllCourses)
   .post(upload.single('thumbnail'),createCourse);

router.route("/course/:id")
  .get(isLoggedIn, getLectureByCourseId)
  .put(updateCourse)
  .delete(removeCourse);

export default router;
