const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const { generateFlashcards, getMyFlashcards, completeFlashcardSession } = require("../controllers/flashcard.controller");

router.post("/generate", auth, generateFlashcards);
router.post("/complete", auth, completeFlashcardSession);
router.get("/my-flashcards", auth, getMyFlashcards);

module.exports = router;
