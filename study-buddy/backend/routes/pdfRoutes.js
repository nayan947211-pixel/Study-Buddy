const express = require("express");
const router = express.Router();
const multer = require("multer");
const { extractPdf, getData } = require("../controllers/pdf.controller");

// Use global uploadsDir set in server.js (handles serverless vs local)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsPath = global.uploadsDir || "uploads/";
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

router.post("/getData", upload.single("file"), getData);
router.post("/extract", upload.single("pdf"), extractPdf);

module.exports = router;
