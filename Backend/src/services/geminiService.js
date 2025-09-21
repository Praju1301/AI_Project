import dotenv from 'dotenv';
dotenv.config();
import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
if (process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// ** THE FIX IS HERE: Ensure 'frequentTopics' is listed as the fourth parameter **
export async function generateTextResponse(transcribedText, detectedEmotion, calendarEvents, frequentTopics) {
    if (!genAI) {
        return { responseText: "I'm here to listen.", topic: "General" };
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
        You are "Sathi," an empathetic voice assistant for a teenager with Down syndrome.
        Your goal is to be encouraging, simple, and clear.
        Analyze the user's text. Respond in JSON format with "responseText" and "topic".
        The "topic" should be one of: School, Home, Feelings, Hobbies, Health, General.

        **NEW INSTRUCTION:**
        - If the user's text is short, generic, or just a greeting (e.g., "hi", "hello"), check their frequent topics.
        - If frequent topics exist, proactively start a conversation by asking a question related to one of those topics.
        - Otherwise, provide a simple, empathetic response to what they said.

        Current Context:
        - User said: "${transcribedText}"
        - Detected emotion: "${detectedEmotion}"
        - User's frequent topics: ${frequentTopics.length > 0 ? frequentTopics.join(', ') : "None yet."}
        - Upcoming schedule: ${calendarEvents.length > 0 ? calendarEvents.map(e => `- ${e.summary} at ${e.start.dateTime || e.start.date}`).join('\n') : "No upcoming events."}
    `;

    try {
        const result = await model.generateContent(prompt);
        let responseText = result.response.text();

        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
            responseText = jsonMatch[1];
        }
        
        const parsedResponse = JSON.parse(responseText);
        return parsedResponse;

    } catch (error) {
        console.error('Error generating or parsing Gemini response:', error);
        return {
            responseText: "I'm having a little trouble thinking. Can you say that again?",
            topic: "General"
        };
    }
}

/**
 * Generates a simple fallback response when Gemini API is not available
 * @param {string} transcribedText - The user's transcribed speech
 * @param {string} detectedEmotion - The detected emotion
 * @returns {string} A simple, empathetic response
 */
function generateFallbackResponse(transcribedText, detectedEmotion) {
    const emotionResponses = {
        happy: "I'm so glad to hear you sound happy! That makes me happy too.",
        sad: "I can hear that you might be feeling a bit down. I'm here for you.",
        angry: "I understand you might be feeling frustrated. Let's take a deep breath together.",
        excited: "Your excitement is wonderful! I love your energy.",
        calm: "You sound peaceful today. That's really nice.",
        unknown: "Thank you for sharing with me."
    };

    const emotionResponse = emotionResponses[detectedEmotion] || emotionResponses.unknown;
    let response = `${emotionResponse} Is there anything specific you'd like to talk about today?`;
    return response;
}