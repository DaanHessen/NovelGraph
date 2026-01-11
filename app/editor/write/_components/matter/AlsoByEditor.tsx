import { MatterSection } from '../../_store/useManuscriptStore';
import { Trash2, Plus } from 'lucide-react';

interface BookItem {
    id: string;
    title: string;
    link?: string;
    year?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AlsoByEditor({ section, onChange }: { section: MatterSection, onChange: (c: string, d?: any) => void }) {
    const books: BookItem[] = section.data?.books || [];
    
    // Convert current structure to simple text for preview if needed, but we mostly store in data
    
    const addBook = () => {
        const newBook: BookItem = { id: crypto.randomUUID(), title: '' };
        updateBooks([...books, newBook]);
    };

    const updateBooks = (newBooks: BookItem[]) => {
        // Also update content string for simple exports
        const textContent = newBooks.map(b => b.title + (b.year ? ` (${b.year})` : '')).join('\n');
        onChange(textContent, { ...section.data, books: newBooks });
    };

    const updateBook = (id: string, field: keyof BookItem, value: string) => {
        const newBooks = books.map(b => b.id === id ? { ...b, [field]: value } : b);
        updateBooks(newBooks);
    };

    const removeBook = (id: string) => {
        const newBooks = books.filter(b => b.id !== id);
        updateBooks(newBooks);
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-3">
                {books.map(book => (
                    <div key={book.id} className="flex gap-3 group items-start">
                        <div className="flex-1 space-y-2 p-4 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-border/80 transition-colors">
                            <input 
                                value={book.title}
                                onChange={(e) => updateBook(book.id, 'title', e.target.value)}
                                placeholder="Book Title"
                                className="w-full bg-transparent border-none outline-none font-serif text-xl italic placeholder:text-muted-foreground text-foreground"
                            />
                            <div className="flex gap-4">
                                <input 
                                    value={book.link || ''}
                                    onChange={(e) => updateBook(book.id, 'link', e.target.value)}
                                    placeholder="Amazon/Store Link (optional)"
                                    className="flex-1 bg-transparent border-none outline-none text-xs text-primary placeholder:text-muted-foreground font-mono"
                                />
                                <input 
                                    value={book.year || ''}
                                    onChange={(e) => updateBook(book.id, 'year', e.target.value)}
                                    placeholder="Year"
                                    className="w-16 bg-transparent border-none outline-none text-xs text-muted-foreground placeholder:text-muted-foreground/50 text-right"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={() => removeBook(book.id)}
                            className="mt-4 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
            
            <button 
                onClick={addBook}
                className="w-full py-4 rounded-lg border border-dashed border-border text-muted-foreground hover:text-foreground hover:bg-accent/5 hover:border-accent/20 transition-all text-sm font-medium flex items-center justify-center gap-2"
            >
                <Plus size={16} />
                <span>Add Book</span>
            </button>
        </div>
    );
}
