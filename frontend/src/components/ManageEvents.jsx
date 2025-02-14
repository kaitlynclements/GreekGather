import React, { useState, useEffect } from 'react';
import './ManageEvents.css';

function ManageEvents() {
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        name: '',
        description: '',
        date: '',
        location: '',
        eventType: 'Social'
    });

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

    // ✅ Submit the new event to the backend
    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://127.0.0.1:5000/create_event', { // ✅ Fixed URL
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newEvent),
            });

            const data = await response.json();
            if (response.ok) {
                setEvents([...events, { ...newEvent, id: data.id }]); // ✅ Update state with new event
                setShowModal(false); // ✅ Close modal
            } else {
                alert(data.error || 'Error creating event');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event');
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
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {showModal && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>Create Event</h2>
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

                        <button className="create-event-btn" onClick={handleSubmit}>Create</button>
                        <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageEvents;
