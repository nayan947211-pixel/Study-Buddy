const mongoose = require("mongoose");
require("dotenv").config();

exports.dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.log("\n⚠️  Common Solutions:");
    console.log("   1. Check if your IP is whitelisted in MongoDB Atlas");
    console.log("   2. Verify MONGO_URI in .env file");
    console.log("   3. Check MongoDB Atlas cluster status");
    console.log("\n🔄 Server will continue running without database...\n");
    // Don't exit - let server continue for API testing
  }
}
