// src/VisualFeedback.js
import React from 'react';
import './VisualFeedback.css'; // We will create this CSS file next for animations

const VisualFeedback = ({ status, responseText }) => {
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
                    icon: '😊',
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