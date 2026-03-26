import { AssemblyAI } from 'assemblyai';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { successResponse, errorResponse } from '../utils/helpers.js';

// Lazy initialize AssemblyAI to avoid crashes when API key is missing
let assemblyAIClient = null;
const getAssemblyAIClient = () => {
    if (!assemblyAIClient) {
        if (!process.env.ASSEMBLYAI_API_KEY) {
            throw new Error('AssemblyAI API key not configured. Please add ASSEMBLYAI_API_KEY to your .env file.');
        }
        assemblyAIClient = new AssemblyAI({
            apiKey: process.env.ASSEMBLYAI_API_KEY,
        });
    }
    return assemblyAIClient;
};

// Configure multer for audio file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/audio';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
    },
});

export const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /wav|mp3|ogg|webm|m4a/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'));
        }
    },
});

// @desc    Transcribe audio to text using AssemblyAI
// @route   POST /api/voice/transcribe
// @access  Public
export const transcribeAudio = async (req, res) => {
    try {
        if (!req.file) {
            return errorResponse(res, 400, 'No audio file uploaded');
        }

        const audioPath = req.file.path;

        const client = getAssemblyAIClient();

        // Upload audio file and get transcription
        const transcript = await client.transcripts.transcribe({
            audio: audioPath,
        });

        // Delete the audio file after transcription
        fs.unlinkSync(audioPath);

        if (transcript.status === 'error') {
            return errorResponse(res, 500, 'Transcription failed', transcript.error);
        }

        successResponse(res, 200, { text: transcript.text }, 'Audio transcribed successfully');
    } catch (error) {
        // Clean up file if exists
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        errorResponse(res, 500, 'Failed to transcribe audio', error.message);
    }
};
