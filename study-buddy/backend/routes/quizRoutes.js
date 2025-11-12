const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { 
  generateQuiz, 
  getAllQuizzes, 
  getQuizById,
  getMyQuizzes,
  completeQuiz 
} = require("../controllers/quiz.controller");

router.post("/generate", auth, generateQuiz);

router.post("/complete", auth, completeQuiz);

router.get("/", getAllQuizzes);

router.get("/my-quizzes", auth, getMyQuizzes);

router.get("/:id", getQuizById);


module.exports = router;
