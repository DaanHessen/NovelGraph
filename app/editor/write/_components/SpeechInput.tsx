import { Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '../../_hooks/useSpeechRecognition';
import { useEffect } from 'react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeechInputProps {
    onTranscript: (text: string) => void;
    onInterim?: (text: string) => void;
}

export default function SpeechInput({ onTranscript, onInterim }: SpeechInputProps) {
    const { isListening, startListening, stopListening, transcript, interimTranscript, resetTranscript, hasSupport } = useSpeechRecognition();

    useEffect(() => {
        if (transcript) {
            onTranscript(transcript);
            resetTranscript();
        }
    }, [transcript, onTranscript, resetTranscript]);

    useEffect(() => {
        if (onInterim) {
            onInterim(interimTranscript);
        }
    }, [interimTranscript, onInterim]);

    if (!hasSupport) {
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
                onClick={isListening ? stopListening : startListening}
                className={clsx(
                    "p-2 rounded-full transition-all duration-300 flex items-center gap-2",
                    isListening 
                        ? "bg-red-500/10 text-red-500 ring-2 ring-red-500/20" 
                        : "bg-accent/10 text-accent hover:bg-accent/20"
                )}
                title={isListening ? "Stop Listening" : "Start Dictation"}
            >
                {isListening ? <Mic size={18} className="animate-pulse" /> : <Mic size={18} />}
            </button>

            <AnimatePresence>
                {isListening && (
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
            </AnimatePresence>
        </div>
    );
}
