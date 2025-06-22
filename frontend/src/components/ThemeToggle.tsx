// src/components/ThemeToggle.tsx
import { useEffect } from 'react';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector'; // Import typed Redux hooks
import { toggleTheme } from '../features/theme/ThemeSlice'; // Import the toggleTheme action from your slice

const ThemeToggle = () => {
  // 1. Get the dispatch function from Redux
  const dispatch = useAppDispatch();

  // 2. Select the currentTheme state from the Redux store
  const currentTheme = useAppSelector((state) => state.theme.currentTheme);

  // 3. Use useEffect to apply the 'dark' class to the <html> element
  //    This logic was originally in your ThemeProvider's useEffect.
  useEffect(() => {
    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    // Note: localStorage update is now handled directly in the themeSlice's toggleTheme reducer.
  }, [currentTheme]); // Re-run effect whenever currentTheme changes in Redux

  // 4. Create a handler that dispatches the Redux action
  const handleToggle = () => {
    dispatch(toggleTheme()); // Dispatch the action to change the theme in Redux
  };

  return (
    <button
      onClick={handleToggle} // Call the Redux-dispatching handler
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
      aria-label={`Switch to ${currentTheme === 'light' ? 'dark' : 'light'} mode`} // Use currentTheme from Redux
    >
      {currentTheme === 'light' ? '🌙' : '☀️'} {/* Display based on currentTheme from Redux */}
    </button>
  );
};

export default ThemeToggle;