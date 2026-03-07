/**
 * e-sort AI Help Chatbot Logic
 * Simulated AI Assistant for Email Organizer
 */

class ESortChatBot {
    constructor() {
        this.chatWindow = document.getElementById('ai-chat-window');
        this.chatBtn = document.getElementById('ai-help-btn');
        this.closeBtn = document.getElementById('close-chat');
        this.messagesContainer = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('send-chat');

        this.context = null; // To remember the last topic
        this.isTyping = false;

        this.intents = [
            {
                id: 'auth',
                keywords: ['connect', 'google', 'login', 'auth', 'sign in', 'account', 'link'],
                response: "To connect your Google account, click the **link icon (🔗)** in the top sidebar header. This allows e-sort to organize your emails securely."
            },
            {
                id: 'sorting',
                keywords: ['sort', 'rule', 'organize', 'organise', 'create', 'automation'],
                response: "You can create custom sorting rules! Click on **'+ Create Sort Rule'** in the sidebar. You can automate sorting by Subject, Body content, or even Sender Logos."
            },
            {
                id: 'logos',
                keywords: ['logo', 'detection', 'brand', 'icon', 'identify'],
                response: "e-sort uses advanced logo detection to identify senders. You can see company logos next to your emails and even create rules to group emails by specific brands!"
            },
            {
                id: 'feedback',
                keywords: ['feedback', 'suggest', 'problem', 'bug', 'issue', 'report'],
                response: "We value your input! Use the **'💬 Feedback'** button at the bottom of the sidebar to share your thoughts or report any issues you encounter."
            },
            {
                id: 'troubleshooting',
                keywords: ['missing', 'emails', 'empty', 'not showing', 'refresh', 'sync'],
                response: "If your emails aren't appearing, make sure you are connected to Google. Try clicking the **🔗 icon** in the header to refresh your connection and sync your latest emails."
            },
            {
                id: 'greeting',
                keywords: ['hi', 'hello', 'hey', 'yo', 'sup', 'morning', 'evening'],
                response: "Hello! I'm your e-sort AI assistant. I can help you with Google connection, creating sorting rules, or understanding how logo detection works. How can I help you today?"
            }
        ];

        this.init();
    }

    init() {
        if (!this.chatBtn) return;
        this.chatBtn.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.toggleChat());

        this.sendBtn.addEventListener('click', () => this.handleSendMessage());
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSendMessage();
        });
    }

    toggleChat() {
        const isVisible = this.chatWindow.style.display === 'flex';
        this.chatWindow.style.display = isVisible ? 'none' : 'flex';
        if (!isVisible) {
            this.chatInput.focus();
            if (this.messagesContainer.children.length === 0) {
                this.addMessage("Hello! I'm e-sort AI Helper. Ask me anything about organizing your emails!", 'ai');
            }
        }
    }

    handleSendMessage() {
        const text = this.chatInput.value.trim();
        if (!text || this.isTyping) return;

        this.addMessage(text, 'user');
        this.chatInput.value = '';

        this.showTypingIndicator();

        // Simulate AI "thinking" time
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.getAIResponse(text);
            this.addMessage(response, 'ai');
        }, 800 + Math.random() * 1000);
    }

    showTypingIndicator() {
        this.isTyping = true;
        const loader = document.createElement('div');
        loader.className = 'message ai typing';
        loader.id = 'typing-indicator';
        loader.innerHTML = '<span></span><span></span><span></span>';
        this.messagesContainer.appendChild(loader);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const loader = document.getElementById('typing-indicator');
        if (loader) loader.remove();
    }

    addMessage(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;

        // Simple Markdown-like bold formatting
        const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        msgDiv.innerHTML = formattedText;

        this.messagesContainer.appendChild(msgDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    getAIResponse(input) {
        const lowerInput = input.toLowerCase();

        // 1. Check for specific contextual follow-ups (Basic context)
        if (this.context === 'sorting' && (lowerInput.includes('how') || lowerInput.includes('where'))) {
            return "You can find the '+ Create Sort Rule' button right above your email list in the sidebar!";
        }

        // 2. Score based intent matching
        let bestMatch = null;
        let highestScore = 0;

        for (const intent of this.intents) {
            let score = 0;
            intent.keywords.forEach(keyword => {
                if (lowerInput.includes(keyword)) {
                    score += 1;
                    // Boost score for exact matches in shorter inputs
                    if (lowerInput.length < 20 && lowerInput === keyword) score += 2;
                }
            });

            if (score > highestScore) {
                highestScore = score;
                bestMatch = intent;
            }
        }

        if (bestMatch && highestScore > 0) {
            this.context = bestMatch.id;
            return bestMatch.response;
        }

        // Handle unknown
        this.context = null;
        return "I'm not exactly sure how to help with that yet. You can ask about **connecting Google**, **logo detection**, or **creating sorting rules**!";
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.esortChatBot = new ESortChatBot();
});
