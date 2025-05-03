// src/components/CreateGame.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  Form,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
} from 'react-bootstrap';
import API from '../api/api';
import LocationPicker from './LocationPicker';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function CreateGame() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    sport_id: '',
    capacity: '',
    location: '',
    latitude: null,
    longitude: null,
    start_time: '',
    end_time: '',
    skill_level: 'all',
  });
  const [sports, setSports] = useState([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dateError, setDateError] = useState(''); // validation error

  // Redirect if not logged in
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch sports options
  useEffect(() => {
    API.get('sports/')
      .then(({ data }) => setSports(data))
      .catch(() => setError('Failed to load sports.'))
      .finally(() => setLoadingSports(false));
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
  };

  const handleLocationChange = loc => {
    setFormData(fd => ({ ...fd, location: loc }));
  };
  const handleCoordsChange = ({ lat, lng }) => {
    setFormData(fd => ({ ...fd, latitude: lat, longitude: lng }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await API.post(
        'games/create/',
        {
          ...formData,
          start_time: new Date(formData.start_time).toISOString(),
          end_time: new Date(formData.end_time).toISOString(),
          capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
        }
      );
      navigate('/games');
    } catch {
      setError('Failed to create game. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <Button variant="link" onClick={() => navigate(-1)}>
        ← Back
      </Button>

      <Card className="shadow-sm mt-3">
        <Card.Header>
          <h3 className="mb-0">Create a New Game</h3>
        </Card.Header>

        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="gameName">
                  <Form.Label>Game Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter a title"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="sportSelect">
                  <Form.Label>Sport</Form.Label>
                  {loadingSports ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <Form.Select
                      name="sport_id"
                      value={formData.sport_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choose…</option>
                      {sports.map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="capacity">
                  <Form.Label>Capacity (max players)</Form.Label>
                  <Form.Control
                    type="number"
                    name="capacity"
                    placeholder="Leave blank for unlimited"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="skillLevel">
                  <Form.Label>Skill Level</Form.Label>
                  <Form.Select
                    name="skill_level"
                    value={formData.skill_level}
                    onChange={handleChange}
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col xs={12}>
                <Form.Label>Location</Form.Label>
                <LocationPicker
                  location={formData.location}
                  setLocation={handleLocationChange}
                  setLatLng={handleCoordsChange}
                />
              </Col>

              <Col md={6}>
                <Form.Group controlId="startTime">
                  <Form.Label>Start Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="endTime">
                  <Form.Label>End Time</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-4 d-flex justify-content-end">
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => navigate('/games')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Creating…
                  </>
                ) : (
                  'Create Game'
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
