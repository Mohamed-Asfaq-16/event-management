import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserDashboard = ({ user, onLogout }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events');
      setEvents(response.data);
    } catch (error) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-nav">
          <div className="dashboard-title">Event Explorer</div>
          <div className="dashboard-user">
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role">User</div>
            </div>
            <button className="btn-logout" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <h1>Discover Events</h1>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="container">
          {events.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No events available</h3>
              <p>Check back later for exciting events!</p>
            </div>
          ) : (
            <div className="grid">
              {events.map((event) => (
                <div key={event._id} className="card">
                  <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
                    {event.title}
                  </h3>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Organized by:</strong> {event.poster}
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <strong>Description:</strong>
                    <p style={{ marginTop: '5px', lineHeight: '1.5' }}>
                      {event.description}
                    </p>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Posted:</strong> {formatDate(event.createdAt)}
                  </div>
                  
                  <a
                    href={event.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-success"
                    style={{ width: '100%', textAlign: 'center' }}
                  >
                    Register Now
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 