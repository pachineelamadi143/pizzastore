import React, { useState, useEffect } from 'react';
import { Container, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyMessages, markAllMessagesAsRead } from '../services/api';
import Navbar from '../components/Navbar';

const Notifications = () => {
  const { updateUnreadCount } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    handleMarkAllRead();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await getMyMessages();
      setMessages(res.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
    setLoading(false);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllMessagesAsRead();
      updateUnreadCount();
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };


  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Navbar */}
      <Navbar />

      <Container className="mt-5" style={{ maxWidth: '800px' }}>
        <div className="d-flex align-items-center gap-2 mb-4">
          <i className="bi bi-bell-fill text-warning fs-3"></i>
          <h2 className="mb-0 fw-bold">Notifications</h2>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
               <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <Card className="text-center py-5 border-0 shadow-sm rounded-4">
            <Card.Body>
              <i className="bi bi-bell-slash text-muted fs-1 mb-3 d-block"></i>
              <h5 className="fw-bold">No notifications yet!</h5>
              <p className="text-muted">When you place an order, updates will appear here.</p>
              <Button variant="danger" className="rounded-pill px-4" onClick={() => navigate('/menu')}>Explore Menu</Button>
            </Card.Body>
          </Card>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className="notification-card bg-white shadow-sm mb-4 rounded-4 overflow-hidden">
              <div className="notification-header bg-light">
                <div>
                  <span className="notification-id text-danger fw-bold me-2">#{msg.orderId?._id?.slice(-8).toUpperCase() || 'SYSTEM'}</span>
                  <span className="notification-title fw-bold">Order Update</span>
                </div>
                <span className={`badge ${msg.orderId?.orderStatus === 'delivered' ? 'bg-success' : msg.orderId?.orderStatus === 'rejected' ? 'bg-danger' : 'bg-primary'}`}>
                  {msg.orderId?.orderStatus?.toUpperCase() || 'UPDATE'}
                </span>
              </div>
              <div className="notification-body bg-white p-3">
                <div className="notification-step border-bottom-0 pb-0 mb-0">
                  <div className="notification-icon bg-danger bg-opacity-10 text-danger rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-info-circle-fill"></i>
                  </div>
                  <div className="notification-content ms-3">
                    <h6 className="fw-bold mb-1">{msg.message}</h6>
                    <p className="text-muted small mb-0">{new Date(msg.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

      </Container>
    </div>
  );
};

export default Notifications;
