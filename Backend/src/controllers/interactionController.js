import Interaction from '../models/Interaction.js';
import mongoose from 'mongoose';
import { transcribeAudio } from '../services/whisperService.js';
import { detectEmotion } from '../services/emotionService.js';
import { getCalendarEvents } from '../services/gcalendarService.js';
import { generateTextResponse } from '../services/geminiService.js';
import { textToSpeech } from '../services/ttsService.js';
import { analyzeTextSentiment } from '../services/sentimentService.js';

/**
 * Intelligently combines audio emotion and text analysis to determine a final emotion.
 * - If the text contains a specific, strong emotion keyword (e.g., "sad", "angry"), it is prioritized.
 * - Otherwise, it relies on the tone of voice from the audio analysis.
 * @param {string} audioEmotion - Emotion detected from voice tone (e.g., 'neu', 'hap').
 * @param {{sentiment: string, specificEmotion: string|null, score: number}} textAnalysis - Analysis from sentiment service.
 * @returns {string} The finalized, standardized emotion (e.g., 'neutral', 'happy').
 */
const finalizeEmotion = (audioEmotion, textAnalysis) => {
    let finalEmotion;

    // 1. Prioritize specific emotion keywords found in the text.
    if (textAnalysis.specificEmotion) {
        finalEmotion = textAnalysis.specificEmotion;
    }
    // 2. If text sentiment is strong but audio is neutral, trust the text.
    else if (textAnalysis.sentiment !== 'neutral' && audioEmotion === 'neu') {
        finalEmotion = textAnalysis.sentiment === 'positive' ? 'happy' : 'sad';
    }
    // 3. Otherwise, use the audio tone.
    else {
        finalEmotion = audioEmotion;
    }
    
    // --- START OF FIX: Standardize all emotion labels ---
    const emotionMap = {
        'ang': 'angry',
        'hap': 'happy',
        'neu': 'neutral',
        'sad': 'sad',
        'sur': 'surprise', // Add other mappings as needed
        'fea': 'fear',
        'dis': 'disgust'
    };

    // Return the standardized name if it exists in the map, otherwise return the original.
    // This handles cases where the label is already correct (e.g., from text analysis).
    return emotionMap[finalEmotion] || finalEmotion;
    // --- END OF FIX ---
};

export const processInteraction = async (req, res, next) => {
    if (!req.file) {
        return next(new Error('No audio file provided.'));
    }

    try {
        const audioFilePath = req.file.path;
        const userId = req.user._id;

        const topicHistory = await Interaction.aggregate([
            { $match: { user: new mongoose.Types.ObjectId(userId) } },
            { $group: { _id: '$topic', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 3 },
            { $project: { _id: 0, topic: '$_id' } }
        ]);
        const frequentTopics = topicHistory.map(item => item.topic);

        const transcribedText = await transcribeAudio(audioFilePath);
        const audioEmotion = await detectEmotion(audioFilePath); // e.g., 'neu'
        const calendarEvents = await getCalendarEvents();
        
        const textAnalysis = analyzeTextSentiment(transcribedText);
        const finalEmotion = finalizeEmotion(audioEmotion, textAnalysis);
        
        const aiResponse = await generateTextResponse(
            transcribedText, 
            finalEmotion, 
            calendarEvents,
            frequentTopics
        );
        
        const audioResponse = await textToSpeech(aiResponse.responseText);

       await Interaction.create({
            user: userId,
            transcribedText,
            detectedEmotion: finalEmotion,
            responseText: aiResponse.responseText,
            topic: aiResponse.topic
        });

        res.json({ 
            textResponse: aiResponse.responseText, 
            audioResponse, 
            detectedEmotion: finalEmotion 
        });

    } catch (error) {
        console.error("Interaction controller caught an error:", error);
        next(error);
    }
};