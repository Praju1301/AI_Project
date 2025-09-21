import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentSettings, updateStudentSettings } from '../api/api.js';

const SettingsPage = () => {
    const { studentId } = useParams(); // Get student ID from the URL
    const [settings, setSettings] = useState({ voice: 'Default', responseSpeed: 'normal' });
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        if (studentId) {
            const fetchSettings = async () => {
                try {
                    const response = await getStudentSettings(studentId);
                    setSettings(response.data);
                } catch (error) {
                    setStatusMessage('Could not load settings.');
                }
            };
            fetchSettings();
        }
    }, [studentId]);

    const handleSave = async () => {
        try {
            await updateStudentSettings(studentId, settings);
            setStatusMessage('Settings saved successfully!');
        } catch (error) {
            setStatusMessage('Error saving settings.');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prevSettings => ({
            ...prevSettings,
            [name]: value
        }));
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: 'auto' }}>
            <Link to="/dashboard">← Back to Dashboard</Link>
            <h2>Settings</h2>

            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="voice-select">Sathi's Voice:</label>
                <select id="voice-select" name="voice" value={settings.voice} onChange={handleChange}>
                    <option value="Default">Default</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Calm">Calm</option>
                </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label>Response Speed:</label>
                <div>
                    <input type="radio" id="slow" name="responseSpeed" value="slow" checked={settings.responseSpeed === 'slow'} onChange={handleChange} />
                    <label htmlFor="slow">Slow</label>
                </div>
                <div>
                    <input type="radio" id="normal" name="responseSpeed" value="normal" checked={settings.responseSpeed === 'normal'} onChange={handleChange} />
                    <label htmlFor="normal">Normal</label>
                </div>
                <div>
                    <input type="radio" id="fast" name="responseSpeed" value="fast" checked={settings.responseSpeed === 'fast'} onChange={handleChange} />
                    <label htmlFor="fast">Fast</label>
                </div>
            </div>

            <button onClick={handleSave}>Save Settings</button>
            {statusMessage && <p>{statusMessage}</p>}
        </div>
    );
};

export default SettingsPage;