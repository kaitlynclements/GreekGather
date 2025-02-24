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

function App() {
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        if (storedRole) {
            setUserRole(storedRole);
        }
    }, []);

    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/login" element={<Login setUserRole={setUserRole} />} />
                <Route path="/register" element={<Register />} />
                <Route path="/events" element={<Events />} />
                <Route path="/create_chapter" element={<CreateChapter />} />
                <Route path="/join_chapter" element={<JoinChapter />} />
                <Route path="/assign_role" element={userRole === 'admin' ? <AssignRole /> : <Navigate to="/" />} />
                <Route path="/manage-events" element={(userRole === 'vp' || userRole === 'admin') ? <ManageEvents /> : <Navigate to="/" />} />
            </Routes>
        </Router>
    );
}

export default App;
