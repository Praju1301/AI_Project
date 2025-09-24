// src/components/shared/VisualFeedback.js
import React from 'react';
import './VisualFeedback.css'; 

const VisualFeedback = ({ status, responseText, emotion }) => { // Accept emotion as a prop

    const getEmotionIcon = () => {
        switch (emotion?.toLowerCase()) {
            case 'happy': return '😄';
            case 'sad': return '😢';
            case 'angry': return '😠';
            case 'neutral': return '😐';
            case 'surprise': return '😮';
            default: return '😊'; // Default for speaking
        }
    };

    const getFeedbackContent = () => {
        switch (status) {
            case 'recording':
                return {
                    icon: '🎤',
                    text: 'I am listening...',
                    className: 'listening'
                };
            case 'processing':
                return {
                    icon: '🤔',
                    text: 'Thinking...',
                    className: 'thinking'
                };
            case 'speaking':
                 return {
                    icon: getEmotionIcon(), // This will now work correctly
                    text: responseText,
                    className: 'speaking'
                };
            case 'idle':
            default:
                return {
                    icon: '👋',
                    text: responseText || 'Hello! I am Sathi. Press the button and talk to me.',
                    className: 'idle'
                };
        }
    };

    const { icon, text, className } = getFeedbackContent();

    return (
        <div className={`feedback-container ${className}`}>
            <div className="feedback-icon">{icon}</div>
            <h2 className="feedback-text">{text}</h2>
        </div>
    );
};

export default VisualFeedback;