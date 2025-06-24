// src/features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
    id: string;
    name: string;
    email: string;
    role: string; // Ensure 'role' is part of your User interface
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

// Helper to get the username from localStorage
const getUserNameFromLocalStorage = (): string | null => {
    return localStorage.getItem('userName');
};

// **NEW:** Helper to get the user role from localStorage
const getUserRoleFromLocalStorage = (): string | null => {
    return localStorage.getItem('userRole');
};

const initialState: AuthState = {
    user: (() => {
        const token = localStorage.getItem('token');
        const userName = getUserNameFromLocalStorage();
        const userRole = getUserRoleFromLocalStorage(); // **Retrieve the role**

        // If token, username, AND role exist, reconstruct a partial user object
        if (token && userName && userRole) {
            return {
                id: '', // Placeholder if not persisted
                name: userName,
                email: '', // Placeholder if not persisted
                role: userRole, // **Assign the retrieved role**
            };
        }
        return null; // Otherwise, no user is authenticated
    })(), // This is an Immediately Invoked Function Expression (IIFE) for initial state logic

    token: localStorage.getItem('token') || null,
    // isAuthenticated should be true only if token, username, AND role are present
    isAuthenticated: !!localStorage.getItem('token') && !!getUserNameFromLocalStorage() && !!getUserRoleFromLocalStorage(),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (
            state,
            action: PayloadAction<{ user: User; token: string }>
        ) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.token = action.payload.token;

            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('userName', action.payload.user.name);
            localStorage.setItem('userRole', action.payload.user.role); // **<--- Persist the user role**
        },
        logout: state => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole'); // **<--- Clear user role on logout**
        },
    },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;