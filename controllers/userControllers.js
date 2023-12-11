import User from "../models/userModels.js";
import cloudinary from "cloudinary";
import AppError from "../utils/error.utils.js";
import fs from "fs/promises";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto"

const home = (req, res) => {
  res.status(200).json({
    messsage: "This is the home page created by vipin kumar",
  });
};

const register = async (req, res, next) => {
  // Destructuring the necessary data from req object
  const { fullName, email, password } = req.body;

  // Check if the data is there or not, if not throw error message
  if (!fullName || !email || !password) {
    return next(new AppError("All fiels are required", 400));
  }

  // Check if the user exists with the provided email
  const userExist = await User.findOne({ email });

  // If user exists send the reponse
  if (userExist) {
    return next(AppError("Email is already exist !!!", 400));
  }

  // Create a new user with the given necessary data and save to DB
  const user = await User.create({
    fullName,
    email,
    password,
    avatar: {
      public_id: email,
      secure_url: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    },
  });

  //If user data not created send message response
  if (!user) {
    return next(AppError("User registration failed, plz try again", 400));
  }

  //console.log('File details',JSON.stringify(req.file));
  if (req.file) {
    try {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms", // Save files in a folder named lms
        width: 250,
        height: 250,
        gravity: "faces", // This option tells cloudinary to center the image around detected faces (if any) after cropping or resizing the original image
        crop: "fill",
      });

      // If success
      if (result) {
        // Set the public_id and secure_url in DB
        user.avatar.public_id = result.public_id;
        user.avatar.secure_url = result.secure_url;

        // After successful upload remove the file from local storage
        fs.rm(`uploads/${req.file.filename}`);
      }
    } catch (error) {
      return next(
        new AppError(error || "File not uploaded, please try again", 400)
      );
    }
  }

  //Save the user object
  await user.save();

  user.password = undefined;

  // generate the token
  const token = await user.generateJWTToken();

  const CookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, //7days
    httpOnly: true,
    secure: true,
  };

  //Setting the token in cookie with name token along with cookieOption
  res.cookie("token", token, CookieOptions);

  //If all good then send the response to the fronted
  res.status(200).json({
    success: true,
    messsage: "User registered successfully!!!!",
    user,
  });
};

const login = async (req, res) => {
  // Destructuring the necessary data from req object
  const { email, password } = req.body;

  // Check if the data is there or not, if not throw error message
  if (!email || !password) {
    return next(new AppError("Email and Password are required", 400));
  }

  try {
    // Finding the user with the sent email
    const user = await User.findOne({ email }).select("+password");

    // If no user or sent password do not match then send generic response
    if (!(user && (await user.comparePassword(password)))) {
      return next(
        new AppError(
          "Email or Password do not match or user does not exist",
          401
        )
      );
    }

    // Generating a JWT token
    const token = await user.generateJWTToken();

    // Setting the password to undefined so it does not get sent in the response
    user.password = undefined;

    const cookieOptions = {
      maxAge: 7 * 24 * 60 * 60 * 1000, //7days
      httpOnly: true,
      //I took mistake here that was secure : true
    };

    // Setting the token in the cookie with name token along with cookieOptions
    res.cookie("token", token, cookieOptions);

    // If all good send the response to the frontend
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      user,
    });
  } catch (error) {
    return next(new AppError("Error occured", 401));
  }
};

const logOut = async (req, res) => {
  try {
    const cookieOption = {
      expiresIn: new Date(),
      httpOnly: true,
    };

    res.cookie("token", null, cookieOption);

    res.status(200).json({
      success: true,
      messsage: "User logged out successfully !!!",
    });
  } catch (error) {
    return next(new AppError(error.messsage), 400);
  }
};

const getUser = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    res.status(200).json({
      success: true,
      messsage: "User Details !!!",
      data: user,
    });
  } catch (error) {
    return next(new AppError("Failed to fetched the user data"), 400);
  }
};

const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  //if user don't provide  email then send the
  if (!email) {
    return next(new AppError("Email is required!!!", 400));
  }

  //Match email in db
  const user = await User.findOne({ email });

  //if the email not matched in databases
  if (!user) {
    return next(new AppError("Email is not registerd!!!!", 400));
  }

  const resetToken = await user.generateResetToken();

  // token ko save kar lo db me
  await user.save();

  const resetPasswordURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  console.log(resetPasswordURL);

  // We here need to send an email to the user with the token
  const subject = "Reset Password";
  const message = `You can reset your password by clicking <a href=${resetPasswordURL} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordURL}.\n If you have not requested this, kindly ignore.`;

  try {
    await sendEmail(email, subject, message);

    res.status(200).json({
      success: true,
      message: `Reset password token has been sent to ${email} successfully`,
    });
  } catch (error) {
    //in case email send nhi huaa
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;

    await user.save();

    return next(new AppError(error.message, 400));
  }

  
};

const resetPassword = async(req, res,next) => {
  const { resetToken} = req.params

  const {password} = req.body

  const forgotPasswordToken = crypto
  .createHash('sha256')
  .update(resetToken)
  .digest('hex')
  
  if(!password)
  {
    return next(new AppError('Password is required',401))
  }

  
  // Checking if token matches in DB and if it is still valid(Not expired)
  const user = await User.findOne({
    forgotPasswordToken,
    forgotPasswordExpiry : {$gt:Date.now()} // $gt will help us check for greater than value, with this we can check if token is valid or expired
  })
  if(!user)
  {
    return next(new AppError('Token is invalid or expired !!!',401))
  }

  // Update the password if token is valid and not expired
  user.password = password

  // making forgotPassword undefined in the DB after the updated the password
  user.forgotPasswordExpiry = undefined
  user.forgotPasswordToken = undefined
  
  // Save the updated user values
  user.save()

  res.status(200).json({
    success:true,
    message:"Password changed successfully !!!!"
  })

  
};

export {
  home,
  register,
  login,
  logOut,
  getUser,
  forgetPassword,
  resetPassword,
};