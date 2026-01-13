import { generateEpub } from '../actions';

export interface ExportConfig {
    title: string;
    author: string;
    subject?: string;
    language?: string;
    copyright?: string;
    foreword?: string;
    afterword?: string;
    includeTOC?: boolean;
    coverImage?: string;
}

export interface ChapterData {
    title: string;
    content: string;
    id: string;
    type: 'chapter' | 'part'; 
}

const generateHtmlContent = (chapters: ChapterData[], config: ExportConfig, frontMatter: any[], backMatter: any[]) => {
    // We use a wrapper class to isolate styles and prevent them from bleeding into the main app when html2pdf renders it.
    // Also removed <html><body> tags as html2pdf processes the element.
    let html = `
    <div class="print-export">
        <style>
            .print-export { font-family: serif; color: black; line-height: 1.6; background: white; padding: 40px; }
            .print-export h1 { page-break-before: always; text-align: center; margin-bottom: 2rem; color: #333; }
            .print-export p { margin-bottom: 1rem; text-indent: 1.5em; }
            .copyright-page { page-break-after: always; display: flex; flex-direction: column; justify-content: flex-end; height: 90vh; text-align: center; font-size: 0.8rem; padding-bottom: 2rem; }
            .dedication-page { page-break-after: always; display: flex; flex-direction: column; justify-content: center; height: 90vh; text-align: center; font-style: italic; font-size: 1.2rem; }
            .toc { page-break-after: always; }
            .toc-item { margin-bottom: 0.5rem; }
            .frontmatter, .backmatter { page-break-after: always; }
            .title-page { height: 90vh; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }
            .book-title { font-size: 3rem; font-weight: bold; margin-bottom: 1rem; }
            .book-author { font-size: 1.5rem; font-style: italic; }
            .part-page { height: 90vh; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-before: always; page-break-after: always; }
            .part-title { font-size: 2.5rem; font-weight: bold; border-bottom: 2px solid #333; padding-bottom: 1rem; }
            img.cover-image { width: 100%; height: 100%; object-fit: cover; page-break-after: always; }
        </style>
    `;

    if (config.coverImage) {
        html += `
            <div style="height: 100vh; width: 100%; overflow: hidden;">
                <img src="${config.coverImage}" class="cover-image" />
            </div>
        `;
    }

    html += `
        <div class="title-page">
            <div class="book-title">${config.title}</div>
            <div class="book-author">${config.author}</div>
        </div>
    `;

    // Process Front Matter
    frontMatter.forEach(section => {
        if(section.enabled) {
            if (section.type === 'copyright') {
                 html += `
                    <div class="copyright-page">
                        ${section.content}
                        <p style="margin-top: 1rem;">Created with Bread</p>
                    </div>
                `;
            } else if (section.type === 'dedication') {
                 html += `
                    <div class="dedication-page">
                        ${section.content}
                    </div>
                `;
            } else {
                 html += `
                    <div class="frontmatter">
                        <h1>${section.title}</h1>
                        ${section.content}
                    </div>
                `;
            }
        }
    });

    if (config.includeTOC) {
        html += `
            <div class="toc">
                <h1>Table of Contents</h1>
                ${chapters.map((c) => 
                    c.type === 'part' 
                    ? `<div class="toc-item" style="font-weight: bold; margin-top: 1rem;">${c.title}</div>`
                    : `<div class="toc-item" style="margin-left: ${chapters.some(ch => ch.type === 'part') ? '1rem' : '0'}">${c.title}</div>`
                ).join('')}
            </div>
        `;
    }

    chapters.forEach(c => {
        if (c.type === 'part') {
             html += `
                <div class="part-page">
                    <div class="part-title">${c.title}</div>
                </div>
            `;
        } else {
             html += `
                <h1>${c.title}</h1>
                ${c.content}
            `;
        }
    });

     // Process Back Matter
     backMatter.forEach(section => {
        if(section.enabled) {
             html += `
                <div class="backmatter">
                    <h1>${section.title}</h1>
                    ${section.content}
                </div>
             `;
        }
    });

    html += '</div>';
    return html;
};

export const exportToPdf = async (chapters: ChapterData[], config: ExportConfig, frontMatter: any[], backMatter: any[]) => {
    const htmlContent = generateHtmlContent(chapters, config, frontMatter, backMatter);
    const opt = {
        margin: 1,
        filename: `${config.title.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 4 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };

    const html2pdf = (await import('html2pdf.js')).default;
    html2pdf().set(opt).from(htmlContent).save();
};

export const exportToEpub = async (chapters: ChapterData[], config: ExportConfig, frontMatter: any[], backMatter: any[]) => {
   const epubOptions = {
       title: config.title,
       author: config.author,
       publisher: "Bread",
       version: 3,
       cover: config.coverImage, 
       css: `body { font-family: serif; } h1 { text-align: center; } p { margin-bottom: 1em; } .part-title { font-size: 2em; font-weight: bold; text-align: center; margin-top: 30%; }`,
   };

   try {
       const contentArray = [
           ...(config.foreword ? [{ title: "Foreword", content: config.foreword }] : []),
           ...chapters.map(c => {
                if (c.type === 'part') {
                    // EPUB doesn't strictly have "parts" in the same way, but we can make a section for it.
                    // Or ideally, use it to group subsequent chapters. For simplicity now, we make it a separate section.
                    return { title: c.title, content: `<div class="part-title">${c.title}</div>` };
                }
                return { title: c.title, content: c.content };
           }),
           ...(config.afterword ? [{ title: "Afterword", content: config.afterword }] : [])
       ];
       
       const base64 = await generateEpub(epubOptions, contentArray);
       
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        const epubBlob = new Blob([bytes], { type: "application/epub+zip" });

       const link = document.createElement('a');
       link.href = URL.createObjectURL(epubBlob);
       link.download = `${config.title.replace(/\s+/g, '_')}.epub`;
       document.body.appendChild(link);
       link.click();
       document.body.removeChild(link);
       
   } catch (e) {
       console.error("EPUB Generation failed", e);
       alert("Failed to generate EPUB. See console.");
   }
};

export const exportToMarkdown = (chapters: ChapterData[], config: ExportConfig) => {
    let md = `# ${config.title}\n\nBy ${config.author}\n\n`;
    
    if(config.copyright) md += `\n> ${config.copyright}\n\n---\n\n`;
    
    if(config.foreword) md += `## Foreword\n\n${config.foreword}\n\n---\n\n`;
    
    chapters.forEach(c => {
        md += `## ${c.title}\n\n${c.content}\n\n`;
    });
    
    if(config.afterword) md += `\n---\n\n## Afterword\n\n${config.afterword}\n`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${config.title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
