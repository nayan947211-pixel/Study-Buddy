const { GoogleGenerativeAI } = require("@google/generative-ai");
const Flashcard = require("../models/Flashcard");
const Analytics = require("../models/Analytics");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateFlashcards = async (req, res) => {
  try {
    const { text, title } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "PDF text is required to generate flashcards",
      });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required. Please login again.",
      });
    }

    console.log("Generating flashcards with Gemini AI...");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an expert flashcard generator. Based on the following text, create concise Q/A flashcards for quick revision.

Text:
${text.substring(0, 3000)}

Requirements:
1. Create 10-15 flashcards
2. Each flashcard should have a clear question and concise answer
3. Focus on key concepts, definitions, and important facts
4. Keep questions specific and answers brief (1-3 sentences)
5. Cover different aspects of the material

Return ONLY a valid JSON array in this exact format (no markdown, no extra text):
[
  {
    "question": "What is...?",
    "answer": "Brief, clear answer here."
  }
]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let generatedText = response.text();

    console.log("Raw Gemini Response:", generatedText);

    generatedText = generatedText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let cards;
    try {
      cards = JSON.parse(generatedText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Generated Text:", generatedText);
      return res.status(500).json({
        success: false,
        message: "Failed to parse AI response",
        error: parseError.message,
      });
    }

    if (!Array.isArray(cards) || cards.length === 0) {
      return res.status(500).json({
        success: false,
        message: "AI generated invalid flashcard format",
      });
    }

    const flashcardSet = new Flashcard({
      title: title || `Flashcards generated on ${new Date().toLocaleDateString()}`,
      cards: cards,
      createdBy: req.user.userId,
    });

    await flashcardSet.save();

    res.status(200).json({
      success: true,
      data: flashcardSet,
      message: "Flashcards generated successfully",
    });
  } catch (error) {
    console.error("Flashcard generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate flashcards",
      error: error.message,
    });
  }
};

const getMyFlashcards = async (req, res) => {
  try {
    const userId = req.user.userId;
    const flashcards = await Flashcard.find({ createdBy: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards,
    });
  } catch (error) {
    console.error("Get flashcards error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch flashcards",
      error: error.message,
    });
  }
};

// Complete flashcard study session and record analytics
const completeFlashcardSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { flashcardSetId, cardsReviewed, timeSpent } = req.body;
    
    if (!flashcardSetId || !cardsReviewed) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (flashcardSetId, cardsReviewed)"
      });
    }

    // Verify flashcard set exists
    const flashcardSet = await Flashcard.findById(flashcardSetId);
    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        message: "Flashcard set not found"
      });
    }

    // Find or create analytics for user
    let analytics = await Analytics.findOne({ userId });
    if (!analytics) {
      analytics = new Analytics({ userId });
    }

    // Record flashcard study session
    analytics.flashcardStudy.push({
      flashcardSetId,
      cardsReviewed,
      timeSpent: timeSpent || 0,
      studiedAt: new Date()
    });

    // Add study session
    analytics.studySessions.push({
      activityType: 'flashcard',
      duration: Math.round((timeSpent || 0) / 60), // Convert seconds to minutes
      date: new Date()
    });

    // Update stats and streak
    analytics.updateStats();
    await analytics.save();

    res.status(200).json({
      success: true,
      message: "Flashcard session recorded in analytics",
      data: {
        cardsReviewed,
        totalFlashcardsReviewed: analytics.totalFlashcardsReviewed,
        streak: analytics.streak.current
      }
    });
  } catch (error) {
    console.error("Complete flashcard session error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record flashcard session",
      error: error.message
    });
  }
};

module.exports = { generateFlashcards, getMyFlashcards, completeFlashcardSession };
