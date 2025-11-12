const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const {
  getDashboard,
  recordQuizAttempt,
  recordFlashcardSession,
  recordStudySession
} = require("../controllers/analytics.controller");

// All routes require authentication
router.use(auth);

// Get analytics dashboard
router.get("/dashboard", getDashboard);

// Record quiz attempt
router.post("/quiz-attempt", recordQuizAttempt);

// Record flashcard study session
router.post("/flashcard-session", recordFlashcardSession);

// Record general study session
router.post("/study-session", recordStudySession);

module.exports = router;
