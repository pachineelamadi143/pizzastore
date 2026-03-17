const express = require('express');
const router = express.Router();

let books = [
  { id: 1, title: '1984', author: 'Orwell' },
  { id: 2, title: 'The Alchemist', author: 'Coelho' }
];
let nextId = 3;

// GET all books
router.get('/', (req, res) => {
  res.json(books);
});

// POST - add a book
router.post('/', (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).json({ error: 'title and author required' });
  }
  const newBook = { id: nextId++, title, author };
  books.push(newBook);
  res.status(201).json(newBook);
});

// PUT - update a book
router.put('/:id', (req, res) => {
  const book = books.find(b => b.id === parseInt(req.params.id));
  if (!book) return res.status(404).json({ error: 'Book not found' });
  const { title, author } = req.body;
  if (title) book.title = title;
  if (author) book.author = author;
  res.json(book);
});

// DELETE - delete a book
router.delete('/:id', (req, res) => {
  const index = books.findIndex(b => b.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Book not found' });
  res.json({ message: 'Deleted', book: books.splice(index, 1)[0] });
});

module.exports = router;