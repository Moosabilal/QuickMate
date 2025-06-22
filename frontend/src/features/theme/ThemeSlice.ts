// src/features/theme/themeSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of your theme state
interface ThemeState {
  currentTheme: 'light' | 'dark';
}

// Get initial theme from localStorage or default to 'light'
const initialState: ThemeState = {
  currentTheme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    // Action to toggle the theme
    toggleTheme: (state) => {
      state.currentTheme = state.currentTheme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.currentTheme); // Update localStorage
    },
    // Optional: Action to set a specific theme (e.g., from an external source)
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.currentTheme = action.payload;
      localStorage.setItem('theme', state.currentTheme); // Update localStorage
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;