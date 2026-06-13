import express from 'express';
import multer from 'multer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import DocumentState from '../models/DocumentState.js';
import ModelRouter from '../services/ModelRouter.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Cap at 10MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('INVALID_FORMAT_ONLY_PDF_ALLOWED'), false);
    }
    cb(null, true);
  }
});

router.post('/upload', authMiddleware, upload.single('file'), async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { workspaceId } = req.params;
    const { type } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!['syllabus', 'pyq', 'codebase_context'].includes(type)) {
      return res.status(400).json({ error: 'Invalid document type' });
    }

    const docState = new DocumentState({
      userId,
      workspaceId,
      type,
      originalFilename: req.file.originalname,
      state: 'processing'
    });
    await docState.save();

    const pdfData = await pdfParse(req.file.buffer);
    docState.parsedText = pdfData.text;

    // Phase A: Preprocessing Pipeline (Structure Extraction)
    let extractedStructure = null;
    let extractionVersion = null;
    let extractionTelemetry = null;
    
    try {
      const response = await ModelRouter.execute('STRUCTURE_EXTRACTION', {
        filename: req.file.originalname,
        text: pdfData.text,
        docType: type.toUpperCase()
      });
      extractedStructure = response.data;
      extractionTelemetry = response.telemetry;
      
      if (extractedStructure) {
        extractionVersion = {
          model: response.telemetry.providerUsed,
          promptVersion: "v2.multi-model-router"
        };
      }
    } catch (extractError) {
      console.error("Structure extraction failed entirely:", extractError.message);
      // Removed the hard 429 throw since ModelRouter gracefully handles it, 
      // but if BOTH fail, we still fail the upload.
      throw new Error(`Structure Extraction Failed: ${extractError.message}`);
    }

    docState.metadata = {
      ...docState.metadata,
      extractedStructure,
      extractionVersion,
      extractionTelemetry,
      userDeclaredType: type,
      detectedType: extractedStructure?.detectedType || type
    };
    
    docState.state = 'completed';
    await docState.save();

    res.status(200).json({ 
      success: true, 
      documentId: docState._id,
      detectedType: docState.metadata.detectedType,
      message: 'File parsed and stored successfully'
    });

  } catch (error) {
    console.error('Upload/Parse error:', error);
    next(error);
  }
});

// Streamlined Error Handling Catch
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'FILE_TOO_LARGE' });
    }
    return res.status(400).json({ error: err.message });
  } else if (err.message === 'INVALID_FORMAT_ONLY_PDF_ALLOWED') {
    return res.status(415).json({ error: 'ONLY_PDF_ALLOWED' });
  }
  
  res.status(500).json({ error: 'INTERNAL_SERVER_ERROR', details: err.message });
});

export default router;
