'use server';

import epub from 'epub-gen-memory';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateEpub(options: any, content: any[]) {
    try {
        const buffer = await epub(options, content);
        return buffer.toString('base64');
    } catch (error) {
        console.error("Server EPUB gen failed:", error);
        throw new Error("Failed to generate EPUB");
    }
}
