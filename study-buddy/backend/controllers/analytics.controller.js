const Analytics = require("../models/Analytics");
const Quiz = require("../models/quiz");
const Flashcard = require("../models/Flashcard");
const StudyTopic = require("../models/StudyTopic");

// Get user analytics dashboard data
const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    let analytics = await Analytics.findOne({ userId });
    
    if (!analytics) {
      analytics = new Analytics({ userId });
      await analytics.save();
    }
    
    // Get additional stats
    const totalQuizzes = await Quiz.countDocuments({ createdBy: userId });
    const totalFlashcards = await Flashcard.countDocuments({ createdBy: userId });
    const totalTopics = await StudyTopic.countDocuments({ createdBy: userId });
    const completedTopics = await StudyTopic.countDocuments({ createdBy: userId, completed: true });
    
    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentQuizAttempts = analytics.quizAttempts.filter(
      attempt => new Date(attempt.completedAt) >= thirtyDaysAgo
    );
    
    const recentStudySessions = analytics.studySessions.filter(
      session => new Date(session.date) >= thirtyDaysAgo
    );
    
    // Calculate study time by day (last 7 days)
    const studyTimeByDay = getStudyTimeByDay(analytics.studySessions, 7);
    
    // Calculate performance trends (last 10 quiz attempts)
    const performanceTrend = analytics.quizAttempts
      .slice(-10)
      .map((attempt, index) => ({
        attempt: index + 1,
        score: attempt.percentage,
        date: attempt.completedAt
      }));
    
    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStudyTime: analytics.totalStudyTime,
          totalQuizzesTaken: analytics.totalQuizzesTaken,
          totalFlashcardsReviewed: analytics.totalFlashcardsReviewed,
          averageQuizScore: Math.round(analytics.averageQuizScore),
          streak: analytics.streak,
          totalQuizzes,
          totalFlashcards,
          totalTopics,
          completedTopics
        },
        charts: {
          studyTimeByDay,
          performanceTrend,
          recentActivity: {
            quizAttempts: recentQuizAttempts.length,
            studySessions: recentStudySessions.length
          }
        },
        recentQuizAttempts: analytics.quizAttempts.slice(-5).reverse(),
        recentStudySessions: analytics.studySessions.slice(-10).reverse()
      }
    });
  } catch (error) {
    console.error("Get dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message
    });
  }
};

// Record quiz attempt
const recordQuizAttempt = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { quizId, score, totalQuestions, timeSpent } = req.body;
    
    if (!quizId || score === undefined || !totalQuestions) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    let analytics = await Analytics.findOne({ userId });
    
    if (!analytics) {
      analytics = new Analytics({ userId });
    }
    
    const percentage = (score / totalQuestions) * 100;
    
    analytics.quizAttempts.push({
      quizId,
      score,
      totalQuestions,
      percentage,
      timeSpent: timeSpent || 0,
      completedAt: new Date()
    });
    
    // Add study session
    analytics.studySessions.push({
      activityType: 'quiz',
      duration: Math.round((timeSpent || 0) / 60), // Convert seconds to minutes
      date: new Date()
    });
    
    analytics.updateStats();
    await analytics.save();
    
    res.status(200).json({
      success: true,
      message: "Quiz attempt recorded",
      data: analytics
    });
  } catch (error) {
    console.error("Record quiz attempt error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record quiz attempt",
      error: error.message
    });
  }
};

// Record flashcard study session
const recordFlashcardSession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { flashcardSetId, cardsReviewed, timeSpent } = req.body;
    
    if (!flashcardSetId || !cardsReviewed) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    let analytics = await Analytics.findOne({ userId });
    
    if (!analytics) {
      analytics = new Analytics({ userId });
    }
    
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
    
    analytics.updateStats();
    await analytics.save();
    
    res.status(200).json({
      success: true,
      message: "Flashcard session recorded",
      data: analytics
    });
  } catch (error) {
    console.error("Record flashcard session error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record flashcard session",
      error: error.message
    });
  }
};

// Record general study session
const recordStudySession = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { activityType, duration } = req.body;
    
    if (!activityType || !duration) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }
    
    let analytics = await Analytics.findOne({ userId });
    
    if (!analytics) {
      analytics = new Analytics({ userId });
    }
    
    analytics.studySessions.push({
      activityType,
      duration,
      date: new Date()
    });
    
    analytics.updateStats();
    await analytics.save();
    
    res.status(200).json({
      success: true,
      message: "Study session recorded",
      data: analytics
    });
  } catch (error) {
    console.error("Record study session error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record study session",
      error: error.message
    });
  }
};

// Helper function to get study time by day
function getStudyTimeByDay(sessions, days) {
  const result = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    
    const daySessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= date && sessionDate < nextDate;
    });
    
    const totalMinutes = daySessions.reduce((sum, session) => sum + session.duration, 0);
    
    result.push({
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      minutes: totalMinutes
    });
  }
  
  return result;
}

module.exports = {
  getDashboard,
  recordQuizAttempt,
  recordFlashcardSession,
  recordStudySession
};
