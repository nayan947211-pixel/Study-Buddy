const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { addTopic, getSchedule, markComplete } = require("../controllers/planner.controller");

router.post("/add-topic", auth, addTopic);
router.get("/schedule", auth, getSchedule);
router.patch("/complete/:id", auth, markComplete);

module.exports = router;
