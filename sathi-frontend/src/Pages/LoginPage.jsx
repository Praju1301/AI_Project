import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password, role);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Login failed.');
        }
    };
    return (
        <div className="card" style={{ maxWidth: '400px', margin: '2rem auto' }}>
            <h2 style={{ textAlign: 'center' }}>Login as a {role.charAt(0).toUpperCase() + role.slice(1)}</h2>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                <button onClick={() => setRole('student')} style={{ marginRight: '10px', background: role === 'student' ? '#BB86FC' : '#444' }}>
                    I'm a Student
                </button>
                <button onClick={() => setRole('caregiver')} style={{ background: role === 'caregiver' ? '#BB86FC' : '#444' }}>
                    I'm a Caregiver
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                {error && <p style={{ color: '#CF6679', marginTop: '1rem' }}>{error}</p>}
                <button type="submit">Login</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
};

export default LoginPage;