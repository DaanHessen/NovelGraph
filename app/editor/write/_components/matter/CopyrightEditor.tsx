import { MatterSection } from '../../_store/useManuscriptStore';
import { Check } from 'lucide-react';
import clsx from 'clsx';
import { CLAUSES } from './constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function CopyrightEditor({ section, onChange }: { section: MatterSection, onChange: (c: string, d?: any) => void }) {
    // Data stores array of enabled clause IDs?
    const enabledClauses: string[] = section.data?.enabledClauses || [];
    const customText = section.content || "";

    const toggleClause = (id: string) => {
        const newEnabled = enabledClauses.includes(id) 
            ? enabledClauses.filter(c => c !== id)
            : [...enabledClauses, id];
        
        onChange(customText, { ...section.data, enabledClauses: newEnabled });
    };

    return (
        <div className="space-y-8">
            <div className="space-y-4">
                <h3 className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Clauses</h3>
                <div className="grid gap-3">
                    {CLAUSES.map((clause: { id: string; title: string; text: string }) => {
                        const isEnabled = enabledClauses.includes(clause.id);
                        return (
                            <div 
                                key={clause.id}
                                onClick={() => toggleClause(clause.id)}
                                className={clsx(
                                    "p-4 rounded-lg border cursor-pointer transition-all hover:bg-accent/10",
                                    isEnabled ? "border-primary bg-primary/10" : "border-border"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={clsx(
                                        "w-4 h-4 rounded border mt-0.5 flex items-center justify-center shrink-0 transition-colors",
                                        isEnabled ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                                    )}>
                                        {isEnabled && <Check size={10} strokeWidth={4} />}
                                    </div>
                                    <div>
                                        <h4 className={clsx("text-sm font-bold mb-1", isEnabled ? "text-foreground" : "text-muted-foreground")}>{clause.title}</h4>
                                        <p className="text-xs text-muted-foreground leading-relaxed">{clause.text}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-2">
                 <h3 className="text-xs uppercase tracking-wider font-bold text-gray-500">Additional Text</h3>
                 <textarea 
                    value={customText}
                    onChange={(e) => onChange(e.target.value, section.data)}
                    placeholder="Add any custom copyright notices or details..."
                    className="w-full h-40 bg-zinc-900/50 border border-border rounded-lg p-4 text-sm text-gray-300 focus:border-accent/50 focus:ring-1 focus:ring-accent/50 outline-none transition-all placeholder:text-gray-600"
                 />
            </div>
        </div>
    );
}
