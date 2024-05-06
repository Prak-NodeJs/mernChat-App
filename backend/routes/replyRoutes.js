const express = require("express");
const {protect} = require('../middleware/authMiddleware')
const {replyToMessage} = require('../controller/reply.controller')

const router = express.Router();

router.route("/message/:messageId").post(protect, replyToMessage);

module.exports = router;