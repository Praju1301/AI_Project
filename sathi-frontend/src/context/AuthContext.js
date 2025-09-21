// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            // You could also fetch the user profile here to verify the token
            const role = localStorage.getItem('userRole');
            setUser({ token, role });
        }
        setLoading(false);
    }, []);

    const login = async (email, password, role) => {
        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data.role !== role) {
                throw new Error(`You are registered as a ${response.data.role}. Please select the correct role.`);
            }

            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('userRole', response.data.role);
            setUser({ token: response.data.token, role: response.data.role });

            if (response.data.role === 'caregiver') {
                navigate('/dashboard');
            } else {
                navigate('/student');
            }
        } catch (err) {
            throw err; // Let the login page handle the error display
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        setUser(null);
        navigate('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;