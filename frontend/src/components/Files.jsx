/*
 * Name: Files.jsx
 * Description: Displays the chapter's shared file repository for GreekGather.
 * Programmer: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: April 7th, 2025
 * Revised: Refer to Github Commits
 * Revisions: Refer to Github Commits
 * Preconditions: React application must be running.
 * Acceptable Inputs: None at this stage (static content).
 * Unacceptable Inputs: N/A
 * Postconditions: Renders the shared files page layout.
 * Return Values: React JSX.
 * Errors & Exceptions: None expected.
 * Side Effects: None.
 * Invariants: Page must render consistently with app styling.
 * Known Faults: Placeholder content only.
 */

import React from "react";
import './Files.css';

function Files() {
    return (
        <div className="page-container">
            <h2>Chapter Files</h2>
            <p>This page will show shared files like PDFs, flyers, and resources.</p>
        </div>
    );
}

export default Files;
