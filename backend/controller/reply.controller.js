const Reply = require('../models/replyModel')
const Message = require('../models/messageModel')
const {ApiError} = require('../middleware/ApiError')

const replyToMessage = async(req, res, next)=>{
    try {
        const {content,file } = req.body;
        const {messageId} = req.params;

        const message= await Message.findOne({_id:messageId})
        if(!message){
            throw new ApiError(404, 'Message not found');
        }

        const replyData = {
            content,
            sender:req.user._id
        }
        if(file){
            replyData.file = file
        }
        const result = await Reply.create(replyData);
        message.replies.push(result._id)
        message.save()
        res.status(200).json({
            success:true,
            message:"reply added",
            data:result
        })
    } catch (error) {
        next(error)
    }
}

module.exports= {
    replyToMessage
}