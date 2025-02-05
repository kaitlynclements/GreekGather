import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Calendar.css';

function EventCalendar() {
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        fetchEvents();
        setUserRole(localStorage.getItem('role'));
    }, []);

    const fetchEvents = async () => {
        try {
            const response = await fetch('http://127.0.0.1:5000/events');
            const data = await response.json();
            setEvents(data);
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };
    const handleCreateEvent = async (date) => {
        const eventName = prompt("Enter event name:");
        if (!eventName) return;

        const token = localStorage.getItem('token');
        const response = await fetch('http://127.0.0.1:5000/events/create_event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                name: eventName, 
                date: date.toISOString().split('T')[0] 
            }),
        });

        const data = await response.json();
        if (response.ok) {
            fetchEvents();
            alert('Event created successfully!');
        } else {
            alert(data.error || 'Error creating event');
        }
    };
    
    const titleContent = ({ date }) => {
        const eventsOnDate = events.filter(event => 
            new Date(event.date).toDateString() === date.toDateString()
        );

        return eventsOnDate.length > 0 ? (
            <div className="event-dot">
                {eventsOnDate.map(event => (
                    <div key={event.id} className="event-name">{event.name}</div>
                ))}
            </div>
        ) : null;
    };
    
    return (
        <div className="calendar-container">
            <h2>Event Calendar</h2>
            {userRole === 'vp' && (
                <button 
                    className="create-event-btn"
                    onClick={() => handleCreateEvent(selectedDate)}
                >
                    Create Event
                </button>
            )}
            <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                tileContent={titleContent}
                className="react-calendar"
            />
        </div>
    );
}

export default EventCalendar;
    
    