
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
    const chat = await Chat.findOne({ _id: chatId, isGroupChat: true });
    if(!chat){
      throw new ApiError(404, 'Group Chat Id is not found')
    }

    if(chat.groupAdmin.toString()!=req.user._id.toString()){
      throw new ApiError(400, 'Only group admin can add users')
    }

    const findUser = await User.findOne({_id:userId})

    if(!findUser){
      throw new ApiError(404, 'User not found')
    }

    const userExist = await Chat.findOne({ _id: chatId, users: userId });
    if (userExist) {
        throw new ApiError(400, "User already added");
    }    

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
    const chat = await Chat.findOne({ _id: chatId, isGroupChat: true });
    if(!chat){
      throw new ApiError(404, 'Group Chat Id is not found')
    }
    if(chat.groupAdmin.toString()!==req.user._id.toString() && req.user._id.toString()!=userId.toString()){
      throw new ApiError(400, 'Only group admin can remove users')
    }
    const findUser = await User.findOne({_id:userId})
    if(!findUser){
      throw new ApiError(404, 'User not found')
    }

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

const deleteChatForUser  = async (req, res, next)=>{
  try {
    const userId = req.user._id
    const chat = await Chat.findOne({_id:req.params.chatId})

    if(!chat){
      throw new ApiError(404, 'Chat not found')
    }
    
    await Chat.updateOne(
      { _id: req.params.chatId },
      { $pull: { users: userId }
     }
    );

    const result = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } }).populate("users", "-password")
    .populate("groupAdmin", "-password")
    .populate("latestMessage").sort({ updatedAt: -1 })
  res.status(200).json({
    success:true,
    message:"chat deleted and rest of the chat retrived",
    data:result
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
  removefromgroup,
  deleteChatForUser
}