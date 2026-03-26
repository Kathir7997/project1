import express from 'express';
import { transcribeAudio, upload } from '../controllers/voiceController.js';

const router = express.Router();

// Transcribe audio (using multer middleware for file upload)
router.post('/transcribe', upload.single('audio'), transcribeAudio);

export default router;
