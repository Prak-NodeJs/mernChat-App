const express = require("express");
const router = express.Router();
const {protect} = require('../middleware/authMiddleware')
const {accessChat, fetchChats, createGroupChat,renameGroupChat, addToGroup,removefromgroup} = require('../controller/chatController')


router.route("/").post(protect, accessChat);
router.route("/").get(protect, fetchChats);
router.route('/group').post(protect, createGroupChat)
router.route('/rename').put(protect, renameGroupChat)
router.route('/removefromgroup').put(protect,removefromgroup)
router.route('/addtogroup').put(protect, addToGroup)



module.exports = router;