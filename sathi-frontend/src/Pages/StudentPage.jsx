import React, { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { processInteraction, getRoutineForStudent, getTasksForStudent, getCurrentUserProfile } from '../api/api.js';
import VisualFeedback from '../components/shared/VisualFeedback.js';
import { speak } from '../utils/speech.js';

const StudentPage = () => {
    const [status, setStatus] = useState('idle');
    const [responseText, setResponseText] = useState('Hello! I am Sathi. Press the button and talk to me.');
    const [routine, setRoutine] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [notifiedIds, setNotifiedIds] = useState(new Set());
    const [detectedEmotion, setDetectedEmotion] = useState(null); // New state for emotion

    const mediaRecorder = useRef(null);
    const audioChunks = useRef([]);

    useEffect(() => {
        const fetchUserDataAndSchedule = async () => {
            try {
                const profileRes = await getCurrentUserProfile();
                const studentId = profileRes.data._id;
                setUserProfile(profileRes.data);

                if (studentId) {
                    const routineRes = await getRoutineForStudent(studentId);
                    const tasksRes = await getTasksForStudent(studentId);
                    setRoutine(routineRes.data.items || []);
                    setTasks(tasksRes.data || []);
                }
            } catch (error) {
                console.error("Failed to fetch user data or schedule", error);
            }
        };
        fetchUserDataAndSchedule();
    }, []);

    useEffect(() => {
        if (userProfile) {
            const socket = io('http://localhost:5000');
            socket.emit('addUser', userProfile._id);

            socket.on('new_task', (task) => {
                const notificationText = `New task assigned: ${task.title}`;
                toast.info(notificationText);
                speak(notificationText);
            });

            return () => socket.disconnect();
        }
    }, [userProfile]);

    useEffect(() => {
        const checkUpcomingEvents = () => {
            const now = new Date();
            const upcomingTimeLimit = new Date(now.getTime() + 5 * 60000);

            const allEvents = [
                ...routine.map(item => ({ id: item._id || item.name, title: item.name, time: item.startTime })),
                ...tasks.map(item => ({ id: item._id, title: item.title, time: item.startTime }))
            ];

            allEvents.forEach(event => {
                const eventTime = new Date();
                if (typeof event.time === 'string' && event.time.includes(':')) {
                    const [hours, minutes] = event.time.split(':');
                    eventTime.setHours(hours, minutes, 0, 0);
                } else {
                    const taskTime = new Date(event.time);
                    if (!isNaN(taskTime)) {
                        eventTime.setTime(taskTime.getTime());
                    }
                }

                if (eventTime > now && eventTime <= upcomingTimeLimit && !notifiedIds.has(event.id)) {
                    speak(`Reminder: You have "${event.title}" coming up in 5 minutes.`);
                    setNotifiedIds(prev => new Set(prev).add(event.id));
                }
            });
        };

        const intervalId = setInterval(checkUpcomingEvents, 60000);
        return () => clearInterval(intervalId);
    }, [routine, tasks, notifiedIds]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
            };

            mediaRecorder.current.onstop = async () => {
                setStatus('processing');
                const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
                audioChunks.current = [];

                try {
                    const response = await processInteraction(audioBlob);
                    const { textResponse, audioResponse, detectedEmotion } = response.data;
                    
                    setResponseText(textResponse);
                    setDetectedEmotion(detectedEmotion); // Set the emotion state
                    setStatus('speaking');
                    
                    const audio = new Audio(`data:audio/wav;base64,${audioResponse}`);
                    audio.play();
                    audio.onended = () => {
                        setStatus('idle');
                        setDetectedEmotion(null); // Reset emotion after speaking
                    };

                } catch (error) {
                    console.error("Error processing interaction:", error);
                    setResponseText('I had a little trouble. Please try again.');
                    setStatus('idle');
                }
            };

            mediaRecorder.current.start();
            setStatus('recording');
        } catch (error) {
            console.error("Error accessing microphone:", error);
            setResponseText('Please allow microphone access.');
            setStatus('idle');
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && status === 'recording') {
            mediaRecorder.current.stop();
        }
    };

    const getButtonState = () => {
        switch (status) {
            case 'idle':
            case 'speaking':
                return { text: 'Tap to Speak', action: startRecording, disabled: false };
            case 'recording':
                return { text: 'Tap to Stop', action: stopRecording, disabled: false };
            case 'processing':
                return { text: 'Processing...', action: () => {}, disabled: true };
            default:
                return { text: 'Tap to Speak', action: startRecording, disabled: false };
        }
    };

    const buttonState = getButtonState();

    return (
        <div>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
            <div style={{ display: 'flex', height: '80vh' }}>
                <div style={{ flex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
                    <VisualFeedback status={status} responseText={responseText} emotion={detectedEmotion} />
                    <button onClick={buttonState.action} disabled={buttonState.disabled}>
                        {buttonState.text}
                    </button>
                </div>
                <div style={{ flex: 1, borderLeft: '2px solid #333', padding: '20px', overflowY: 'auto' }}>
                    <h3>My Day</h3>
                    <h4>Routine</h4>
                    {routine.length > 0 ? (
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                            {routine.map((item, index) => (
                                <li key={index} className="card" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>
                                    <input type="checkbox" style={{ marginRight: '10px', transform: 'scale(1.5)' }} />
                                    <div>
                                        <strong style={{ fontSize: '1.1rem' }}>{item.name}</strong>
                                        <p style={{ color: '#bbb', margin: '0.25rem 0 0' }}>
                                            {item.startTime} - {item.endTime}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : <p>No daily routine set.</p>}
                    <h4 style={{ marginTop: '2rem' }}>Additional Tasks</h4>
                    {tasks.length > 0 ? (
                        <ul style={{ listStyleType: 'none', padding: 0 }}>
                            {tasks.map(task => (
                                <li key={task._id} className="card" style={{ marginBottom: '1rem' }}>
                                    <strong>{task.title}</strong>
                                    <p style={{ color: '#bbb', margin: '0.5rem 0 0' }}>
                                        {new Date(task.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    ) : <p>No additional tasks for today.</p>}
                </div>
            </div>
        </div>
    );
};

export default StudentPage;