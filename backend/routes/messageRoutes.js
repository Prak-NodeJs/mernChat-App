const express = require("express");
const {sendMessage, allMessages} = require('../controller/messageController')
const router = express.Router();
const {protect} = require('../middleware/authMiddleware')

router.route("/:chatId").get(protect, allMessages);

router.route("/").post(protect, sendMessage);


module.exports = router;