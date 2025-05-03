// src/components/PublicProfile.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Card,
  Alert,
  Spinner,
  Badge,
} from 'react-bootstrap';
import API from '../api/api';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../index.css';

export default function PublicProfile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const fetchProfile = async () => {
      try {
        const { data } = await API.get(`profile/${id}/`);
        if (mounted) {
          setProfile(data);
          setError('');
        }
      } catch {
        if (mounted) setError('Failed to fetch profile.');
      }
    };
    fetchProfile();
    return () => {
      mounted = false;
    };
  }, [id]);

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
      <Card className="shadow-sm">
        <Card.Header>
          <h2 className="h5 mb-0">Public Profile</h2>
        </Card.Header>

        <Card.Body>
          <p>
            <strong>Name:</strong> {profile.name}
          </p>
          <p>
            <strong>Email:</strong> {profile.email}
          </p>
          <p>
            <strong>Bio:</strong>{' '}
            {profile.bio || <em className="text-muted">No bio provided.</em>}
          </p>

          <hr />

          <h5 className="mb-2">Favorite Sports</h5>
          {profile.favorite_sports && profile.favorite_sports.length > 0 ? (
            profile.favorite_sports.map((s) => (
              <Badge
                bg="primary"
                key={s.id}
                className="me-2 mb-2"
              >
                {s.name}
              </Badge>
            ))
          ) : (
            <p className="text-muted mb-0">None</p>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
