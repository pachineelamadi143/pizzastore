import React from 'react';
import BookCard from './BookCard';

export default function BookList({ books = [], view = 'grid' }) {
  return (
    <section className={`book-list ${view}`}>
      {books.length === 0 ? (
        <div className="empty">No books match your search.</div>
      ) : (
        books.map((b) => (
          <BookCard key={b.id} title={b.title} author={b.author} price={b.price} />
        ))
      )}
    </section>
  );
}
