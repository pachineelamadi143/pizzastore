import React, { useState } from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { register, verifyRegisterOtp } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const registerSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Full name is required'),
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number')
    .required('Phone number is required'),
});

const Register = () => {
  const [serverError, setServerError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  const formik = useFormik({
    initialValues: { name: '', email: '', password: '', phone: '', role: 'customer' },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError('');
      try {
        const { data } = await register(values);
        setPendingEmail(data.email || values.email);
        setOtpStep(true);
      } catch (err) {
        setServerError(err.response?.data?.message || 'Registration failed');
      }
      setSubmitting(false);
    },
  });

  const handleVerifyOtp = async () => {
    setServerError('');
    try {
      const { data } = await verifyRegisterOtp({ email: pendingEmail, otp });
      authLogin(data.user, data.token);
      navigate('/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'OTP verification failed');
    }
  };

  const field = (name, label, type = 'text', placeholder = '') => (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type={type}
        name={name}
        placeholder={placeholder}
        value={formik.values[name]}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        isInvalid={formik.touched[name] && !!formik.errors[name]}
      />
      <Form.Control.Feedback type="invalid">
        {formik.errors[name]}
      </Form.Control.Feedback>
    </Form.Group>
  );

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card className="shadow-sm border-0 rounded-4" style={{ width: '430px', padding: '24px' }}>
        <h3 className="text-center mb-4">Pizza Store</h3>
        <p className="text-center text-danger fw-bold mb-2">Welcome to Pizza Store</p>
        <h5 className="text-center mb-4">{otpStep ? 'Verify Your Email' : 'Register'}</h5>

        {serverError && <Alert variant="danger">{serverError}</Alert>}

        {otpStep ? (
          <>
            <p className="text-center text-muted mb-3">
              Enter the OTP sent to your mail below.
            </p>
            <Form.Group className="mb-3">
              <Form.Label>Enter OTP</Form.Label>
              <Form.Control
                type="text"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              />
            </Form.Group>
            <Button
              variant="danger"
              className="w-100 rounded-pill fw-bold shadow-sm"
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6}
            >
              Verify
            </Button>
          </>
        ) : (
          <Form noValidate onSubmit={formik.handleSubmit}>
            {field('name',     'Full Name',     'text',     'Enter your name')}
            {field('email',    'Email',         'email',    'Enter email')}
            {field('password', 'Password',      'password', 'Min 6 characters')}
            {field('phone',    'Phone Number',  'text',     '10-digit number')}

            <Button
              variant="danger"
              type="submit"
              className="w-100 rounded-pill fw-bold shadow-sm"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Sending OTP...' : 'Register'}
            </Button>
          </Form>
        )}

        <div className="text-center mt-3">
          <span className="text-muted">Already have an account? </span>
          <Link to="/login" className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm">
            Sign In
          </Link>
        </div>
      </Card>
    </Container>
  );
};

export default Register;
