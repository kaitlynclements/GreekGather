// frontend/src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [studyHours, setStudyHours] = useState(0);
    const [serviceHours, setServiceHours] = useState(0);
    const [chapterInfo, setChapterInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // Fetch dashboard data
        const fetchDashboardData = async () => {
            try {
                // Fetch upcoming events
                const eventsResponse = await fetch('http://127.0.0.1:5000/events', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const eventsData = await eventsResponse.json();
                const upcoming = (eventsData.events || []).filter(event => {
                    const eventDate = new Date(event.date);
                    const today = new Date();
                    return eventDate >= today;
                }).slice(0, 3); // Get next 3 events
                setUpcomingEvents(upcoming);

                // Fetch study hours summary
                const studyResponse = await fetch('http://127.0.0.1:5000/auth/study_summary?period=month', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const studyData = await studyResponse.json();
                setStudyHours(studyData.total_hours || 0);

                // Fetch service hours summary
                const serviceResponse = await fetch('http://127.0.0.1:5000/auth/service_summary?period=month', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const serviceData = await serviceResponse.json();
                setServiceHours(serviceData.total_hours || 0);

                // Fetch chapter info
                const chapterResponse = await fetch('http://127.0.0.1:5000/auth/chapter/info', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const chapterData = await chapterResponse.json();
                setChapterInfo(chapterData);

            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [navigate]);

    if (loading) {
        return <div className="dashboard-loading">Loading dashboard...</div>;
    }

    return (
        <div className="dashboard-container">
            {/* Chapter Welcome Section */}
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p className="user-role">Role: {localStorage.getItem('role')}</p>
            </div>

            <div className="dashboard-grid">
                {/* Quick Stats */}
                <div className="dashboard-card stats-card">
                    <h2>Your Monthly Stats</h2>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <h3>{studyHours}</h3>
                            <p>Study Hours</p>
                        </div>
                        <div className="stat-item">
                            <h3>{serviceHours}</h3>
                            <p>Service Hours</p>
                        </div>
                    </div>
                </div>

                {/* Upcoming Events */}
                <div className="dashboard-card events-card">
                    <h2>Upcoming Events</h2>
                    {upcomingEvents.length === 0 ? (
                        <p>No upcoming events</p>
                    ) : (
                        <ul className="events-list">
                            {upcomingEvents.map(event => (
                                <li key={event.id} className="event-item">
                                    <h3>{event.name}</h3>
                                    <p>{new Date(event.date).toLocaleDateString()}</p>
                                    <p className="event-type">{event.eventType}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                    <button onClick={() => navigate('/events')} className="view-all-btn">
                        View All Events
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="dashboard-card actions-card">
                    <h2>Quick Actions</h2>
                    <div className="actions-grid">
                        <button onClick={() => navigate('/track-hours')}>Log Hours</button>
                        <button onClick={() => navigate('/events')}>View Calendar</button>
                        <button onClick={() => navigate('/profile')}>Update Profile</button>
                        <button onClick={() => navigate('/announcements')}>Announcements</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;