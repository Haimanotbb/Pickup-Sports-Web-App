import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Signup from './components/Signup';
import Games from './components/Games';
import CreateGame from './components/CreateGame';
import GameDetail from './components/GameDetail';
import Profile from './components/Profile';
import PublicProfile from './components/PublicProfile';
import ProfileSetup from './components/ProfileSetup';

function AppContent() {
  const location = useLocation();
  // Use state to hold login status.
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // Extract token from the URL (if present), store it in localStorage, and update state.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Update our reactive state so that the Navigation bar updates immediately.
      setIsLoggedIn(true);
      // Remove query parameters from the URL.
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.search, location.pathname]);

  // Only hide Navigation on certain routes
  const hideNavRoutes = ['/login', '/signup', '/'];
  const showNavigation = isLoggedIn && !hideNavRoutes.includes(location.pathname);

  return (
    <>
      {showNavigation && <Navigation />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/:id" element={<GameDetail />} />
        <Route path="/create-game" element={<CreateGame />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<PublicProfile />} />
        <Route path="/profile/setup" element={<ProfileSetup />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
