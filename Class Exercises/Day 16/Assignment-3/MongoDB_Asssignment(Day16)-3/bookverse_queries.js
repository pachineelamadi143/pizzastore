// BookVerse - Indexing Commands
db.books.createIndex({ genre: 1 });
db.books.createIndex({ authorId: 1 });
db.books.createIndex({ "ratings.score": 1 });
db.books.dropIndex("ratings.score_1");

// Aggregation 1: Average rating per book
db.books.aggregate([
  { $unwind: "$ratings" },
  { $group: { _id: "$title", avgRating: { $avg: "$ratings.score" } } }
]);

// Aggregation 2: Top 3 highest rated books
db.books.aggregate([
  { $unwind: "$ratings" },
  { $group: { _id: "$title", avgRating: { $avg: "$ratings.score" } } },
  { $sort: { avgRating: -1 } },
  { $limit: 3 }
]);

// Aggregation 3: Count books per genre
db.books.aggregate([
  { $group: { _id: "$genre", totalBooks: { $sum: 1 } } }
]);

// Aggregation 4: Authors with more than 2 books
db.books.aggregate([
  { $group: { _id: "$authorId", totalBooks: { $sum: 1 } } },
  { $match: { totalBooks: { $gt: 2 } } }
]);

// Aggregation 5: Total rating points per author
db.books.aggregate([
  { $unwind: "$ratings" },
  { $group: { _id: "$authorId", totalPoints: { $sum: "$ratings.score" } } }
]);