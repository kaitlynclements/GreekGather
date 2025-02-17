/*
 * Name: Events.jsx
 * Description: Component for displaying and managing events in GreekGather.
 * Programmer: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: February 2nd, 2025
 * Revised: Refer to Github Commits
 * Revisions: Refer to Github Commits
 * Preconditions: User must be logged in.
 * Acceptable Inputs: None (fetches events from the backend).
 * Unacceptable Inputs: None.
 * Postconditions: Displays a list of upcoming and past events.
 * Return Values: React JSX component.
 * Errors & Exceptions: API errors if event data cannot be retrieved.
 * Side Effects: UI updates dynamically.
 * Invariants: Events must be displayed accurately.
 * Known Faults: N/A
 */


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Events.css';

function Events() {
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();

    /* Fetches events from backend when component loads. If user is not authenticated
    they are redirected to login.*/
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        async function fetchEvents() {
            try {
                const response = await fetch('http://127.0.0.1:5000/events', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch events');
                }
                const data = await response.json();
                setEvents(data.events || []);
            } catch (error) {
                console.error('Error fetching events:', error);
                setEvents([]); // Set empty array instead of showing error
            }
        }

        fetchEvents();
        setUserRole(localStorage.getItem('role'));
    }, [navigate]);

    /* Handles event creation by prompting the user for an event name and sends
    request to backend. Only avaliable to certain administrative users.*/
    const handleCreateEvent = async () => {
        const eventName = prompt("Enter event name:");
        if (!eventName) return;

        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://127.0.0.1:5000/events/create_event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: eventName,
                    date: selectedDate.toISOString().split('T')[0]
                }),
            });

            const data = await response.json();
            if (response.ok) {
                window.location.reload();
            } else {
                alert(data.error || 'Error creating event');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            alert('Failed to create event');
        }
    };

    return (
        <div className="calendar-container">
            <h2>Chapter Events</h2>
            {userRole === 'vp' && (
                <button 
                    className="create-event-btn"
                    onClick={handleCreateEvent}
                >
                    Create Event
                </button>
            )}
            
            <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="react-calendar"
            />

            <div className="upcoming-events">
                <h3>Upcoming Events</h3>
                {events.length === 0 ? (
                    <p>No upcoming events scheduled</p>
                ) : (
                    <div className="events-grid">
                        {events.map(event => (
                            <div key={event.id} className="event-card">
                                <h3>{event.name}</h3>
                                <p className="event-date">
                                    {new Date(event.date).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Events;
