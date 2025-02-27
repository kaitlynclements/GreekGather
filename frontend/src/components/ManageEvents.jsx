/*
 * Name: ManageEvents.jsx
 * Description: Component for managing events in GreekGather.
 * Programmer: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: February 2nd, 2025
 * Revised: Refer to Github Commits
 * Revisions: Refer to Github Commits
 * Preconditions: User must have appropriate permissions to manage events.
 * Acceptable Inputs: Event details (name, date, description).
 * Unacceptable Inputs: Invalid event data.
 * Postconditions: Updates or creates events in the system.
 * Return Values: React JSX component.
 * Errors & Exceptions: API errors if event operations fail.
 * Side Effects: Updates the events list dynamically.
 * Invariants: Events must be correctly displayed and editable.
 * Known Faults: N/A.
 */


import React, { useState, useEffect } from 'react';
import './ManageEvents.css';

function ManageEvents() {
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        id: null,
        name: '',
        description: '',
        date: '',
        location: '',
        eventType: 'Social'
    });

    const [isEditing, setIsEditing] = useState(false);

    // ✅ Fetch events from the backend
    useEffect(() => {
        const fetchEvents = async () => {
            const token = localStorage.getItem("token"); // ✅ Retrieve JWT token
    
            if (!token) {
                console.error("No JWT token found, cannot fetch events.");
                return;
            }
    
            try {
                const response = await fetch("http://127.0.0.1:5000/events", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,  // ✅ Include token
                    },
                    credentials: "include",  // ✅ Allow credentials
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
    
                const data = await response.json();
                setEvents(data.events); // ✅ Update state with fetched events
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };
    
        fetchEvents();
    }, []);

    // ✅ Handle form input changes
    const handleInputChange = (e) => {
        setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
    };

    const handleEdit = (event) => {
        setNewEvent(event);
        setIsEditing(true);
        setShowModal(true);
    };

    // ✅ Submit the new event to the backend
    const handleSubmit = async () => {
        console.log("Submitting event edit...");
        const token = localStorage.getItem('token');
        if (!newEvent.id) {
            try {
                const response = await fetch('http://127.0.0.1:5000/create_event', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(newEvent),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error creating event');
                }
                
                const data = await response.json();
                setEvents([...events, { ...newEvent, id: data.id }]);
                setShowModal(false);
                
            } catch (error) {
                console.error('Error creating event:', error);
                alert('Failed to create event');
            }
        } else {
            try {
                const response = await fetch(`http://127.0.0.1:5000/edit_event/${newEvent.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(newEvent),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error updating event');
                }
                
                
            console.log("Response received:", response);
            const data = await response.json();
            setEvents(events.map(event => event.id === newEvent.id ? newEvent : event));
            setShowModal(false);
            
        } catch (error) {
                console.error('Error updating event:', error);
                alert('Failed to update event');
            }
        }
    };

    return (
        <div className="manage-events-container">
            <h2>Manage Events</h2>

            <button className="create-event-btn" onClick={() => setShowModal(true)}>
                Create Event
            </button>

            <div className="events-list">
                <h3>Existing Events</h3>
                {events.length === 0 ? (
                    <p>No events found</p>
                ) : (
                    <ul>
                        {events.map(event => (
                            <li key={event.id}>
                                <strong>{event.name}</strong> - ({event.eventType})
                                <br />
                                <small>{new Date(event.date).toLocaleString()} | {event.location}</small>
                                <button onClick={() => handleEdit(event)}>Edit</button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>{isEditing ? "Edit Event" : "Create Event"}</h2>
                        <label>Event Name</label>
                        <input type="text" name="name" value={newEvent.name} onChange={handleInputChange} required />

                        <label>Description</label>
                        <textarea name="description" value={newEvent.description} onChange={handleInputChange} required></textarea>

                        <label>Date and Time</label>
                        <input type="datetime-local" name="date" value={newEvent.date} onChange={handleInputChange} required />

                        <label>Location</label>
                        <input type="text" name="location" value={newEvent.location} onChange={handleInputChange} required />

                        <label>Event Type</label>
                        <select name="eventType" value={newEvent.eventType} onChange={handleInputChange}>
                            <option value="Social">Social</option>
                            <option value="Service">Service</option>
                            <option value="Academics">Academics</option>
                        </select>

                        <button onClick={handleSubmit}>{isEditing ? "Update" : "Create"}</button>
                        <button onClick={() => setShowModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageEvents;
