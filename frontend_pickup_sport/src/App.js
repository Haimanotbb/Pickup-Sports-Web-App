import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Games from './components/Games';
import CreateGame from './components/CreateGame';
import GameDetail from './components/GameDetail';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/games" element={<Games />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/create-game" element={<CreateGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

