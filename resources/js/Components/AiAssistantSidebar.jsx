import { useState, useRef, useEffect } from 'react';
import { 
    Send, X, MessageSquare, Bot, User, Loader2, Minimize2, Maximize2, 
    LayoutTemplate, Box, Settings, PlusCircle, ExternalLink, Sparkles 
} from 'lucide-react';
import axios from 'axios';
import { usePage } from '@inertiajs/react';

export default function AiAssistantSidebar() {
    const { component } = usePage();
    const isEditorActive = component === 'Pages/Builder' || component === 'Layout/Editor';

    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState([]);
    const [conversationId, setConversationId] = useState(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [models, setModels] = useState([]);
    const [selectedModelId, setSelectedModelId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            fetchModels();
            fetchHistory();
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        try {
            setIsInitialLoading(true);
            const res = await axios.get(route('ai.chat.history'));
            setMessages(res.data.messages || []);
            setConversationId(res.data.conversation_id);
        } catch (err) {
            console.error("Failed to fetch chat history:", err);
            // Fallback to default message if failed
            setMessages([{ role: 'assistant', content: 'Hello! I am your AI Assistant. How can I help you manage your CMS today?' }]);
        } finally {
            setIsInitialLoading(false);
        }
    };

    const fetchModels = async () => {
        try {
            const res = await axios.get(route('ai.models.list'));
            setModels(res.data);
            if (res.data.length > 0 && !selectedModelId) {
                // Find default active one or just take first
                const defaultModel = res.data.find(m => m.is_default) || res.data[0];
                setSelectedModelId(defaultModel.id);
            }
        } catch (err) {
            console.error("Failed to fetch AI models:", err);
        }
    };

    useEffect(() => {
        if (isOpen && !isMinimized) {
            scrollToBottom();
        }
    }, [messages, isOpen, isMinimized]);

    const handleCreatePage = async (jsonData) => {
        try {
            setLoading(true);
            const res = await axios.post(route('ai.pages.store'), {
                title: jsonData.title || 'New AI Generated Page',
                blocks: jsonData.blocks || [],
                header_blocks: jsonData.header_blocks || [],
                footer_blocks: jsonData.footer_blocks || [],
                theme_data: jsonData.theme_data || null,
                meta_title: jsonData.meta_title,
                meta_description: jsonData.meta_description,
                layout_name: jsonData.layout_name,
                fonts_to_install: jsonData.fonts_to_install || []
            });
            
            let successMsg = `✅ ${res.data.message}\n\n`;
            successMsg += `• [Open in Page Builder](${res.data.url})\n`;
            if (res.data.layout_url) {
                successMsg += `• [Open in Layout Editor](${res.data.layout_url})`;
            }

            if (res.data.font_results && res.data.font_results.length > 0) {
                successMsg += `\n\n**Font Installation Summary:**\n`;
                res.data.font_results.forEach(f => {
                    successMsg += `\n${f.success ? '✅' : '❌'} ${f.name} ${f.success ? '(Success)' : '(Failed: Link Protected or Broken)'}`;
                });
            }

            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: successMsg 
            }]);
        } catch (err) {
            alert('Failed to create design: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleScanDesign = async (url) => {
        try {
            setLoading(true);
            const res = await axios.post(route('ai.design.scan'), { url });
            
            // Collect fonts that need installation
            const missingFonts = res.data.fonts ? res.data.fonts.filter(f => !f.is_installed) : [];
            
            // Format a prompt for the AI to handle the rest
            let scanSummary = `IMPORTANT: Design Scan results for ${url} are now available below. Use these details to generate a highly accurate "Hyper Clone" JSON payload.\n\n`;
            scanSummary += `DESIGN DATA:\n`;
            scanSummary += `- Core Font: ${res.data.detected_font_family}\n`;
            scanSummary += `- Fonts to Install: ${JSON.stringify(missingFonts)}\n`;
            scanSummary += `- CSS Variables: ${JSON.stringify(res.data.css_variables || {})}\n`;
            scanSummary += `- Custom Styles Hint: \n\`\`\`css\n${res.data.custom_styles_hint || ''}\n\`\`\`\n\n`;
            scanSummary += `INSTRUCTIONS:\n`;
            scanSummary += `1. Replicate the site's layout structure (header, footer, and main sections) using the available blocks.\n`;
            scanSummary += `2. Put ALL patterns from 'Custom Styles Hint' into 'theme_data.customCss'.\n`;
            scanSummary += `3. Ensure branding colors match the 'CSS Variables' provided.\n`;
            scanSummary += `4. OUTPUT THE FULL UNIFIED JSON IN A MARKDOWN BLOCK.`;

            // Add a visual status message
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `🔍 **Scan for ${url} complete!**\nAnalyzed fonts and styles. AI is now preparing your one-click Hyper Clone proposal...` 
            }]);

            // Trigger AI automatically to generate the final Hyper Clone JSON
            await handleSendAuto(scanSummary);
        } catch (err) {
            alert('Failed to scan design: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleSendAuto = async (text) => {
        const userMessage = { role: 'user', content: `[SYSTEM_ACTION]: ${text}`, isHidden: true };
        const newMessages = [...messages, userMessage];
        // We don't setShow local user message because it's a system action
        
        try {
            const response = await axios.post(route('ai.chat'), {
                messages: newMessages,
                model_id: selectedModelId,
                conversation_id: conversationId
            });

            setMessages(prev => [...prev, { role: 'assistant', content: response.data.content }]);
            if (response.data.conversation_id && !conversationId) {
                setConversationId(response.data.conversation_id);
            }
        } catch (error) {
            console.error("AI Auto Error:", error);
        }
    };

    const handleInstallFont = async (fontName, url) => {
        try {
            setLoading(true);
            const res = await axios.post(route('ai.design.font'), { font_name: fontName, url: url });
            
            setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `✨ **Font Installed!**\n\n${res.data.message}\n\nYou can now use \`${fontName}\` in your layout settings.` 
            }]);
        } catch (err) {
            alert('Failed to install font: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

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
                messages: newMessages,
                model_id: selectedModelId,
                conversation_id: conversationId
            });

            setMessages([...newMessages, { role: 'assistant', content: response.data.content }]);
            if (response.data.conversation_id && !conversationId) {
                setConversationId(response.data.conversation_id);
            }
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
            <div className="p-4 bg-indigo-600 text-white flex flex-col shadow-md shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold leading-none">AI Assistant</h3>
                            {!isMinimized && <p className="text-[10px] text-indigo-100 mt-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                Multi-Model Active
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

                {!isMinimized && models.length > 0 && (
                    <div className="flex items-center gap-2 bg-indigo-700/50 p-1 rounded-xl">
                        <select 
                            value={selectedModelId || ''} 
                            onChange={(e) => setSelectedModelId(e.target.value)}
                            className="flex-1 bg-transparent border-none text-[11px] font-bold focus:ring-0 cursor-pointer appearance-none py-1 h-7 pr-8"
                        >
                            <option value="" className="text-gray-900 italic">Default Model</option>
                            {models.map(m => (
                                <option key={m.id} value={m.id} className="text-gray-900">
                                    {m.name} ({m.model_name})
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 relative">
                        {isInitialLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
                                <span className="relative flex h-10 w-10">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-20"></span>
                                  <span className="relative inline-flex rounded-full h-10 w-10 bg-indigo-500 items-center justify-center">
                                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                                  </span>
                                </span>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-gray-800">Recalling your conversation...</p>
                                    <p className="text-[10px] text-gray-400 font-medium italic">Syncing with your CMS brain</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.filter(msg => !msg.isHidden).map((msg, index) => (
                                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-white text-indigo-600 shadow-sm border border-gray-100'
                                            }`}>
                                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                            </div>
                                            <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                                msg.role === 'user' 
                                                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                                                    : msg.isError 
                                                        ? 'bg-red-50 text-red-700 border border-red-100 rounded-tl-none font-medium'
                                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                            }`}>
                                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                                
                                                {msg.role === 'assistant' && !msg.isError && /```\s*json/i.test(msg.content) && (() => {
                                                    try {
                                                        const match = msg.content.match(/```\s*json\s*([\s\S]*?)\s*```/i);
                                                        if (!match) return null;
                                                        const jsonData = JSON.parse(match[1]);
                                                        
                                                        // Check if it's a Layout (blocks or header_blocks) or a Plugin (plugin_name)
                                                        if (jsonData.cloner_action === 'scan') {
                                                            return (
                                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                                    <button
                                                                        onClick={() => handleScanDesign(jsonData.url)}
                                                                        className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-sm"
                                                                    >
                                                                        <Sparkles className="w-3.5 h-3.5" />
                                                                        Scan Website Design
                                                                    </button>
                                                                </div>
                                                            );
                                                        }

                                                        if (jsonData.cloner_action === 'scan') {
                                                            return (
                                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                                    <button
                                                                        onClick={() => handleScanDesign(jsonData.url)}
                                                                        className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-sm"
                                                                    >
                                                                        <Sparkles className="w-3.5 h-3.5" />
                                                                        Scan Website Design
                                                                    </button>
                                                                </div>
                                                            );
                                                        }

                                                        if (jsonData.cloner_action === 'install_font') {
                                                            return (
                                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                                    <button
                                                                        onClick={() => handleInstallFont(jsonData.font_name, jsonData.url)}
                                                                        className="w-full py-2 bg-green-50 text-green-700 border border-green-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition-all"
                                                                    >
                                                                        <PlusCircle className="w-3.5 h-3.5" />
                                                                        Install Original Font: {jsonData.font_name}
                                                                    </button>
                                                                </div>
                                                            );
                                                        }

                                                        if (jsonData.blocks || jsonData.header_blocks || jsonData.footer_blocks) {
                                                            return (
                                                                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Generated Layout</p>
                                                                        {isEditorActive && <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-black animate-pulse">Editor Detected</span>}
                                                                    </div>
                                                                    
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <button
                                                                            onClick={() => {
                                                                                if (!isEditorActive) {
                                                                                    alert('No active editor detected. Please open a page in the Page Builder first, or use the "Create as New Page" option.');
                                                                                    return;
                                                                                }
                                                                                window.dispatchEvent(new CustomEvent('apply-ai-layout', { detail: jsonData }));
                                                                                alert('Layout injected! Check the editor window.');
                                                                            }}
                                                                            className={`py-2 px-3 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 transition-all shadow-sm ${
                                                                                isEditorActive 
                                                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed grayscale'
                                                                            }`}
                                                                        >
                                                                            <Sparkles className="w-3.5 h-3.5" />
                                                                            Apply to Editor
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleCreatePage(jsonData)}
                                                                            className="py-2 px-3 bg-white hover:bg-gray-50 text-indigo-600 border border-indigo-100 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 transition-all shadow-sm"
                                                                        >
                                                                            <PlusCircle className="w-3.5 h-3.5" />
                                                                            Create New Page
                                                                        </button>
                                                                    </div>
                                                                    {!isEditorActive && (
                                                                        <p className="text-[9px] text-gray-400 italic text-center mt-1">
                                                                            Tip: Open the Page Builder to auto-inject this layout
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            );
                                                        }

                                                        if (jsonData.plugin_name && jsonData.files) {
                                                            return (
                                                                <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col gap-2">
                                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">AI-Generated Plugin Detected</p>
                                                                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 mb-1">
                                                                        <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                                                                            <Box className="w-3 h-3 text-indigo-400" />
                                                                            {jsonData.plugin_name} ({jsonData.files.length} files)
                                                                        </p>
                                                                    </div>
                                                                    <button
                                                                        onClick={async () => {
                                                                            if (confirm(`Do you want to install the plugin '${jsonData.plugin_name}'? This will create ${jsonData.files.length} files on your server.`)) {
                                                                                try {
                                                                                    setLoading(true);
                                                                                    const res = await axios.post(route('ai.create-plugin'), {
                                                                                        plugin_name: jsonData.plugin_name,
                                                                                        files: jsonData.files
                                                                                    });
                                                                                    alert(res.data.message);
                                                                                    setMessages(prev => [...prev, { role: 'assistant', content: `✅ Plugin '${jsonData.plugin_name}' has been installed successfully!` }]);
                                                                                } catch (err) {
                                                                                    const errText = err.response?.data?.error || err.message;
                                                                                    alert(`Installation failed: ${errText}`);
                                                                                } finally {
                                                                                    setLoading(false);
                                                                                }
                                                                            }
                                                                        }}
                                                                        className="w-full py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                                                                    >
                                                                        <Box className="w-3.5 h-3.5" />
                                                                        Install Plugin
                                                                    </button>
                                                                </div>
                                                            );
                                                        }
                                                    } catch (e) {
                                                        return null;
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="flex gap-2 items-center text-indigo-600 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-xs font-black uppercase tracking-wider">
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            AI is thinking...
                                        </div>
                                    </div>
                                )}
                            </>
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
