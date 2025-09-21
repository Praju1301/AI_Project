// src/RoutineManager.js
import React, { useState, useEffect } from 'react';
import { getRoutine, addRoutineItem, deleteRoutineItem } from '../../api/api';

const RoutineManager = () => {
    const [routine, setRoutine] = useState([]);
    const [summary, setSummary] = useState('');
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    const [error, setError] = useState('');

    const fetchRoutine = async () => {
        try {
            const response = await getRoutine();
            setRoutine(response.data);
        } catch (err) {
            setError('Failed to fetch routine.');
        }
    };

    useEffect(() => {
        fetchRoutine();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // Basic validation
            if (!summary || !startDateTime || !endDateTime) {
                setError('All fields are required.');
                return;
            }
            await addRoutineItem({ 
                summary, 
                startDateTime: new Date(startDateTime).toISOString(),
                endDateTime: new Date(endDateTime).toISOString()
            });
            // Reset form and refresh list
            setSummary('');
            setStartDateTime('');
            setEndDateTime('');
            fetchRoutine();
        } catch (err) {
            setError('Failed to add routine item.');
        }
    };

    const handleDelete = async (itemId) => {
        try {
            await deleteRoutineItem(itemId);
            fetchRoutine(); // Refresh list after deleting
        } catch (err) {
            setError('Failed to delete routine item.');
        }
    };

    return (
        <div style={{ marginTop: '50px', borderTop: '2px solid #eee', paddingTop: '20px' }}>
            <h3>Routine Management</h3>

            {/* Form to add a new item */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
                <input 
                    type="text"
                    placeholder="Event Summary"
                    value={summary}
                    onChange={e => setSummary(e.target.value)}
                />
                <input 
                    type="datetime-local"
                    value={startDateTime}
                    onChange={e => setStartDateTime(e.target.value)}
                />
                <input 
                    type="datetime-local"
                    value={endDateTime}
                    onChange={e => setEndDateTime(e.target.value)}
                />
                <button type="submit">Add Item</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>

            {/* List of current routine items */}
            <h4>Upcoming Routine:</h4>
            <ul>
                {routine.length > 0 ? routine.map(item => (
                    <li key={item.id}>
                        {item.summary} (at {new Date(item.start.dateTime).toLocaleString()})
                        <button onClick={() => handleDelete(item.id)} style={{ marginLeft: '10px' }}>
                            Delete
                        </button>
                    </li>
                )) : <p>No upcoming items in the routine.</p>}
            </ul>
        </div>
    );
};

export default RoutineManager;