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
import { useAuth } from '../contexts/AuthContext';
import './Login.css'; // Import the new CSS file

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    /*Sends login credentails to backend for handling user authentication. Stores authentication
    token and user role in local storage if successful*/
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
                // Use AuthContext login function
                login({
                    token: data.token,
                    role: data.role,
                    username: data.username,
                    chapter_id: data.chapter_id
                });
                
                navigate('/events');
            } else {
                setError(data.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('An error occurred during login');
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
