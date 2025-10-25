# ಕನ್ನಡ Kannada Multilingual Voice & Text Chatbot

## Overview
A fully-featured multilingual chatbot application supporting both Kannada (ಕನ್ನಡ) and English languages with voice and text input/output capabilities. Built with Flask backend and vanilla JavaScript frontend, integrated with OpenAI GPT for intelligent conversational responses.

**Current State**: Production-ready MVP with all core features implemented.

## Recent Changes
- **October 25, 2025**: Initial project setup
  - Created Flask backend with session management
  - Built responsive frontend with Kannada Unicode support
  - Integrated OpenAI GPT-4o-mini for chat responses
  - Implemented Web Speech API for voice input/output
  - Added language switching between Kannada and English
  - Configured for Replit deployment

## Project Architecture

### Backend (Flask)
- **File**: `app.py`
- **Framework**: Flask with Flask-CORS and Flask-Session
- **Features**:
  - RESTful API endpoints (`/chat`, `/clear`, `/health`)
  - Session-based conversation history (last 10 messages)
  - Multilingual system prompts for Kannada and English
  - OpenAI GPT-4o-mini integration
  - Error handling and logging

### Frontend
- **Templates**: `templates/index.html`
- **Styling**: `static/style.css`
- **JavaScript**: `static/script.js`
- **Features**:
  - Clean, responsive UI with gradient design
  - Kannada Unicode font support (Noto Sans Kannada)
  - Language toggle (Kannada/English)
  - Text input with auto-send on Enter
  - Voice input via Web Speech API (browser-native)
  - Text-to-speech for bot responses
  - Chat history display with timestamps
  - Clear conversation functionality

### Dependencies
- **Python Packages**:
  - flask==3.1.2
  - flask-cors==6.0.1
  - flask-session==0.8.0
  - openai (latest)

### Environment Variables
- `OPENAI_API_KEY`: Required for OpenAI GPT integration
- `SESSION_SECRET`: Optional, auto-generated if not provided

## Features

### Text Chat
- Type messages in Kannada or English
- Intelligent responses from OpenAI GPT
- Conversation context maintained across messages
- Support for Unicode Kannada characters

### Voice Features
- **Speech-to-Text**: Click microphone button to speak in Kannada or English
- **Text-to-Speech**: Click speaker icon on bot messages to hear responses
- Automatic language detection based on selected mode
- Browser-native Web Speech API (works in Chrome, Edge, Safari)

### Language Support
- **Kannada (ಕನ್ನಡ)**: Full input/output support with proper Unicode rendering
- **English**: Standard English conversation
- Dynamic language switching during conversation
- Language-specific system prompts for natural responses

### Session Management
- Server-side session storage
- Maintains last 10 messages for context
- Clear conversation option to reset history

## File Structure
```
.
├── app.py                  # Flask backend application
├── templates/
│   └── index.html         # Main chatbot interface
├── static/
│   ├── style.css          # Responsive styling with Kannada font support
│   └── script.js          # Frontend logic, voice features, API calls
├── .gitignore             # Python and Flask specific ignores
└── replit.md              # This documentation file
```

## API Endpoints

### POST /chat
Sends a message and receives AI response.
- **Request Body**: `{ "message": "string", "language": "kannada" | "english" }`
- **Response**: `{ "response": "string", "success": true }`

### POST /clear
Clears the conversation history.
- **Response**: `{ "success": true, "message": "Conversation cleared" }`

### GET /health
Health check endpoint.
- **Response**: `{ "status": "healthy", "service": "Kannada Multilingual Chatbot" }`

## How It Works

1. **User Input**: User types or speaks a message in Kannada or English
2. **Frontend Processing**: JavaScript captures input and sends to `/chat` endpoint
3. **Backend Processing**: Flask receives message, retrieves conversation history from session
4. **OpenAI Integration**: Message sent to GPT-4o-mini with language-specific system prompt
5. **Response Generation**: AI generates contextual response in appropriate language
6. **Session Update**: Conversation history updated and saved to session
7. **Frontend Display**: Response displayed in chat with option to hear it spoken

## Browser Compatibility

### Full Support
- Chrome/Edge (recommended for best voice features)
- Safari (Mac/iOS)

### Limited Support
- Firefox (no voice input support)
- Other browsers may have limited Web Speech API support

## Future Enhancements
- Add persistent database storage for chat history
- Implement user authentication and profiles
- Support additional Indian languages (Hindi, Tamil, Telugu)
- Advanced language detection to auto-switch
- Voice activity detection for better speech recognition
- Export chat history feature
- Custom voice selection for TTS
- Mobile app version

## User Preferences
- None specified yet

## Deployment Notes
- Application binds to `0.0.0.0:5000` for Replit compatibility
- No cache headers needed (not implemented yet for static files)
- All dependencies managed via Replit's package manager
- Session files stored in `flask_session/` directory
