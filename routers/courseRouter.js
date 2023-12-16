import { Router } from "express";
const router = new Router();
import isLoggedIn from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.middleware.js";
import {
  getAllCourses,
  getLectureByCourseId,
  createCourse,
  updateCourse,
  removeCourse,
} from "../controllers/course.controllers.js";
import { authorizedRoles } from "../middleware/authMiddleware.js";

router.route("/")
   .get(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    getAllCourses)

   .post(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    upload.single('thumbnail'),createCourse);

router.route("/course/:id")
  .get(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    getLectureByCourseId)

  .put(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    updateCourse)

  .delete(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    removeCourse);

export default router;
