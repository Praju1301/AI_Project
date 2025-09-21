// Import necessary packages for making HTTP requests and handling files
import axios from 'axios';
import fs from 'fs';

// The specific URL for the Whisper model on the Hugging Face Inference API
const API_URL = "https://api-inference.huggingface.co/models/openai/whisper-large-v3";

/**
 * Transcribes an audio file into text using the Hugging Face Inference API.
 * This function uses the exact same Whisper model as OpenAI, but via a free service.
 * @param {string} audioFilePath - The local path to the audio file to be transcribed.
 * @returns {Promise<string>} A promise that resolves to the transcribed text.
 * @throws {Error} Throws an error if the API call fails.
 */
export async function transcribeAudio(audioFilePath) {
    // Read the audio file from the disk into a buffer
    const audioData = fs.readFileSync(audioFilePath);

    // Make sure your Hugging Face API Key is set in your .env file.
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
        throw new Error('Hugging Face API key is not configured.');
    }

    try {
        // Make a POST request to the Hugging Face API
        const response = await axios.post(
            API_URL,
            audioData, // Send the raw audio data in the request body
            {
                headers: {
                    // Explicitly set the Accept header to match the API's requirements
                    'Accept': 'application/json',
                    // Add the Authorization header with your Hugging Face token
                    'Authorization': `Bearer ${apiKey}`,
                    // Specify the content type of the data you are sending
                    'Content-Type': 'audio/flac' 
                },
            }
        );

        // The transcribed text is in the 'text' property of the response data
        return response.data.text;
    } catch (error) {
        // Log a detailed error message if the API call fails
        console.error('Error in Hugging Face transcription:', error.response ? error.response.data : error.message);
        throw new Error('Failed to transcribe audio via Hugging Face.');
    }
}