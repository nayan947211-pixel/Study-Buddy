const { GoogleGenerativeAI } = require("@google/generative-ai");
const Quiz = require("../models/quiz");
const Analytics = require("../models/Analytics");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateQuiz = async (req, res) => {
  try {
    const { text, numQuestions = 5, difficulty = "medium", title } = req.body;

    console.log("User from token:", req.user);

    if (!text) {
      return res.status(400).json({
        success: false,
        message: "PDF text is required to generate quiz",
      });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required. Please login again.",
      });
    }

    console.log("Generating quiz with Gemini AI...");

    // Use the correct Gemini model name
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
You are an expert quiz generator. Based on the following text, create ${numQuestions} multiple-choice questions with ${difficulty} difficulty level.

Text:
${text.substring(0, 3000)}

Requirements:
1. Create exactly ${numQuestions} questions
2. Each question must have exactly 4 options (A, B, C, D)
3. Provide the correct answer (just the letter: A, B, C, or D)
4. Include a brief explanation for each answer
5. Make questions relevant and meaningful based on the content

Return ONLY a valid JSON array in this exact format (no markdown, no extra text):
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "explanation": "Brief explanation why this is correct",
    "difficulty": "${difficulty}"
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

    let questions;
    try {
      questions = JSON.parse(generatedText);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Generated Text:", generatedText);
      return res.status(500).json({
        success: false,
        message: "Failed to parse AI response",
        error: parseError.message,
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({
        success: false,
        message: "AI generated invalid quiz format",
      });
    }

    const quiz = new Quiz({
      title: title || `Quiz generated on ${new Date().toLocaleDateString()}`,
      description: `Auto-generated quiz with ${numQuestions} questions`,
      questions: questions,
      generatedFrom: "pdf",
      createdBy: req.user.userId,
    });

    await quiz.save();

    res.status(200).json({
      success: true,
      data: quiz,
      message: "Quiz generated successfully",
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate quiz",
      error: error.message,
    });
  }
};

const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    console.error("Get quizzes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quizzes",
      error: error.message,
    });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
    });
  } catch (error) {
    console.error("Get quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch quiz",
      error: error.message,
    });
  }
};

const getMyQuizzes = async (req, res) => {
  try {
    const userId = req.user.userId;
    const quizzes = await Quiz.find({ createdBy: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    console.error("Get my quizzes error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your quizzes",
      error: error.message,
    });
  }
};

// Complete quiz and record analytics
const completeQuiz = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { quizId, score, totalQuestions, timeSpent, selectedAnswers } = req.body;
    
    if (!quizId || score === undefined || !totalQuestions) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields (quizId, score, totalQuestions)"
      });
    }

    // Verify quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found"
      });
    }

    // Find or create analytics for user
    let analytics = await Analytics.findOne({ userId });
    if (!analytics) {
      analytics = new Analytics({ userId });
    }

    // Calculate percentage
    const percentage = (score / totalQuestions) * 100;

    // Record quiz attempt
    analytics.quizAttempts.push({
      quizId,
      score,
      totalQuestions,
      percentage,
      timeSpent: timeSpent || 0,
      completedAt: new Date()
    });

    // Add study session for the quiz
    analytics.studySessions.push({
      activityType: 'quiz',
      duration: Math.round((timeSpent || 0) / 60), // Convert seconds to minutes
      date: new Date()
    });

    // Update stats and streak
    analytics.updateStats();
    await analytics.save();

    res.status(200).json({
      success: true,
      message: "Quiz completed and analytics recorded",
      data: {
        score,
        totalQuestions,
        percentage: Math.round(percentage),
        analytics: {
          totalQuizzesTaken: analytics.totalQuizzesTaken,
          averageQuizScore: Math.round(analytics.averageQuizScore),
          streak: analytics.streak.current
        }
      }
    });
  } catch (error) {
    console.error("Complete quiz error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to complete quiz",
      error: error.message
    });
  }
};

module.exports = { generateQuiz, getAllQuizzes, getQuizById, getMyQuizzes, completeQuiz };
