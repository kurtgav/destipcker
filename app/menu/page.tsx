"use client";
import React, { useState, useRef, useEffect } from "react";
import { StarsBackground } from "@/components/ui/StarsBackground";
import { ShootingStars } from "@/components/ui/ShootingStars";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowLeft, Camera, Sparkles, Utensils, Loader2, Send, X, Mic, MicOff, Trash2, Heart } from "lucide-react";
import Link from "next/link";
import { TypewriterEffect } from "@/components/ui/TypewriterEffect";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "destipicker_menu_chat";

type Message = {
    id: string;
    role: "user" | "assistant";
    content?: string;
    image?: string;
};

export default function MenuScannerPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [textInput, setTextInput] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Auto-scroll to bottom
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // Load messages from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setMessages(parsed);
                    setIsInitialized(true);
                    return;
                }
            } catch (e) {
                console.error("Failed to parse saved messages", e);
            }
        }
        // Default welcome message if no saved history
        setMessages([
            {
                id: "welcome",
                role: "assistant",
                content: "Hi there! 🍽️ I'm your AI food guide. Upload a menu photo and I'll help you pick the best dishes, or ask me anything about food!"
            }
        ]);
        setIsInitialized(true);
    }, []);

    // Save messages to localStorage whenever they change
    useEffect(() => {
        if (isInitialized && messages.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
        }
    }, [messages, isInitialized]);

    // Clear conversation history
    const handleClearHistory = () => {
        localStorage.removeItem(STORAGE_KEY);
        setMessages([
            {
                id: "welcome",
                role: "assistant",
                content: "Hi there! 🍽️ I'm your AI food guide. Upload a menu photo and I'll help you pick the best dishes, or ask me anything about food!"
            }
        ]);
    };

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = "en-US";

                recognitionRef.current.onresult = (event: any) => {
                    const transcript = Array.from(event.results)
                        .map((result: any) => result[0])
                        .map((result: any) => result.transcript)
                        .join("");
                    setTextInput(transcript);
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    setIsListening(false);
                };
            }
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition is not supported in your browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setFile(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClearImage = () => {
        setImage(null);
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSend = async () => {
        const hasImage = !!image;
        const hasText = textInput.trim().length > 0;

        if (!hasImage && !hasText) return;

        // Add user message
        const userMsgId = Date.now().toString();
        const currentImage = image;
        const currentFile = file;
        const currentText = textInput.trim();

        setMessages(prev => [...prev, {
            id: userMsgId,
            role: "user",
            content: hasText ? currentText : undefined,
            image: currentImage || undefined
        }]);

        setLoading(true);
        setTextInput("");
        if (hasImage) handleClearImage();

        try {
            const formData = new FormData();
            if (currentFile) formData.append("image", currentFile);
            if (currentText) formData.append("message", currentText);

            // Include conversation history for AI context (last 10 text messages)
            const history = messages
                .filter(m => m.content && m.role !== "assistant" || (m.role === "assistant" && m.id !== "welcome"))
                .slice(-10)
                .map(m => ({ role: m.role, content: m.content }));
            formData.append("history", JSON.stringify(history));

            const res = await fetch("/api/menu", {
                method: "POST",
                body: formData
            });

            const data = await res.json();

            if (!res.ok) {
                if (res.status === 429) {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        role: "assistant",
                        content: "Daily limit reached! Upgrade to Premium for unlimited scans."
                    }]);
                    return;
                }
                throw new Error(data.error || "Something went wrong");
            }

            // Add response
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "assistant",
                content: data.result
            }]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "assistant",
                content: "Sorry, I had trouble with that. Could you try again?"
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-[#050505] relative overflow-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <StarsBackground />
                <ShootingStars />
            </div>

            {/* Header */}
            <header className="relative z-10 p-4 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/home">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
                            <ArrowLeft className="w-4 h-4 text-white" />
                        </div>
                    </Link>
                    <h1 className="text-lg font-bold text-white flex items-center gap-2">
                        <Utensils className="w-5 h-5 text-[#88B04B]" /> Menu Scanner
                    </h1>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/favorites">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition">
                            <Heart className="w-4 h-4 text-red-400" />
                        </div>
                    </Link>
                    {messages.length > 1 && (
                        <button
                            onClick={handleClearHistory}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-400/30 hover:bg-red-500/10 transition text-xs"
                            title="Clear chat history"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Clear</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-y-auto p-4 space-y-6 relative z-10 scrollbar-hide pb-52">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex w-full mb-4",
                            msg.role === "user" ? "justify-end" : "justify-start"
                        )}
                    >
                        {msg.role === "assistant" && (
                            <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center mr-2 flex-shrink-0 mt-2">
                                <Sparkles className="w-4 h-4 text-[#88B04B]" />
                            </div>
                        )}

                        <div className={cn(
                            "max-w-[85%] sm:max-w-[75%]",
                            msg.role === "user" ? "flex flex-col items-end" : ""
                        )}>
                            {msg.content && (
                                <GlassCard className={cn(
                                    "p-3 sm:p-4 rounded-2xl inline-block",
                                    msg.role === "assistant"
                                        ? "rounded-tl-none border-[#88B04B]/30 glass-matcha"
                                        : "rounded-tr-none bg-[#88B04B]/10 border-[#88B04B]/20"
                                )}>
                                    {msg.role === "assistant" ? (
                                        <div className="text-sm font-light leading-relaxed">
                                            <TypewriterEffect text={msg.content || ""} />
                                        </div>
                                    ) : (
                                        <p className="text-white text-sm">{msg.content}</p>
                                    )}
                                </GlassCard>
                            )}

                            {msg.image && (
                                <div className="mt-2 w-48 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                                    <img src={msg.image} alt="Menu upload" className="w-full h-auto object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start w-full">
                        <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center mr-2 flex-shrink-0">
                            <Sparkles className="w-4 h-4 text-[#88B04B]" />
                        </div>
                        <GlassCard className="p-4 rounded-2xl rounded-tl-none border-[#88B04B]/30 glass-matcha flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-[#88B04B] animate-spin" />
                            <span className="text-xs text-gray-300">Thinking...</span>
                        </GlassCard>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </main>

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-black/60 backdrop-blur-xl border-t border-white/10 p-4 pb-8 safe-area-bottom">

                {/* Image Preview */}
                {image && (
                    <div className="flex gap-3 mb-3 overflow-x-auto pb-2">
                        <div className="relative group">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-16 h-20 rounded-lg border border-dashed border-white/20 bg-white/5 flex items-center justify-center cursor-pointer overflow-hidden relative"
                            >
                                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleClearImage(); }}
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white"
                            >
                                <X className="w-2.5 h-2.5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Text Input + Controls */}
                <div className="flex items-end gap-2">
                    {/* Image Upload Button */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "w-10 h-10 rounded-full border flex items-center justify-center transition",
                            image ? "bg-[#88B04B]/20 border-[#88B04B] text-[#88B04B]" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                        )}
                        title="Upload Menu Photo"
                    >
                        <Camera className="w-4 h-4" />
                    </button>

                    {/* Text Input */}
                    <div className="flex-1 relative">
                        <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message or ask about food..."
                            rows={1}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 pr-12 text-white text-sm placeholder-gray-500 resize-none focus:outline-none focus:border-[#88B04B]/50 transition"
                            style={{ minHeight: "46px", maxHeight: "120px" }}
                        />
                        {/* Mic Button inside input */}
                        <button
                            onClick={toggleListening}
                            className={cn(
                                "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition",
                                isListening ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-gray-400 hover:text-white"
                            )}
                            title={isListening ? "Stop listening" : "Voice input"}
                        >
                            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Send Button */}
                    <button
                        onClick={handleSend}
                        disabled={!image && !textInput.trim() || loading}
                        className="w-11 h-11 rounded-full bg-[#88B04B] flex items-center justify-center disabled:opacity-50 disabled:grayscale transition shadow-lg shadow-[#88B04B]/20"
                    >
                        <Send className="w-5 h-5 text-black fill-current" />
                    </button>
                </div>

                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                <div className="text-center mt-2">
                    <p className="text-[10px] text-gray-500">Upload a menu photo or chat about food</p>
                </div>
            </div>
        </div>
    );
}
