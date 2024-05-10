const express = require("express");
const router = express.Router();
const {protect} = require('../middleware/authMiddleware')
const {accessChat, fetchChats, createGroupChat,renameGroupChat, addToGroup,removefromgroup} = require('../controller/chatController')
const {createChat, createGroup, renameGroup, removeUser, addUser} = require('../validation/chat.validation')
const {validate}= require('../middleware/validate')

router.route("/").post(protect,validate(createChat), accessChat);
router.route("/").get(protect, fetchChats);
router.route('/group').post(protect, validate(createGroup), createGroupChat)
router.route('/rename').put(protect, validate(renameGroup), renameGroupChat)
router.route('/removefromgroup').put(protect,validate(removeUser), removefromgroup)
router.route('/addtogroup').put(protect,validate(addUser), addToGroup)



module.exports = router;