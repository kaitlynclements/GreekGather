import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './HoursTracker.css';
import ServiceLeaderboard from './ServiceLeaderboard';
import StudyLeaderboard from './StudyLeaderboard';

function HoursTracker() {
    const navigate = useNavigate(); 
    const [studySessions, setStudySessions] = useState([]);
    const [serviceSessions, setServiceSessions] = useState([]);
    const [form, setForm] = useState({ date: '', duration: '', description: '', type: 'study' });
    const [period, setPeriod] = useState('week');

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/");
        }
    }, [token, navigate]);

    useEffect(() => {
        if (token) {
            fetchStudySessions();
            fetchServiceSessions();
        }
    }, [period, token]);

    const fetchStudySessions = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/auth/study_summary?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setStudySessions(data.sessions || []); 
        } catch (error) {
            console.error("Error fetching study sessions:", error);
            setStudySessions([]); 
        }
    };

    const fetchServiceSessions = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:5000/auth/service_summary?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            setServiceSessions(data.sessions || []); 
        } catch (error) {
            console.error("Error fetching service sessions:", error);
            setServiceSessions([]); 
        }
    };

    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const isService = form.type === "service";
        const endpoint = isService ? "service_sessions" : "study_sessions";

        let payload;

        try {
            payload = {
                date: form.date,
                duration_hours: parseFloat(form.duration) || 0,
                description: form.description
            };

            const response = await fetch(`http://127.0.0.1:5000/auth/${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to log session");
            }

            await fetchStudySessions();
            await fetchServiceSessions();
            
            setForm({ date: '', duration: '', description: '', type: 'study' });
            alert("Hours submitted successfully!");
        } catch (err) {
            console.error("Error submitting session:", err);
            alert(err.message);
        }
    };

    const calculateTotal = (sessions) =>
        sessions.reduce((sum, s) => sum + (s.duration_hours ?? s.duration ?? 0), 0).toFixed(2);

    const renderSession = (s, i) => {
        const date = new Date(s.start_time || s.date);
        const duration = s.duration_hours ?? s.duration ?? 0;

        return (
            <div key={i} className="session-entry">
                <p><strong>{date.toLocaleDateString()}</strong></p>
                <p>{s.description}</p>
                <p>Hours: {duration.toFixed(2)}</p>
            </div>
        );
    };

    const ServiceHourEntry = ({ session }) => (
        <div className="session-entry">
            <div className="session-header">
                <span className="session-date">{new Date(session.start_time || session.date).toLocaleDateString()}</span>
                {session.verified && (
                    <span className="verification-badge">
                        ✓ Approved
                    </span>
                )}
            </div>
            <div className="session-details">
                <p><strong>Duration:</strong> {session.duration_hours?.toFixed(2) || session.duration?.toFixed(2)} hours</p>
                <p><strong>Description:</strong> {session.description}</p>
            </div>
        </div>
    );

    return (
        <div className="study-hours-container">
            <h2>Study & Service Hour Tracker</h2>

            <form onSubmit={handleSubmit} className="study-form">
                <label>Type</label>
                <select name="type" value={form.type} onChange={handleInputChange}>
                    <option value="study">Study</option>
                    <option value="service">Service</option>
                </select>

                <label>Date</label>
                <input type="date" name="date" value={form.date} onChange={handleInputChange} required />

                <label>Duration (hours)</label>
                <input type="number" name="duration" value={form.duration} onChange={handleInputChange} placeholder="Duration in hours" step="0.1" min="0" required />

                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleInputChange} required />

                <button type="submit">Log Session</button>
            </form>

            <div className="filter">
                <label>View By:</label>
                <select value={period} onChange={e => setPeriod(e.target.value)}>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                </select>
            </div>

            <div className="session-list">
                <h3>Study Hours: {calculateTotal(studySessions)}</h3>
                {studySessions.map(renderSession)}

                <h3>Service Hours: {calculateTotal(serviceSessions)}</h3>
                {serviceSessions.map((s, i) => <ServiceHourEntry key={i} session={s} />)}
            </div>
            
            <ServiceLeaderboard />
            <StudyLeaderboard />
        </div>
    );
}

export default HoursTracker;
