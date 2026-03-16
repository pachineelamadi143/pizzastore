import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Toast, ToastContainer, Spinner, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, getAddresses, deleteAddress } from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const profileSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number')
    .required('Phone number is required'),
});

const Profile = () => {
  const navigate = useNavigate();
  const { user, token, login } = useAuth();
  const imageMenuRef = useRef(null);
  const fileInputRef = useRef(null);

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [initialProfile, setInitialProfile] = useState({ name: '', phone: '', profileImage: '' });
  const [showImageMenu, setShowImageMenu] = useState(false);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, addressRes] = await Promise.all([getProfile(), getAddresses()]);
      const p = profileRes.data;
      setEmail(p.email || '');
      setRole(p.role || '');
      setProfileImage(p.profileImage || '');
      setInitialProfile({
        name: p.name || '',
        phone: p.phone || '',
        profileImage: p.profileImage || ''
      });
      formik.setValues({ name: p.name || '', phone: p.phone || '' });
      setAddresses(addressRes.data);
    } catch (error) {
      showToastMessage('Failed to load profile data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (imageMenuRef.current && !imageMenuRef.current.contains(event.target)) {
        setShowImageMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const showToastMessage = (message, variant) => {
    setToastMessage(message);
    setToastVariant(variant);
    setShowToast(true);
  };

  const formik = useFormik({
    initialValues: { name: '', phone: '' },
    validationSchema: profileSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { data } = await updateProfile({ name: values.name, phone: values.phone, profileImage });
        setInitialProfile({
          name: data.user.name || '',
          phone: data.user.phone || '',
          profileImage: data.user.profileImage || ''
        });
        setProfileImage(data.user.profileImage || '');
        if (user && token) {
          login(
            {
              ...user,
              name: data.user.name,
              profileImage: data.user.profileImage || ''
            },
            token
          );
        }
        showToastMessage('Profile updated successfully!', 'success');
      } catch (error) {
        showToastMessage(error.response?.data?.message || 'Failed to update profile', 'danger');
      }
      setSubmitting(false);
    },
  });

  const handleDeleteAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      await deleteAddress(id);
      setAddresses(addresses.filter(a => a._id !== id));
      showToastMessage('Address deleted successfully', 'success');
    } catch (error) {
      showToastMessage('Failed to delete address', 'danger');
    }
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToastMessage('Please choose an image file', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(String(reader.result || ''));
      setShowImageMenu(false);
      showToastMessage('Profile picture selected. Save changes to update it.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleAddImageClick = () => {
    setShowImageMenu(false);
    fileInputRef.current?.click();
  };

  const profileInitial = formik.values.name.charAt(0).toUpperCase();
  const isProfileChanged =
    formik.values.name !== initialProfile.name ||
    formik.values.phone !== initialProfile.phone ||
    profileImage !== initialProfile.profileImage;

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar />

      <ToastContainer position="top-center" className="p-3" style={{ zIndex: 1050 }}>
        <Toast bg={toastVariant} show={showToast} delay={3000} autohide onClose={() => setShowToast(false)}>
          <Toast.Body className="text-white fw-bold d-flex align-items-center">
            {toastVariant === 'success'
              ? <i className="bi bi-check-circle-fill me-2 fs-5"></i>
              : <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>}
            {toastMessage}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <Container className="mt-5 flex-grow-1 pb-5">
        <h2 className="mb-4 fw-bold">My Profile</h2>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="danger" />
            <p className="mt-2 text-muted">Loading profile...</p>
          </div>
        ) : (
          <Row className="g-4">
            {/* Sidebar */}
            <Col lg={4}>
              <Card className="border-0 shadow-sm rounded-4 text-center mb-4">
                <Card.Body className="p-4 d-flex flex-column align-items-center">
                  <div className="position-relative mb-3" ref={imageMenuRef}>
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={formik.values.name || 'Profile'}
                        className="rounded-circle shadow"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center shadow"
                        style={{ width: '100px', height: '100px', fontSize: '2.5rem' }}
                      >
                        {profileInitial || 'U'}
                      </div>
                    )}
                    <Button
                      variant="light"
                      className="position-absolute border-0 rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                      style={{ width: '34px', height: '34px', right: '-4px', bottom: '-4px' }}
                      onClick={() => setShowImageMenu((prev) => !prev)}
                    >
                      <i className="bi bi-plus-lg text-danger fw-bold"></i>
                    </Button>
                    {showImageMenu && (
                      <div
                        className="position-absolute bg-white shadow rounded-4 py-2"
                        style={{ top: 'calc(100% + 12px)', right: '-12px', minWidth: '150px', zIndex: 20 }}
                      >
                        <button
                          type="button"
                          className="btn btn-link text-dark text-decoration-none w-100 text-start px-3 py-2"
                          onClick={handleAddImageClick}
                        >
                          Add Image
                        </button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="d-none"
                    />
                  </div>
                  <h4 className="fw-bold mb-1">{formik.values.name}</h4>
                  <p className="text-muted mb-3">{email}</p>
                  <Badge bg="secondary" className="text-uppercase letter-spacing-1 p-2">{role}</Badge>
                  <p className="small text-muted mt-3 mb-0">Click the + icon to add or change your photo.</p>
                </Card.Body>
              </Card>
              <Card className="border-0 shadow-sm rounded-4 text-center">
                <Card.Body className="p-3">
                  <Button variant="outline-danger" className="w-100 rounded-pill btn-sm" onClick={() => navigate('/orders')}>
                    View My Orders
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* Form & Addresses */}
            <Col lg={8}>
              <Card className="border-0 shadow-sm rounded-4 mb-4">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-4 border-bottom pb-3">Personal Information</h5>
                  <Form noValidate onSubmit={formik.handleSubmit}>
                    <Row>
                      <Col md={12} className="mb-3">
                        <Form.Group>
                          <Form.Label className="text-muted small fw-bold">FULL NAME</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isInvalid={formik.touched.name && !!formik.errors.name}
                            className="bg-light border-0 py-2"
                          />
                          <Form.Control.Feedback type="invalid">{formik.errors.name}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label className="text-muted small fw-bold">EMAIL ADDRESS</Form.Label>
                          <Form.Control
                            type="email"
                            value={email}
                            disabled
                            className="bg-light border-0 py-2 text-muted"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label className="text-muted small fw-bold">PHONE NUMBER</Form.Label>
                          <Form.Control
                            type="tel"
                            name="phone"
                            value={formik.values.phone}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            isInvalid={formik.touched.phone && !!formik.errors.phone}
                            className="bg-light border-0 py-2"
                          />
                          <Form.Control.Feedback type="invalid">{formik.errors.phone}</Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="d-flex justify-content-end mt-4 pt-3 border-top">
                      <Button variant="danger" type="submit" className="rounded-pill px-4 fw-bold shadow-sm"
                        disabled={formik.isSubmitting || !isProfileChanged}>
                        {formik.isSubmitting
                          ? <><Spinner animation="border" size="sm" className="me-2" />Saving...</>
                          : 'Save Changes'}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>

              {/* Saved Addresses */}
              <Card className="border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-4 border-bottom pb-3">Saved Addresses</h5>
                  {addresses.length === 0 ? (
                    <div className="text-center py-4 bg-light rounded-4">
                      <p className="text-muted mb-0">No saved addresses yet.</p>
                      <Button variant="link" className="text-danger fw-bold text-decoration-none" onClick={() => navigate('/cart')}>
                        Add during next order
                      </Button>
                    </div>
                  ) : (
                    <Row className="g-3">
                      {addresses.map(addr => (
                        <Col md={6} key={addr._id}>
                          <Card className="h-100 border-light shadow-sm rounded-4 overflow-hidden">
                            <Card.Body className="p-3 position-relative">
                              <Button
                                variant="link"
                                className="text-muted p-1 position-absolute top-0 end-0 mt-2 me-2"
                                onClick={() => handleDeleteAddress(addr._id)}
                                title="Delete address"
                              >
                                <i className="bi bi-x-circle-fill fs-5"></i>
                              </Button>
                              <div className="d-flex align-items-center gap-2 mb-2">
                                <i className="bi bi-geo-alt-fill text-danger"></i>
                                <h6 className="fw-bold mb-0">Address</h6>
                              </div>
                              <p className="small text-muted mb-0">
                                {addr.houseNumber}, {addr.street}<br />
                                {addr.city}, {addr.state} - {addr.pincode}<br />
                                {addr.landmark && <span className="text-secondary italic">Near: {addr.landmark}</span>}
                              </p>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>

      <footer className="bg-dark text-white text-center py-4 mt-auto">
        <p className="mb-0 opacity-75 small">© 2026 Pizza Store. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Profile;
