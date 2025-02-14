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
