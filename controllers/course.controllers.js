import Course from "../models/course.model.js";
import AppError from "../utils/error.utils.js";
import cloudinary from "cloudinary";
import fs from "fs/promises"


const getAllCourses = async (req, res, next) => {
  const course = await Course.find({}).select("-lectures");

  res.status(200).json({
    success: true,
    message: "All the courses are here!!!!",
    course,
  });
};

const getLectureByCourseId = async (req, res, next) => {
  const { id } = req.params.id; //Note: jab data url ke through aata hai tab ham => req.params.id  , data store karate hai as well as router me bhi batana padta hai ki data url se aa raha hai

  const course = await Course.findById(id);

  if (!course) {
    return next(new AppError("Invalid course id or course not found.", 404));
  }

  res.status(200).json({
    success: true,
    message: "Course lectures fetched successfully",
    lectures: course.lectures,
  });
};

const createCourse = async (req, res, next) => {
  // Destructuring the necessary data from req object
  const { title,description,category,createdBy} = req.body

  // Check if the data is there or not, if not throw error message
  if(!title || !description || !category || !createdBy)
  {
    return next(new AppError("All fields are required!99!!",401))
  }
  
  // Create a new course with the given necessary data and save to DB
  const course =await Course.create({
    title,
    description,
    category,
    createdBy,
    thumbnail:{
      public_id :'email',
      secure_url:"dummy"
    }
  })

  if(!course)
  {
    return next(new AppError('Course could not created ,please try again',401))
  }

   try {
    if(req.file)
    { 
      // //upload the file on cloudinary
      const result = await cloudinary.v2.uploader.upload(req.file.path,{
        folder:'lms' // Save files in a folder named lms
      })
  
      if(result)
      { 
        // Set the public_id and secure_url in DB
        course.thumbnail.public_id = result.public_id
        course.thumbnail.secure_url = result.secure_url
      }
  
      // After successfully upload remove the file from local storage
      fs.rm(`uploads/${req.file.filename}`)
  
      await course.save();
  
      res.status(200).json({
        success:true,
        message:"Course is successfully created!!!",
        course
      })
  
    }
   } catch (error) {
     return next(new AppError(error.message))
   }
};

const removeCourse = async (req, res, next) => {};

const updateCourse = async (req, res, next) => {};
export {
  getAllCourses,
  getLectureByCourseId,
  createCourse,
  removeCourse,
  updateCourse,
};
