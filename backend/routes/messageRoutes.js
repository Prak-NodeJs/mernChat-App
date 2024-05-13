const express = require("express");
const {sendMessage, allMessages, deleteMessage, editMessage} = require('../controller/messageController')
const router = express.Router();
const {protect} = require('../middleware/authMiddleware')
const {createMessage, fetchMessage, messageEdit, messageDelete} = require('../validation/message.validation')
const {validate} = require('../middleware/validate')

router.route("/:chatId").get(protect,validate(fetchMessage), allMessages);

router.route("/").post(protect, validate(createMessage),sendMessage);
router.route("/:msgId")
  .delete(protect, validate(messageDelete), deleteMessage)
  .put(protect, validate(messageEdit), editMessage);


module.exports = router;