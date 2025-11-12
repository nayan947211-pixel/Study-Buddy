const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askQuestion = async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required",
      });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required. Please login again.",
      });
    }

    console.log("Processing question with Gemini AI...");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let prompt;
    if (context) {
      prompt = `
You are an expert AI tutor helping a student learn. The student has uploaded study material and is asking questions about it.

Study Material Context:
${context.substring(0, 4000)}

Student's Question:
${question}

Provide a clear, helpful, and educational answer. Include:
1. Direct answer to the question
2. Relevant examples if applicable
3. Additional context or clarification
4. Encouragement to keep learning

Keep your response concise but informative (2-4 paragraphs).
`;
    } else {
      prompt = `
You are an expert AI tutor helping a student learn. The student is asking you a question.

Student's Question:
${question}

Provide a clear, helpful, and educational answer. Include:
1. Direct answer to the question
2. Relevant examples if applicable
3. Additional context or clarification
4. Encouragement to keep learning

Keep your response concise but informative (2-4 paragraphs).
`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const answer = response.text();

    console.log("AI Response generated successfully");

    res.status(200).json({
      success: true,
      data: {
        question,
        answer,
      },
      message: "Answer generated successfully",
    });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate answer",
      error: error.message,
    });
  }
};

module.exports = { askQuestion };
