import { MatterSection } from '../../_store/useManuscriptStore';
import { User } from 'lucide-react';
import Image from 'next/image';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function AboutAuthorEditor({ section, onChange }: { section: MatterSection, onChange: (c: string, d?: any) => void }) {
    const defaultImage = section.data?.image || null;
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(section.content, { ...section.data, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
         <div className="flex gap-8">
             <div className="shrink-0 space-y-3">
                 <div className="w-48 h-64 bg-muted/10 border border-border rounded-lg flex items-center justify-center relative overflow-hidden group">
                     {defaultImage ? (
                         <Image src={defaultImage} alt="Author" fill className="object-cover" />
                     ) : (
                         <div className="text-center text-muted-foreground">
                             <User size={32} className="mx-auto mb-2 opacity-50" />
                             <span className="text-xs">No Photo</span>
                         </div>
                     )}
                     
                     <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity z-10">
                         <span className="text-xs font-bold text-white border border-border px-3 py-1 rounded-full hover:bg-white hover:text-black transition-colors">
                             {defaultImage ? 'Change Photo' : 'Add Photo'}
                         </span>
                         <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                     </label>
                 </div>
                 <p className="text-[10px] text-muted-foreground text-center uppercase tracking-widest">Author Portrait</p>
             </div>

             <div className="flex-1">
                <textarea
                    value={section.content}
                    onChange={(e) => onChange(e.target.value, section.data)}
                    placeholder="Write about the author..."
                    className="w-full h-[60vh] bg-transparent resize-none outline-none text-lg leading-relaxed font-serif placeholder:font-sans placeholder:text-muted-foreground focus:placeholder:text-muted-foreground/50 text-foreground"
                />
             </div>
         </div>
    );
}
