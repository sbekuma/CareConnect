/**
 * Centralized API Configuration
 * * This file detects if the app is running locally or on Vercel
 * and picks the correct backend URL automatically.
 */

export const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:3000";

// Export common endpoints for easy access
export const ENDPOINTS = {
    DOCTORS: `${API_BASE_URL}/doctors`,
    CHAT: `${API_BASE_URL}/chat`,
    LOGIN: `${API_BASE_URL}/login`,
    SIGNUP: `${API_BASE_URL}/signup`,
    APPOINTMENTS: (userId) => `${API_BASE_URL}/appointments/${userId}`,
    BOOK: `${API_BASE_URL}/book-appointment`
};