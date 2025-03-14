import React, { useState, useEffect } from "react";
import "./Profile.css";

function Profile() {
    const [userData, setUserData] = useState({ name: "", email: "", phone: "" });
    const [message, setMessage] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        fetch("http://127.0.0.1:5000/get_profile", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        })
        .then((res) => res.json())
        .then((data) => setUserData(data))
        .catch((err) => console.error("Error fetching profile:", err));
    }, []);

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:5000/update_profile", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();
        setMessage(data.message || "Profile updated!");
    };

    return (
        <div className="profile-container">
            <h2>My Profile</h2>
            {message && <p className="success-message">{message}</p>}
            <label>Name:</label>
            <input type="text" name="name" value={userData.name} onChange={handleChange} disabled />
            <label>Email:</label>
            <input type="email" name="email" value={userData.email} onChange={handleChange} />
            <label>Phone:</label>
            <input type="text" name="phone" value={userData.phone} onChange={handleChange} />
            <button onClick={handleSubmit}>Update Profile</button>
        </div>
    );
}

export default Profile;