import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { GoogleGenAI, Modality } from "@google/genai";
import { Send, Bot, User, Sparkles, Volume2, Mic, Brain, Trash2, Plus, Info, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

export const AIInterface: React.FC = () => {
  const { habits, tasks, aiMemory, aiSettings, userProfile, addMemory, deleteMemory, updateHabit, addTask, toggleHabitLog } = useAppContext();
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('elevate_chat_history');
    if (saved) {
      return JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
    }
    return [
      { 
        role: 'assistant', 
        content: `Hello! I am ${aiSettings.name}, your ${aiSettings.persona}. I'm here to help you stay disciplined and reach your goals. How can I assist you today?`, 
        timestamp: new Date() 
      }
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('elevate_chat_history', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const generateSystemInstruction = () => {
    const habitsList = habits.map(h => `- ${h.name} (${h.category})`).join('\n');
    const tasksList = tasks.map(t => `- ${t.name} (Date: ${t.date}, Completed: ${t.completed})`).join('\n');
    const memoryList = aiMemory.map(m => `- ${m.content}`).join('\n');

    let userContext = `User Name: ${userProfile?.name || 'User'}\n`;
    if (userProfile?.dob) {
      const age = new Date().getFullYear() - new Date(userProfile.dob).getFullYear();
      userContext += `User Age: Approx ${age}\n`;
    }
    if (userProfile?.about) userContext += `About User: ${userProfile.about}\n`;
    if (userProfile?.goals) userContext += `User Goals: ${userProfile.goals}\n`;

    return `
      You are ${aiSettings.name}, an AI assistant with the persona of a ${aiSettings.persona}.
      Your behavior is: ${aiSettings.behavior}.
      
      USER PROFILE:
      ${userContext}
      
      You have access to the user's progress tracker data:
      
      HABITS:
      ${habitsList}
      
      TASKS:
      ${tasksList}
      
      MEMORY:
      ${memoryList}
      
      Current Date: ${format(new Date(), 'yyyy-MM-dd')}
      
      Your goals:
      1. Motivate the user to complete their habits and tasks.
      2. Be disciplined and hold the user accountable.
      3. You can suggest adding or removing tasks if the user asks.
      4. If the user mentions something important, you should acknowledge it.
      5. Always stay in character as a ${aiSettings.persona}.
      
      When the user asks to "add a task", "complete a habit", etc., respond naturally and confirm you've noted it.
    `;
  };

  const handleSend = async () => {
    if (!input.trim() || !aiSettings.apiKey) return;

    const userMessage: Message = { role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: aiSettings.apiKey });
      const model = aiSettings.model || "gemini-3-flash-preview";
      
      const response = await ai.models.generateContent({
        model: model,
        contents: messages.concat(userMessage).map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: generateSystemInstruction(),
        }
      });

      const aiContent = response.text || "I'm sorry, I couldn't process that.";
      const aiMessage: Message = { role: 'assistant', content: aiContent, timestamp: new Date() };
      setMessages(prev => [...prev, aiMessage]);

      // Auto-memory logic (simple heuristic)
      if (aiContent.length > 100 || input.includes('remember')) {
        const memoryContent = `User said: "${input}". AI responded: "${aiContent.substring(0, 50)}..."`;
        addMemory(memoryContent, 'auto');
      }

    } catch (error: any) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${error.message || "Failed to connect to Gemini. Please check your API key in Settings."}`, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const speak = async (text: string) => {
    if (!aiSettings.apiKey) return;
    
    try {
      setIsSpeaking(text);
      const ai = new GoogleGenAI({ apiKey: aiSettings.apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: aiSettings.voice || 'Zephyr' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        try {
          // Convert base64 to ArrayBuffer
          const binaryString = atob(base64Audio);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const arrayBuffer = bytes.buffer;

          // Decode and play using AudioContext
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          let audioBuffer: AudioBuffer;
          try {
            // Try decoding as WAV/MP3 first
            // We copy the buffer because decodeAudioData might detach it
            audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
          } catch (decodeError) {
            // Standard decoding failed, likely raw PCM. Proceeding to fallback.
            // Fallback: Assume Raw PCM 24kHz 16-bit Mono (common for Gemini TTS)
            const pcm16 = new Int16Array(arrayBuffer);
            const float32 = new Float32Array(pcm16.length);
            for (let i = 0; i < pcm16.length; i++) {
              float32[i] = pcm16[i] / 32768;
            }
            audioBuffer = audioContext.createBuffer(1, float32.length, 24000);
            audioBuffer.getChannelData(0).set(float32);
          }
          
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);
          
          source.onended = () => {
            setIsSpeaking(null);
            audioContext.close();
          };
          
          source.start(0);
        } catch (playError) {
          console.error("Audio play failed:", playError);
          setIsSpeaking(null);
        }
      } else {
        setIsSpeaking(null);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setIsSpeaking(null);
    }
  };

  return (
    <div className="flex h-full bg-[#F5F5F5]">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white border-b border-black/5 px-8 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 overflow-hidden">
              {aiSettings.avatar ? (
                <img src={aiSettings.avatar} alt={aiSettings.name} className="w-full h-full object-cover" />
              ) : (
                <Bot size={24} />
              )}
            </div>
            <div>
              <h2 className="font-bold text-lg">{aiSettings.name}</h2>
              <p className="text-xs text-emerald-500 font-bold uppercase tracking-widest flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse" />
                Online • {aiSettings.persona}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowMemory(!showMemory)}
              className={cn(
                "p-3 rounded-2xl transition-all",
                showMemory ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              )}
            >
              <Brain size={20} />
            </button>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[80%] flex space-x-4",
                msg.role === 'user' ? "flex-row-reverse space-x-reverse" : "flex-row"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm overflow-hidden",
                  msg.role === 'user' ? "bg-[#141414] text-white" : "bg-white text-emerald-500"
                )}>
                  {msg.role === 'user' ? (
                    userProfile?.avatar ? (
                      <img src={userProfile.avatar} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} />
                    )
                  ) : aiSettings.avatar ? (
                    <img src={aiSettings.avatar} alt={aiSettings.name} className="w-full h-full object-cover" />
                  ) : (
                    <Bot size={20} />
                  )}
                </div>
                <div className="space-y-2">
                  <div className={cn(
                    "p-5 rounded-3xl shadow-sm text-[15px] leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-[#141414] text-white rounded-tr-none" 
                      : "bg-white text-gray-800 rounded-tl-none border border-black/5"
                  )}>
                    {msg.content}
                  </div>
                  <div className={cn("flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2")}>
                    <span>{format(msg.timestamp, 'HH:mm')}</span>
                    {msg.role === 'assistant' && (
                      <button 
                        onClick={() => speak(msg.content)}
                        className={cn("hover:text-emerald-500 transition-colors", isSpeaking === msg.content && "text-emerald-500")}
                      >
                        <Volume2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-3xl rounded-tl-none border border-black/5 shadow-sm flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-white border-t border-black/5">
          {!aiSettings.apiKey && (
            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-3 text-amber-800">
              <Info size={20} />
              <p className="text-sm font-medium">Please add your Gemini API Key in Settings to enable the AI agent.</p>
            </div>
          )}
          <div className="relative max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Elevate AI anything..."
              className="w-full h-16 pl-6 pr-32 bg-gray-50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium text-lg shadow-inner"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <button className="p-3 text-gray-400 hover:text-emerald-500 transition-colors">
                <Mic size={24} />
              </button>
              <button 
                onClick={handleSend}
                disabled={!input.trim() || !aiSettings.apiKey || isLoading}
                className="p-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                <Send size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Sidebar */}
      {showMemory && (
        <div className="w-96 bg-white border-l border-black/5 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          <header className="p-6 border-b border-black/5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Brain className="text-emerald-500" size={24} />
              <h3 className="font-bold text-lg">AI Memory</h3>
            </div>
            <button 
              onClick={() => addMemory("New memory note...")}
              className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Plus size={20} />
            </button>
          </header>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {aiMemory.length === 0 ? (
              <div className="text-center py-20">
                <Brain className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-400 font-medium">No memories stored yet.</p>
              </div>
            ) : (
              aiMemory.map(memory => (
                <div key={memory.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 group relative">
                  <p className="text-sm text-gray-700 leading-relaxed">{memory.content}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      {format(new Date(memory.date), 'MMM d, HH:mm')} • {memory.type}
                    </span>
                    <button 
                      onClick={() => deleteMemory(memory.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
