from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
from flask_session import Session
import os
from openai import OpenAI

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SESSION_SECRET', os.urandom(24))
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)
CORS(app)

# Initialize OpenAI client
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    print("WARNING: OPENAI_API_KEY environment variable is not set!")
    print("The chatbot will not function without a valid OpenAI API key.")
    
client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# System prompts for multilingual support
SYSTEM_PROMPTS = {
    'kannada': """You are a helpful AI assistant that can communicate in Kannada and English. 
    When the user speaks in Kannada, respond primarily in Kannada. When they speak in English, 
    respond in English. Be conversational, friendly, and helpful. You can mix languages if appropriate 
    for clarity.""",
    'english': """You are a helpful AI assistant. Be conversational, friendly, and helpful."""
}

@app.route('/')
def home():
    """Render the main chatbot interface."""
    return render_template('index.html')

@app.route('/chat', methods=['POST'])
def chat():
    """
    Handle chat messages and generate responses using OpenAI.
    Supports both Kannada and English languages.
    """
    try:
        data = request.get_json(silent=True)
        if data is None:
            return jsonify({'error': 'Invalid JSON payload', 'success': False}), 400
        
        user_message = data.get('message', '')
        language = data.get('language', 'kannada')
        
        if not user_message:
            return jsonify({'error': 'No message provided', 'success': False}), 400
        
        # Check if OpenAI client is initialized
        if client is None:
            return jsonify({
                'error': 'OpenAI API key not configured. Please contact the administrator.',
                'success': False
            }), 503
        
        # Initialize conversation history in session if not exists
        if 'conversation_history' not in session:
            session['conversation_history'] = []
        
        # Add user message to history
        session['conversation_history'].append({
            'role': 'user',
            'content': user_message
        })
        
        # Prepare messages for OpenAI
        messages = [
            {'role': 'system', 'content': SYSTEM_PROMPTS.get(language, SYSTEM_PROMPTS['english'])}
        ]
        
        # Add conversation history (keep last 10 messages to manage context)
        messages.extend(session['conversation_history'][-10:])
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model='gpt-4o-mini',
            messages=messages,
            temperature=0.7,
            max_tokens=500
        )
        
        assistant_message = response.choices[0].message.content
        
        # Add assistant response to history
        session['conversation_history'].append({
            'role': 'assistant',
            'content': assistant_message
        })
        
        # Save session
        session.modified = True
        
        return jsonify({
            'response': assistant_message,
            'success': True
        })
        
    except Exception as e:
        # Log the full error for debugging
        print(f"Error in chat endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Return user-friendly error message without exposing stack trace
        return jsonify({
            'error': 'An error occurred while processing your message. Please try again.',
            'success': False
        }), 500

@app.route('/clear', methods=['POST'])
def clear_conversation():
    """Clear the conversation history."""
    try:
        session['conversation_history'] = []
        session.modified = True
        return jsonify({
            'success': True,
            'message': 'Conversation cleared'
        })
    except Exception as e:
        return jsonify({
            'error': str(e),
            'success': False
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'service': 'Kannada Multilingual Chatbot'})

if __name__ == '__main__':
    # Run on 0.0.0.0:5000 for Replit compatibility
    app.run(host='0.0.0.0', port=5000, debug=True)
