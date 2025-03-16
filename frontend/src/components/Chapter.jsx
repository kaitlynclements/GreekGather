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
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchChapterHierarchy = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://127.0.0.1:5000/auth/chapter/hierarchy', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch chapter hierarchy');
                }

                const data = await response.json();
                console.log("DEBUG: Received chapter data", data); // Debugging
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

    // Combine all members into a single array for easier searching
    const allMembers = [];
    if (chapterMembers.admin) allMembers.push({ ...chapterMembers.admin, role: "admin" });
    allMembers.push(...chapterMembers.execs.map(exec => ({ ...exec, role: "exec" })));
    allMembers.push(...chapterMembers.members.map(member => ({ ...member, role: "member" })));

    // Filter members based on search term (name or role)
    const filteredMembers = allMembers.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="chapter-container">
            <h1>Chapter Hierarchy</h1>
            
            {/* Search Input */}
            <input
                type="text"
                placeholder="Search by name or role (admin, exec, member)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-box"
            />

            <div className="org-tree">
                {filteredMembers.length > 0 ? (
                    filteredMembers.map(member => (
                        <div key={member.id} className={`member-card ${member.role}`}>
                            <h3>{member.name}</h3>
                            <span className="role">{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</span>
                            <p><strong>Email:</strong> {member.email || "N/A"}</p>
                        </div>
                    ))
                ) : (
                    <p>No members found.</p>
                )}
            </div>
        </div>
    );
}

export default Chapter;