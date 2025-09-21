/**
 * Uses the browser's Web Speech API to speak a given text.
 * @param {string} text The text to be spoken.
 */
export const speak = (text) => {
    // Cancel any previous speech to prevent overlap
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    window.speechSynthesis.speak(utterance);
};