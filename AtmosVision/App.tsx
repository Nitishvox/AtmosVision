
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import LoginPage from './components/LoginPage';

const App: React.FC = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in from a previous session
    const loggedInUserEmail = localStorage.getItem('atmosvision-user-email');
    if (loggedInUserEmail) {
      setUserEmail(loggedInUserEmail);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (email: string) => {
    localStorage.setItem('atmosvision-user-email', email);
    // When a new user logs in, clear any previous chat history for privacy.
    localStorage.removeItem('atmosvision-chat-history');
    setUserEmail(email);
  };
  
  const handleLogout = () => {
      localStorage.removeItem('atmosvision-user-email');
      // Also remove chat history on logout for security
      localStorage.removeItem('atmosvision-chat-history');
      setUserEmail(null);
  }

  // Show a blank screen or a spinner while checking auth status
  if (isLoading) {
    return <div className="h-screen w-screen bg-gray-100 dark:bg-[#0D1117]"></div>;
  }

  return (
    <div className="h-screen w-screen font-sans">
      {userEmail ? <Dashboard onLogout={handleLogout} userEmail={userEmail} /> : <LoginPage onLoginSuccess={handleLoginSuccess} />}
    </div>
  );
};

export default App;