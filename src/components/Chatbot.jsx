import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your SafeSphere AI assistant. I can help you:\n\n🆘 Create emergency alerts\n📝 Post help requests\n📞 Find contacts\n🔧 Get maintenance info\n\nYou can type or use voice! How can I help you today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const { currentUser } = useAuth();

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const createHelpPost = async (title, description, category) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      const userData = userDoc.exists() ? userDoc.data() : {};

      await addDoc(collection(db, 'helpPosts'), {
        title,
        description,
        category,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: userData.name || 'Unknown',
        userPhone: userData.phone || 'Not provided',
        userUnit: userData.unit || 'Not provided',
        createdAt: serverTimestamp(),
        status: 'open'
      });

      return true;
    } catch (error) {
      console.error('Error creating help post:', error);
      return false;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

      const context = `You are a helpful AI assistant for SafeSphere, a community safety platform. 
      
Your capabilities:
1. Help users create help board requests
2. Provide information about emergency services
3. Guide users on how to use the platform
4. Answer questions about community features

When a user wants to create a help request, extract:
- Title (brief summary)
- Description (detailed explanation)
- Category (General, Maintenance, Security, Community, or Lost & Found)

If the user's message indicates they want to create a help request, respond with:
CREATE_POST|Title|Description|Category

Otherwise, provide helpful, friendly responses. Keep responses concise and clear, especially for elderly users.

User message: ${userMessage}`;

      const result = await model.generateContent(context);
      const response = await result.response;
      let aiResponse = response.text();

      // Check if AI wants to create a post
      if (aiResponse.startsWith('CREATE_POST|')) {
        const parts = aiResponse.split('|');
        if (parts.length === 4) {
          const [, title, description, category] = parts;
          const success = await createHelpPost(title, description, category);
          
          if (success) {
            aiResponse = `✅ Great! I've created your help request:\n\n📝 **${title}**\n\nYour request has been posted to the Help Board. Community members can now see it and offer assistance. You'll be notified when someone responds!`;
          } else {
            aiResponse = "I'm sorry, there was an error creating your help request. Please try again or create it manually from the Help Board.";
          }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      
      // Speak the response for elderly users
      speak(aiResponse);
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.";
      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
      speak(errorMsg);
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickActions = [
    { text: "I need help with something", icon: "fa-hand-paper" },
    { text: "Report a maintenance issue", icon: "fa-tools" },
    { text: "I lost something", icon: "fa-search" },
    { text: "Emergency contacts", icon: "fa-phone" }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl h-[95vh] sm:h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 sm:p-6 rounded-t-xl sm:rounded-t-2xl flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
              <i className="fas fa-robot text-xl sm:text-2xl"></i>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold truncate">AI Assistant</h2>
              <p className="text-xs sm:text-sm text-purple-100">
                {isSpeaking ? '🔊 Speaking...' : isListening ? '🎤 Listening...' : 'Online'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/20 hover:bg-white/30 transition flex items-center justify-center flex-shrink-0"
          >
            <i className="fas fa-times text-lg sm:text-xl"></i>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-xl sm:rounded-2xl p-3 sm:p-4 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
                    : 'bg-white text-slate-800 shadow-soft border border-slate-200'
                }`}
              >
                <p className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white text-slate-800 rounded-2xl p-4 shadow-soft border border-slate-200">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="px-3 sm:px-6 py-2 sm:py-3 bg-white border-t border-slate-200 flex-shrink-0">
            <p className="text-xs text-slate-600 mb-2 font-medium">Quick actions:</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(action.text)}
                  className="px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition flex items-center space-x-1 sm:space-x-2"
                >
                  <i className={`fas ${action.icon} text-xs`}></i>
                  <span className="hidden sm:inline">{action.text}</span>
                  <span className="sm:hidden">{action.text.split(' ').slice(0, 2).join(' ')}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 rounded-b-xl sm:rounded-b-2xl flex-shrink-0">
          <div className="flex space-x-1.5 sm:space-x-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type or use voice..."
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-300 rounded-lg sm:rounded-xl text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10 sm:pr-12"
              />
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-red-600 hover:text-red-700"
                >
                  <i className="fas fa-volume-mute text-base sm:text-lg"></i>
                </button>
              )}
            </div>
            
            <button
              onClick={isListening ? stopListening : startListening}
              className={`w-11 h-11 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition flex-shrink-0 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-600'
              }`}
            >
              <i className={`fas ${isListening ? 'fa-stop' : 'fa-microphone'} text-base sm:text-lg`}></i>
            </button>
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              <i className="fas fa-paper-plane text-sm sm:text-base"></i>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center hidden sm:block">
            💡 Tip: Click the microphone to speak your request
          </p>
        </div>
      </div>
    </div>
  );
}
