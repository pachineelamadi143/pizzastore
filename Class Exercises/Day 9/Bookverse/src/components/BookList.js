import React from 'react';
import BookCard from './BookCard';

class BookList extends React.Component {
  componentDidMount() {
    // Demonstrate lifecycle method for data loading
    console.log('BookList mounted — books available:', this.props.books.length);
  }

  render() {
    const { books, onBookClick } = this.props;
    return (
      <div>
        <div className="row">
          <div className="col-12">
            <div className="list-group">
              {books.map(book => (
                <BookCard key={book.id} book={book} onClick={onBookClick} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default BookList;
