import React, { useState, useEffect } from 'react';
import { getStudents, linkStudent } from '../../api/api.js';

const StudentManager = () => {
    const [students, setStudents] = useState([]);
    const [studentEmail, setStudentEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchStudents = async () => {
        try {
            const response = await getStudents();
            setStudents(response.data);
        } catch (err) {
            setError('Failed to fetch students.');
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    const handleLinkStudent = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await linkStudent(studentEmail);
            setSuccess('Student linked successfully! Refreshing...');
            setStudentEmail('');
            // Instead of reloading, we just refetch the students for a smoother experience
            fetchStudents(); 
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to link student.');
        }
    };

    return (
        <div>
            <h3>Manage Students</h3>
            <form onSubmit={handleLinkStudent}>
                <input
                    type="email"
                    placeholder="Enter Student's Email to Link"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    required
                />
                <button type="submit">Link Student</button>
                {error && <p style={{ color: '#CF6679' }}>{error}</p>}
                {success && <p style={{ color: '#03DAC6' }}>{success}</p>}
            </form>

            <h4>Linked Students:</h4>
            {students.length > 0 ? (
                <ul>
                    {students.map(student => (
                        <li key={student._id}>{student.name} ({student.email})</li>
                    ))}
                </ul>
            ) : (
                <p>No students have been linked yet.</p>
            )}
            {/* The reference to <AssignTask /> has been removed */}
        </div>
    );
};

export default StudentManager;