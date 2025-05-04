import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  Form,
  Row,
  Col,
  Button,
  Alert,
  Spinner
} from 'react-bootstrap';
import {
  FaPlus,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaFlag
} from 'react-icons/fa';
import API from '../api/api';
import LocationPicker from './LocationPicker';
import '../index.css';

export default function CreateGame() {
  const navigate = useNavigate();
  const getLocalDateTime = dt => {
    const tzOffset = dt.getTimezoneOffset() * 60000;
    return new Date(dt - tzOffset).toISOString().slice(0, 16);
  };
  const [minStart] = useState(getLocalDateTime(new Date()));

  //User input form
  const [formData, setFormData] = useState({
    name: '',
    sport_id: '',
    location: '',
    latitude: null,
    longitude: null,
    start_time: '',
    end_time: '',
    skill_level: 'all',
    capacity: ''
  });
  const [sports, setSports] = useState([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [error, setError] = useState('');

  //Make sure user is logged in
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/login');
    }
  }, [navigate]);

  //Fetch sports data
  useEffect(() => {
    API.get('sports/')
      .then(({ data }) => setSports(data))
      .catch(() => setError('Failed to fetch sports.'))
      .finally(() => setLoadingSports(false));
  }, []);

  //Handle form input changes
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
    if (error) setError('');
  };

  //Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    try {
      const start = new Date(formData.start_time);
      const end = new Date(formData.end_time);

      await API.post('games/create/', {
        ...formData,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        capacity: formData.capacity ? parseInt(formData.capacity, 10) : null
      });
      navigate('/games');
    } catch {
      setError('Failed to create game.');
    }
  };

  return (
    <Container className="my-5">
      <Card className="shadow create-game-card mx-auto" style={{ maxWidth: '700px' }}>
        <Card.Header className="bg-primary text-white d-flex align-items-center">
          <FaPlus className="me-2" />
          <h4 className="mb-0">Create a New Game</h4>
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
                    placeholder="Enter game name"
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
                      <option value="">Select a sport</option>
                      {sports.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </Form.Select>
                  )}
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group controlId="locationPicker">
                  <Form.Label>
                    <FaMapMarkerAlt className="me-1 text-primary" />
                    Location
                  </Form.Label>
                  <LocationPicker
                    location={formData.location}
                    setLocation={loc => setFormData(fd => ({ ...fd, location: loc }))}
                    setLatLng={({ lat, lng }) =>
                      setFormData(fd => ({ ...fd, latitude: lat, longitude: lng }))
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="startTime">
                  <Form.Label>
                    <FaClock className="me-1 text-primary" />
                    Start Time
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                    min={minStart}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="endTime">
                  <Form.Label>
                    <FaClock className="me-1 text-primary" />
                    End Time
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                    min={formData.start_time || minStart}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="capacity">
                  <Form.Label>
                    <FaUsers className="me-1 text-primary" />
                    Capacity
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="capacity"
                    placeholder="Max players (leave blank for unlimited)"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="skillLevel">
                  <Form.Label>
                    <FaFlag className="me-1 text-primary" />
                    Skill Level
                  </Form.Label>
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
              <Col md={12} className="text-end">
                <Button type="submit" variant="primary">
                  Create Game
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
