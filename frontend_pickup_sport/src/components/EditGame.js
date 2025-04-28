// src/EditGame.js
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import API from '../api/api'

const EditGame = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: '',
        sport_id: '',
        location: '',
        start_time: '',
        end_time: '',
        skill_level: 'all',
    })
    const [sports, setSports] = useState([])
    const [error, setError] = useState('')

    useEffect(() => {
        // load sports list
        API.get('sports/').then(res => setSports(res.data))
        // load game details
        API.get(`games/${id}/`).then(res => {
            const g = res.data
            setFormData({
                name: g.name,
                sport_id: g.sport.id,
                location: g.location,
                // convert ISO to "YYYY-MM-DDThh:mm" for datetime-local
                start_time: g.start_time.slice(0, 16),
                end_time: g.end_time.slice(0, 16),
                skill_level: g.skill_level,
            })
        }).catch(() => setError('Failed to load game.'))
    }, [id])

    const handleChange = e => {
        const { name, value } = e.target
        setFormData(fd => ({ ...fd, [name]: value }))
    }

    const handleSubmit = async e => {
        e.preventDefault()
        try {
            await API.put(`games/${id}/update/`, {
                ...formData,
                start_time: new Date(formData.start_time).toISOString(),
                end_time: new Date(formData.end_time).toISOString(),
            })
            navigate(`/games/${id}`)
        } catch {
            setError('Failed to update the game.')
        }
    }

    return (
        <div className="container mt-4">
            <h2>Edit Game</h2>
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
                {/* Name */}
                <div className="mb-3">
                    <label className="form-label">Game Name</label>
                    <input
                        type="text" name="name"
                        className="form-control"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Sport */}
                <div className="mb-3">
                    <label className="form-label">Sport</label>
                    <select
                        name="sport_id"
                        className="form-select"
                        value={formData.sport_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select a sport</option>
                        {sports.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>

                {/* Location */}
                <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input
                        type="text" name="location"
                        className="form-control"
                        value={formData.location}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* Start & End */}
                <div className="mb-3 row">
                    <div className="col">
                        <label className="form-label">Start Time</label>
                        <input
                            type="datetime-local" name="start_time"
                            className="form-control"
                            value={formData.start_time}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="col">
                        <label className="form-label">End Time</label>
                        <input
                            type="datetime-local" name="end_time"
                            className="form-control"
                            value={formData.end_time}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                {/* Skill Level */}
                <div className="mb-3">
                    <label className="form-label">Skill Level</label>
                    <select
                        name="skill_level"
                        className="form-select"
                        value={formData.skill_level}
                        onChange={handleChange}
                    >
                        <option value="all">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>

                <button type="submit" className="btn btn-primary">
                    Save Changes
                </button>
            </form>
        </div>
    )
}

export default EditGame
