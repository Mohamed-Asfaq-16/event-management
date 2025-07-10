import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ComposeEvent from './ComposeEvent';

const AdminDashboard = ({ user, onLogout }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/admin/events');
      setEvents(response.data);
    } catch (error) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventCreated = (newEvent) => {
    setEvents([newEvent, ...events]);
    setShowCompose(false);
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`/api/events/${eventId}`);
        setEvents(events.filter(event => event._id !== eventId));
      } catch (error) {
        setError('Failed to delete event');
      }
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
          <div className="dashboard-title">Admin Dashboard</div>
          <div className="dashboard-user">
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role">Administrator</div>
            </div>
            <button className="btn-logout" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <h1>Event Management</h1>
        
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2>Your Posted Events</h2>
            <button 
              className="btn btn-primary"
              onClick={() => setShowCompose(true)}
            >
              Create New Event
            </button>
          </div>

          {events.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No events posted yet</h3>
              <p>Start by creating your first event!</p>
              <button 
                className="btn btn-primary"
                onClick={() => setShowCompose(true)}
                style={{ marginTop: '20px' }}
              >
                Create Event
              </button>
            </div>
          ) : (
            <div className="grid">
              {events.map((event) => (
                <div key={event._id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, color: '#333' }}>{event.title}</h3>
                    <button 
                      className="btn btn-danger"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                      onClick={() => handleDeleteEvent(event._id)}
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Poster:</strong> {event.poster}
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Description:</strong>
                    <p style={{ marginTop: '5px', lineHeight: '1.5' }}>
                      {event.description}
                    </p>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Registration Link:</strong>
                    <a 
                      href={event.registrationLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ display: 'block', marginTop: '5px', color: '#007bff', textDecoration: 'none' }}
                    >
                      {event.registrationLink}
                    </a>
                  </div>
                  
                  <div style={{ fontSize: '0.9rem', color: '#666' }}>
                    <strong>Posted:</strong> {formatDate(event.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCompose && (
        <ComposeEvent 
          onClose={() => setShowCompose(false)}
          onEventCreated={handleEventCreated}
        />
      )}
    </div>
  );
};

export default AdminDashboard; 