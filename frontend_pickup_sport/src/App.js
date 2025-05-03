import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
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
import MyGames from './components/MyGames';
import EditGame from './components/EditGame';

function ProtectedRoute() {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function AppContent() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      setIsLoggedIn(true);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.search, location.pathname]);
  const hideNavRoutes = ['/login', '/signup', '/', '/profile/setup'];
  const showNavigation = isLoggedIn && !hideNavRoutes.includes(location.pathname);

  return (
    <>
      {showNavigation && <Navigation />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/games" element={<Games />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/create-game" element={<CreateGame />} />
          <Route path="/my-games" element={<MyGames />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/games/:id/edit" element={<EditGame />} />
        </Route>
        <Route path="/profile/:id" element={<PublicProfile />} />
        <Route path="/profile/setup" element={<ProfileSetup />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
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
