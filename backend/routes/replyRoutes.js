const express = require("express");
const {protect} = require('../middleware/authMiddleware')
const {replyToMessage} = require('../controller/reply.controller')
const { replyMessage } = require('../validation/message.validation');
const { validate } = require("../middleware/validate");

const router = express.Router();

router.route("/message/:messageId").post(protect,validate(replyMessage), replyToMessage);

module.exports = router;