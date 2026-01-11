import { MatterSection } from '../../_store/useManuscriptStore';
import { AlignCenter } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function EpigraphEditor({ section, onChange }: { section: MatterSection, onChange: (c: string, d?: any) => void }) {
    const author = section.data?.author || "";
    const quote = section.content || "";

    const update = (newQuote: string, newAuthor: string) => {
        onChange(newQuote, { ...section.data, author: newAuthor });
    };

    return (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center space-y-6">
            <AlignCenter className="text-gray-600 mb-4" />
            
            <textarea
                value={quote}
                onChange={(e) => update(e.target.value, author)}
                placeholder="Write your epigraph here..."
                className="w-full max-w-lg bg-transparent border-none outline-none text-2xl font-serif italic text-center placeholder:text-gray-700 resize-none overflow-hidden"
                style={{ minHeight: '100px' }}
            />
            
        </div>
    );
}
