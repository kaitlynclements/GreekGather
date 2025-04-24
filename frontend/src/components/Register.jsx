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
import './Register.css'; // Import the CSS file

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [passwordValid, setPasswordValid] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    // Password validation function
    const validatePassword = (password) => {
        const minLength = password.length >= 8;
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasDigit = /\d/.test(password);
        const hasSpecial = /[!@#$%^&*()-_+=<>?/]/.test(password);

        setPasswordValid(minLength && hasUpper && hasLower && hasDigit && hasSpecial);

        return { minLength, hasUpper, hasLower, hasDigit, hasSpecial };
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        validatePassword(newPassword);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!passwordValid) {
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
                    <li style={{ color: password.length >= 8 ? "green" : "red" }}>
                        <span>{password.length >= 8 ? "✅" : "❌"}</span> <span>At least 8 characters</span>
                    </li>
                    <li style={{ color: /[A-Z]/.test(password) ? "green" : "red" }}>
                        <span>{/[A-Z]/.test(password) ? "✅" : "❌"}</span> <span>One uppercase letter</span>
                    </li>
                    <li style={{ color: /[a-z]/.test(password) ? "green" : "red" }}>
                        <span>{/[a-z]/.test(password) ? "✅" : "❌"}</span> <span>One lowercase letter</span>
                    </li>
                    <li style={{ color: /\d/.test(password) ? "green" : "red" }}>
                        <span>{/\d/.test(password) ? "✅" : "❌"}</span> <span>One number</span>
                    </li>
                    <li style={{ color: /[!@#$%^&*()-_+=<>?/]/.test(password) ? "green" : "red" }}>
                        <span>{/[!@#$%^&*()-_+=<>?/]/.test(password) ? "✅" : "❌"}</span> <span>One special character</span>
                    </li>
                </ul>

                <button type="submit" disabled={!passwordValid}>Register</button>
            </form>
        </div>
    );
}

export default Register;
