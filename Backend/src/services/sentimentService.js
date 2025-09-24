import Sentiment from 'sentiment';

const sentiment = new Sentiment();

// Define keywords for more specific emotion detection
const emotionKeywords = {
    happy: ['happy', 'joyful', 'excited', 'great', 'wonderful', 'amazing', 'fantastic'],
    sad: ['sad', 'unhappy', 'miserable', 'depressed', 'crying', 'heartbroken'],
    angry: ['angry', 'mad', 'furious', 'annoyed', 'frustrated', 'irritated']
};

/**
 * Analyzes text for both general sentiment and specific emotion keywords.
 * @param {string} text The text to analyze.
 * @returns {{sentiment: 'positive'|'negative'|'neutral', specificEmotion: 'happy'|'sad'|'angry'|null, score: number}}
 */
export function analyzeTextSentiment(text) {
    const result = sentiment.analyze(text.toLowerCase());
    let specificEmotion = null;

    // Check for specific emotion keywords
    for (const emotion in emotionKeywords) {
        if (emotionKeywords[emotion].some(keyword => text.includes(keyword))) {
            specificEmotion = emotion;
            break; // Stop after finding the first match
        }
    }

    let generalSentiment = 'neutral';
    if (result.comparative > 0.5) {
        generalSentiment = 'positive';
    } else if (result.comparative < -0.5) {
        generalSentiment = 'negative';
    }
    
    // If we found a specific keyword, let it determine the sentiment
    if (specificEmotion === 'happy') generalSentiment = 'positive';
    if (specificEmotion === 'sad' || specificEmotion === 'angry') generalSentiment = 'negative';

    return { 
        sentiment: generalSentiment,
        specificEmotion,
        score: result.comparative 
    };
}