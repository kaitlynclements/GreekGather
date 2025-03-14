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
    const [searchQuery, setSearchQuery] = useState("");

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

    const filteredExecs = chapterMembers.execs.filter(exec =>
        exec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exec.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredMembers = chapterMembers.members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div>Loading chapter information...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="chapter-container">
            <h1>Chapter Hierarchy</h1>
            
            <input
                type="text"
                placeholder="Search by name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="org-tree">
                {/* Admin Level */}
                {chapterMembers.admin && (
                    <div className="level admin-level">
                        <div className="member-card admin">
                            <h3>{chapterMembers.admin.name}</h3>
                            <span className="role">Administrator</span>
                            <p>Email: {chapterMembers.admin.email}</p>
                            <p>Phone: {chapterMembers.admin.phone || "N/A"}</p>
                        </div>
                    </div>
                )}

                {/* Exec Level */}
                {filteredExecs.length > 0 && (
                    <div className="level exec-level">
                        {filteredExecs.map(exec => (
                            <div key={exec.id} className="member-card exec">
                                <h3>{exec.name}</h3>
                                <span className="role">Executive</span>
                                <p>Email: {exec.email}</p>
                                <p>Phone: {exec.phone || "N/A"}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Member Level */}
                {filteredMembers.length > 0 && (
                    <div className="level member-level">
                        {filteredMembers.map(member => (
                            <div key={member.id} className="member-card member">
                                <h3>{member.name}</h3>
                                <span className="role">Member</span>
                                <p>Email: {member.email}</p>
                                <p>Phone: {member.phone || "N/A"}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Chapter;
