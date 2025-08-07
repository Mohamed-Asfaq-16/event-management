import React, { useState } from 'react';
import axios from 'axios';

const ComposeEvent = ({ onClose, onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    poster: '',
    description: '',
    registrationLink: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/events', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      onEventCreated(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Create New Event</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Event Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter event title"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="poster">
              Poster/Organizer *
            </label>
            <input
              type="text"
              id="poster"
              name="poster"
              className="form-input"
              value={formData.poster}
              onChange={handleChange}
              required
              placeholder="Enter poster or organizer name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Event Description *
            </label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Enter detailed event description"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="registrationLink">
              Registration Link *
            </label>
            <input
              type="url"
              id="registrationLink"
              name="registrationLink"
              className="form-input"
              value={formData.registrationLink}
              onChange={handleChange}
              required
              placeholder="https://example.com/register"
            />
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ flex: 1 }}
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComposeEvent;
