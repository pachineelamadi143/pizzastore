import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Modal, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getCart, createOrder, getAddresses, addAddress, updateCartItem, removeFromCart } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const addressSchema = Yup.object({
  houseNumber: Yup.string().required('House / Flat number is required'),
  street:      Yup.string().required('Street / Area is required'),
  city:        Yup.string().required('City is required'),
  state:       Yup.string().required('State is required'),
  pincode:     Yup.string()
    .matches(/^[0-9]{6}$/, 'Enter a valid 6-digit pincode')
    .required('Pincode is required'),
  landmark:    Yup.string(),
});

const Cart = () => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [ordering, setOrdering] = useState(false);
  // const [showToast, setShowToast] = useState(false); // Removed local toast state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [deliveryMode, setDeliveryMode] = useState('delivery');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  const [newAddressError, setNewAddressError] = useState('');

  const { user, addToast } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
    if (user) fetchAddresses();
  }, [user]);

  const fetchCart = async () => {
    try {
      const { data } = await getCart();
      setCart(data);
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
    setLoading(false);
  };

  const fetchAddresses = async () => {
    try {
      const { data } = await getAddresses();
      setAddresses(data);
      const defaultAddr = data.find(a => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr._id);
      else if (data.length > 0) setSelectedAddressId(data[0]._id);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  // handleAddAddress is now handled by addressFormik


  // ── Formik for Add Address modal ────────────────────────────────
  const addressFormik = useFormik({
    initialValues: { houseNumber: '', street: '', city: '', state: '', pincode: '', landmark: '' },
    validationSchema: addressSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setNewAddressError('');
      try {
        const { data } = await addAddress(values);
        setAddresses(prev => [...prev, data]);
        setSelectedAddressId(data._id);
        setShowAddressModal(false);
        resetForm();
      } catch (error) {
        setNewAddressError('Error adding address. Please check all fields.');
      }
      setSubmitting(false);
    },
  });


  const handleUpdateQuantity = async (itemId, newQty) => {
    try {
      const res = await updateCartItem({ itemId, quantity: newQty });
      setCart(res.data.cart);
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const res = await removeFromCart(itemId);
      setCart(res.data.cart);
      addToast('SUCCESS', 'Item removed from cart');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      addToast('ERROR', 'Failed to remove item from cart');
    }
  };

  const handlePlaceOrder = async () => {
    if (deliveryMode === 'delivery' && !selectedAddressId) {
      addToast('ERROR', 'Please add address');
      return;
    }

    setOrdering(true);
    try {
      await createOrder({
        addressId: deliveryMode === 'delivery' ? selectedAddressId : '000000000000000000000000', // Placeholder if pickup
        deliveryMode,
        paymentMethod
      });
      
      // WebSocket will handle the ORDER_PLACED toast automatically
      
      setTimeout(() => {
        navigate('/orders');
      }, 3000);
      
    } catch (error) {
      alert(error.response?.data?.message || 'Error placing order');
      setOrdering(false);
    }
  };

  const subtotal = cart.totalAmount;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const deliveryCharge = deliveryMode === 'delivery' ? 40 : 0;
  const total = subtotal + tax + deliveryCharge;

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />


      <Container className="mt-4 flex-grow-1 pb-5">
        <h3 className="mb-4 fw-bold">Checkout</h3>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
               <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : cart.items.length === 0 ? (
          <Card className="text-center py-5 border-0 shadow-sm rounded-4">
            <Card.Body>
              <i className="bi bi-cart-x text-muted display-1 mb-4"></i>
              <h4 className="fw-bold">Your cart is empty!</h4>
              <p className="text-muted mb-4">Looks like you haven't added anything yet.</p>
              <Button variant="danger" className="rounded-pill px-5 py-2 fw-bold"
                onClick={() => navigate('/menu')}>
                Browse Menu
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row>
            <Col lg={8}>
              {/* Order Items */}
              <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <Card.Header className="bg-white border-0 py-3">
                  <h5 className="fw-bold mb-0">1. Review Items</h5>
                </Card.Header>
                <Table responsive hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="py-3 px-4 border-0">Item</th>
                      <th className="py-3 text-center border-0">Price</th>
                      <th className="py-3 text-center border-0">Qty</th>
                      <th className="py-3 text-end px-4 border-0">Subtotal</th>
                      <th className="py-3 text-end px-4 border-0">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.items.map(item => (
                      <tr key={item._id} className="align-middle">
                        <td className="py-3 px-4 border-0">
                          <div className="fw-bold">{item.name}</div>
                          {item.itemId?.image && (
                            <img src={item.itemId.image} alt={item.name} style={{ width: '40px', height: '40px', objectFit: 'cover' }} className="rounded mt-1 d-md-none" />
                          )}
                        </td>
                        <td className="py-3 text-center text-muted border-0">₹{item.price}</td>
                        <td className="py-3 text-center border-0">
                          <div className="d-inline-flex align-items-center bg-light rounded-pill p-1 border">
                            <Button
                              variant="link"
                              size="sm"
                              className="text-danger p-0 px-2"
                              onClick={() => handleUpdateQuantity(item.itemId?._id || item.itemId || item._id, item.quantity - 1)}
                            >
                              <i className="bi bi-dash-circle fs-5"></i>
                            </Button>
                            <span className="fw-bold px-2" style={{ minWidth: '20px' }}>{item.quantity}</span>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-success p-0 px-2"
                              onClick={() => handleUpdateQuantity(item.itemId?._id || item.itemId || item._id, item.quantity + 1)}
                            >
                              <i className="bi bi-plus-circle fs-5"></i>
                            </Button>
                          </div>
                        </td>
                        <td className="py-3 text-end px-4 fw-bold text-danger border-0">₹{item.price * item.quantity}</td>
                        <td className="py-3 text-end px-4 border-0">
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="rounded-pill px-3 fw-semibold"
                            onClick={() => handleRemoveItem(item.itemId?._id || item.itemId || item._id)}
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>

              {/* Delivery Details */}
              <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Header className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                  <h5 className="fw-bold mb-0">2. Delivery Details</h5>
                  <div className="btn-group btn-group-sm">
                    <Button 
                      variant={deliveryMode === 'delivery' ? 'danger' : 'outline-danger'}
                      onClick={() => setDeliveryMode('delivery')}
                    >
                      Delivery
                    </Button>
                    <Button 
                      variant={deliveryMode === 'pickup' ? 'danger' : 'outline-danger'}
                      onClick={() => setDeliveryMode('pickup')}
                    >
                      Pickup
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body className="pt-0">
                  {deliveryMode === 'delivery' ? (
                    <div className="mt-2">
                      {addresses.length > 0 ? (
                        <Row className="g-3">
                          {addresses.map(addr => (
                            <Col md={6} key={addr._id}>
                              <Card 
                                className={`h-100 border-2 cursor-pointer rounded-4 transition-all ${selectedAddressId === addr._id ? 'border-danger bg-danger bg-opacity-10' : 'border-light shadow-sm'}`}
                                onClick={() => setSelectedAddressId(addr._id)}
                                style={{ cursor: 'pointer' }}
                              >
                                <Card.Body className="p-3">
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h6 className="fw-bold mb-0">
                                      {addr.isDefault && <Badge bg="danger" className="me-2 rounded-pill">Default</Badge>}
                                      Address
                                    </h6>
                                    {selectedAddressId === addr._id && <i className="bi bi-check-circle-fill text-danger"></i>}
                                  </div>
                                  <p className="small text-muted mb-0">
                                    {addr.houseNumber}, {addr.street}<br />
                                    {addr.city}, {addr.state} - {addr.pincode}<br />
                                    {addr.landmark && <span className="italic text-secondary">Near: {addr.landmark}</span>}
                                  </p>
                                </Card.Body>
                              </Card>
                            </Col>
                          ))}
                          <Col md={6}>
                            <Button 
                              variant="outline-danger" 
                              className="w-100 h-100 py-4 border-2 border-dashed rounded-4 d-flex flex-column align-items-center justify-content-center gap-2"
                              onClick={() => setShowAddressModal(true)}
                            >
                              <i className="bi bi-plus-circle fs-3"></i>
                              Add New Address
                            </Button>
                          </Col>
                        </Row>
                      ) : (
                        <div className="text-center py-4 bg-light rounded-4">
                          <p className="text-muted mb-3">No addresses found.</p>
                          <Button variant="danger" className="rounded-pill px-4" onClick={() => setShowAddressModal(true)}>
                            Add Delivery Address
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-light rounded-4">
                      <p className="text-dark fw-medium mb-1">Store Pickup Selected</p>
                      <p className="small text-muted mb-0">
                        Visit us at: 123 Pizza Street, Food City<br />
                        <span className="text-danger">Available for pickup in 20-30 mins</span>
                      </p>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Payment Options */}
              <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Header className="bg-white border-0 py-3">
                  <h5 className="fw-bold mb-0">3. Payment Method</h5>
                </Card.Header>
                <Card.Body className="pt-0">
                  <Row className="g-3">
                    <Col md={6}>
                      <Card 
                        className={`h-100 border-2 rounded-4 transition-all ${paymentMethod === 'cod' ? 'border-danger bg-danger bg-opacity-10' : 'border-light shadow-sm'}`}
                        onClick={() => setPaymentMethod('cod')}
                        style={{ cursor: 'pointer' }}
                      >
                        <Card.Body className="p-3 d-flex align-items-center gap-3">
                          <div className={`rounded-circle p-2 ${paymentMethod === 'cod' ? 'bg-danger text-white' : 'bg-light text-muted'}`}>
                            <i className="bi bi-cash-stack fs-4"></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-0">Cash on Delivery</h6>
                            <p className="small text-muted mb-0">Pay when you receive</p>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card 
                        className={`h-100 border-2 rounded-4 transition-all ${paymentMethod === 'card' ? 'border-danger bg-danger bg-opacity-10' : 'border-light shadow-sm'}`}
                        onClick={() => setPaymentMethod('card')}
                        style={{ cursor: 'pointer' }}
                      >
                        <Card.Body className="p-3 d-flex align-items-center gap-3">
                          <div className={`rounded-circle p-2 ${paymentMethod === 'card' ? 'bg-danger text-white' : 'bg-light text-muted'}`}>
                            <i className="bi bi-credit-card fs-4"></i>
                          </div>
                          <div>
                            <h6 className="fw-bold mb-0">Card Payment</h6>
                            <p className="small text-muted mb-0">Secure online payment</p>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={4}>
              <Card className="border-0 shadow-lg rounded-4 overflow-hidden sticky-top" style={{ top: '90px', zIndex: 10 }}>
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-4">Bill Details</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Item Subtotal</span>
                    <span className="fw-bold">₹{subtotal}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">GST (5%)</span>
                    <span className="fw-bold text-success">+₹{tax}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span className="text-muted">Delivery Charges</span>
                    <span className="fw-bold">{deliveryCharge === 0 ? <span className="text-success">FREE</span> : `₹${deliveryCharge}`}</span>
                  </div>
                  <hr className="my-4 opacity-75" />
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0 fw-bold">Total Payble</h5>
                    <h3 className="text-danger fw-bold mb-0">₹{total}</h3>
                  </div>
                  
                  <div className="alert alert-warning border-0 small mb-4 rounded-3 py-2 px-3">
                    <i className="bi bi-info-circle me-2"></i>
                    {deliveryMode === 'delivery' 
                      ? 'Delivering to your selected address.' 
                      : 'You will pick up from our store.'}
                  </div>

                  <Button
                    variant="danger"
                    className="w-100 rounded-pill py-3 fw-bold fs-5 shadow-sm"
                    onClick={handlePlaceOrder}
                    disabled={ordering}
                  >
                    {ordering ? (
                      <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...</>
                    ) : 'Place Order'}
                  </Button>
                  
                  <div className="d-flex align-items-center justify-content-center gap-2 mt-4 text-muted small">
                    <i className="bi bi-shield-lock-fill text-success"></i>
                    Secure Checkout
                  </div>
                </Card.Body>
              </Card>
              <Button 
                variant="outline-secondary" 
                className="w-100 mt-3 rounded-pill border-0 text-muted"
                onClick={() => navigate('/menu')}
              >
                <i className="bi bi-arrow-left me-2"></i> Continued Shopping
              </Button>
            </Col>
          </Row>
        )}
      </Container>

      {/* Add Address Modal */}
      <Modal show={showAddressModal} onHide={() => { setShowAddressModal(false); addressFormik.resetForm(); }} centered className="rounded-4">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Add New Address</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          {newAddressError && <div className="alert alert-danger py-2 small">{newAddressError}</div>}
          <Form noValidate onSubmit={addressFormik.handleSubmit}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">House/Flat No.</Form.Label>
                  <Form.Control
                    type="text"
                    name="houseNumber"
                    placeholder="e.g. 402"
                    value={addressFormik.values.houseNumber}
                    onChange={addressFormik.handleChange}
                    onBlur={addressFormik.handleBlur}
                    isInvalid={addressFormik.touched.houseNumber && !!addressFormik.errors.houseNumber}
                  />
                  <Form.Control.Feedback type="invalid">{addressFormik.errors.houseNumber}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Street/Area</Form.Label>
                  <Form.Control
                    type="text"
                    name="street"
                    placeholder="e.g. MG Road"
                    value={addressFormik.values.street}
                    onChange={addressFormik.handleChange}
                    onBlur={addressFormik.handleBlur}
                    isInvalid={addressFormik.touched.street && !!addressFormik.errors.street}
                  />
                  <Form.Control.Feedback type="invalid">{addressFormik.errors.street}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">City</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    placeholder="e.g. Mumbai"
                    value={addressFormik.values.city}
                    onChange={addressFormik.handleChange}
                    onBlur={addressFormik.handleBlur}
                    isInvalid={addressFormik.touched.city && !!addressFormik.errors.city}
                  />
                  <Form.Control.Feedback type="invalid">{addressFormik.errors.city}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Pincode</Form.Label>
                  <Form.Control
                    type="text"
                    name="pincode"
                    placeholder="e.g. 400001"
                    value={addressFormik.values.pincode}
                    onChange={addressFormik.handleChange}
                    onBlur={addressFormik.handleBlur}
                    isInvalid={addressFormik.touched.pincode && !!addressFormik.errors.pincode}
                  />
                  <Form.Control.Feedback type="invalid">{addressFormik.errors.pincode}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-bold">State</Form.Label>
                  <Form.Control
                    type="text"
                    name="state"
                    placeholder="e.g. Maharashtra"
                    value={addressFormik.values.state}
                    onChange={addressFormik.handleChange}
                    onBlur={addressFormik.handleBlur}
                    isInvalid={addressFormik.touched.state && !!addressFormik.errors.state}
                  />
                  <Form.Control.Feedback type="invalid">{addressFormik.errors.state}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Landmark (Optional)</Form.Label>
                  <Form.Control
                    type="text"
                    name="landmark"
                    placeholder="e.g. Near Post Office"
                    value={addressFormik.values.landmark}
                    onChange={addressFormik.handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <hr className="my-4" />
            <div className="d-flex justify-content-end gap-2">
              <Button variant="light" className="rounded-pill px-4"
                onClick={() => { setShowAddressModal(false); addressFormik.resetForm(); }}>
                Cancel
              </Button>
              <Button variant="danger" type="submit" className="rounded-pill px-4"
                disabled={addressFormik.isSubmitting}>
                {addressFormik.isSubmitting ? 'Saving...' : 'Save Address'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      <footer className="bg-dark text-white text-center py-4 mt-auto">
        <p className="mb-0 opacity-75 small">© 2026 Pizza Store. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Cart;
