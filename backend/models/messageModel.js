
const mongoose = require("mongoose");

const messageSchema = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    file:{type:String, trim:true},
    time: {
      type: String,
      trim: true,
      default: function() {
        const currentDate = new Date();

        // Extract hours and minutes
        const hours = currentDate.getHours();
        const minutes = currentDate.getMinutes();

        // Convert hours to 12-hour format
        const formattedHours = hours % 12 === 0 ? 12 : hours % 12;

        // Determine AM/PM
        const meridiem = hours >= 12 ? 'PM' : 'AM';

        // Construct the time string with leading zeros
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
