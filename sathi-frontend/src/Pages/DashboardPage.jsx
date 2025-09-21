import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getProgressAnalytics, getTopicAnalytics } from '../api/api.js';
import HistoryLog from '../components/caregiver/HistoryLog.js';
import StudentManager from '../components/caregiver/StudentManager.js';
import ScheduleManager from '../components/caregiver/ScheduleManager.js';
import StudentSettings from '../components/caregiver/StudentSettings.js';

const DashboardPage = () => {
    const [analytics, setAnalytics] = useState(null);
    const [topicData, setTopicData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [analyticsRes, topicsRes] = await Promise.all([
                    getProgressAnalytics(),
                    getTopicAnalytics()
                ]);
                setAnalytics(analyticsRes.data);
                setTopicData(topicsRes.data);
            } catch (err) {
                setError('Failed to fetch dashboard data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

    if (loading) return <div>Loading dashboard...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Caregiver Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div className="card">
                    <h3>Total Interactions</h3>
                    <p style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{analytics?.totalInteractions || 0}</p>
                </div>
                <div className="card">
                    <h3>Emotion Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={analytics?.emotionDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="emotion" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="card">
                    <h3>Interaction Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics?.interactionTrend}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="count" stroke="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="card">
                    <h3>Conversation Topics</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={topicData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                {topicData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="card" style={{ marginTop: '2rem' }}><StudentManager /></div>
            <div className="card" style={{ marginTop: '2rem' }}><ScheduleManager /></div>
            <div className="card" style={{ marginTop: '2rem' }}><StudentSettings /></div>
            <div className="card" style={{ marginTop: '2rem' }}><HistoryLog /></div>
        </div>
    );
};

export default DashboardPage;