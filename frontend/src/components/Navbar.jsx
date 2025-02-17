/*
 * Name: Navbar.jsx
 * Description: Navigation bar component for GreekGather.
 * Programmer: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: February 2nd, 2025
 * Revised: Refer to Github Commits
 * Revisions: Refer to Github Commits
 * Preconditions: React application must be running.
 * Acceptable Inputs: Props including `userRole` (optional).
 * Unacceptable Inputs: None.
 * Postconditions: Renders the navigation bar.
 * Return Values: React JSX.
 * Errors & Exceptions: None expected.
 * Side Effects: UI changes dynamically.
 * Invariants: Navbar must be accessible across the app.
 * Known Faults: N/A.
 */


import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token); // Convert to boolean (true if logged in)

        // Get username from localStorage (to be set at login)
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    return (
        <nav className="navbar">
            <ul className="nav-list">
                <li><Link to="/">Home</Link></li>
                
                {!isLoggedIn ? (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/events">Events</Link></li>
                        <li><Link to="/announcements">View Announcements</Link></li>
                        <li><Link to="/manage-events">Manage Events</Link></li>
                        <li><Link to="/track-hours">Track Study & Service Hours</Link></li>
                        <li className="profile-section">
                            <span>👤 {username || "Profile"}</span>
                        </li>
                        <li>
                            <Link to="/" onClick={() => { localStorage.clear(); window.location.reload(); }}>
                                Logout
                            </Link>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
}

export default Navbar;
