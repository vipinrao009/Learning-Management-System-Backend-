import Course from "../models/course.model.js";
import AppError from "../utils/error.utils.js";

const getAllCourses = async (req, res, next) => {
  const course = await Course.find({}).select("-lectures");

  res.status(200).json({
    success: true,
    message: "All the courses are here!!!!",
    course,
  });
};

const getLectureByCourseId = (async (req, res, next) =>{

  const { id } = req.params.id;   //Note: jab data url ke through aata hai tab ham => req.params.id  , data store karate hai as well as router me bhi batana padta hai ki data url se aa raha hai

  const course = await Course.findById(id);

  if (!course) {
    return next(new AppError("Invalid course id or course not found.", 404));
  }

  res.status(200).json({
    success: true,
    message: "Course lectures fetched successfully",
    lectures: course.lectures,
  });
});

export { getAllCourses, getLectureByCourseId };
