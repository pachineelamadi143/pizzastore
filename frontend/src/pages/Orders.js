import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Card, Button, Badge, Table, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getMyOrders, cancelOrder, addToCart } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const cancellingIdRef = useRef(null);   // ← ref avoids stale-state race condition
  const [cancelLoading, setCancelLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await getMyOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Open the confirmation dialog
  const confirmCancel = (orderId) => {
    cancellingIdRef.current = orderId;  // sync, never stale
    setShowCancelConfirm(true);
  };

  // Perform the cancellation
  const handleCancel = async () => {
    const idToCancel = cancellingIdRef.current;
    if (!idToCancel) return;            // safety guard
    setCancelLoading(true);
    try {
      await cancelOrder(idToCancel);
      setShowCancelConfirm(false);
      setShowBillModal(false);
      await fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || 'Error cancelling order');
    }
    setCancelLoading(false);
    cancellingIdRef.current = null;
  };

  const handleReorder = async (order) => {
    try {
      for (let item of order.items) {
        await addToCart({
          itemId: item.itemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        });
      }
      navigate('/cart');
    } catch (err) {
      alert('Failed to reorder items');
    }
  };

  const generatePDF = (order) => {
    const doc = new jsPDF();
    const orderIdShort = order._id.slice(-8).toUpperCase();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(220, 53, 69); // Bootstrap Danger Color
    doc.text("PIZZA STORE", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice for Order #${orderIdShort}`, 14, 30);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 14, 35);
    doc.text(`Customer: ${user?.name || 'Customer'}`, 14, 40);

    // Table Data
    const tableColumn = ["Item", "Price", "Qty", "Subtotal"];
    const tableRows = [];

    order.items.forEach(item => {
      const itemData = [
        item.name,
        `Rs. ${item.price}`,
        item.quantity,
        `Rs. ${item.price * item.quantity}`
      ];
      tableRows.push(itemData);
    });

    // Generate Table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'striped',
      headStyles: { fillColor: [220, 53, 69] }
    });

    // Summary Section
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setTextColor(50);
    
    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`Rs. ${order.subtotal || order.totalAmount}`, 175, finalY, { align: 'right' });
    
    doc.text(`Tax (5%):`, 140, finalY + 7);
    doc.text(`Rs. ${order.tax || 0}`, 175, finalY + 7, { align: 'right' });
    
    doc.text(`Delivery:`, 140, finalY + 14);
    doc.text(`Rs. ${order.deliveryCharge || 0}`, 175, finalY + 14, { align: 'right' });
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL BILL:`, 140, finalY + 25);
    doc.text(`Rs. ${order.totalAmount}`, 175, finalY + 25, { align: 'right' });

    // Footer
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(150);
    doc.text("Thank you for choosing Pizza Store! Enjoy your meal.", 105, finalY + 45, { align: 'center' });

    doc.save(`PizzaStore_Invoice_${orderIdShort}.pdf`);
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending:   'warning',
      confirmed: 'info',
      accepted:  'success',
      preparing: 'primary',
      'out for delivery': 'primary',
      delivered: 'success',
      cancelled: 'secondary',
      rejected:  'danger'
    };
    return <Badge bg={variants[status] || 'secondary'}>{status.toUpperCase()}</Badge>;
  };

  const formatDate = (dateString) => {
    const options = { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-GB', options).replace(',', ' •');
  };

  const canCancel = (status) => status === 'pending';

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />

      <Container className="mt-4 flex-grow-1">
        <h3 className="mb-4">My Orders</h3>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center">
            <p>No orders found!</p>
            <Button variant="danger" onClick={() => navigate('/menu')}>Order Now</Button>
          </div>
        ) : (
          <div className="table-responsive">
            <Table striped bordered hover className="align-middle">
              <thead className="table-danger">
                <tr>
                  <th>Order ID</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Order Status</th>
                  <th>Payment Status</th>
                  <th>Date</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td className="fw-bold text-danger">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td>
                      {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                    </td>
                    <td className="fw-bold">₹{order.totalAmount}</td>
                    <td>{getStatusBadge(order.orderStatus)}</td>
                    <td>
                      <Badge bg="success">PAID</Badge>
                    </td>
                    <td className="text-muted small">{formatDate(order.createdAt)}</td>
                    <td className="text-center">
                      <div className="d-flex gap-2 justify-content-center flex-wrap">
                        {/* View Bill */}
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => { setSelectedOrder(order); setShowBillModal(true); }}
                        >
                          View Bill
                        </Button>

                        {/* Reorder (completed/cancelled orders) */}
                        {(order.orderStatus === 'delivered' || order.orderStatus === 'cancelled' || order.orderStatus === 'rejected') && (
                          <Button variant="danger" size="sm" onClick={() => handleReorder(order)}>
                            Reorder
                          </Button>
                        )}

                        {/* Cancel (pending only) */}
                        {canCancel(order.orderStatus) && (
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => confirmCancel(order._id)}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Container>

      {/* ── Cancel Confirmation Modal ──────────────────────────── */}
      <Modal show={showCancelConfirm} onHide={() => setShowCancelConfirm(false)} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-0" />
        <Modal.Body className="text-center px-4 pb-2">
          <div
            style={{
              width: 60, height: 60, borderRadius: '50%',
              background: '#fee2e2', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <span style={{ fontSize: '2rem' }}>✖</span>
          </div>
          <h5 className="fw-bold mb-1">Cancel Order?</h5>
          <p className="text-muted small mb-0">
            Only <strong>pending</strong> orders can be cancelled. This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center gap-2 pt-2">
          <Button variant="outline-secondary" size="sm" className="px-4 rounded-pill"
            onClick={() => setShowCancelConfirm(false)}>
            Keep Order
          </Button>
          <Button variant="danger" size="sm" className="px-4 rounded-pill"
            onClick={handleCancel}
            disabled={cancelLoading}>
            {cancelLoading ? 'Cancelling…' : 'Yes, Cancel'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Bill Modal ─────────────────────────────────────────── */}
      <Modal show={showBillModal} onHide={() => setShowBillModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0" />
        <Modal.Body className="pt-0">
          {selectedOrder && (
            <Card className="border-0 shadow-sm">
              <div className="bg-light p-3 border-bottom text-center">
                <h5 className="fw-bold mb-1">Pizza Store Receipt</h5>
                <p className="text-muted small mb-0">Order #{selectedOrder._id.slice(-8).toUpperCase()}</p>
                <p className="text-muted small mb-0">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
              </div>
              <Card.Body className="p-4">
                <div className="d-flex justify-content-center mb-3">
                  {getStatusBadge(selectedOrder.orderStatus)}
                </div>

                <div className="mb-3 p-2 bg-light rounded-3 small">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Payment:</span>
                    <span className="fw-bold">
                      {selectedOrder.paymentMethod?.toUpperCase()} - {selectedOrder.paymentStatus?.toUpperCase()}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Mode:</span>
                    <span className="fw-bold">{selectedOrder.deliveryMode?.toUpperCase()}</span>
                  </div>
                </div>

                <div className="mb-4 border-bottom pb-3">
                  <div className="d-flex justify-content-between text-muted small fw-bold mb-2">
                    <span>ITEM</span><span>AMT</span>
                  </div>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="d-flex justify-content-between mb-2 small fw-medium">
                      <span>{item.quantity}x {item.name}</span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-muted small">Subtotal</span>
                  <span className="small fw-bold">₹{selectedOrder.subtotal || selectedOrder.totalAmount}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-muted small">Tax (5%)</span>
                  <span className="small fw-bold">₹{selectedOrder.tax || 0}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted small">Delivery Charges</span>
                  <span className="small fw-bold">₹{selectedOrder.deliveryCharge || 0}</span>
                </div>

                <div className="d-flex justify-content-between align-items-center bg-light p-3 rounded">
                  <strong className="fs-5">TOTAL BILL</strong>
                  <strong className="text-danger fs-5">₹{selectedOrder.totalAmount}</strong>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <Button
                    variant="danger"
                    className="flex-grow-1 rounded-pill fw-bold py-2 shadow-sm"
                    onClick={() => generatePDF(selectedOrder)}
                  >
                    <i className="bi bi-download me-2"></i>
                    Download PDF
                  </Button>
                </div>

                {/* Cancel inside bill modal too */}
                {canCancel(selectedOrder.orderStatus) && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="w-100 mt-4 rounded-pill fw-bold py-2"
                    onClick={() => {
                      setShowBillModal(false);
                      confirmCancel(selectedOrder._id);
                    }}
                  >
                    Cancel Order
                  </Button>
                )}
              </Card.Body>
            </Card>
          )}
        </Modal.Body>
      </Modal>

      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <p className="mb-0">© 2026 Pizza Store. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Orders;