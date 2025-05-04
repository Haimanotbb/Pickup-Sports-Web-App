import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  Form,
  Row,
  Col,
  InputGroup,
  Button,
  Alert,
  Spinner,
} from 'react-bootstrap';
import {
  FaEdit,
  FaFutbol,
  FaUsers,
  FaMapMarkerAlt,
  FaChartLine,
  FaCalendarAlt,
  FaClock,
  FaSave,
  FaTimes,
} from 'react-icons/fa';
import API from '../api/api';
import LocationPicker from './LocationPicker';
import 'bootstrap/dist/css/bootstrap.min.css';



export default function EditGame() {
  const { id } = useParams();
  const navigate = useNavigate();

  //form data
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dateError, setDateError] = useState('');

  //timezone offset
  const toLocalInput = dt => {
    const offset = dt.getTimezoneOffset() * 60000;
    return new Date(dt - offset).toISOString().slice(0, 16);
  };

  // Loads sports and game data, then populates the form while ensuring the component is still mounted.
  const [minStart] = useState(toLocalInput(new Date()));
  useEffect(() => {
    let mounted = true;
    Promise.all([API.get('sports/'), API.get(`games/${id}/`)])
      .then(([{ data: sportsData }, { data: game }]) => {
        if (!mounted) return;
        setSports(sportsData);
        setFormData({
          name: game.name,
          sport_id: game.sport.id,
          capacity: game.capacity ?? '',
          location: game.location,
          latitude: game.latitude,
          longitude: game.longitude,
          start_time: game.start_time.slice(0, 16),
          end_time: game.end_time.slice(0, 16),
          skill_level: game.skill_level,
        });
      })
      .catch(() => mounted && setError('Failed to load data.'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [id]);

  //handle form input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
    if (name === 'start_time') setDateError('');
    if (error) setError('');
  };

  //handle location and coordinates changes
  const handleLocation = loc => {
    setFormData(fd => ({ ...fd, location: loc }));
  };
  const handleCoords = ({ lat, lng }) => {
    setFormData(fd => ({ ...fd, latitude: lat, longitude: lng }));
  };


  //handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setDateError('');
    const now = new Date();
    const start = new Date(formData.start_time);
    if (start <= now) {
      setDateError('Start time must be in the future.');
      return;
    }

    setSubmitting(true);
    try {
      await API.put(`games/${id}/update/`, {
        ...formData,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null,
      });
      navigate(`/games/${id}`);
    } catch {
      setError('Failed to save changes. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="my-4 d-flex justify-content-center">
      <Card className="shadow-sm w-100" style={{ maxWidth: 800 }}>
        <Card.Header className="d-flex align-items-center">
          <FaEdit className="me-2" />
          <h4 className="mb-0">Edit Game</h4>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {dateError && <Alert variant="warning">{dateError}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="name">
                  <Form.Label>Name</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaEdit /></InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Game title"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="sport_id">
                  <Form.Label>Sport</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaFutbol /></InputGroup.Text>
                    <Form.Select
                      name="sport_id"
                      value={formData.sport_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a sport</option>
                      {sports.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </Form.Select>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="capacity">
                  <Form.Label>Capacity</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaUsers /></InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="capacity"
                      placeholder="Max players (blank = unlimited)"
                      value={formData.capacity}
                      onChange={handleChange}
                      min="1"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="skill_level">
                  <Form.Label>Skill Level</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaChartLine /></InputGroup.Text>
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
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Label>Location</Form.Label>
                <InputGroup>
                  <InputGroup.Text><FaMapMarkerAlt /></InputGroup.Text>
                  <LocationPicker
                    location={formData.location}
                    setLocation={handleLocation}
                    setLatLng={handleCoords}
                  />
                </InputGroup>
              </Col>
              <Col md={6}>
                <Form.Group controlId="start_time">
                  <Form.Label>Start Time</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaCalendarAlt /></InputGroup.Text>
                    <Form.Control
                      type="datetime-local"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleChange}
                      required
                      min={minStart}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="end_time">
                  <Form.Label>End Time</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><FaClock /></InputGroup.Text>
                    <Form.Control
                      type="datetime-local"
                      name="end_time"
                      value={formData.end_time}
                      onChange={handleChange}
                      required
                      min={formData.start_time || minStart}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-4 d-flex justify-content-end">
              <Button
                variant="outline-secondary"
                className="me-2"
                disabled={submitting}
                onClick={() => navigate(`/games/${id}`)}
              >
                <FaTimes className="me-1" /> Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={submitting}>
                {submitting
                  ? (<><Spinner animation="border" size="sm" className="me-2" /> Saving…</>)
                  : (<><FaSave className="me-1" /> Save Changes</>)
                }
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
