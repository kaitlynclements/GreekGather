/* Fetches and displays events from backend */

import React, { useEffect, useState } from 'react';

function Events() {
    const [events, setEvents] = useState([]);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        async function fetchEvents() {
            const response = await fetch('http://127.0.0.1:5000/events');
            const data = await response.json();
            setEvents(data);
        }
        fetchEvents();

        // Get user role from localStorage
        setUserRole(localStorage.getItem('role'));
    }, []);

    const handleCreateEvent = async () => {
        const eventName = prompt("Enter event name:");
        const eventDate = prompt("Enter event date:");

        if (!eventName || !eventDate) return;

        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:5000/events/create_event', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ name: eventName, date: eventDate }),
        });

        const data = await response.json();
        alert(data.message);
    };

    return (
        <div>
            <h2>Upcoming Events</h2>
            {userRole === 'vp' && (
                <button onClick={handleCreateEvent}>Create Event</button>
            )}
            <ul>
                {events.map((event) => (
                    <li key={event.id}>{event.name} - {event.date}</li>
                ))}
            </ul>
        </div>
    );
}

export default Events;

