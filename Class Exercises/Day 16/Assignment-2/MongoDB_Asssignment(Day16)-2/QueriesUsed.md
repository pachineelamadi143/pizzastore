## User Story 1 - Database Setup
use BookVerseDB
db.authors.insertMany([...])
db.books.insertMany([...])
db.users.insertMany([...])

## User Story 2 - CRUD Operations
db.books.insertOne({...})          -- Create
db.books.find({genre: "Science Fiction"})  -- Read
db.books.updateOne({...})          -- Update
db.users.deleteOne({...})          -- Delete
db.books.updateOne({$push...})     -- Add rating

## User Story 3 - Filtering Queries
db.books.find({publicationYear: {$gt: 2015}})
db.books.find({genre: "Fantasy"})
db.users.find({joinDate: {$gte: ...}})
db.books.find({"ratings.score": {$gt: 4}})

## To Export .json file
JSON.stringify(db.authors.find().toArray())
JSON.stringify(db.books.find().toArray())
JSON.stringify(db.users.find().toArray())