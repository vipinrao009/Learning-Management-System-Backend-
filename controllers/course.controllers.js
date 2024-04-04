import Course from "../models/course.model.js";
import AppError from "../utils/error.utils.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";

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
  const { title, description, category, createdBy } = req.body;

  // Check if the data is there or not, if not throw error message
  if (!title || !description || !category || !createdBy) {
    return next(new AppError("All fields are required!99!!", 401));
  }

  // Create a new course with the given necessary data and save to DB
  const course = await Course.create({
    title,
    description,
    category,
    createdBy,
    thumbnail: {
      public_id: "email",
      secure_url: "dummy",
    },
  });

  if (!course) {
    return next(
      new AppError("Course could not created ,please try again", 401)
    );
  }

  try {
    if (req.file) {
      // //upload the file on cloudinary
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms", // Save files in a folder named lms
      });

      if (result) {
        // Set the public_id and secure_url in DB
        course.thumbnail.public_id = result.public_id;
        course.thumbnail.secure_url = result.secure_url;
      }

      // After successfully upload remove the file from local storage
      fs.rm(`uploads/${req.file.filename}`);

      await course.save();

      res.status(200).json({
        success: true,
        message: "Course is successfully created!!!",
        course,
      });
    }
  } catch (error) {
    return next(new AppError(error.message));
  }
};

const updateCourse = async (req, res, next) => {
  const { id } = req.params;

  try {
    // finding the course using id
    const course = await Course.findByIdAndUpdate(
      id,
      {
        $set: req.body, //this is only update the fields which are present and remain same (no update)
      },
      {
        runValidators: true, // this will run the validation checks on the new data that is right or wrong
      }
    );

    if (!course) {
      return next(new AppError("course with given id does not exist !!!", 401));
    }

    res.status(200).json({
      success: true,
      message: "Course updated successfully!!!",
    });
  } catch (error) {
    return next(new AppError(error.message, 401));
  }
};

const removeCourse = async (req, res, next) => {
  const { id } = req.params;
  try {
    const course = await Course.findById(id);

    if (!course) {
      return next(new AppError("course with given id does not exist !!!", 401));
    }

    await Course.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Course deleted successfully!!!",
    });
  } catch (error) {
    return next(new AppError(error.message, 401));
  }
};

const addLectureById = async (req, res, next) => {
  //Extract id from user
  const { title, description } = req.body;
  const { id } = user.params;

  // Check if the data is there or not, if not throw error message
  if (!title || !description) {
    return next(new AppError("All field are required", 400));
  }

  //Lookup into db and check the course is exist or not
  const course = await Course.findById(id);
  if (!course) {
    return next(new AppError("Course with given id does not exist", 400));
  }

  const lecturesData = {
    title,
    description,
    lecture: {},
  };

  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        file: "lms", // Save files in a folder named lms
      });

      if (result) {
        // Set the public_id and secure_url in DB
        lecturesData.lecture.public_id = result.public_id;
        lecturesData.lecture.secure_url = result.secure_url;
      }

      // After successfully upload remove the file from local storage
      fs.rm(`upload/${req.file.filename}`);
    } catch (error) {
      return next(new AppError(error.message, 400));
    }
  }
  
  //DB me Course ke ander ek lecture name ka folder hai ukse under data ko push kar do
  course.lectures.push(lecturesData);
  course.numberOfLecture = course.lectures.length; //Count the number of lecture

  //Finally save all the data in db
  await course.save();

  res.status(200).json({
    success: true,
    message: "Lecture Added Successfully!!!",
    course,
  });
};

const addLectureById1 = async (req, res, next) => {
  const { title, description } = req.body;
  const { id } = req.params;

  let lectureData = {};

  if (!title || !description) {
    return next(new AppError("Title and Description are required", 400));
  }

  const course = await Course.findById(id);

  if (!course) {
    return next(new AppError("Invalid course id or course not found.", 400));
  }

  // Run only if user sends a file
  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms", // Save files in a folder named lms
        // chunk_size: 50000000, // 50 mb size
        // resource_type: 'video',
      });

      // If success
      if (result) {
        // Set the public_id and secure_url in array
        lectureData.public_id = result.public_id;
        lectureData.secure_url = result.secure_url;
      }

      // After successful upload remove the file from local storage
      fs.rm(`uploads/${req.file.filename}`);
    } catch (error) {
      // Empty the uploads directory without deleting the uploads directory
      for (const file of await fs.readdir("uploads/")) {
        await fs.unlink(path.join("uploads/", file));
      }

      // Send the error message
      return next(
        new AppError(
          JSON.stringify(error) || "File not uploaded, please try again",
          400
        )
      );
    }
  }

  course.lectures.push({
    title,
    description,
    lecture: lectureData,
  });

  course.numberOfLectures = course.lectures.length;

  // Save the course object
  await course.save();

  res.status(200).json({
    success: true,
    message: "Course lecture added successfully",
    course,
  });
};

export {
  getAllCourses,
  getLectureByCourseId,
  createCourse,
  removeCourse,
  updateCourse,
  addLectureById,
};
