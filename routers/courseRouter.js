import { Router } from "express";
const router = new Router();
import isLoggedIn, { authorizedSubscriber } from "../middleware/authMiddleware.js";
import upload from "../middleware/multer.middleware.js";
import {
  getAllCourses,
  getLectureByCourseId,
  createCourse,
  updateCourse,
  removeCourse,
  addLectureById
} from "../controllers/course.controllers.js";
import { authorizedRoles } from "../middleware/authMiddleware.js";

router.route("/")
   .get(
    isLoggedIn,
    authorizedRoles('ADMIN','USER'),
    getAllCourses)

   .post(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    upload.single('thumbnail'),
    createCourse)

    .delete(
      isLoggedIn,
      authorizedRoles('ADMIN'),
      removeCourse)
    
    
    


router.route("/:id")
  .get(
    isLoggedIn,
    authorizedSubscriber,
    getLectureByCourseId)

  .put(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    updateCourse)

  // .delete(
  //   isLoggedIn,
  //   authorizedRoles('ADMIN'),
  //   removeCourse)

  .post(
    isLoggedIn,
    authorizedRoles('ADMIN'),
    upload.single('lecture'),
    addLectureById
  )

export default router;
