"""
 * Name: api.js
 * Description: Hnadles API requests to backend for reuse of functions.
 * Programmer: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: February 2nd, 2025
 * Revised: Refer to Github commits.
 * Revisions: Refer to Github commits.
 * Preconditions: Flask and dependencies must be installed.
 * Acceptable Inputs: HTTP requests to intended endpoints.
 * Unacceptable Inputs: Incorrect requests.
 * Postconditions: Routes are registered and server starts.
 * Return Values: N/A
 * Errors & Exceptions: Raises errors if database is not connected.
 * Side Effects: Flask app initialized
 * Invariants: Server must remain available.
 * Known Faults: N/A
"""

const API_URL = "http://127.0.0.1:5000";

// Fetch events from backend
export async function getEvents() {
    try {
        const response = await fetch(`${API_URL}/events`);
        return response.json();
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
}

// Register a new user
export async function registerUser(userData) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData),
        });
        return response.json();
    } catch (error) {
        console.error("Error registering user:", error);
    }
}

// Login user
export async function loginUser(credentials) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
        });
        return response.json();
    } catch (error) {
        console.error("Error logging in:", error);
    }
}
