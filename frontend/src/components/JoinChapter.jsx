/*
 * Name: JoinChapter.jsx
 * Description: Component for users to join a fraternity/sorority chapter.
 * Programmer: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: February 2nd, 2025
 * Revised: Refer to Github Commits
 * Revisions: Refer to Github Commits
 * Preconditions: User must be logged in.
 * Acceptable Inputs: Chapter selection.
 * Unacceptable Inputs: None.
 * Postconditions: User is added to the selected chapter.
 * Return Values: React JSX component.
 * Errors & Exceptions: API errors if joining fails.
 * Side Effects: Updates user's chapter association.
 * Invariants: A user must belong to only one chapter at a time.
 * Known Faults: N/A.
 */


import React, { useState, useEffect } from 'react';
import './JoinChapter.css';

function JoinChapter() {
    const [chapters, setChapters] = useState([]);
    const [selectedChapter, setSelectedChapter] = useState('');

    useEffect(() => {
        fetch("http://127.0.0.1:5000/auth/get_chapters")  // ✅ Updated URL
            .then((response) => response.json())
            .then((data) => {
                if (data.chapters) {
                    setChapters(data.chapters); // ✅ Store data in state
                } else {
                    setChapters([]); // ✅ Prevent undefined issues
                }
            })
            .catch((error) => console.error("Error fetching chapters:", error));
    }, []);
    

    const handleJoinRequest = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        if (!selectedChapter) {
            alert("Please select a chapter to join.");
            return;
        }

        const response = await fetch('http://127.0.0.1:5000/auth/request_join_chapter', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ chapter_id: selectedChapter }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            alert(data.error || "An error occurred while sending the request.");
        } else {
            alert(data.message);
        }
    };

    return (
        <div className="join-chapter-container">
            <h2>Join a Chapter</h2>
            <form onSubmit={handleJoinRequest} className="join-chapter-form">
                <select onChange={(e) => setSelectedChapter(e.target.value)} required>
                    <option value="">Select a Chapter</option>
                    {chapters.map((chapter) => (
                        <option key={chapter.id} value={chapter.id}>
                            {chapter.organization_name} - {chapter.chapter_name}
                        </option>
                    ))}
                </select>
                <button type="submit">Request to Join</button>
            </form>
        </div>
    );
}

export default JoinChapter;

