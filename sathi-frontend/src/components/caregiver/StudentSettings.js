// src/components/caregiver/StudentSettings.js
import React, { useState, useEffect } from 'react';
import { getStudents, getStudentSettings, updateStudentSettings } from '../../api/api.js';

const StudentSettings = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [settings, setSettings] = useState({ voice: 'Default', responseSpeed: 'normal' });
    const [status, setStatus] = useState('');

    useEffect(() => {
        const fetchStudents = async () => {
            const response = await getStudents();
            setStudents(response.data);
        };
        fetchStudents();
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            const fetchSettings = async () => {
                try {
                    const response = await getStudentSettings(selectedStudent);
                    setSettings(response.data);
                    setStatus('');
                } catch (error) {
                    setStatus('Could not load settings for this student.');
                }
            };
            fetchSettings();
        } else {
            setSettings({ voice: 'Default', responseSpeed: 'normal' }); // Reset form if no student is selected
        }
    }, [selectedStudent]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!selectedStudent) {
            setStatus('Please select a student first.');
            return;
        }
        setStatus('Saving...');
        try {
            await updateStudentSettings(selectedStudent, settings);
            setStatus('Settings saved successfully!');
        } catch (error) {
            setStatus('Failed to save settings.');
        }
    };

    return (
        <div className="card">
            <h3>Student Settings</h3>
            <select onChange={(e) => setSelectedStudent(e.target.value)} value={selectedStudent}>
                <option value="">-- Select a Student --</option>
                {students.map(student => (
                    <option key={student._id} value={student._id}>{student.name}</option>
                ))}
            </select>

            {selectedStudent && (
                <div style={{ marginTop: '1.5rem' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label>Sathi's Voice:</label>
                        <select name="voice" value={settings.voice} onChange={handleChange}>
                            <option value="Default">Default</option>
                            <option value="Friendly">Friendly</option>
                            <option value="Calm">Calm</option>
                        </select>
                    </div>
                    <div>
                        <label>Response Speed:</label>
                        <select name="responseSpeed" value={settings.responseSpeed} onChange={handleChange}>
                            <option value="slow">Slow</option>
                            <option value="normal">Normal</option>
                            <option value="fast">Fast</option>
                        </select>
                    </div>
                    <button onClick={handleSave} style={{ marginTop: '1rem', width: '100%' }}>Save Settings</button>
                </div>
            )}
            {status && <p style={{ marginTop: '1rem', color: '#BB86FC' }}>{status}</p>}
        </div>
    );
};

export default StudentSettings;