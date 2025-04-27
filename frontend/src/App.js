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
import React from 'react';
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
import Profile from './components/Profile'
import HoursTracker from './components/HoursTracker';
import ManageHours from './components/ManageHours';
import Photos from './components/Photos';
import Files from './components/Files'
import Announcements from './components/Announcements';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Dashboard from './components/Dashboard';

function AppRoutes() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/events" element={<Events />} />
            <Route path="/chapter" element={<Chapter />} />
            <Route path="/create_chapter" element={<CreateChapter />} />
            <Route path="/join_chapter" element={<JoinChapter />} />
            <Route path="/track-hours" element={<HoursTracker />} />
            <Route path="/assign_role" element={user?.role === 'admin' ? <AssignRole /> : <Navigate to="/" />} />
            <Route path="/manage-events" element={(user?.role === 'exec' || user?.role === 'admin') ? <ManageEvents /> : <Navigate to="/" />} />
            <Route 
                path="/request-dashboard" 
                element={user?.role === "admin" ? <RequestDashboard /> : <Navigate to="/" />}
            />
            <Route 
                path="/manage-roles" 
                element={user?.role === "admin" ? <ManageRoles /> : <Navigate to="/" />}
            />
            <Route path="/profile" element={<Profile />}/>
            <Route 
                path="/manage-hours" 
                element={(user?.role === 'exec' || user?.role === 'admin') ? <ManageHours /> : <Navigate to="/" />}
            />
            <Route path="/media/photos" element={<Photos />} />
            <Route path="/media/files" element={<Files />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar />
                <div className="main-content">
                    <AppRoutes />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;
