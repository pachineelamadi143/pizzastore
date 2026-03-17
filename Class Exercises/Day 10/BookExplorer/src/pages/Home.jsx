import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import withLoading from '../components/withLoading';
import LoadingStatus from '../components/LoadingStatus';
import '../styles/Home.css';

const BooksList = ({ books }) => {
  return (
    <div className="books-grid">
      {books.map((book) => (
        <div key={book.id} className="book-card fade-in">
          <div className="book-card-content">
            <h2>{book.title}</h2>
            <p className="author">by {book.author}</p>
            <p className="category">{book.category}</p>
            <p className="rating">⭐ {book.rating}/5</p>
            <p className="price">${book.price}</p>
            <Link 
              to={`/book/${book.id}`} 
              className="view-details-btn"
            >
              View Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

const BooksListWithLoading = withLoading(BooksList);

const Home = () => {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        // Simulate network delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const response = await axios.get('http://localhost:3001/books');
        setBooks(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('Failed to load books. Make sure json-server is running on port 3001');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, []);

  return (
    <LoadingStatus isLoading={!isLoading} userName="Book Lover">
      {({ isLoading: loadingStatus }) => (
        <div className="home-container fade-in">
          <header className="home-header">
            <h1>📚 BookVerse</h1>
            <p>Explore & Navigate Between Pages</p>
          </header>

          {error && (
            <div className="error-message">
              <p>{error}</p>
              <p className="error-hint">Start json-server with: npx json-server --watch books.json --port 3001</p>
            </div>
          )}

          {isLoading && <BooksListWithLoading isLoading={true} books={[]} />}
          
          {!isLoading && books.length > 0 && (
            <>
              <p className="books-count">Found {books.length} books</p>
              <BooksListWithLoading isLoading={false} books={books} />
            </>
          )}

          {!isLoading && books.length === 0 && !error && (
            <div className="no-books">
              <p>No books found</p>
            </div>
          )}
        </div>
      )}
    </LoadingStatus>
  );
};

export default Home;
