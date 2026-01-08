'use server';

import epub from 'epub-gen-memory';

export async function generateEpub(options: any, content: any[]) {
    try {
        const buffer = await epub(options, content);
        // Convert buffer to base64 string
        return buffer.toString('base64');
    } catch (error) {
        console.error("Server EPUB gen failed:", error);
        throw new Error("Failed to generate EPUB");
    }
}
