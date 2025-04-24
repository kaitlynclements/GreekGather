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


import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaChevronDown } from "react-icons/fa";
import { useAuth } from '../contexts/AuthContext';
import "./Navbar.css";

function Navbar() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isManageDropdownVisible, setIsManageDropdownVisible] = useState(false);
    const [isMediaDropdownVisible, setIsMediaDropdownVisible] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <nav 
            className={`navbar ${isExpanded ? "expanded" : ""}`} 
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => {
                if (!isManageDropdownVisible) setIsExpanded(false);
            }}
        >
            <div className="navbar-header">
                <span className="nav-title">GreekGather</span>
                <FaChevronDown className={`nav-arrow ${isExpanded ? "rotated" : ""}`} />
            </div>

            <ul className="nav-list">
                <li><Link to="/">Home</Link></li>
        
                {!user ? (
                    <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/chapter">Chapter</Link></li>
                        <li><Link to="/events">Calendar</Link></li>
                        <li 
                            className="dropdown"
                            onMouseEnter={() => setIsMediaDropdownVisible(true)}
                            onMouseLeave={() => setIsMediaDropdownVisible(false)}
                        >
                        <span className="dropdown-toggle">
                            Media <FaChevronDown className="dropdown-arrow" />
                        </span>
                        <ul className={`dropdown-menu ${isMediaDropdownVisible ? "visible" : ""}`}>
                            <li><Link to="/media/photos">Photos</Link></li>
                            <li><Link to="/media/files">Files</Link></li>
                        </ul>
                        </li>

                        <li><Link to="/announcements">Announcements</Link></li>

                        <li><Link to="/track-hours">Study & Service Hours</Link></li>

                        {/* Manage Dropdown (Admins and Execs only) */}
                        {(user.role === "admin" || user.role === "exec") && (
                            <li 
                                className="dropdown"
                                onMouseEnter={() => setIsManageDropdownVisible(true)}
                                onMouseLeave={() => setIsManageDropdownVisible(false)}
                            >
                                <span className="dropdown-toggle">
                                    Manage <FaChevronDown className="dropdown-arrow" />
                                </span>
                                <ul className={`dropdown-menu ${isManageDropdownVisible ? "visible" : ""}`}>
                                    <li><Link to="/manage-events">Manage Events</Link></li>
                                    {user.role === "admin" && (
                                        <>
                                            <li><Link to="/request-dashboard">Manage Requests</Link></li>
                                            <li><Link to="/manage-roles">Manage Roles</Link></li>
                                        </>
                                    )}
                                    <li><Link to="/manage-hours">Manage Hours</Link></li>
                                </ul>
                            </li>
                        )}

                        <li>
                            <Link to="/profile" className="profile-link">Profile</Link>
                        </li>

                        <li>
                            <Link
                                to="/"
                                onClick={() => {
                                    logout();
                                    navigate('/');
                                }}
                            >
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
