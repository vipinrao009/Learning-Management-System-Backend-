import JWT from "jsonwebtoken";
const isLoggedIn = async (req, res, next) => {
  // extracting token from the cookies
  const { token } = req.cookies;

  // if no token send unauthorized message
  if (!token) {
    return next(new AppError("Unauthorized,plz login again"), 400);
  }

  // Decode the token using JWT packege verify method
  const userDetails = await JWT.verify(token, process.env.JWT_SECRET); //token ko kbhi string me na dale

  // If no decode send the message unauthorized
  if (!userDetails) {
    return next(new AppError("I didn't get details after verify through JWT"));
  }

  // If all good store the id in req object, here we are modifying the request object and adding a custom field user in it
  req.user = userDetails;

  next();
};

export default isLoggedIn;
