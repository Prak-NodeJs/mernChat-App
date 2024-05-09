const Reply = require('../models/replyModel')
const Message = require('../models/messageModel')
const User = require('../models/userModel')
const {ApiError} = require('../middleware/ApiError')

const replyToMessage = async(req, res, next)=>{
    try {
        const {content,file } = req.body;
        const {messageId} = req.params;

        var message= await Message.findOne({_id:messageId})
        if(!message){
            throw new ApiError(404, 'Message not found');
        }

        const replyData = {
            content,
            sender:req.user._id,
            name:req.user.name
        }
        if(file){
            replyData.file = file
        }
        const result = await Reply.create(replyData);
        message.replies.push(result._id)
        message.save()

    message = await message.populate("sender", "name pic")
    message = await message.populate('replies')
    message = await message.populate("chat")

    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });
        res.status(200).json({
            success:true,
            message:"reply added",
            data:message
        })
    } catch (error) {
        next(error)
    }
}

module.exports= {
    replyToMessage
}