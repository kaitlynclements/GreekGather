/*
 * Name: Welcome.jsx
 * Description: Welcome screen for GreekGather, providing options to create or join a chapter.
 * Programmer: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: February 2nd, 2025
 * Revised: Refer to GitHub Commits
 * Revisions: Refer to GitHub Commits
 * Preconditions: User is not logged in or has not joined a chapter yet.
 * Acceptable Inputs: Click actions for navigation.
 * Unacceptable Inputs: N/A (no user input fields).
 * Postconditions: Navigates user to create or join a chapter, or login if already registered.
 * Return Values: React JSX component.
 * Errors & Exceptions: None expected.
 * Side Effects: Navigates user to different pages based on button clicks.
 * Invariants: Navigation paths must be valid and correctly routed.
 * Known Faults: N/A.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

function Welcome() {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const chapterId = localStorage.getItem('chapter_id');
        
        if (token && chapterId) {
            navigate('/dashboard');
        }
    }, [navigate]);

    return (
        <div className="welcome-container">
            <h1>Welcome to GreekGather</h1>
            <p>Manage your Greek Life events and responsibilities with ease.</p>
            
            <div className="welcome-buttons">
                <button onClick={() => navigate('/create_chapter')}>Create a Chapter</button>
                <button onClick={() => navigate('/join_chapter')}>Join a Chapter</button>
            </div>

            <p className="login-link">
                Already have an account? <a href="/login">Login here</a>
            </p>
        </div>
    );
}

export default Welcome;
