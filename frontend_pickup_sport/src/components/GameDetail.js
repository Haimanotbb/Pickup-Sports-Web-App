// src/components/GameDetail.jsx
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  Alert,
  Container,
  Card,
  Badge,
  Button,
  ListGroup,
  Form,
  Row,
  Col,
} from 'react-bootstrap';
import {
  FaRegCheckCircle,
  FaPlayCircle,
  FaTimesCircle,
  FaSignInAlt,
  FaSignOutAlt,
  FaPaperPlane,
} from 'react-icons/fa';
import API from '../api/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../index.css';

const INTERVAL = 7000;
const statusMap = {
  open: {
    text: 'Open',
    variant: 'success',
    icon: <FaRegCheckCircle className="me-1" aria-hidden />,
  },
  in_progress: {
    text: 'In Progress',
    variant: 'warning',
    icon: <FaPlayCircle className="me-1" aria-hidden />,
  },
  cancelled: {
    text: 'Cancelled',
    variant: 'danger',
    icon: <FaTimesCircle className="me-1" aria-hidden />,
  },
};

export default function GameDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [user, setUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function fetchDetail() {
      try {
        const [gRes, uRes] = await Promise.all([
          API.get(`games/${id}/`),
          API.get('profile/'),
        ]);
        if (!isMounted) return;
        setGame(gRes.data);
        setUser(uRes.data);

        const cRes = await API.get(`games/${id}/comments/`);
        setComments(cRes.data);
        setError('');
      } catch {
        if (isMounted) setError('Failed to load game details.');
      }
    }

    fetchDetail();
    const tid = setInterval(fetchDetail, INTERVAL);
    return () => {
      isMounted = false;
      clearInterval(tid);
    };
  }, [id]);

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  if (!game || !user) {
    return (
      <Container className="text-center py-5">
        <span>Loading…</span>
      </Container>
    );
  }

  const rawState = game.current_state.toLowerCase();
  const info = statusMap[rawState] || {
    text: game.current_state,
    variant: 'secondary',
    icon: null,
  };
  const isCreator = game.creator.id === user.id;
  const joined = game.participants.some(p => p.user.id === user.id);

  const handleJoin = async () => {
    await API.post(`games/${id}/join/`);
    const { data } = await API.get(`games/${id}/`);
    setGame(data);
  };
  const handleLeave = async () => {
    await API.post(`games/${id}/leave/`);
    const { data } = await API.get(`games/${id}/`);
    setGame(data);
  };
  const handleCancel = async () => {
    await API.post(`games/${id}/cancel/`);
    const { data } = await API.get(`games/${id}/`);
    setGame(data);
  };
  const handleDelete = async () => {
    await API.delete(`games/${id}/delete/`);
    navigate('/games');
  };
  const postComment = async () => {
    if (!newComment.trim()) return;
    const res = await API.post(`games/${id}/comments/`, { text: newComment });
    setComments(cs => [...cs, res.data]);
    setNewComment('');
  };

  return (
    <Container className="mt-4">
      <Card className="shadow-sm mb-4">
        {/* Header */}
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2 className="h5 mb-0">{game.name}</h2>
          <Link to="/games" className="btn btn-link">
            ← Back to Games
          </Link>
        </Card.Header>

        <Card.Body>
          {/* Game details */}
          <Row className="gx-4">
            <Col md={6}>
              <dl className="row">
                <dt className="col-sm-4">Sport</dt>
                <dd className="col-sm-8">{game.sport.name}</dd>

                <dt className="col-sm-4">Location</dt>
                <dd className="col-sm-8">{game.location}</dd>

                <dt className="col-sm-4">Start Time</dt>
                <dd className="col-sm-8">
                  {new Date(game.start_time).toLocaleString()}
                </dd>

                <dt className="col-sm-4">End Time</dt>
                <dd className="col-sm-8">
                  {new Date(game.end_time).toLocaleString()}
                </dd>

                <dt className="col-sm-4">Skill Level</dt>
                <dd className="col-sm-8">{game.skill_level}</dd>

                <dt className="col-sm-4">Capacity</dt>
                <dd className="col-sm-8">
                  {game.capacity != null ? game.capacity : 'Unlimited'}
                </dd>

                <dt className="col-sm-4">Creator</dt>
                <dd className="col-sm-8">{game.creator.name}</dd>
              </dl>
            </Col>

            <Col md={6} className="text-center">
              <div className="mb-3">
                <Badge bg={info.variant} className="fs-6">
                  {info.icon}
                  {info.text}
                </Badge>
              </div>
            </Col>
          </Row>

          <hr />

          {/* Participants */}
          <h5 className="h6">Participants ({game.participants.length})</h5>
          <ListGroup className="mb-4">
            {game.participants.map(p => (
              <ListGroup.Item key={p.id}>
                <Link to={`/profile/${p.user.id}`}>
                  {p.user.name || p.user.email}
                </Link>
              </ListGroup.Item>
            ))}
          </ListGroup>

          {/* Comments (only creator or joined) */}
          {(isCreator || joined) && (
            <>
              <h5 className="h6">Comments ({comments.length})</h5>
              <ListGroup className="mb-3">
                {comments.map(c => (
                  <ListGroup.Item key={c.id}>
                    <strong>{c.author_name}</strong>{' '}
                    <small className="text-muted">
                      {new Date(c.created).toLocaleString()}
                    </small>
                    <p className="mb-0">{c.text}</p>
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <Form.Group className="d-flex mb-4">
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Leave a comment…"
                />
                <Button
                  variant="primary"
                  onClick={postComment}
                  disabled={!newComment.trim()}
                  className="ms-2"
                >
                  <FaPaperPlane className="me-1" /> Post
                </Button>
              </Form.Group>
            </>
          )}
        </Card.Body>

        {/* Footer: Join/Leave or Creator actions */}
        <Card.Footer className="d-flex justify-content-end">
          {!isCreator ? (
            joined ? (
              <Button variant="outline-danger" onClick={handleLeave}>
                <FaSignOutAlt className="me-1" /> Leave Game
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleJoin}
                disabled={game.current_state.toLowerCase() !== 'open'}
              >
                <FaSignInAlt className="me-1" /> Join Game
              </Button>
            )
          ) : (
            <>
              {game.current_state.toLowerCase() !== 'completed' && (
                <Button
                  variant="warning"
                  onClick={handleCancel}
                  className="me-2"
                >
                  Cancel
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => navigate(`/games/${id}/edit`)}
                className="me-2"
              >
                Edit
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </>
          )}
        </Card.Footer>
      </Card>
    </Container>
  );
}
