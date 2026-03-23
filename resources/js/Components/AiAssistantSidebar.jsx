import { useState, useRef, useEffect } from 'react';
import { Send, X, MessageSquare, Bot, User, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import axios from 'axios';

export default function AiAssistantSidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI Assistant. How can I help you manage your CMS today?' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen && !isMinimized) {
            scrollToBottom();
        }
    }, [messages, isOpen, isMinimized]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post(route('ai.chat'), {
                messages: newMessages
            });

            setMessages([...newMessages, { role: 'assistant', content: response.data.content }]);
        } catch (error) {
            console.error("AI Assistant Error:", error);
            const errorMessage = error.response?.data?.error || error.message || 'Failed to get response from AI. Please check your plugin settings.';
            setMessages([...newMessages, { role: 'assistant', content: `Error: ${errorMessage}`, isError: true }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 rounded-full shadow-lg hover:shadow-xl hover:bg-indigo-700 text-white flex items-center justify-center transition-all duration-300 z-50 group animate-in zoom-in"
            >
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                <MessageSquare className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
        );
    }

    return (
        <div 
            className={`fixed bottom-6 right-6 w-96 bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-100 overflow-hidden transition-all duration-300 z-50 ${
                isMinimized ? 'h-14' : 'h-[600px] max-h-[80vh]'
            }`}
        >
            {/* Header */}
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shadow-md shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold leading-none">AI Assistant</h3>
                        {!isMinimized && <p className="text-[10px] text-indigo-100 mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                            Online & Ready
                        </p>}
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button 
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1 hover:bg-white/10 rounded-md transition-colors"
                    >
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-1 hover:bg-white/10 rounded-md transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                        msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-indigo-600 shadow-sm border border-gray-100'
                                    }`}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                                        msg.role === 'user' 
                                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                                            : msg.isError 
                                                ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-none font-medium'
                                                : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-tl-none'
                                    }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex gap-2 items-center text-indigo-600 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-xs font-medium">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    AI is thinking...
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2 items-end">
                        <textarea
                            className="flex-1 border-gray-200 rounded-xl focus:ring-indigo-500/20 focus:border-indigo-500 text-sm py-2 px-3 bg-gray-50 resize-none max-h-32 transition-all"
                            placeholder="Type your message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend(e);
                                }
                            }}
                            rows="1"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-sm hover:shadow transition-all disabled:opacity-50 disabled:bg-gray-400"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                    <div className="px-4 pb-2 bg-white text-[9px] text-gray-400 text-center italic">
                        Powered by your chosen AI provider in settings.
                    </div>
                </>
            )}
        </div>
    );
}
