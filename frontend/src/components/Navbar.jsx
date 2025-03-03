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
import { FaChevronDown } from "react-icons/fa";  // Import arrow icon
import './Navbar.css';

function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    const [userRole, setUserRole] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);

        const storedUsername = localStorage.getItem('username');
        const storedRole = localStorage.getItem('role');

        if (storedUsername) setUsername(storedUsername);
        if (storedRole) setUserRole(storedRole);
    }, []);

    return (
        <nav className={`navbar ${isExpanded ? 'expanded' : ''}`} 
             onMouseEnter={() => setIsExpanded(true)} 
             onMouseLeave={() => setIsExpanded(false)}>

            <div className="navbar-header">
                <span className="nav-title">GreekGather</span>
                <FaChevronDown className={`nav-arrow ${isExpanded ? 'rotated' : ''}`} />
            </div>

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

                        {userRole === "admin" && (
                            <>
                                <li><Link to="/request-dashboard" className="admin-button">Manage Membership Requests</Link></li>
                                <li><Link to="/manage-roles" className="admin-button">Manage Roles</Link></li>  
                            </>
                        )}

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
