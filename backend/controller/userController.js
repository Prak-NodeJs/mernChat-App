const User = require('../models/userModel')
const generateToken = require('../config/generateToken');
const {ApiError} = require('../middleware/ApiError');


const allUsers =async (req, res, next) => {
  try{
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
  
    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
    res.status(200).json({
      success:true,
      message:"user retrived",
      data:users
    })
  }
catch(error){
  next(error)
}
   
  };

const registerUser =async (req, res, next) => {
  try{
    const { name, email, password, pic } = req.body;
  
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please Enter all the Feilds");
    }
  
    const userExists = await User.findOne({ email });
  
    if (userExists) {
      throw new ApiError(400, 'User email already exist')
    }
  
    const user = await User.create({
      name,
      email,
      password,
      pic,
    });
  
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
      pic: user.pic
    }
      res.status(201).json({
         success:true,
         message:"user registered successfully",
         data:userData
      })
  }catch(error){
    next(error)
  }
  }
  

  const authUser =async (req, res, next) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });

      if(!user){
        throw new ApiError(400, 'InValid login Crdentials')
      }
    
      const passwordMatched = await user.matchPassword(password)

      if(!passwordMatched){
        throw new ApiError(400, 'InValid login Crdentials')
      }

      const userData = {
        _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            pic: user.pic,
            token: generateToken(user._id),
      }

      res.status(200).json({
        success:true,
         message:"login success",
         data:userData
      })
    } catch (error) {
      next(error)
    }
  }
  
module.exports = {
    registerUser, authUser,allUsers
}