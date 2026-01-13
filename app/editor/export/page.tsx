"use client";

import { useExportStore } from './_store/useExportStore';
import ExportPreview from './_components/ExportPreview';

export default function ExportPage() {
    const config = useExportStore(); 

    return (
        <div className="h-full flex bg-background animate-in fade-in duration-500 justify-center items-center overflow-hidden">
            <div className="scale-75 md:scale-90 lg:scale-100 transition-transform duration-300">
                <ExportPreview config={config} />
            </div>
        </div>
    );
}
