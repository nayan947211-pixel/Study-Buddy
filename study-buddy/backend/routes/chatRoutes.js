const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { askQuestion } = require("../controllers/chat.controller");

router.post("/ask", auth, askQuestion);

module.exports = router;
