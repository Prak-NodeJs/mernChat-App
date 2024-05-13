const jwt = require("jsonwebtoken");
const User = require('../models/userModel');
const { ApiError } = require("./ApiError");

const protect = async (req, res, next) => {
  try {
    let token;
  if (
    !req.headers.authorization &&
    !req.headers.authorization.startsWith("Bearer")
  ) {
    throw new ApiError(400,'No token, anauthorized')
  }

  token = req.headers.authorization.split(" ")[1];

  if(!token){
    throw new ApiError(403,'No token unauthorized')
  }
      
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  req.user = await User.findById(decoded.id).select("-password");
  next();
  } catch (error) {
    next(error)
  }
  
};

module.exports = { protect };