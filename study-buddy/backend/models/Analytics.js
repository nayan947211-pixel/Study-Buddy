const mongoose = require("mongoose");

const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    quizAttempts: [{
      quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
      },
      score: {
        type: Number,
        required: true
      },
      totalQuestions: {
        type: Number,
        required: true
      },
      percentage: {
        type: Number,
        required: true
      },
      timeSpent: {
        type: Number, // in seconds
        default: 0
      },
      completedAt: {
        type: Date,
        default: Date.now
      }
    }],
    flashcardStudy: [{
      flashcardSetId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flashcard'
      },
      cardsReviewed: {
        type: Number,
        default: 0
      },
      timeSpent: {
        type: Number, // in seconds
        default: 0
      },
      studiedAt: {
        type: Date,
        default: Date.now
      }
    }],
    studySessions: [{
      activityType: {
        type: String,
        enum: ['quiz', 'flashcard', 'planner', 'chat'],
        required: true
      },
      duration: {
        type: Number, // in minutes
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }],
    totalStudyTime: {
      type: Number, // in minutes
      default: 0
    },
    totalQuizzesTaken: {
      type: Number,
      default: 0
    },
    totalFlashcardsReviewed: {
      type: Number,
      default: 0
    },
    averageQuizScore: {
      type: Number,
      default: 0
    },
    streak: {
      current: {
        type: Number,
        default: 0
      },
      longest: {
        type: Number,
        default: 0
      },
      lastStudyDate: {
        type: Date
      }
    }
  },
  { timestamps: true }
);

// Method to update statistics
analyticsSchema.methods.updateStats = function() {
  // Update total quizzes taken
  this.totalQuizzesTaken = this.quizAttempts.length;
  
  // Calculate average quiz score
  if (this.quizAttempts.length > 0) {
    const totalPercentage = this.quizAttempts.reduce((sum, attempt) => sum + attempt.percentage, 0);
    this.averageQuizScore = totalPercentage / this.quizAttempts.length;
  }
  
  // Update total flashcards reviewed
  this.totalFlashcardsReviewed = this.flashcardStudy.reduce((sum, session) => sum + session.cardsReviewed, 0);
  
  // Update total study time
  this.totalStudyTime = this.studySessions.reduce((sum, session) => sum + session.duration, 0);
  
  // Update streak
  this.updateStreak();
  
  return this;
};

// Method to update study streak
analyticsSchema.methods.updateStreak = function() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (this.streak.lastStudyDate) {
    const lastStudy = new Date(this.streak.lastStudyDate);
    lastStudy.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Same day, don't update streak
      return;
    } else if (daysDiff === 1) {
      // Consecutive day
      this.streak.current += 1;
      if (this.streak.current > this.streak.longest) {
        this.streak.longest = this.streak.current;
      }
    } else {
      // Streak broken
      this.streak.current = 1;
    }
  } else {
    // First study session
    this.streak.current = 1;
    this.streak.longest = 1;
  }
  
  this.streak.lastStudyDate = new Date();
};

module.exports = mongoose.model("Analytics", analyticsSchema);
