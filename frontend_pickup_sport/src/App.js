import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup'; 
import Games from './components/Games';
import CreateGame from './components/CreateGame';
import GameDetail from './components/GameDetail';
import Profile from './components/Profile';
import PublicProfile from './components/PublicProfile';
import ProfileSetup from './components/ProfileSetup';

function App() {
  return (
    <Router>
      <div>
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
      </div>
    </Router>
  );
}

export default App;

