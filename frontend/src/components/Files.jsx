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

import React, { useEffect, useState, useRef } from "react";
import "./Photos.css"; // Reuse styles for dropzone and grid
import "./Files.css";  // Add extra styles here if needed

function Files() {
    const [files, setFiles] = useState([]);
    const [dragging, setDragging] = useState(false);
    const dropRef = useRef(null);

    const fetchFiles = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://127.0.0.1:5000/media/files", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch files");
            const data = await response.json();
            setFiles(data);
        } catch (error) {
            console.error("Error fetching files:", error);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setDragging(false);
        const droppedFiles = e.dataTransfer.files;
        const token = localStorage.getItem("token");

        const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword", "image/png", "image/jpeg"];
        if (!validTypes.includes(droppedFiles[0].type)) {
            alert("Invalid file type. Please upload PDF, DOCX, DOC, or image files.");
            return;
        }

        const formData = new FormData();
        formData.append("file", droppedFiles[0]);

        try {
            const response = await fetch("http://127.0.0.1:5000/media/files/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");
            await fetchFiles(); // Refresh list
        } catch (error) {
            console.error("Upload error:", error);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => setDragging(false);

    return (
        <div className="photo-gallery-container"> {/* Reusing layout class */}
            <h2>Chapter File Repository</h2>
            <p>Upload waivers, flyers, or other documents here.</p>

            <div
                className={`drop-zone ${dragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                ref={dropRef}
            >
                <p>Drag & drop a file here to upload 📤</p>
            </div>

            <div className="photo-grid">
                {files.map((file) => (
                    <div key={file.id} className="photo-card">
                        <div className="file-icon">📄</div>
                        <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <strong>{file.name}</strong>
                        </a>
                        <p className="photo-caption">Uploaded by {file.uploaderName}</p>
                        <p className="upload-date">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Files;
