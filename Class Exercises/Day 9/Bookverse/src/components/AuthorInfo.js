import React from 'react';

class AuthorInfo extends React.Component {
  componentDidMount() {
    console.log('AuthorInfo mounted');
  }

  componentDidUpdate(prevProps) {
    if (prevProps.author !== this.props.author) {
      console.log('AuthorInfo received new author:', this.props.author);
    }
  }

  renderTopBooks(authorName, books) {
    if (!authorName) return null;
    const authored = books.filter(b => b.author === authorName);
    const top3 = authored.slice(0, 3);
    return (
      <ul className="list-group list-group-flush">
        {top3.map(b => (
          <li key={b.id} className="list-group-item">{b.title} <small className="text-muted">({b.year})</small></li>
        ))}
      </ul>
    );
  }

  render() {
    const { author, books } = this.props;
    return (
      <div className="author-panel">
        <h5>Author Info</h5>
        {!author ? (
          <p className="text-muted">Click any book to view author details and top books.</p>
        ) : (
          <div>
            <h6>{author.name}</h6>
            <p className="text-muted">{author.bio}</p>
            <hr />
            <h6>Top books</h6>
            {this.renderTopBooks(author.name, books)}
          </div>
        )}
      </div>
    );
  }
}

export default AuthorInfo;
