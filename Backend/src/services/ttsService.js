import say from 'say';
import fs from 'fs';
import { promisify } from 'util';
import path from 'path';

// Promisify fs.unlink for async file deletion
const unlinkAsync = promisify(fs.unlink);

/**
 * Converts text into speech audio using the OS's built-in TTS engine.
 * @param {string} text - The text to be synthesized into speech.
 * @returns {Promise<string>} A promise that resolves to a base64 encoded audio string (WAV format).
 */
export async function textToSpeech(text) {
    // Define a temporary file path. Using path.join is safer for cross-platform compatibility.
    const filePath = path.join(process.cwd(), 'response.wav');

    return new Promise((resolve, reject) => {
        // Use say.export to save the speech to a file
        say.export(text, null, 1.0, filePath, async (err) => {
            if (err) {
                console.error('Error in Text-to-Speech synthesis (say.js):', err);
                return reject(new Error('Failed to generate audio response.'));
            }
            
            try {
                // Read the generated file into a buffer
                const audioBuffer = fs.readFileSync(filePath);

                // Clean up by deleting the temporary file
                await unlinkAsync(filePath);
                
                // Convert the buffer to a base64 string and resolve the promise
                resolve(audioBuffer.toString('base64'));
            } catch (readErr) {
                console.error('Error reading or deleting TTS file:', readErr);
                reject(new Error('Failed to process generated audio.'));
            }
        });
    });
}