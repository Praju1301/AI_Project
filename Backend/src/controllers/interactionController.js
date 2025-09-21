import Interaction from '../models/Interaction.js';
import mongoose from 'mongoose';
import { transcribeAudio } from '../services/whisperService.js';
import { detectEmotion } from '../services/emotionService.js';
import { getCalendarEvents } from '../services/gcalendarService.js';
import { generateTextResponse } from '../services/geminiService.js';
import { textToSpeech } from '../services/ttsService.js';

export const processInteraction = async (req, res, next) => {
    if (!req.file) {
        return next(new Error('No audio file provided.'));
    }

    try {
        const audioFilePath = req.file.path;
        // Remember to replace this with a real user ID from your MongoDB 'users' collection
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
        const detectedEmotion = await detectEmotion(audioFilePath);
        const calendarEvents = await getCalendarEvents();
        
        // Ensure all four arguments are being passed correctly here
        const aiResponse = await generateTextResponse(
            transcribedText, 
            detectedEmotion, 
            calendarEvents,
            frequentTopics
        );
        
        const audioResponse = await textToSpeech(aiResponse.responseText);

       await Interaction.create({
            user: userId,
            transcribedText,
            detectedEmotion,
            responseText: aiResponse.responseText,
            topic: aiResponse.topic
        });
        res.json({ textResponse: aiResponse.responseText, audioResponse });

    } catch (error) {
        console.error("Interaction controller caught an error:", error);
        next(error);
    }
};