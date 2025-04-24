/*
 * Name: Announcements.jsx
 * Description: Component for displaying announcements in GreekGather.
 * Programmer: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: February 2nd, 2025
 * Revised: Refer to Github Commits
 * Revisions: [Revision Date]: [Description of change] (Author)
 * Preconditions: Announcements data must be available via the backend.
 * Acceptable Inputs: None (fetches announcements).
 * Unacceptable Inputs: None.
 * Postconditions: Displays a list of announcements.
 * Return Values: React JSX component.
 * Errors & Exceptions: API fetches errors if announcements can't be retrieved.
 * Side Effects: UI updates dynamically.
 * Invariants: Announcements must be kept up-to-date.
 * Known Faults: N/A.
 */


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAnnouncements, createAnnouncement, updateAnnouncement } from '../api';
import './Announcements.css';

/*Function displaying greetings text on Announcements page.*/
function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    const isExec = user?.role === 'admin' || user?.role === 'exec';

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const data = await getAnnouncements();
            setAnnouncements(data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateAnnouncement(editingId, newAnnouncement);
            } else {
                await createAnnouncement(newAnnouncement);
            }
            setNewAnnouncement({ title: '', message: '' });
            setIsEditing(false);
            setEditingId(null);
            fetchAnnouncements();
        } catch (error) {
            console.error('Error saving announcement:', error);
        }
    };

    const handleEdit = (announcement) => {
        setNewAnnouncement({
            title: announcement.title,
            message: announcement.message
        });
        setIsEditing(true);
        setEditingId(announcement.id);
    };

    const formatDate = (dateString) => {
        // Parse the UTC date string
        const date = new Date(dateString);
        
        // Convert to CST (UTC-5 during daylight saving time)
        const cstDate = new Date(date.getTime() - (5 * 60 * 60 * 1000));
        
        return cstDate.toLocaleString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    return (
        <div className="announcements-container">
            <h2>Chapter Announcements</h2>
            
            {isExec && (
                <form onSubmit={handleSubmit} className="announcement-form">
                    <input
                        type="text"
                        placeholder="Announcement Title"
                        value={newAnnouncement.title}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                        required
                    />
                    <textarea
                        placeholder="Announcement Message"
                        value={newAnnouncement.message}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, message: e.target.value })}
                        required
                    />
                    <button type="submit">
                        {isEditing ? 'Update Announcement' : 'Post Announcement'}
                    </button>
                    {isEditing && (
                        <button type="button" onClick={() => {
                            setIsEditing(false);
                            setEditingId(null);
                            setNewAnnouncement({ title: '', message: '' });
                        }}>
                            Cancel Edit
                        </button>
                    )}
                </form>
            )}

            <div className="announcements-list">
                {announcements.map((announcement) => (
                    <div key={announcement.id} className="announcement-card">
                        <h3>{announcement.title}</h3>
                        <p>{announcement.message}</p>
                        <div className="announcement-meta">
                            <span>Posted by {announcement.author}</span>
                            <span>{formatDate(announcement.created_at)}</span>
                        </div>
                        {isExec && (
                            <div className="announcement-actions">
                                <button onClick={() => handleEdit(announcement)}>Edit</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Announcements;
