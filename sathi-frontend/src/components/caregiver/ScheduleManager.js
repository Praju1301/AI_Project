import React, { useState, useEffect } from 'react';
import { getStudents, getRoutineForStudent, setRoutineForStudent, createTaskForStudent } from '../../api/api.js';

const ScheduleManager = () => {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState('');

    // State for the routine
    const [routineItems, setRoutineItems] = useState([]);
    const [newRoutineText, setNewRoutineText] = useState(''); // <-- This was missing
    const [newRoutineStartTime, setNewRoutineStartTime] = useState('');
    const [newRoutineEndTime, setNewRoutineEndTime] = useState('');

    // State for one-off tasks
    const [taskTitle, setTaskTitle] = useState('');
    const [taskStartTime, setTaskStartTime] = useState('');
    const [taskEndTime, setTaskEndTime] = useState('');
    
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
            const fetchRoutine = async () => {
                const response = await getRoutineForStudent(selectedStudent);
                setRoutineItems(response.data?.items || []);
            };
            fetchRoutine();
        } else {
            setRoutineItems([]);
        }
    }, [selectedStudent]);

    // --- Routine Management ---
    const handleAddRoutineItem = () => {
        if (newRoutineText.trim() && newRoutineStartTime && newRoutineEndTime) {
            setRoutineItems([
                ...routineItems,
                { name: newRoutineText, startTime: newRoutineStartTime, endTime: newRoutineEndTime }
            ]);
            setNewRoutineText('');
            setNewRoutineStartTime('');
            setNewRoutineEndTime('');
        }
    };

    const handleRemoveRoutineItem = (indexToRemove) => {
        setRoutineItems(routineItems.filter((_, index) => index !== indexToRemove));
    };

    const handleSaveRoutine = async () => {
        setStatus('Saving routine...');
        try {
            // Correctly filter for items with startTime and endTime
            const validItems = routineItems.filter(item => item.name && item.startTime && item.endTime);
            await setRoutineForStudent(selectedStudent, { items: validItems });
            setStatus('Routine saved successfully!');
        } catch (error) {
            setStatus('Failed to save routine.');
        }
    };
    
    // --- Task Management ---
    const handleAssignTask = async (e) => {
        e.preventDefault();
        setStatus('Assigning task...');
        try {
            await createTaskForStudent(selectedStudent, {
                title: taskTitle,
                startTime: new Date(taskStartTime).toISOString(),
                endTime: new Date(taskEndTime).toISOString()
            });
            setStatus('Task assigned successfully!');
            setTaskTitle('');
            setTaskStartTime('');
            setTaskEndTime('');
        } catch (error) {
            setStatus('Failed to assign task.');
        }
    };

    return (
        <div className="card">
            <h3>Schedule Manager</h3>
            <select onChange={(e) => setSelectedStudent(e.target.value)} value={selectedStudent}>
                <option value="">-- Select a Student --</option>
                {students.map(student => (
                    <option key={student._id} value={student._id}>{student.name}</option>
                ))}
            </select>

            {selectedStudent && (
                <div style={{ marginTop: '2rem' }}>
                    {/* --- Routine Section --- */}
                    <h4>Daily Routine</h4>
                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                        {routineItems.map((item, index) => (
                            <li key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', background: '#2a2a2a', padding: '10px', borderRadius: '5px' }}>
                                <span>{item.name} ({item.startTime} - {item.endTime})</span>
                                <button onClick={() => handleRemoveRoutineItem(index)} style={{ background: '#CF6679' }}>Remove</button>
                            </li>
                        ))}
                    </ul>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '10px', marginTop: '1rem' }}>
                        <input type="text" placeholder="Add new routine item..." value={newRoutineText} onChange={(e) => setNewRoutineText(e.target.value)} />
                        <input type="time" value={newRoutineStartTime} onChange={(e) => setNewRoutineStartTime(e.target.value)} title="Start Time" />
                        <input type="time" value={newRoutineEndTime} onChange={(e) => setNewRoutineEndTime(e.target.value)} title="End Time" />
                        <button onClick={handleAddRoutineItem}>+ Add</button>
                    </div>
                    <button onClick={handleSaveRoutine} style={{ marginTop: '1rem', width: '100%' }}>Save Full Routine</button>

                    {/* --- Assign Task Section --- */}
                    <h4 style={{ marginTop: '2rem', borderTop: '1px solid #444', paddingTop: '2rem' }}>Assign a One-off Task</h4>
                    <form onSubmit={handleAssignTask}>
                        <input type="text" placeholder="Task Title" value={taskTitle} onChange={e => setTaskTitle(e.target.value)} required />
                        <input type="datetime-local" value={taskStartTime} onChange={e => setTaskStartTime(e.target.value)} required />
                        <input type="datetime-local" value={taskEndTime} onChange={e => setTaskEndTime(e.target.value)} required />
                        <button type="submit">Assign Task</button>
                    </form>
                </div>
            )}
            {status && <p style={{ marginTop: '1rem', color: '#BB86FC' }}>{status}</p>}
        </div>
    );
};

export default ScheduleManager;