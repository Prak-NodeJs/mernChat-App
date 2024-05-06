
const {ApiError} = require('../middleware/ApiError');
const Chat = require('../models/chatModel')
const User = require('../models/userModel')
const mongoose = require('mongoose')

const accessChat = async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      throw new ApiError(400, 'UserId is required')
    }

    const isUserExist = await User.findOne({ _id: userId })
    if (!isUserExist) {
      throw new ApiError(404, 'User not found')
    }

    var isChat = await Chat.find({
      isGroupChat: false,
      $and: [
        { users: { $elemMatch: { $eq: req.user._id } } },
        { users: { $elemMatch: { $eq: userId } } },
      ],
    })
      .populate("users", "-password")
      .populate("latestMessage");

    isChat = await User.populate(isChat, {
      path: "latestMessage.sender",
      select: "name pic email",
    });

    if (isChat.length > 0) {
      return res.status(200).json({
        success: true,
        message: "chat retrived",
        data: isChat[0]
      })
    }

    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    const createdChat = await Chat.create(chatData);
    const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
      "users",
      "-password"
    );
    res.status(200).json({
      success: true,
      message: "chat retrived",
      data: FullChat
    })
  }
  catch (error) {
    next(error)
  }
}


const fetchChats =async (req, res, next) => {
  try {
    const result = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } }).populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage").sort({ updatedAt: -1 })
    res.status(200).json({
      success:true,
      message:"chat retrived",
      data:result
    })
  } catch (error) {
      next(error)
  }
}


const createGroupChat =async (req, res, next) => {
  try {
  

    const {users, chatName} = req.body;

    if (!users || !chatName) {
      throw new ApiError(400, 'Please fill all the details') 
    }
    // const users = JSON.parse(req.body.users)
    
    if (users.length < 2) {
      throw new ApiError(400, 'More than 2 users are required to form a group chat') 
    }

    for (const userId of users){
      const userObjId = new mongoose.Types.ObjectId(userId)
        const userExist = await User.findOne({_id:userObjId})
        if(!userExist){
         throw new ApiError(400, `User with id ${userId} not found`)
        }
    }
    users.push(req.user)

    const groupChat = await Chat.create({
      chatName: chatName,
      users: req.body.users,
      isGroupChat: true,
      groupAdmin: req.user
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")


    res.status(200).json({
      success:true,
      message:"group chat created",
      data:fullGroupChat
    })

  } catch (error) {
   next(error)
  }
}



const renameGroupChat = async (req, res, next) => {
  try {
    const { chatId, chatName } = req.body;
    const updatedChat = await Chat.findByIdAndUpdate(chatId, {
      chatName
    }, {
      new: true
    }).populate("users", "-password")
      .populate("groupAdmin", "-password")

    if (!updatedChat) {
      throw new ApiError(404,'chat not found')
    }
    res.status(200).json({
      success:true,
      message:"Group name updated",
      data:updatedChat
    })

  } catch (error) {
   next(error)
  }
}



const addToGroup = async (req, res, next) => {
  try {
    const { chatId, userId } = req.body;
    const added = await Chat.findByIdAndUpdate(chatId, {
      $push: { users: userId }
    }, {
      new: true
    }).populate("users", "-password")
      .populate("groupAdmin", "-password")

    if (!added) {
      throw new ApiError(404,'chat not found')
    }
    res.status(200).json({
      success:true,
      message:"Added to group",
      data:added
    })
  } catch (error) {
    next(error)
  }
}


const removefromgroup =async (req, res, next) => {
  try {
    const { chatId, userId } = req.body;
    const removed = await Chat.findByIdAndUpdate(chatId, {
      $pull: { users: userId }
    }, {
      new: true
    }).populate("users", "-password")
      .populate("groupAdmin", "-password")

    if (!removed) {
      throw new ApiError(404,'chat not found')
    }
    res.status(200).json({
      success:true,
      message:"removed from group",
      data:removed
    })
  } catch (error) {
    next(error)
  }
}

module.exports = {
  accessChat, fetchChats,
  createGroupChat,
  renameGroupChat,
  addToGroup,
  removefromgroup
}