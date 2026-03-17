import React from 'react';
import PropTypes from 'prop-types';

class BookCard extends React.Component {
  handleClick = () => {
    const { book, onClick } = this.props;
    if (onClick) onClick(book);
  };

  render() {
    const { book } = this.props;
    return (
      <div className="card card-book mb-3" onClick={this.handleClick}>
        <div className="row g-0">
          <div className="col">
            <div className="card-body">
              <h5 className="card-title">{book.title}</h5>
              <p className="card-text mb-1"><small className="text-muted">{book.author} • {book.year}</small></p>
              <p className="card-text"><small>{book.title.length > 100 ? book.title.slice(0,100)+'...' : ''}</small></p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

BookCard.propTypes = {
  book: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    year: PropTypes.number,
    cover: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func
};

export default BookCard;
