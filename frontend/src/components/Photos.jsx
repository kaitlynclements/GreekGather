/*
 * Name: Photos.jsx
 * Description: Displays and uploads chapter-specific photo gallery with drag-and-drop.
 * Programmer: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: April 7th, 2025
 * Revised: Refer to Github Commits
 * Preconditions: User must be logged in. Backend API must handle GET and POST.
 * Postconditions: Renders a responsive photo gallery and drag/drop uploader.
 */

import React, { useEffect, useState, useRef } from "react";
import "./Photos.css";

function Photos() {
    const [photos, setPhotos] = useState([]);
    const [dragging, setDragging] = useState(false);
    const dropRef = useRef(null);

    const fetchPhotos = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await fetch("http://127.0.0.1:5000/media/photos", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch photos");
            const data = await response.json();
            setPhotos(data);
        } catch (error) {
            console.error("Error fetching photos:", error);
        }
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setDragging(false);
        const files = e.dataTransfer.files;
        const token = localStorage.getItem("token");

        const formData = new FormData();
        formData.append("photo", files[0]); // For now, support one file

        try {
            const response = await fetch("http://127.0.0.1:5000/media/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");
            await fetchPhotos(); // Refresh photo list after upload
        } catch (error) {
            console.error("Upload error:", error);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => setDragging(false);

    return (
        <div className="photo-gallery-container">
            <h2>Chapter Photo Gallery</h2>
            <p>This page will display photos uploaded by chapter members.</p>

            <div
                className={`drop-zone ${dragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                ref={dropRef}
            >
                <p>Drag & drop a photo here to upload 📤</p>
            </div>

            <div className="photo-grid">
                {photos.map((photo) => (
                    <div key={photo.id} className="photo-card">
                        <img src={photo.url} alt={photo.caption} className="photo-img" />
                        <p className="photo-caption">{photo.caption}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Photos;
