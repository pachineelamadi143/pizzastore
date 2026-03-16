import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form } from 'react-bootstrap';
import { getAllOrders, updateOrderStatus, sendMessage } from '../services/api';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'delivered', 'cancelled'

  // Modal states
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageData, setMessageData] = useState({ orderId: null, userId: null, status: '', message: '' });
  const [showBillModal, setShowBillModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch Orders
  const fetchOrders = useCallback(async () => {
    try {
      const res = await getAllOrders();
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
    setLoadingOrders(false);
  }, []);

  // 🔔 Real-time WS handler – refresh orders on new order or customer cancellation
  const handleWsMessage = useCallback((data) => {
    if (data.type === 'NEW_ORDER' || data.type === 'ORDER_CANCELLED_BY_USER') {
      fetchOrders();
    }
  }, [fetchOrders]);

  useEffect(() => {
    fetchOrders();
    window._adminWsHandler = handleWsMessage;
    return () => { window._adminWsHandler = null; };
  }, [fetchOrders, handleWsMessage]);

  // Handle Stat Card Clicks
  const handleStatClick = (status) => {
    setFilterStatus(status);
  };

  // Derive displayed orders
  const displayedOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(o => o.orderStatus === filterStatus);

  // Manage Order Status Modals
  const openMessageModal = (orderId, status, userId) => {
    const defaultMessages = {
      accepted: 'Your order has been accepted!',
      rejected: 'Sorry, your order has been rejected.',
      delivered: 'Your order has been delivered! Enjoy your pizza!'
    };
    setMessageData({ orderId, userId, status, message: defaultMessages[status] || '' });
    setShowMessageModal(true);
  };

  const handleStatusUpdate = async () => {
    try {
      await updateOrderStatus(messageData.orderId, { orderStatus: messageData.status });
      if (messageData.message.trim() !== '') {
        await sendMessage({
          userId: messageData.userId,
          orderId: messageData.orderId,
          message: messageData.message
        });
      }
      setShowMessageModal(false);
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleShowBill = (order) => {
    setSelectedOrder(order);
    setShowBillModal(true);
  };

  const handlePrint = () => window.print();

  const getStatusBadge = (status) => {
    const variants = {
      pending:             'warning',
      accepted:            'success',
      confirmed:           'info',
      preparing:           'primary',
      'out for delivery':  'primary',
      delivered:           'success',
      cancelled:           'secondary',
      rejected:            'danger'
    };
    const labels = { cancelled: 'CANCELLED BY CUSTOMER' };
    return <Badge bg={variants[status] || 'secondary'}>{labels[status] || status.toUpperCase()}</Badge>;
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <Container className="mt-4">
        <h3 className="mb-4">Admin Dashboard – Overview</h3>

        {/* Stat Cards - Clickable Filters */}
        {loadingOrders ? (
          <div className="text-center">Loading stats...</div>
        ) : (
          <Row className="mb-4">
            <Col md={3}>
              <Card 
                className={`text-center shadow-sm border-danger ${filterStatus === 'all' ? 'bg-danger text-white' : ''}`}
                style={{ cursor: 'pointer', transition: '0.2s' }}
                onClick={() => handleStatClick('all')}
              >
                <Card.Body>
                  <h2 className={filterStatus === 'all' ? 'text-white' : 'text-danger'}>{orders.length}</h2>
                  <p className="mb-0">Total Orders</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card 
                className={`text-center shadow-sm border-warning ${filterStatus === 'pending' ? 'bg-warning text-dark' : ''}`}
                style={{ cursor: 'pointer', transition: '0.2s' }}
                onClick={() => handleStatClick('pending')}
              >
                <Card.Body>
                  <h2 className={filterStatus === 'pending' ? 'text-dark' : 'text-warning'}>
                    {orders.filter(o => o.orderStatus === 'pending').length}
                  </h2>
                  <p className="mb-0">Pending Orders</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card 
                className={`text-center shadow-sm border-success ${filterStatus === 'delivered' ? 'bg-success text-white' : ''}`}
                style={{ cursor: 'pointer', transition: '0.2s' }}
                onClick={() => handleStatClick('delivered')}
              >
                <Card.Body>
                  <h2 className={filterStatus === 'delivered' ? 'text-white' : 'text-success'}>
                    {orders.filter(o => o.orderStatus === 'delivered').length}
                  </h2>
                  <p className="mb-0">Delivered Orders</p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card 
                className={`text-center shadow-sm border-secondary ${filterStatus === 'cancelled' ? 'bg-secondary text-white' : ''}`}
                style={{ cursor: 'pointer', transition: '0.2s' }}
                onClick={() => handleStatClick('cancelled')}
              >
                <Card.Body>
                  <h2 className={filterStatus === 'cancelled' ? 'text-white' : 'text-secondary'}>
                    {orders.filter(o => o.orderStatus === 'cancelled').length}
                  </h2>
                  <p className="mb-0">Cancelled Orders</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )} 
        {/* Orders Table */}
        {loadingOrders ? (
          <div className="text-center">Loading orders...</div>
        ) : displayedOrders.length === 0 ? (
          <p>No orders matched your filter.</p>
        ) : (
          <Table striped bordered hover responsive>
            <thead className="table-danger">
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th className="text-end">Total</th>
                <th className="text-center">Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedOrders.map(order => (
                <tr key={order._id}>
                  <td>{order._id.slice(-8).toUpperCase()}</td>
                  <td>
                    <div>{order.userId?.name}</div>
                    <small className="text-muted">{order.userId?.email}</small>
                  </td>
                  <td>
                    {order.items.map((item, i) => (
                      <div key={i}>{item.name} x{item.quantity}</div>
                    ))}
                  </td>
                  <td className="text-end">₹{order.totalAmount}</td>
                  <td className="text-center align-middle">{getStatusBadge(order.orderStatus)}</td>
                  <td className="text-center align-middle">
                    {order.orderStatus === 'pending' && (
                      <div className="d-flex justify-content-center gap-1">
                        <Button variant="success" size="sm" onClick={() => openMessageModal(order._id, 'accepted', order.userId?._id)}>Accept</Button>
                        <Button variant="danger" size="sm" onClick={() => openMessageModal(order._id, 'rejected', order.userId?._id)}>Reject</Button>
                      </div>
                    )}
                    {order.orderStatus === 'accepted' && (
                      <div className="d-flex justify-content-center gap-1">
                        <Button variant="primary" size="sm" onClick={() => openMessageModal(order._id, 'delivered', order.userId?._id)}>Mark Delivered</Button>
                        <Button variant="outline-dark" size="sm" onClick={() => handleShowBill(order)}>Bill</Button>
                      </div>
                    )}
                    {order.orderStatus === 'delivered' && (
                      <Button variant="outline-dark" size="sm" onClick={() => handleShowBill(order)}>Bill</Button>
                    )}
                    {['cancelled', 'rejected'].includes(order.orderStatus) && (
                      <span className="text-muted fst-italic mb-0" style={{ fontSize: '0.9rem' }}>No action required</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}

      </Container>

      {/* Status / Message Modal */}
      <Modal show={showMessageModal} onHide={() => setShowMessageModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Update Order Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            You are about to mark this order as <strong><Badge bg="secondary" className="text-uppercase">{messageData.status}</Badge></strong>.
          </div>
          <Form.Group>
            <Form.Label className="fw-bold">Notification Message to Customer <span className="text-danger">*</span></Form.Label>
            <Form.Control
              as="textarea" rows={3} value={messageData.message}
              onChange={(e) => setMessageData({ ...messageData, message: e.target.value })}
              placeholder="Enter message to display as a notification..."
            />
            <Form.Text className="text-muted">This message will be shown on the user's notification page.</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowMessageModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleStatusUpdate}>Confirm &amp; Send</Button>
        </Modal.Footer>
      </Modal>

      {/* Bill / Invoice Modal */}
      <Modal show={showBillModal} onHide={() => setShowBillModal(false)} size="lg" centered className="bill-modal">
        <Modal.Header closeButton className="bg-light d-print-none">
          <Modal.Title>Order Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body id="printable-bill">
          <div className="p-4 bg-white border rounded">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-start mb-4 border-bottom pb-4">
              <div>
                <h2 className="text-danger fw-bold mb-0">Pizza Store</h2>
                <p className="text-muted mb-0">123 Pizza Street, Food City</p>
                <p className="text-muted mb-0">Phone: +91 98765 43210</p>
              </div>
              <div className="text-end">
                <h4 className="fw-bold mb-1">INVOICE</h4>
                <p className="mb-0 text-muted">Order ID: #{selectedOrder?._id?.toUpperCase()}</p>
                <p className="mb-0 text-muted">Date: {selectedOrder && new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-4">
              <h6 className="fw-bold text-uppercase text-muted border-bottom pb-2">Bill To:</h6>
              <div className="row mt-2">
                <div className="col-md-6">
                  <p className="mb-0 fw-bold">{selectedOrder?.userId?.name}</p>
                  <p className="mb-0">{selectedOrder?.userId?.email}</p>
                  <p className="mb-0">{selectedOrder?.userId?.phone}</p>
                </div>
                <div className="col-md-6">
                  <p className="mb-0 fw-bold">Delivery Address:</p>
                  {selectedOrder?.addressId && (
                    <p className="mb-0">
                      {selectedOrder.addressId.houseNumber}, {selectedOrder.addressId.street},<br />
                      {selectedOrder.addressId.landmark && `${selectedOrder.addressId.landmark}, `}
                      {selectedOrder.addressId.city}, {selectedOrder.addressId.pincode}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Items Table */}
            <Table responsive borderless className="mb-4">
              <thead className="border-bottom border-top bg-light">
                <tr><th>Item</th><th className="text-center">Price</th><th className="text-center">Quantity</th><th className="text-end">Total</th></tr>
              </thead>
              <tbody>
                {selectedOrder?.items.map((item, index) => (
                  <tr key={index} className="border-bottom-custom">
                    <td className="py-3"><p className="mb-0 fw-bold">{item.name}</p></td>
                    <td className="py-3 text-center">₹{item.price}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-end fw-bold">₹{item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Summary */}
            <div className="row justify-content-end">
              <div className="col-md-5">
                <Card className="border-0 bg-light rounded-4">
                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between mb-2"><span>Subtotal</span><span>₹{selectedOrder?.totalAmount}</span></div>
                    <div className="d-flex justify-content-between mb-2"><span>Delivery Fee</span><span className="text-success">FREE</span></div>
                    <hr />
                    <div className="d-flex justify-content-between h4 mb-0 fw-bold">
                      <span className="text-danger">Total</span><span className="text-danger">₹{selectedOrder?.totalAmount}</span>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>

            <div className="text-center mt-5 pt-4 border-top text-muted small">
              <p className="mb-0">Thank you for your order! Visit again.</p>
              <p className="mb-0">© 2026 Pizza Store. All rights reserved.</p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="d-print-none">
          <Button variant="secondary" onClick={() => setShowBillModal(false)}>Close</Button>
          <Button variant="danger" onClick={handlePrint}>Print Invoice</Button>
        </Modal.Footer>
      </Modal>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <p className="mb-0">© 2026 Pizza Store. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default AdminDashboard;