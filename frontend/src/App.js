/**
 * Name: App.js
 * Description: File created for event logging and creation feature
 * Programmer: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: February 2nd, 2025
 * Revised: Refer to Github commits.
 * Revisions: Refer to Github commits.
 * Preconditions: Flask and dependencies must be installed.
 * Acceptable Inputs: HTTP requests to intended endpoints.
 * Unacceptable Inputs: Incorrect requests.
 * Postconditions: Routes are registered and server starts.
 * Return Values: N/A
 * Errors & Exceptions: Raises errors if database is not connected.
 * Side Effects: Flask app initialized
 * Invariants: Server must remain available.
 * Known Faults: N/A
*/
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Welcome from './components/Welcome';
import Login from './components/Login';
import Register from './components/Register';
import Events from './components/Events';
import Navbar from './components/Navbar';
import './components/Navbar.css';
import CreateChapter from './components/CreateChapter';
import JoinChapter from './components/JoinChapter';
import AssignRole from './components/AssignRole';
import ManageEvents from './components/ManageEvents';
import RequestDashboard from "./components/RequestDashboard";
import './App.css'; 
import ManageRoles from "./components/ManageRoles";
import Chapter from "./components/Chapter";

function App() {
    const [userRole, setUserRole] = useState(null); // Start as null

    useEffect(() => {
        const role = localStorage.getItem("role") || "guest";  // Default to "guest"
        setUserRole(role);
        console.log("Updated userRole:", role);
    }, []);

    return (
        <Router>
            <Navbar />
            <div className="main-content">  {/* ✅ Ensures content is pushed down */}
                <Routes>
                    <Route path="/" element={<Welcome />} />
                    <Route path="/login" element={<Login setUserRole={setUserRole} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/chapter" element={<Chapter />} />
                    <Route path="/create_chapter" element={<CreateChapter />} />
                    <Route path="/join_chapter" element={<JoinChapter />} />
                    <Route path="/assign_role" element={userRole === 'admin' ? <AssignRole /> : <Navigate to="/" />} />
                    <Route path="/manage-events" element={(userRole === 'exec' || userRole === 'admin') ? <ManageEvents /> : <Navigate to="/" />} />
                    <Route 
                        path="/request-dashboard" 
                        element={userRole === null ? null : (userRole === "admin" ? <RequestDashboard /> : <Navigate to="/" />)}
                    />
                    <Route 
                        path="/manage-roles" 
                        element={userRole === "admin" ? <ManageRoles /> : <Navigate to="/" />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
