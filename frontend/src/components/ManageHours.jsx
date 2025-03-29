import React, { useState, useEffect } from 'react';
import './ManageHours.css';

function ManageHours() {
    const [pendingHours, setPendingHours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPendingHours();
    }, []);

    const fetchPendingHours = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://127.0.0.1:5000/auth/pending_service_hours', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch pending hours');
            }

            const data = await response.json();
            setPendingHours(data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleApprove = async (hoursId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://127.0.0.1:5000/auth/approve_service_hours/${hoursId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to approve hours');
            }

            // Remove the approved hours from the list
            setPendingHours(pendingHours.filter(hour => hour.id !== hoursId));
            alert('Hours approved successfully');
        } catch (err) {
            alert('Error approving hours: ' + err.message);
        }
    };

    // Helper function to format time from 24h to 12h format
    const formatTime = (timeString) => {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const standardHour = hour % 12 || 12;
        return `${standardHour}:${minutes} ${ampm}`;
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="manage-hours-container">
            <h2>Pending Hours Approval</h2>
            {pendingHours.length === 0 ? (
                <p>No pending hours to approve</p>
            ) : (
                <table className="hours-table">
                    <thead>
                        <tr>
                            <th>Member Name</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Duration (hours)</th>
                            <th>Description</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingHours.map((hour) => (
                            <tr key={hour.id}>
                                <td>{hour.user_name}</td>
                                <td>{new Date(hour.date).toLocaleDateString()}</td>
                                <td>{formatTime(hour.time)}</td>
                                <td>{hour.duration_hours}</td>
                                <td>{hour.description}</td>
                                <td>
                                    <button 
                                        onClick={() => handleApprove(hour.id)}
                                        className="approve-button"
                                    >
                                        Approve
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ManageHours;