/* Adds a simple navbar to navigate between pages */

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
