import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Welcome.css';

function Welcome() {
    const navigate = useNavigate();

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
