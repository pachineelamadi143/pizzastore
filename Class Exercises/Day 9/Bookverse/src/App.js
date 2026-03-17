import React from 'react';
import BookList from './components/BookList';
import AuthorInfo from './components/AuthorInfo';
import SearchBar from './components/SearchBar';

const sampleBooks = [
  {
    id: 1,
    title: 'The Dawn of React',
    author: 'A. Celeste',
    bio: 'A. Celeste writes modern frontend guides that blend theory and practice.',
    year: 2020
  },
  {
    id: 2,
    title: 'Patterns in UI',
    author: 'A. Celeste',
    bio: 'A. Celeste writes modern frontend guides that blend theory and practice.',
    year: 2018
  },
  {
    id: 3,
    title: 'Advanced Components',
    author: 'M. Rivera',
    bio: 'M. Rivera explores component design and architecture.',
    year: 2021
  },
  {
    id: 4,
    title: 'Styling at Scale',
    author: 'A. Celeste',
    bio: 'A. Celeste writes modern frontend guides that blend theory and practice.',
    year: 2019
  },
  {
    id: 5,
    title: 'State & Life',
    author: 'M. Rivera',
    bio: 'M. Rivera explores component design and architecture.',
    year: 2017
  }
];

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      books: sampleBooks,
      selectedAuthor: null
    };
  }

  handleBookClick = (book) => {
    this.setState({ selectedAuthor: { name: book.author, bio: book.bio } });
  };

  render() {
    const { books, selectedAuthor } = this.state;
    return (
      <div className="container app-container">
        <div className="row mb-3">
          <div className="col-12 col-md-8">
            <h1>BookVerse</h1>
            <p className="text-muted">Click a book to view author details and top works.</p>
          </div>
          <div className="col-12 col-md-4 d-flex align-items-center justify-content-end">
            <SearchBar />
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <BookList books={books} onBookClick={this.handleBookClick} />
          </div>
          <div className="col-lg-4 mt-4 mt-lg-0">
            <AuthorInfo author={selectedAuthor} books={books} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
