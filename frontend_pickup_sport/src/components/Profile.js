import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  Alert,
  Spinner,
  Badge,
  ListGroup,
  Button,
  Accordion,
} from 'react-bootstrap';
import API from '../api/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../index.css';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [archived, setArchived] = useState(null); 
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Fetch profile
    API.get('profile/')
      .then(({ data }) => {
        if (!mounted) return;
        setProfile(data);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load profile.');
      });

    // Fetch archived games
    API.get('my-archived-games/')
      .then(({ data }) => {
        if (!mounted) return;
        setArchived(data);
      })
      .catch(() => {
        if (!mounted) return;
        setError('Failed to load past games.');
      });

    return () => {
      mounted = false;
    };
  }, []);
  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }
  if (!profile) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      {/* Profile Card */}
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h2 className="h5 mb-0">My Profile</h2>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => navigate('/profile/setup')}
          >
            Edit Profile
          </Button>
        </Card.Header>
        <Card.Body>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p>
            <strong>Bio:</strong>{' '}
            {profile.bio || <em className="text-muted">No bio provided.</em>}
          </p>
          <hr />
          <h5 className="mb-2">Favorite Sports</h5>
          {profile.favorite_sports.length > 0 ? (
            profile.favorite_sports.map(s => (
              <Badge key={s.id} bg="primary" className="me-2 mb-2">
                {s.name}
              </Badge>
            ))
          ) : (
            <p className="text-muted mb-0">None</p>
          )}
        </Card.Body>
      </Card>
      <Accordion defaultActiveKey="0" className="mt-4 shadow-sm">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            My Past Created Games ({archived?.length ?? '…'})
          </Accordion.Header>
          <Accordion.Body>
            {archived === null ? (
              // still loading archived games
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" role="status" />
              </div>
            ) : archived.length > 0 ? (
              <ListGroup variant="flush">
                {archived.map(game => (
                  <ListGroup.Item
                    key={game.id}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{game.name || game.sport.name}</strong>
                      <div className="text-muted small">
                        {new Date(game.start_time).toLocaleString()}
                      </div>
                    </div>
                    <em>{game.current_state}</em>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p className="text-muted mb-0">
                You haven’t created any past games yet.
              </p>
            )}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
}
