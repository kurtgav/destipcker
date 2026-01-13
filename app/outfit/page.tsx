"use client";
import React, { useState, useRef, useEffect } from "react";
import { StarsBackground } from "@/components/ui/StarsBackground";
import { ShootingStars } from "@/components/ui/ShootingStars";
import { GlassCard } from "@/components/ui/GlassCard";
import { ArrowLeft, Camera, Sparkles, Shirt, Loader2, Send, X, Mic, MicOff, Trash2, Heart } from "lucide-react";
import Link from "next/link";
import { TypewriterEffect } from "@/components/ui/TypewriterEffect";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "destipicker_outfit_chat";

type Message = {
    id: string;
    role: "user" | "assistant";
    content?: string;
    images?: string[];
};

export default function OutfitPickerPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [textInput, setTextInput] = useState("");
    const [image1, setImage1] = useState<string | null>(null);
    const [image2, setImage2] = useState<string | null>(null);
    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);
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
                content: "Hello! 👋 I'm your AI style assistant. Upload two outfit options for me to compare, or just type/speak your fashion questions!"
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
                content: "Hello! 👋 I'm your AI style assistant. Upload two outfit options for me to compare, or just type/speak your fashion questions!"
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

    const fileInput1Ref = useRef<HTMLInputElement>(null);
    const fileInput2Ref = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (slot === 1) {
                    setImage1(reader.result as string);
                    setFile1(file);
                } else {
                    setImage2(reader.result as string);
                    setFile2(file);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClearImages = () => {
        setImage1(null);
        setImage2(null);
        setFile1(null);
        setFile2(null);
        if (fileInput1Ref.current) fileInput1Ref.current.value = "";
        if (fileInput2Ref.current) fileInput2Ref.current.value = "";
    };

    const handleSend = async () => {
        const hasImages = image1 && image2;
        const hasText = textInput.trim().length > 0;

        if (!hasImages && !hasText) return;

        // Add user message
        const userMsgId = Date.now().toString();
        const currentImages = hasImages ? [image1, image2] : undefined;
        const currentFiles = hasImages ? [file1, file2] : undefined;
        const currentText = textInput.trim();

        setMessages(prev => [...prev, {
            id: userMsgId,
            role: "user",
            content: hasText ? currentText : undefined,
            images: currentImages as string[] | undefined
        }]);

        setLoading(true);
        setTextInput("");
        if (hasImages) handleClearImages();

        try {
            const formData = new FormData();
            if (currentFiles && currentFiles[0]) formData.append("image1", currentFiles[0]);
            if (currentFiles && currentFiles[1]) formData.append("image2", currentFiles[1]);
            if (currentText) formData.append("message", currentText);

            // Include conversation history for AI context (last 10 text messages)
            const history = messages
                .filter(m => m.content && m.role !== "assistant" || (m.role === "assistant" && m.id !== "welcome"))
                .slice(-10)
                .map(m => ({ role: m.role, content: m.content }));
            formData.append("history", JSON.stringify(history));

            const res = await fetch("/api/outfit", {
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
                        <Shirt className="w-5 h-5 text-[#88B04B]" /> Outfit Picker
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

                            {msg.images && msg.images.length > 0 && (
                                <div className="flex gap-2 mt-2">
                                    {msg.images.map((img, idx) => (
                                        <div key={idx} className="w-24 h-32 rounded-xl overflow-hidden border border-white/10 bg-white/5">
                                            <img src={img} alt="Uploaded outfit" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
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

                {/* Image Previews */}
                {(image1 || image2) && (
                    <div className="flex gap-3 mb-3 overflow-x-auto pb-2">
                        {/* Slot 1 Preview */}
                        <div className="relative group">
                            <div
                                onClick={() => fileInput1Ref.current?.click()}
                                className="w-16 h-20 rounded-lg border border-dashed border-white/20 bg-white/5 flex items-center justify-center cursor-pointer overflow-hidden relative"
                            >
                                {image1 ? (
                                    <img src={image1} alt="Preview 1" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] text-gray-500">1</span>
                                )}
                            </div>
                            {image1 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setImage1(null); setFile1(null); }}
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white"
                                >
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            )}
                        </div>

                        {/* Slot 2 Preview */}
                        <div className="relative group">
                            <div
                                onClick={() => fileInput2Ref.current?.click()}
                                className="w-16 h-20 rounded-lg border border-dashed border-white/20 bg-white/5 flex items-center justify-center cursor-pointer overflow-hidden relative"
                            >
                                {image2 ? (
                                    <img src={image2} alt="Preview 2" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] text-gray-500">2</span>
                                )}
                            </div>
                            {image2 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setImage2(null); setFile2(null); }}
                                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white"
                                >
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Text Input + Controls */}
                <div className="flex items-end gap-2">
                    {/* Image Upload Buttons */}
                    <div className="flex gap-1">
                        <button
                            onClick={() => fileInput1Ref.current?.click()}
                            className={cn(
                                "w-10 h-10 rounded-full border flex items-center justify-center transition",
                                image1 ? "bg-[#88B04B]/20 border-[#88B04B] text-[#88B04B]" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                            )}
                            title="Upload Outfit 1"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => fileInput2Ref.current?.click()}
                            className={cn(
                                "w-10 h-10 rounded-full border flex items-center justify-center transition",
                                image2 ? "bg-[#88B04B]/20 border-[#88B04B] text-[#88B04B]" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                            )}
                            title="Upload Outfit 2"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Text Input */}
                    <div className="flex-1 relative">
                        <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Type a message or ask about fashion..."
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
                        disabled={(!image1 || !image2) && !textInput.trim() || loading}
                        className="w-11 h-11 rounded-full bg-[#88B04B] flex items-center justify-center disabled:opacity-50 disabled:grayscale transition shadow-lg shadow-[#88B04B]/20"
                    >
                        <Send className="w-5 h-5 text-black fill-current" />
                    </button>
                </div>

                <input type="file" ref={fileInput1Ref} onChange={(e) => handleFileChange(e, 1)} accept="image/*" className="hidden" />
                <input type="file" ref={fileInput2Ref} onChange={(e) => handleFileChange(e, 2)} accept="image/*" className="hidden" />

                <div className="text-center mt-2">
                    <p className="text-[10px] text-gray-500">Upload 2 outfits to compare, or chat about fashion</p>
                </div>
            </div>
        </div>
    );
}
