// Kannada Multilingual Voice & Text Chatbot - Frontend JavaScript
// Handles chat interactions, voice input/output, and UI updates

class ChatBot {
    constructor() {
        this.currentLanguage = 'kannada';
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeSpeechRecognition();
    }

    initializeElements() {
        this.chatMessages = document.getElementById('chatMessages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.kannadaBtn = document.getElementById('kannadaBtn');
        this.englishBtn = document.getElementById('englishBtn');
    }

    initializeEventListeners() {
        // Send message on button click
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Send message on Enter key
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Voice input
        this.voiceBtn.addEventListener('click', () => this.toggleVoiceInput());

        // Clear conversation
        this.clearBtn.addEventListener('click', () => this.clearConversation());

        // Language selection
        this.kannadaBtn.addEventListener('click', () => this.changeLanguage('kannada'));
        this.englishBtn.addEventListener('click', () => this.changeLanguage('english'));
    }

    initializeSpeechRecognition() {
        // Check if browser supports Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            console.warn('Speech Recognition not supported in this browser');
            this.voiceBtn.disabled = true;
            this.voiceBtn.title = 'Voice input not supported in this browser';
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        
        // Set language based on current selection
        this.updateRecognitionLanguage();

        this.recognition.onstart = () => {
            this.isListening = true;
            this.voiceBtn.classList.add('listening');
            this.updateStatus('Listening... Speak now', 'active');
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.messageInput.value = transcript;
            this.updateStatus('Message captured', 'active');
            
            // Auto-send the message
            setTimeout(() => this.sendMessage(), 500);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.updateStatus(`Voice error: ${event.error}`, 'error');
            this.isListening = false;
            this.voiceBtn.classList.remove('listening');
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.voiceBtn.classList.remove('listening');
        };
    }

    updateRecognitionLanguage() {
        if (!this.recognition) return;
        
        // Set the appropriate language code
        if (this.currentLanguage === 'kannada') {
            this.recognition.lang = 'kn-IN'; // Kannada (India)
        } else {
            this.recognition.lang = 'en-US'; // English (US)
        }
    }

    toggleVoiceInput() {
        if (!this.recognition) {
            alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        if (this.isListening) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    changeLanguage(language) {
        this.currentLanguage = language;
        
        // Update UI
        if (language === 'kannada') {
            this.kannadaBtn.classList.add('active');
            this.englishBtn.classList.remove('active');
            this.messageInput.placeholder = 'ನಿಮ್ಮ ಸಂದೇಶ ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...';
        } else {
            this.englishBtn.classList.add('active');
            this.kannadaBtn.classList.remove('active');
            this.messageInput.placeholder = 'Type your message here...';
        }

        // Update speech recognition language
        this.updateRecognitionLanguage();
        
        this.updateStatus(`Language changed to ${language === 'kannada' ? 'Kannada' : 'English'}`, 'active');
        setTimeout(() => this.updateStatus('', ''), 2000);
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message) {
            this.updateStatus('Please enter a message', 'error');
            return;
        }

        // Disable input while processing
        this.messageInput.disabled = true;
        this.sendBtn.disabled = true;
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Clear input
        this.messageInput.value = '';
        
        // Show typing indicator
        const typingId = this.showTypingIndicator();
        
        try {
            this.updateStatus('Sending...', 'active');
            
            // Send to backend
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    language: this.currentLanguage
                })
            });

            const data = await response.json();
            
            // Remove typing indicator
            this.removeTypingIndicator(typingId);
            
            if (data.success) {
                this.addMessage(data.response, 'bot');
                this.updateStatus('Response received', 'active');
                setTimeout(() => this.updateStatus('', ''), 2000);
            } else {
                throw new Error(data.error || 'Unknown error occurred');
            }
            
        } catch (error) {
            console.error('Error sending message:', error);
            this.removeTypingIndicator(typingId);
            this.updateStatus('Error: ' + error.message, 'error');
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        } finally {
            // Re-enable input
            this.messageInput.disabled = false;
            this.sendBtn.disabled = false;
            this.messageInput.focus();
        }
    }

    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const headerDiv = document.createElement('div');
        headerDiv.className = 'message-header';
        headerDiv.textContent = sender === 'user' ? 'You' : 'AI Assistant';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        textDiv.textContent = text;
        
        contentDiv.appendChild(headerDiv);
        contentDiv.appendChild(textDiv);
        
        // Add speak button for bot messages
        if (sender === 'bot') {
            const footerDiv = document.createElement('div');
            footerDiv.className = 'message-footer';
            
            const speakBtn = document.createElement('button');
            speakBtn.className = 'speak-btn';
            speakBtn.innerHTML = '🔊';
            speakBtn.title = 'Click to hear this message';
            speakBtn.onclick = () => this.speakText(text);
            
            const timeSpan = document.createElement('span');
            timeSpan.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            footerDiv.appendChild(speakBtn);
            footerDiv.appendChild(timeSpan);
            contentDiv.appendChild(footerDiv);
        }
        
        messageDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        const id = 'typing-' + Date.now();
        typingDiv.id = id;
        typingDiv.className = 'message bot';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = `
            <div class="message-header">AI Assistant</div>
            <div class="message-text">
                <span class="loading"></span>
                <span class="loading"></span>
                <span class="loading"></span>
            </div>
        `;
        
        typingDiv.appendChild(contentDiv);
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
        
        return id;
    }

    removeTypingIndicator(id) {
        const typingDiv = document.getElementById(id);
        if (typingDiv) {
            typingDiv.remove();
        }
    }

    speakText(text) {
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set language based on current selection
        if (this.currentLanguage === 'kannada') {
            utterance.lang = 'kn-IN';
        } else {
            utterance.lang = 'en-US';
        }
        
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;
        
        utterance.onstart = () => {
            this.updateStatus('Speaking...', 'active');
        };
        
        utterance.onend = () => {
            this.updateStatus('', '');
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.updateStatus('Speech error', 'error');
        };
        
        this.synthesis.speak(utterance);
    }

    async clearConversation() {
        if (!confirm('Are you sure you want to clear the conversation? / ಸಂಭಾಷಣೆಯನ್ನು ತೆರವುಗೊಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?')) {
            return;
        }

        try {
            const response = await fetch('/clear', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            
            if (data.success) {
                // Clear chat UI
                this.chatMessages.innerHTML = `
                    <div class="welcome-message">
                        <h3>ಸ್ವಾಗತ! Welcome!</h3>
                        <p>I can understand and speak both Kannada and English. Choose your preferred language above and start chatting!</p>
                        <p class="feature-list">
                            ✓ Type your message or use voice input<br>
                            ✓ Click the speaker icon to hear responses<br>
                            ✓ Switch languages anytime
                        </p>
                    </div>
                `;
                this.updateStatus('Conversation cleared', 'active');
                setTimeout(() => this.updateStatus('', ''), 2000);
            }
        } catch (error) {
            console.error('Error clearing conversation:', error);
            this.updateStatus('Error clearing conversation', 'error');
        }
    }

    updateStatus(message, type) {
        this.statusIndicator.textContent = message;
        this.statusIndicator.className = 'status-indicator';
        if (type) {
            this.statusIndicator.classList.add(type);
        }
    }

    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new ChatBot();
});
