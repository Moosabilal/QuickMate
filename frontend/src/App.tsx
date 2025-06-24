// src/App.tsx
import React, { Suspense } from 'react'; // Import Suspense from React
import { RouterProvider } from 'react-router-dom';
import router from './routes'; // Import the configured router
import { ToastContainer } from 'react-toastify'; // Import ToastContainer for notifications

const App = () => {
  return (
    <>
      <ToastContainer
        position="top-right" // You can change this to 'top-center', 'bottom-left', etc.
        autoClose={5000}    // How long the toast stays visible (in ms)
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"     // Options: 'light', 'dark', 'colored'
      />
    
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-blue-500"></div>
          <p className="ml-4 text-xl text-gray-700 dark:text-gray-300">Loading page...</p>
        </div>
      }>
        <RouterProvider router={router} />
      </Suspense>
    </>
  );
};

export default App;