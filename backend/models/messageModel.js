
const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    file:{type:String, trim:true},
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reply" }],
    time: {
      type: String,
      trim: true,
      default: function() {
        const currentDate = new Date();

        // Extract hours and minutes
        const hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
        const meridiem = hours >= 12 ? 'PM' : 'AM';
        const formattedTime = `${formattedHours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')} ${meridiem}`;

        return formattedTime;
      },
    },    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
