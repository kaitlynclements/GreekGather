import React, { useState } from 'react';
import './CreateChapter.css';

function CreateChapter() {
    const [organizationName, setOrganizationName] = useState('');
    const [chapterName, setChapterName] = useState('');

    const handleCreate = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');  // Ensure user is logged in

        const response = await fetch('http://127.0.0.1:5000/auth/create_chapter', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ organization_name: organizationName, chapter_name: chapterName }),
        });

        const data = await response.json();
        alert(data.message);
    };

    return (
        <div className="create-chapter-container">
            <h2>Create a Chapter</h2>
            <form onSubmit={handleCreate} className="create-chapter-form">
                <input type="text" placeholder="Organization Name (e.g., AXO)" onChange={(e) => setOrganizationName(e.target.value)} required />
                <input type="text" placeholder="Chapter Name (e.g., Phi Chapter)" onChange={(e) => setChapterName(e.target.value)} required />
                <button type="submit">Create Chapter</button>
            </form>
        </div>
    );
}

export default CreateChapter;
