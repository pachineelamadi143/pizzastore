/**
 * AddBookForm.js
 * Component for adding new books with form validation
 * Uses Formik for form handling and Yup for validation
 * Integrates with Flux by dispatching ADD_BOOK action
 */

import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { addBook } from '../flux/Actions';
import './AddBookForm.css';

/**
 * Validation Schema using Yup
 * Defines validation rules for form fields
 */
const validationSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must not exceed 100 characters')
    .required('Title is required'),
  author: Yup.string()
    .min(2, 'Author name must be at least 2 characters')
    .max(100, 'Author name must not exceed 100 characters')
    .required('Author is required'),
  price: Yup.number()
    .typeError('Price must be a number')
    .positive('Price must be a positive number')
    .required('Price is required'),
});

/**
 * AddBookForm Component
 * Demonstrates:
 * - Formik for form state management
 * - Yup for form validation
 * - Integration with Flux action dispatch
 * - Uncontrolled form inputs with Formik
 */
const AddBookForm = ({ onBookAdded }) => {
  const handleFormSubmit = (values, { resetForm }) => {
    try {
      // Dispatch ADD_BOOK action to Flux
      addBook({
        title: values.title.trim(),
        author: values.author.trim(),
        price: parseFloat(values.price),
      });

      // Reset form after successful submission
      resetForm();

      // Call callback if provided
      if (onBookAdded) {
        onBookAdded();
      }

      // Show success message
      alert('Book added successfully!');
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Error adding book. Please try again.');
    }
  };

  return (
    <div className="add-book-container">
      <div className="form-card">
        <h2>➕ Add New Book</h2>
        <p className="form-subtitle">Expand your BookVerse collection</p>

        <Formik
          initialValues={{
            title: '',
            author: '',
            price: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleFormSubmit}
          validateOnChange={true}
          validateOnBlur={true}
        >
          {({ values, errors, touched, isSubmitting, isValid, dirty }) => (
            <Form className="book-form">
              {/* Title Field */}
              <div className="form-group">
                <label htmlFor="title">
                  Book Title <span className="required">*</span>
                </label>
                <Field
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Enter book title"
                  className={`form-input ${
                    touched.title && errors.title ? 'input-error' : ''
                  }`}
                />
                <ErrorMessage name="title">
                  {(msg) => <div className="error-message">{msg}</div>}
                </ErrorMessage>
              </div>

              {/* Author Field */}
              <div className="form-group">
                <label htmlFor="author">
                  Author <span className="required">*</span>
                </label>
                <Field
                  type="text"
                  id="author"
                  name="author"
                  placeholder="Enter author name"
                  className={`form-input ${
                    touched.author && errors.author ? 'input-error' : ''
                  }`}
                />
                <ErrorMessage name="author">
                  {(msg) => <div className="error-message">{msg}</div>}
                </ErrorMessage>
              </div>

              {/* Price Field */}
              <div className="form-group">
                <label htmlFor="price">
                  Price ($) <span className="required">*</span>
                </label>
                <Field
                  type="number"
                  id="price"
                  name="price"
                  placeholder="Enter book price"
                  step="0.01"
                  min="0"
                  className={`form-input ${
                    touched.price && errors.price ? 'input-error' : ''
                  }`}
                />
                <ErrorMessage name="price">
                  {(msg) => <div className="error-message">{msg}</div>}
                </ErrorMessage>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting || (!dirty && !isValid)}
              >
                {isSubmitting ? 'Adding...' : 'Add Book'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddBookForm;
