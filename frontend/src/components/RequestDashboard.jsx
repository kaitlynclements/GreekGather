import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./RequestDashboard.css";

function RequestDashboard() {
    const [requests, setRequests] = useState([]);
    const navigate = useNavigate(); // Define navigate

    useEffect(() => {
        const userRole = localStorage.getItem("role");
        if (userRole !== "admin") {
            navigate("/");
            return;
        }
    
        const token = localStorage.getItem("token");  // Retrieve the JWT token
    
        fetch("http://127.0.0.1:5000/auth/membership_requests", {  
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,  // Ensure Authorization header is set
            },
        })
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => setRequests(data))
        .catch((error) => console.error("Error fetching requests:", error));
    }, [navigate]);
    
    
    const handleAction = (requestId, action) => {
        fetch(`http://127.0.0.1:5000/auth/membership_requests/${requestId}/update`, {  // ✅ FIXED: added `/auth/`
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ action })
        })
        .then((res) => {
            if (!res.ok) {
                throw new Error(`HTTP error! Status: ${res.status}`);
            }
            return res.json();
        })
        .then((data) => {
            alert(data.message);
            setRequests(prevRequests => prevRequests.filter(req => req.id !== requestId)); // ✅ Ensures correct UI update
        })
        .catch((error) => console.error(`Error approving request:`, error));
    };
    
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
                                <button className="approve-btn" onClick={() => handleAction(request.id, "approve")}>Approve</button>
                                <button className="deny-btn" onClick={() => handleAction(request.id, "deny")}>Deny</button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default RequestDashboard;
