import React from 'react';

export default function BookCard({ title, author, price }) {
  return (
    <article className="book-card" tabIndex="0">
      <div className="book-info">
        <h3 className="book-title">{title}</h3>
        <p className="book-author">{author}</p>
      </div>
      <div className="book-price">${price.toFixed(2)}</div>
    </article>
  );
}
