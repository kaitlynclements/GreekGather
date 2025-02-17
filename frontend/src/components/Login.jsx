/*
 * Name: Login.jsx
 * Description: Handles user authentication for GreekGather.
 * Programmer: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: February 2nd. 2025
 * Revised: Refer to Github Commits
 * Revisions: Refer to Github Commits
 * Preconditions:API endpoints for authentication must be available.
 * Acceptable Inputs: Username and password fields.
 * Unacceptable Inputs: Empty credentials.
 * Postconditions: Logs in user or returns an error.
 * Return Values: JSX component with login form.
 * Errors & Exceptions: API errors if login fails.
 * Side Effects: Updates authentication state.
 * Invariants: Valid credentials must be provided.
 * Known Faults: N/A.
 */


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css'; // Import the new CSS file

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://127.0.0.1:5000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                window.location.reload();
                navigate('/events');
            } else {
                setError(data.error);
            }
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h2>Login</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;
