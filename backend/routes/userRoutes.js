const express = require("express");
const {
  registerUser,authUser, allUsers
} = require("../controller/userController");
const {protect} = require('../middleware/authMiddleware')
const { createUser, validateUserLogin } = require( "../validation/user.validation");


const {validate} = require('../middleware/validate')
const router = express.Router();

router.route("/").get(protect, allUsers);
router.route("/").post(validate(createUser),registerUser);
router.post("/login",validate(validateUserLogin), authUser);

module.exports = router;