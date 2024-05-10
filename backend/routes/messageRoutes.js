const express = require("express");
const {sendMessage, allMessages} = require('../controller/messageController')
const router = express.Router();
const {protect} = require('../middleware/authMiddleware')
const {createMessage, fetchMessage} = require('../validation/message.validation')
const {validate} = require('../middleware/validate')

router.route("/:chatId").get(protect,validate(fetchMessage), allMessages);

router.route("/").post(protect, validate(createMessage),sendMessage);


module.exports = router;