/* Handles API requests to the backend so you can reuse functions */

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
