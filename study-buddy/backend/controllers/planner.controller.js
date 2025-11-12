const StudyTopic = require("../models/StudyTopic");

const addTopic = async (req, res) => {
  try {
    const { title, description, difficulty, estimatedTime, priority } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Topic title is required",
      });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required. Please login again.",
      });
    }

    // Calculate scheduled date based on priority
    const now = new Date();
    let scheduledFor = new Date();
    
    switch (priority) {
      case 'high':
        scheduledFor.setDate(now.getDate() + 1); // Tomorrow
        break;
      case 'medium':
        scheduledFor.setDate(now.getDate() + 3); // 3 days
        break;
      case 'low':
        scheduledFor.setDate(now.getDate() + 7); // 1 week
        break;
      default:
        scheduledFor.setDate(now.getDate() + 3);
    }

    const topic = new StudyTopic({
      title,
      description,
      difficulty: difficulty || 'medium',
      estimatedTime: estimatedTime || 60,
      priority: priority || 'medium',
      scheduledFor,
      createdBy: req.user.userId,
    });

    await topic.save();

    res.status(200).json({
      success: true,
      data: topic,
      message: "Topic added to schedule successfully",
    });
  } catch (error) {
    console.error("Add topic error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add topic",
      error: error.message,
    });
  }
};

const getSchedule = async (req, res) => {
  try {
    const userId = req.user.userId;
    const topics = await StudyTopic.find({ createdBy: userId }).sort({ scheduledFor: 1 });

    res.status(200).json({
      success: true,
      count: topics.length,
      data: topics,
    });
  } catch (error) {
    console.error("Get schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch schedule",
      error: error.message,
    });
  }
};

const markComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const topic = await StudyTopic.findOne({ _id: id, createdBy: userId });
    
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: "Topic not found",
      });
    }

    topic.completed = true;
    topic.completedAt = new Date();
    await topic.save();

    res.status(200).json({
      success: true,
      data: topic,
      message: "Topic marked as complete",
    });
  } catch (error) {
    console.error("Mark complete error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark topic as complete",
      error: error.message,
    });
  }
};

module.exports = { addTopic, getSchedule, markComplete };
