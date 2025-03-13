import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './Events.css';

function Events() {
    const [events, setEvents] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [popupDate, setPopupDate] = useState('');
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();
    const [rsvpPopup, setRsvpPopup] = useState(false);
    const [rsvpEvent, setRsvpEvent] = useState(null);
    const [attending, setAttending] = useState(null);
    const [guests, setGuests] = useState(0);

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
                setEvents([]);
            }
        }

        fetchEvents();
        setUserRole(localStorage.getItem('role'));
    }, [navigate]);

    const handleDateClick = async (date) => {
        setSelectedDate(date);
        setPopupDate(date.toLocaleDateString());
        setIsPopupOpen(true);

        const token = localStorage.getItem('token');
        if (!token) {
            console.error("No JWT token found, cannot fetch events.");
            return;
        }

        try {
            const formattedDate = date.toISOString().split("T")[0];
            const response = await fetch(`http://127.0.0.1:5000/events_by_date/${formattedDate}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch events for the selected date");
            }

            const data = await response.json();
            setSelectedDateEvents(data.events || []);
        } catch (error) {
            console.error("Error fetching events:", error);
            setSelectedDateEvents([]);
        }
    };

    const upcomingEvents = events.filter(event => {
        const eventDate = new Date(event.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of today
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        return eventDate >= today && eventDate <= nextWeek;
    });

    const openRsvpPopup = (event) => {
        setRsvpEvent(event);
        setAttending(null);
        setGuests(0);
        setRsvpPopup(true);
    };

    const handleRSVP = async () => {
        if (attending === null) {
            alert("Please select if you are attending.");
            return;
        }
    
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No JWT token found, cannot submit RSVP.");
            return;
        }
    
        try {
            const response = await fetch("http://127.0.0.1:5000/rsvp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    event_id: rsvpEvent.id,
                    attending,
                    guests,
                }),
            });
    
            if (!response.ok) {
                throw new Error("Error submitting RSVP");
            }
    
            alert("RSVP submitted successfully!");
            setRsvpPopup(false);
        } catch (error) {
            console.error("Error submitting RSVP:", error);
            alert("Failed to submit RSVP");
        }
    };
    
    return (
        <div className="calendar-container">
            <h2>Chapter Events</h2>
            {userRole === 'vp' && (
                <button className="create-event-btn" onClick={() => alert('Feature not implemented yet')}>Create Event</button>
            )}

            <Calendar onClickDay={handleDateClick} value={selectedDate} className="react-calendar" />

            {isPopupOpen && (
        <div className="popup">
            <div className="popup-content">
                <h2>{popupDate}</h2>
                {selectedDateEvents.length === 0 ? (
                    <p>No events scheduled for this day.</p>
                ) : (
                    <ul>
                        {selectedDateEvents.map(event => (
                            <li key={event.id}>
                                <strong>{event.name}</strong> - {event.eventType}
                                <br />
                                <small>{event.description}</small>
                                <br />
                                <small>📍 {event.location}</small>
                                <br />
                                <button onClick={() => openRsvpPopup(event)}>RSVP</button>
                            </li>
                        ))}
                    </ul>
                )}
                <button onClick={() => setIsPopupOpen(false)}>Close</button>
            </div>
        </div>
    )}


<div className="upcoming-events">
    <h3>Upcoming Events</h3>
    {upcomingEvents.length === 0 ? (
        <p>No upcoming events scheduled</p>
    ) : (
        <div className="events-grid">
            {upcomingEvents.map(event => (
                <div key={event.id} className="event-card">
                    <h3>{event.name}</h3>
                    <p className="event-date">
                        {new Date(event.date).toLocaleDateString()}
                    </p>
                    {event.eventType && (
                        <p className="event-category">
                            <strong>Category:</strong> {event.eventType}
                        </p>
                    )}
                    {event.description && (
                        <p className="event-description">
                            <strong>Description:</strong> <br />{event.description}
                        </p>
                    )}
                    {/* 🔹 ADD RSVP BUTTON HERE 🔹 */}
                    <button onClick={() => openRsvpPopup(event)}>RSVP</button>
                </div>
            ))}
        </div>
    )}
</div>
{rsvpPopup && rsvpEvent && (
    <div className="popup">
        <div className="popup-content">
            <h2>RSVP for {rsvpEvent.name}</h2>
            <label>Will you be attending?</label>
            <div>
                <button onClick={() => setAttending(true)}>Yes</button>
                <button onClick={() => setAttending(false)}>No</button>
            </div>
            {attending && (
                <>
                    <label>Number of Guests:</label>
                    <input 
                        type="number" 
                        value={guests} 
                        onChange={(e) => setGuests(parseInt(e.target.value) || 0)}
                        min="0"
                    />
                </>
            )}
            <button onClick={handleRSVP}>Submit RSVP</button>
            <button onClick={() => setRsvpPopup(false)}>Cancel</button>
        </div>
    </div>
)}
</div>
    );
}

export default Events;
