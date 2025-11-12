const fs = require('fs');
const pdfParse = require('pdf-parse');

exports.getData = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No PDF file uploaded' 
      });
    }
    
    console.log('File received:', req.file.originalname);
    const dataBuffer = fs.readFileSync(req.file.path);
    
    console.log('Parsing PDF...');
    const pdfData = await pdfParse(dataBuffer);
    
    console.log('PDF parsed successfully');
    fs.unlinkSync(req.file.path);
    
    res.status(200).json({ 
      success: true,
      data: {
        text: pdfData.text,
        numPages: pdfData.numpages, 
        info: pdfData.info,
        metadata: pdfData.metadata,
      },
      message: 'PDF text extracted successfully'
    });

  } catch (err) {
    console.error('PDF extraction error:', err);
  
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to extract PDF text',
      error: err.message 
    });
  }
};

exports.extractPdf = async (req, res) => {
  try {
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(dataBuffer);

    fs.unlinkSync(req.file.path);

    res.json({ text: data.text });
  } catch (err) {
    console.error('Extract PDF error:', err);
    res.status(500).json({ error: 'Failed to extract PDF' });
  }
};
