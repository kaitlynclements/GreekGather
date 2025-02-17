/*
 * Name: AssignRole.jsx
 * Description: Component for assigning roles to users in GreekGather.
 * Programmer: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: February 2nd, 2025
 * Revised: Refer to Github Commits
 * Revisions: Refer to Github commits
 * Preconditions: Admin privileges required.
 * Acceptable Inputs: User role assignments.
 * Unacceptable Inputs: Unauthorized access.
 * Postconditions: User roles updated in the system.
 * Return Values: React JSX component.
 * Errors & Exceptions: API errors if role assignment fails.
 * Side Effects: Updates user permissions dynamically.
 * Invariants: Only authorized users can assign roles.
 * Known Faults: N/A.
 */


import React, { useState } from 'react';

function AssignRole() {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('');

    /* Handles role assignment by sending the backend a POST request. Requires Administrative
    privileges and valid authentication token*/
    const handleAssign = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');  // Ensure user is logged in

        const response = await fetch('http://127.0.0.1:5000/auth/assign_role', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ user_email: email, role: role }),
        });

        const data = await response.json();
        alert(data.message);
    };

    return (
        <div>
            <h2>Assign Role</h2>
            <form onSubmit={handleAssign}>
                <input type="email" placeholder="User Email" onChange={(e) => setEmail(e.target.value)} required />
                <select onChange={(e) => setRole(e.target.value)} required>
                    <option value="">Select Role</option>
                    <option value="member">Member</option>
                    <option value="vp">Vice President</option>
                </select>
                <button type="submit">Assign Role</button>
            </form>
        </div>
    );
}

export default AssignRole;
