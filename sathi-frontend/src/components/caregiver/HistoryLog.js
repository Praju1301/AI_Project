import React, { useState, useEffect } from 'react';
import { getHistory } from '../../api/api.js';

const HistoryLog = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await getHistory();
                setHistory(response.data);
            } catch (error) {
                console.error("Failed to fetch history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <p>Loading history...</p>;

    return (
        <div className="card" style={{ marginTop: '2rem' }}>
            <h3>Interaction History</h3>
            {history.length === 0 ? (
                <p>No interactions have been recorded yet.</p>
            ) : (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {history.map(item => (
                        <li key={item._id} style={{ borderBottom: '1px solid #333', padding: '15px 0' }}>
                            {/* --- Start of Change --- */}
                            {/* Display the student's name instead of "User" */}
                            <p><strong>{item.user?.name || 'Student'} Said:</strong> "{item.transcribedText}"</p>
                            {/* --- End of Change --- */}

                            <p style={{ color: '#B3B3B3' }}><strong>Detected Emotion:</strong> {item.detectedEmotion}</p>
                            <p style={{ color: '#B3B3B3' }}><strong>Sathi Replied:</strong> "{item.responseText}"</p>
                            <small style={{ color: '#888' }}>{new Date(item.createdAt).toLocaleString()}</small>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default HistoryLog;