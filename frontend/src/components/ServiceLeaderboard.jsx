import React, { useState, useEffect } from 'react';
import './ServiceLeaderboard.css';

function ServiceLeaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch('http://127.0.0.1:5000/auth/service_hours_leaderboard', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await response.json();

                if (Array.isArray(data)) {
                    setLeaderboard(data);
                } else {
                    console.error("Unexpected response:", data);
                    setLeaderboard([]);
                }
            } catch (error) {
                console.error('Error fetching leaderboard:', error);
                setLeaderboard([]);
            }
        };

        fetchLeaderboard(); 
    }, [token]); 

    return (
        <div className="leaderboard-container">
            <h2>Service Hours Leaderboard</h2>
            <div className="leaderboard-list">
                {leaderboard.map((entry, index) => (
                    <div key={index} className="leaderboard-entry">
                        <div className="rank">{index + 1}</div>
                        <div className="name">{entry.name}</div>
                        <div className="hours">{entry.total_hours.toFixed(1)} hours</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ServiceLeaderboard;
