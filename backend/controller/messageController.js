const Message = require('../models/messageModel')
const User = require('../models/userModel')
const Chat = require('../models/chatModel')
const {ApiError}= require('../middleware/ApiError')

const sendMessage=  async(req, res, next)=>{
  try {
    const {content, chatId, file} = req.body
    if ( !chatId) {
      throw new ApiError(400,'Please provide required data')
   }
    
   const isChatExist = await Chat.findOne({_id:chatId})
   if(!isChatExist){
    throw new ApiError(404, 'Chat not found')
   }
   var newMessage = {
     sender: req.user._id,
     content: content,
     chat: chatId,
   };

    if (file) {
    newMessage.file = file;
   }
 
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic")
    message = await message.populate('replies')
    message = await message.populate("chat")
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.status(200).json({
      success:true,
      message:"message send",
      data:message
    })
  } catch (error) {
  next(error)
  }

}

const allMessages= async(req, res, next)=>{
    try {
        const messages = await Message.find({ chat: req.params.chatId })
          .populate("sender", "name pic email")
          .populate("replies")
          .populate("chat");

        res.status(200).json({
          success:true,
          message:"all messages",
          data:messages
        })
      } catch (error) {
        next(error)
      }
}

module.exports= {
    sendMessage,
    allMessages
}