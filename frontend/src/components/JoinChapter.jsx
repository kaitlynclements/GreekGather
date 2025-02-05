import React, { useState, useEffect } from 'react';
import './JoinChapter.css';

function JoinChapter() {
    const [chapters, setChapters] = useState([]);
    const [selectedChapter, setSelectedChapter] = useState('');

    useEffect(() => {
        fetch('http://127.0.0.1:5000/get_chapters')
            .then((res) => res.json())
            .then((data) => setChapters(data.chapters))
            .catch((err) => console.error('Error fetching chapters:', err));
    }, []);

    const handleJoinRequest = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');

        const response = await fetch('http://127.0.0.1:5000/auth/request_join_chapter', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ chapter_id: selectedChapter }),
        });

        const data = await response.json();
        alert(data.message);
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

