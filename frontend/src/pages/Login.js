import React from 'react';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login, verifyLoginOtp } from '../services/api';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const loginSchema = Yup.object({
  email: Yup.string()
    .email('Enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login = () => {
  const [serverError, setServerError] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [otpStep, setOtpStep] = React.useState(false);
  const [pendingEmail, setPendingEmail] = React.useState('');
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setServerError('');
      try {
        const { data } = await login(values);
        setPendingEmail(data.email || values.email);
        setOtpStep(true);
      } catch (err) {
        setServerError(err.response?.data?.message || 'Login failed');
      }
      setSubmitting(false);
    },
  });

  const handleVerifyOtp = async () => {
    setServerError('');
    try {
      const { data } = await verifyLoginOtp({ email: pendingEmail, otp });
      authLogin(data.user, data.token);
      navigate(data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setServerError(err.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <Card className="shadow-sm border-0 rounded-4" style={{ width: '430px', padding: '24px' }}>
        <h3 className="text-center mb-4">Pizza Store</h3>
        <p className="text-center text-danger fw-bold mb-2">Welcome Back</p>
        <h5 className="text-center mb-4">{otpStep ? 'Verify Your Login' : 'Login'}</h5>

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
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                placeholder="Enter email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isInvalid={formik.touched.email && !!formik.errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                placeholder="Enter password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                isInvalid={formik.touched.password && !!formik.errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {formik.errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Button
              variant="danger"
              type="submit"
              className="w-100 rounded-pill fw-bold shadow-sm"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? 'Sending OTP...' : 'Login'}
            </Button>
          </Form>
        )}

        <div className="text-center mt-3">
          <span className="text-muted">Don't have an account? </span>
          <Link to="/register" className="btn btn-danger rounded-pill px-4 fw-bold shadow-sm">
            Register
          </Link>
        </div>
      </Card>
    </Container>
  );
};

export default Login;
