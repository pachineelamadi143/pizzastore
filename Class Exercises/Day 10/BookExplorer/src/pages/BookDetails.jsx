import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import withLoading from '../components/withLoading';
import LoadingStatus from '../components/LoadingStatus';
import '../styles/BookDetails.css';

const BookContent = ({ book }) => {
  return (
    <div className="book-details-content fade-in">
      <Link to="/" className="back-button">← Back to Home</Link>
      
      <div className="book-details-card">
        <div className="book-header">
          <h1>{book.title}</h1>
          <p className="author-name">by {book.author}</p>
        </div>

        <div className="book-meta">
          <div className="meta-item">
            <span className="meta-label">Category:</span>
            <span className="meta-value">{book.category}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Pages:</span>
            <span className="meta-value">{book.pages}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Year:</span>
            <span className="meta-value">{book.year}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Rating:</span>
            <span className="meta-value">⭐ {book.rating}/5</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Price:</span>
            <span className="meta-value price">${book.price}</span>
          </div>
        </div>

        <div className="book-description">
          <h2>Description</h2>
          <p>{book.description}</p>
        </div>

        <div className="book-actions">
          <button className="btn btn-primary">Add to Cart</button>
          <button className="btn btn-secondary">Add to Wishlist</button>
        </div>
      </div>
    </div>
  );
};

const BookContentWithLoading = withLoading(BookContent);

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        setIsLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const response = await axios.get(`http://localhost:3001/books/${id}`);
        setBook(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching book:', err);
        setError('Book not found. Make sure json-server is running.');
        // Redirect to home after 2 seconds
        setTimeout(() => navigate('/'), 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [id, navigate]);

  if (error) {
    return (
      <div className="book-details-container error-state">
        <div className="error-message">
          <h2>❌ {error}</h2>
          <Link to="/" className="back-button">Return to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <LoadingStatus isLoading={!isLoading && book} userName="Book Explorer">
      {({ userName }) => (
        <div className="book-details-container fade-in">
          <p className="user-greeting">Hello, {userName}! 👋</p>
          {isLoading ? (
            <BookContentWithLoading isLoading={true} book={null} />
          ) : (
            book && <BookContentWithLoading isLoading={false} book={book} />
          )}
        </div>
      )}
    </LoadingStatus>
  );
};

export default BookDetails;
