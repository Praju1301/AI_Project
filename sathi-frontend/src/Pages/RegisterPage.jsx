import React, { useState } from 'react';
import axios from 'axios';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const API_URL = 'http://localhost:5000/api/auth/register';
            const response = await axios.post(API_URL, { name, email, password, role });
            
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('userRole', response.data.role);

            if (response.data.role === 'caregiver') {
                window.location.href = '/dashboard';
            } else {
                window.location.href = '/student';
            }
            
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed.');
        }
    };

    return (
        <div>
            <h2>Register an Account</h2>
            <form onSubmit={handleSubmit}>
                {/* --- Start of Added Fields --- */}
                <div>
                    <label>Name:</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                {/* --- End of Added Fields --- */}

                <div>
                    <label>Role:</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="student">Student</option>
                        <option value="caregiver">Caregiver</option>
                    </select>
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Register</button>
            </form>
        </div>
    );
};

export default RegisterPage;    