/*
 * Name: Chapter.jsx
 * Description: Component displaying organizational hierarchy and role permissions.
 * Programmer: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: March 2024
 * Preconditions: None
 * Postconditions: Displays organizational structure
 * Error conditions: None
 * Side effects: None
 * Invariants: Role hierarchy remains consistent
 */

import React, { useState, useEffect } from 'react';
import './Chapter.css';

function Chapter() {
    const [chapterMembers, setChapterMembers] = useState({
        admin: null,
        execs: [],
        members: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchChapterHierarchy = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://127.0.0.1:5000/chapter/hierarchy', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch chapter hierarchy');
                }

                const data = await response.json();
                setChapterMembers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchChapterHierarchy();
    }, []);

    if (loading) return <div>Loading chapter information...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="chapter-container">
            <h1>Chapter Hierarchy</h1>
            
            <div className="org-tree">
                {/* Admin Level */}
                {chapterMembers.admin && (
                    <div className="level admin-level">
                        <div className="member-card admin">
                            <h3>{chapterMembers.admin.name}</h3>
                            <span className="role">Administrator</span>
                        </div>
                    </div>
                )}

                {/* Exec Level */}
                {chapterMembers.execs.length > 0 && (
                    <div className="level exec-level">
                        {chapterMembers.execs.map(exec => (
                            <div key={exec.id} className="member-card exec">
                                <h3>{exec.name}</h3>
                                <span className="role">Executive</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Member Level */}
                {chapterMembers.members.length > 0 && (
                    <div className="level member-level">
                        {chapterMembers.members.map(member => (
                            <div key={member.id} className="member-card member">
                                <h3>{member.name}</h3>
                                <span className="role">Member</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chapter;