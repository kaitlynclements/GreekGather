import React, { useState, useEffect } from "react";
import "./RequestDashboard.css";

function RequestDashboard() {
    const [requests, setRequests] = useState([]);

    // ✅ Fetch membership requests (Mock Data for Now)
    useEffect(() => {
        const mockRequests = [
            { id: 1, name: "John Doe", email: "john@example.com" },
            { id: 2, name: "Jane Smith", email: "jane@example.com" }
        ];
        setRequests(mockRequests);
    }, []);

    return (
        <div className="request-dashboard">
            <h2>Membership Requests</h2>
            {requests.length === 0 ? (
                <p>No pending requests</p>
            ) : (
                <ul>
                    {requests.map(request => (
                        <li key={request.id} className="request-item">
                            <div className="request-info">
                                <strong>{request.name}</strong> ({request.email})
                            </div>
                            <div className="request-actions">
                                <button className="approve-btn">Approve</button>
                                <button className="deny-btn">Deny</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default RequestDashboard;
