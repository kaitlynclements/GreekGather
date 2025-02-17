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


import React from 'react';
import './Announcements.css';

function Announcements() {
    return (
        <div className="announcements-container">
            <h2>Announcements</h2>
            <p>This page will display chapter announcements.</p>
        </div>
    );
}

export default Announcements;
