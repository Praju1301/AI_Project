import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
export const login = async (email, password) => {
    const config = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const { data } = await axios.post(`${API_URL}/auth`, { email, password }, config);
    return data;
};

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// --- Auth & User ---
export const getCurrentUserProfile = () => api.get('/user/profile');
export const getStudents = () => api.get('/user/students');
export const linkStudent = (studentEmail) => api.post('/user/students', { studentEmail });

// --- Settings ---
export const getStudentSettings = (studentId) => api.get(`/user/settings/${studentId}`);
export const updateStudentSettings = (studentId, settingsData) => api.put(`/user/settings/${studentId}`, settingsData);

// --- Schedule (Routines & Tasks) ---
export const getRoutineForStudent = (studentId) => api.get(`/schedule/routine/${studentId}`);
export const setRoutineForStudent = (studentId, routineData) => api.post(`/schedule/routine/${studentId}`, routineData);
export const getTasksForStudent = (studentId) => api.get(`/schedule/tasks/${studentId}`);
export const createTaskForStudent = (studentId, taskData) => api.post(`/schedule/tasks/${studentId}`, taskData);

// --- Progress & History ---
export const getProgressAnalytics = () => api.get('/progress/analytics');
export const getTopicAnalytics = () => api.get('/progress/topics');
export const getHistory = () => api.get('/progress/history');

// --- Interaction ---
export const processInteraction = (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'interaction.webm');
    return api.post('/interact', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

export default api;