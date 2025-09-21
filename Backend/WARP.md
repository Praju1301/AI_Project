# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Sathi is a Node.js/Express backend for an AI-powered voice assistant designed specifically for teenagers with Down syndrome. The system processes audio input, performs speech-to-text transcription, emotion detection, and generates empathetic responses using Google's Gemini AI, with integration to Google Calendar for routine management.

## Development Commands

### Core Commands
```bash
# Install dependencies
npm install

# Start production server
npm start

# Start development server with auto-restart
npm run dev
```

### Environment Setup
The application requires several environment variables in `.env`:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `GEMINI_API_KEY` - Google Gemini API key
- `HUGGINGFACE_API_KEY` - Hugging Face API key for Whisper transcription
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Google Cloud service account JSON file
- `PORT` - Server port (defaults to 5000)

## Architecture Overview

### Core Architecture Pattern
The application follows a layered MVC architecture with service-oriented components:

**Request Flow:**
1. Audio file uploaded via multer middleware → 
2. JWT authentication via `protect` middleware → 
3. Controller orchestrates multiple AI services → 
4. Database logging → 
5. Response with text + base64 audio

### Key Service Integration Pipeline
The main interaction flow (`/api/interact`) orchestrates multiple AI services sequentially:

1. **Audio Transcription** - Hugging Face Whisper API converts speech to text
2. **Emotion Detection** - Local Transformers.js model analyzes audio for emotions
3. **Calendar Context** - Google Calendar API fetches upcoming events
4. **Response Generation** - Google Gemini AI generates empathetic responses
5. **Speech Synthesis** - Google Cloud TTS converts response to audio
6. **Database Logging** - MongoDB stores complete interaction records

### Directory Structure
```
src/
├── config/         # Database connection
├── controllers/    # Route handlers (auth, interaction, routine, progress)
├── middleware/     # Authentication & error handling
├── models/         # MongoDB schemas (User, Interaction)
├── services/       # External API integrations (AI services)
├── routes/         # Route definitions (currently unused, routes in index.js)
└── utils/          # JWT token generation
```

### Authentication & Security
- JWT-based authentication with bcrypt password hashing
- Protected routes use `protect` middleware that validates Bearer tokens
- User sessions tied to individual interaction logging

### External Service Dependencies
- **MongoDB** - User accounts and interaction logging
- **Google Cloud TTS** - Speech synthesis with Wavenet voices
- **Google Gemini AI** - Contextual response generation with emotion awareness
- **Hugging Face** - Whisper model for speech-to-text transcription
- **Google Calendar API** - Routine/schedule management integration
- **Transformers.js** - Local emotion detection from audio

### Data Models
- **User**: Basic auth with name, email, hashed password
- **Interaction**: Links user to transcribed text, detected emotion, and AI response

### File Upload Handling
Audio files processed via multer, temporarily stored in `uploads/` directory, automatically cleaned up after processing using try/finally blocks.

## Key Development Notes

### Service Initialization
The emotion detection model (`wav2vec2-base-superb-ks`) loads at server startup to prevent request delays. This can take significant time on first startup.

### Error Handling
Centralized error handling middleware catches and formats errors consistently. Services should throw descriptive error messages that are user-friendly for the target demographic.

### AI Response Persona
The Gemini service is specifically prompted to act as "Sathi" - a patient, empathetic assistant using simple language appropriate for teenagers with Down syndrome.

### Calendar Integration
Uses service account authentication for Google Calendar, scoped to read/write calendar events. Timezone hardcoded to 'Asia/Kolkata'.

### Audio Processing
- Input: Audio files via multipart/form-data
- Processing: 16kHz sampling rate for emotion detection
- Output: Base64-encoded MP3 audio responses
