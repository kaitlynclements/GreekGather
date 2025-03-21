/*
 * Name: CreateChapter.jsx
 * Description: Component for creating a new fraternity/sorority chapter.
 * Programmer: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: February 2nd, 2025
 * Revised: Refer to Github Commits
 * Revisions: Refer to Github Commits
 * Preconditions: Admin privileges required.
 * Acceptable Inputs: Chapter name and details.
 * Unacceptable Inputs: Duplicate chapters.
 * Postconditions: Creates a new chapter in the system.
 * Return Values: React JSX component.
 * Errors & Exceptions: API errors if chapter creation fails.
 * Side Effects: Updates chapter list dynamically.
 * Invariants: Each chapter must have a unique name.
 * Known Faults: N/A.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateChapter.css';


function CreateChapter() {
    const [organizationName, setOrganizationName] = useState('');
    const [chapterName, setChapterName] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    /*Handles creation of new chapter by sending the backend a POST request.
    Stores chapter details in localStorage if created successfully or throws an error*/
    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        const token = localStorage.getItem('token');

        if (!token) {
            setError('Please login first');
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:5000/auth/create_chapter', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token.trim()}`
                },
                body: JSON.stringify({ 
                    organization_name: organizationName, 
                    chapter_name: chapterName 
                }),
            });

            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('chapter_id', data.chapter_id);
                localStorage.setItem('role', 'admin');
                alert(data.message);
                navigate('/events');
            } else {
                setError(data.error || `Failed to create chapter: ${data.msg}`);
            }
        } catch (error) {
            console.error('Full error:', error);
            setError('Network error occurred. Please try again.');
        }
    };

    return (
        <div className="create-chapter-container">
            <h2>Create a Chapter</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleCreate} className="create-chapter-form">
                <input 
                    type="text" 
                    placeholder="Organization Name (e.g., AXO)" 
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)} 
                    required 
                />
                <input 
                    type="text" 
                    placeholder="Chapter Name (e.g., Phi Chapter)" 
                    value={chapterName}
                    onChange={(e) => setChapterName(e.target.value)} 
                    required 
                />
                <button type="submit">Create Chapter</button>
            </form>
        </div>
    );
}

export default CreateChapter;
