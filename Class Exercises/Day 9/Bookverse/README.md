# BookVerse — Author Details and Styling (Lesson)

This is a small React app demonstrating:

- Class components and lifecycle methods
- PropTypes validation in `BookCard`
- Uncontrolled components / refs (focus search input)
- Component composition (BookList, BookCard, AuthorInfo)
- Bootstrap + CSS styling

Quick start:

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm start
```

Open http://localhost:3000

Files of interest:

- `src/components/BookCard.js` — class component with `PropTypes`
- `src/components/AuthorInfo.js` — class component showing author bio and top 3 books
- `src/components/SearchBar.js` — demonstrates `ref` focusing on an uncontrolled input
- `src/components/BookList.js` — renders `BookCard` components and logs in `componentDidMount`
