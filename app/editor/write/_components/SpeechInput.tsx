import { Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '../../_hooks/useSpeechRecognition';
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { transcribeAudio } from '@/app/actions/transcribe';

interface SpeechInputProps {
    onTranscript: (text: string) => void;
    onInterim?: (text: string) => void;
}

export default function SpeechInput({ onTranscript, onInterim }: SpeechInputProps) {
    const { isListening, startListening, stopListening, transcript, interimTranscript, resetTranscript, hasSupport } = useSpeechRecognition();

    const [groqKey, setGroqKey] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        // Defer reading from localStorage to avoid hydration mismatch and sync effect issues
        const timer = setTimeout(() => {
             const key = localStorage.getItem('groq_api_key');
             if (key) setGroqKey(key);
        }, 0);
        
        const handleStorage = () => {
             const k = localStorage.getItem('groq_api_key');
             setGroqKey(k);
        };
        window.addEventListener('storage', handleStorage); 
        return () => {
             window.removeEventListener('storage', handleStorage);
             clearTimeout(timer);
        };
    }, []);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.start();
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.onstop = async () => {
                setIsProcessing(true);
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const formData = new FormData();
                formData.append('file', blob);
                
                if (groqKey) {
                    const { text, error } = await transcribeAudio(formData, groqKey);
                    if (!error && text) {
                        onTranscript(text);
                    } else {
                        console.error(error);
                    }
                }
                
                setIsProcessing(false);
                if (mediaRecorderRef.current?.stream) {
                    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
                }
            };
        }
    };

    const handleStart = () => {
        startListening();
        if (groqKey) {
            startRecording();
        }
    };

    const handleStop = () => {
        stopListening();
        if (groqKey) {
            stopRecording();
        }
    };

    useEffect(() => {
        if (transcript && !groqKey) {
            onTranscript(transcript);
            resetTranscript();
        } else if (transcript && groqKey) {
             resetTranscript();
        }
    }, [transcript, onTranscript, resetTranscript, groqKey]);

    useEffect(() => {
        if (onInterim) {
            onInterim(interimTranscript);
        }
    }, [interimTranscript, onInterim]);

    if (!hasSupport && !groqKey) {
        return (
            <button 
                disabled 
                title="Speech recognition not supported in this browser"
                className="p-2 rounded-full bg-muted text-muted-foreground cursor-not-allowed opacity-50"
            >
                <MicOff size={18} />
            </button>
        );
    }

    return (
        <div className="relative">
            <button 
                onClick={isListening ? handleStop : handleStart}
                disabled={isProcessing}
                className={clsx(
                    "p-2 rounded-full transition-all duration-300 flex items-center gap-2",
                    isListening 
                        ? "bg-red-500/10 text-red-500 ring-2 ring-red-500/20" 
                        : "bg-accent/10 text-accent hover:bg-accent/20",
                    isProcessing && "opacity-50 cursor-wait"
                )}
                title={isListening ? "Stop Listening" : "Start Dictation"}
            >
                {isProcessing ? <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" /> : 
                 isListening ? <Mic size={18} className="animate-pulse" /> : <Mic size={18} />}
            </button>

            <AnimatePresence>
                {isListening && !isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl text-xs font-medium whitespace-nowrap z-50 flex items-center gap-2 pointer-events-none"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Listening...
                    </motion.div>
                )}
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl text-xs font-medium whitespace-nowrap z-50 flex items-center gap-2 pointer-events-none"
                    >
                         <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                        Processing...
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
