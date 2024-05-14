const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const { ApiError } = require("../middleware/ApiError");

const sendMessage = async (req, res, next) => {
  try {
    const {
      content,
      chatId,
      file,
      groupUsers,
      userAdded,
      userRemoved,
      userLeft,
    } = req.body;

    const isChatExist = await Chat.findOne({ _id: chatId });
    if (!isChatExist) {
      throw new ApiError(404, "Chat not found");
    }
    var newMessage = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };

    if (file) {
      newMessage.file = file;
    }

    if (groupUsers) {
      if (
        isChatExist.isGroupChat &&
        isChatExist.groupAdmin.toString() != req.user._id.toString()
      ) {
        throw new ApiError(400, "Only group admin can send groupUsers key");
      }
      (newMessage.grpAddEvent = true), (newMessage.groupUsers = groupUsers);
    }

    if (userAdded) {
      if (
        isChatExist.isGroupChat &&
        isChatExist.groupAdmin.toString() != req.user._id.toString()
      ) {
        throw new ApiError(400, "Only group admin can send userAdded key");
      }
      (newMessage.userAdded = userAdded), (newMessage.userAddedToGrp = true);
    }

    if (userRemoved) {
      if (
        isChatExist.isGroupChat &&
        isChatExist.groupAdmin.toString() != req.user._id.toString()
      ) {
        throw new ApiError(400, "Only group admin can send userRemoved key");
      }
      (newMessage.userRemoved = userRemoved),
        (newMessage.userRemovedFromGrp = true);
    }

    if (userLeft) {
      if (isChatExist.isGroupChat) {
        throw new ApiError(400, "This key allowed in group chat");
      }
      (newMessage.userLeft = userLeft), (newMessage.userLeftFromGroup = true);
    }

    var message = await Message.create(newMessage);
    message = await message.populate("sender", "name pic");
    message = await message.populate("replies");
    message = await message.populate("chat");
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

    res.status(200).json({
      success: true,
      message: "message send",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

const allMessages = async (req, res, next) => {
  try {
    const isChatExist = await Chat.findOne({ _id: req.params.chatId });
    if (!isChatExist) {
      throw new ApiError(404, "Chat not found");
    }
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("replies")
      .populate({
        path: "chat",
        populate: [{ path: "groupAdmin" }, { path: "users" }],
      })
      .populate("userAdded")
      .populate("groupUsers")
      .populate("userRemoved")
      .populate("userLeft");

    res.status(200).json({
      success: true,
      message: "all messages",
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findOne({ _id: req.params.msgId });
    if (!message) {
      throw new ApiError(404, "Message not found");
    }
    if (message.sender.toString() != req.user._id.toString()) {
      throw new ApiError(400, "Only Owner can Delete His messages");
    }

    await Message.deleteOne({ _id: req.params.msgId });

    res.status(200).json({
      success: true,
      message: "message deleted",
      data: [],
    });
  } catch (error) {
    next(error);
  }
};

const editMessage = async (req, res, next) => {
  try {
    const message = await Message.findOne({ _id: req.params.msgId });
    if (!message) {
      throw new ApiError(404, "Message not found");
    }

    if (message.sender.toString() != req.user._id.toString()) {
      throw new ApiError(400, "Only Owner can edit his message");
    }

    message.content = req.body.content;
    await message.save();

    res.status(200).json({
      success: true,
      message: "Message Edited",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendMessage,
  allMessages,
  deleteMessage,
  editMessage,
};
