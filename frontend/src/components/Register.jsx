/* Allows users to register for an account */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // Import the new CSS file

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:5000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                window.location.reload();
                navigate('/events');
            } else {
                setError(data.error);
            }
        } catch (error) {
            console.error('Registration error:', error);
        }
    };

    return (
        <div className="register-container">
            <form onSubmit={handleRegister} className="register-form">
                <h2>Register</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <input type="text" placeholder="Full Name" onChange={(e) => setName(e.target.value)} required />
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Register</button>
            </form>
        </div>
    );
}

export default Register;
