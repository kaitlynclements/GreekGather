/*
 * Name: Register.jsx
 * Description: Registration component for new users to sign up for GreekGather.
 * Programmer: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: February 2nd, 2025
 * Revised: Refer to GitHub Commits
 * Revisions: Refer to GitHub Commits
 * Preconditions: User is not logged in and needs to create an account.
 * Acceptable Inputs: Full name, email, and a valid password meeting security requirements.
 * Unacceptable Inputs: Passwords that do not meet the validation criteria.
 * Postconditions: Sends a registration request to the backend, creates an account, and logs in the user.
 * Return Values: React JSX component.
 * Errors & Exceptions: 
 *   - Displays an error message if registration fails.
 *   - Shows validation messages if the password does not meet requirements.
 * Side Effects: 
 *   - Stores authentication token and user role in local storage.
 *   - Navigates to the events page upon successful registration.
 * Invariants: Email must be unique, and passwords must meet security criteria.
 * Known Faults: None identified.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordChecks, setPasswordChecks] = useState({
        minLength: false,
        hasUpper: false,
        hasLower: false,
        hasDigit: false,
        hasSpecial: false,
    });
    const navigate = useNavigate();
    const { login } = useAuth();

    const validatePassword = (password) => {
        const checks = {
            minLength: password.length >= 8,
            hasUpper: /[A-Z]/.test(password),
            hasLower: /[a-z]/.test(password),
            hasDigit: /\d/.test(password),
            hasSpecial: /[!@#$%^&*()\-_+=<>?/]/.test(password),
        };
        setPasswordChecks(checks);
        return Object.values(checks).every(Boolean);
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        validatePassword(newPassword);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validatePassword(password)) {
            setError('Password does not meet requirements.');
            return;
        }
        try {
            const response = await fetch('http://127.0.0.1:5000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            if (response.ok) {
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
            console.error('Registration error:', error);
            setError('An error occurred during registration');
        }
    };

    return (
        <div className="register-container">
            <form onSubmit={handleRegister} className="register-form">
                <h2>Register</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <input type="text" placeholder="Full Name" onChange={(e) => setName(e.target.value)} required />
                <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
                
                <input 
                    type="password" 
                    placeholder="Password" 
                    onChange={handlePasswordChange} 
                    required 
                />
                
                {/* Password Requirements Section */}
                <ul className="password-requirements">
                    <li style={{ color: passwordChecks.minLength ? "green" : "red" }}>
                        <span>{passwordChecks.minLength ? "✅" : "❌"}</span> <span>At least 8 characters</span>
                    </li>
                    <li style={{ color: passwordChecks.hasUpper ? "green" : "red" }}>
                        <span>{passwordChecks.hasUpper ? "✅" : "❌"}</span> <span>One uppercase letter</span>
                    </li>
                    <li style={{ color: passwordChecks.hasLower ? "green" : "red" }}>
                        <span>{passwordChecks.hasLower ? "✅" : "❌"}</span> <span>One lowercase letter</span>
                    </li>
                    <li style={{ color: passwordChecks.hasDigit ? "green" : "red" }}>
                        <span>{passwordChecks.hasDigit ? "✅" : "❌"}</span> <span>One number</span>
                    </li>
                    <li style={{ color: passwordChecks.hasSpecial ? "green" : "red" }}>
                        <span>{passwordChecks.hasSpecial ? "✅" : "❌"}</span> <span>One special character</span>
                    </li>
                </ul>

                <button type="submit" disabled={!Object.values(passwordChecks).every(Boolean)}>Register</button>
            </form>
        </div>
    );
}

export default Register;
