const express = require("express");
const { registerUser, loginUser, findUser, imgUpload} = require("../Controllers/userController");
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/find/:userId", findUser);
router.post('/upload', upload.single('image'), imgUpload);
router.post("/",findUser);
module.exports = router;