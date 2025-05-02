import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  FaRegCheckCircle,
  FaPlayCircle,
  FaTimesCircle,
  FaPaperPlane
} from 'react-icons/fa';
import API from '../api/api';
import '../index.css'; // basic styles

const INTERVAL = 7000;

const statusMap = {
  open: {
    text: 'Open',
    class: 'bg-success',
    icon: <FaRegCheckCircle className="me-1" aria-hidden />
  },
  in_progress: {
    text: 'In Progress',
    class: 'bg-warning text-dark',
    icon: <FaPlayCircle className="me-1" aria-hidden />
  },
  cancelled: {
    text: 'Cancelled',
    class: 'bg-danger',
    icon: <FaTimesCircle className="me-1" aria-hidden />
  }
};

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  const fetchDetail = async () => {
    try {
      const [gRes, uRes] = await Promise.all([
        API.get(`games/${id}/`),
        API.get('profile/')
      ]);
      setGame(gRes.data);
      setUser(uRes.data);
      setError('');

      const cRes = await API.get(`games/${id}/comments/`);
      setComments(cRes.data);
    } catch {
      setError('Failed to load game details.');
    }
  };

  useEffect(() => {
    fetchDetail();
    const tid = setInterval(fetchDetail, INTERVAL);
    return () => clearInterval(tid);
  }, [id]);

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }
  if (!game || !user) {
    return <div className="container mt-4">Loading...</div>;
  }

  const raw = game.current_state.toLowerCase();
  const info = statusMap[raw] || { text: game.current_state, class: 'bg-secondary', icon: null };
  const isCreator = game.creator.id === user.id;
  const joined = game.participants.some(p => p.user.id === user.id);

  const handleJoin  = async () => { await API.post(`games/${id}/join/`);  fetchDetail(); };
  const handleLeave = async () => { await API.post(`games/${id}/leave/`); fetchDetail(); };

  const postComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await API.post(`games/${id}/comments/`, { text: newComment });
      setComments(cs => [...cs, res.data]);
      setNewComment('');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow mb-4">
        {/* Header */}
        <div className="card-header d-flex justify-content-between align-items-center">
          <h2 className="h5 mb-0">{game.name}</h2>
          <Link to="/games" className="btn btn-link">← Back to Games</Link>
        </div>

        {/* Body */}
        <div className="card-body">
          <div className="row gx-4">
            <div className="col-md-6">
              <dl className="row">
                <dt className="col-sm-4">Sport</dt>
                <dd className="col-sm-8">{game.sport.name}</dd>


                    <dt className="col-sm-4">Player Limit</dt>
                    <dd className="col-sm-8">{game.capacity ? game.capacity : 'Unlimited'}</dd>


                <dt className="col-sm-4">Location</dt>
                <dd className="col-sm-8">{game.location}</dd>

                <dt className="col-sm-4">Start Time</dt>
                <dd className="col-sm-8">{new Date(game.start_time).toLocaleString()}</dd>

                <dt className="col-sm-4">End Time</dt>
                <dd className="col-sm-8">{new Date(game.end_time).toLocaleString()}</dd>

                <dt className="col-sm-4">Skill</dt>
                <dd className="col-sm-8">{game.skill_level}</dd>

                <dt className="col-sm-4">Creator</dt>
                <dd className="col-sm-8">{game.creator.name}</dd>
              </dl>
            </div>
            <div className="col-md-6 text-center">
              {game.image_url
                ? <img src={game.image_url} className="img-fluid rounded mb-3" alt={game.name} />
                : <div className="border rounded p-5 text-muted">No image provided</div>
              }
              <div className="mt-3">
                <span className={`badge rounded-pill fw-semibold ${info.class}`}>
                  {info.icon}{info.text}
                </span>
              </div>
            </div>
          </div>

          {/* Participants */}
          <div className="mt-4">
            <h5 className="h6">Participants ({game.participants.length})</h5>
            <ul className="list-group mb-4">
              {game.participants.map(p => (
                <li key={p.id} className="list-group-item">
                  <Link to={`/profile/${p.user.id}`}>
                    {p.user.name || p.user.email}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Comments */}
          {(isCreator || joined) && (
            <div className="mt-4">
              <h5 className="h6">Comments ({comments.length})</h5>
              <ul className="list-group mb-3">
                {comments.map(c => (
                  <li key={c.id} className="list-group-item">
                    <strong>{c.author_name}</strong>{' '}
                    <small className="text-muted">
                      {new Date(c.created).toLocaleString()}
                    </small>
                    <p className="mb-0">{c.text}</p>
                  </li>
                ))}
              </ul>
              <div className="d-flex align-items-start mb-4">
                <textarea
                  className="form-control me-2"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      postComment();
                    }
                  }}
                  placeholder="Leave a comment…"
                  rows={2}
                />
                <button
                  className="btn btn-primary"
                  onClick={postComment}
                  disabled={!newComment.trim()}
                >
                  <FaPaperPlane className="me-1" /> Post
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer (Join/Leave/Edit/Delete) */}
        <div className="card-footer d-flex justify-content-end">
          {!isCreator ? (
            joined ? (
              <button className="btn btn-outline-danger me-2" onClick={handleLeave}>
                Leave Game
              </button>
            ) : (
              <button
                className="btn btn-primary me-2"
                disabled={game.current_state !== 'Open'}
                onClick={handleJoin}
              >
                Join Game
              </button>
            )
          ) : (
            <>
              {game.current_state !== 'Completed' && (
                <button
                  className="btn btn-warning me-2"
                  onClick={async () => { await API.post(`games/${id}/cancel/`); fetchDetail(); }}
                >
                  Cancel Game
                </button>
              )}
              <button
                className="btn btn-secondary me-2"
                onClick={() => navigate(`/games/${id}/edit`)}
              >
                Edit Game
              </button>
              <button
                className="btn btn-danger"
                onClick={async () => { await API.delete(`games/${id}/delete/`); navigate('/games'); }}
              >
                Delete Game
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
