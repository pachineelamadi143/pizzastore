# Day 22 - Forms, Database, and Authentication

## Folder Structure
```
Day 22/
├── Authentication/
│   └── app.js
├── DataBase Integration/
│   └── app.js
├── Form Handling/
│   └── app.js
└── README.md
```

---

## Challenge 1 - Form Handling
```bash
# Step 1 - Go to folder
cd "Form Handling"

# Step 2 - Install dependencies
npm install express body-parser

# Step 3 - Run
node app.js
```

**Open browser:** http://localhost:3000

**Expected Output:**
```
🚀 Server running on http://localhost:3000
```
✅ Fill the form with First & Last name → See "Registration successful for John Doe"

---

## Challenge 2 - Database Integration
```bash
# Step 1 - Open new terminal and start MongoDB
mongod

# Step 2 - Go to folder (new terminal)
cd "DataBase Integration"

# Step 3 - Install dependencies
npm install express body-parser mongoose

# Step 4 - Run
node app.js
```

**Open browser:** http://localhost:3000

**Expected Output:**
```
🚀 Server running on http://localhost:3000
✅ MongoDB connected
✅ User saved to MongoDB: { firstName: 'John', lastName: 'Doe' }
```
✅ Fill the form → Data saved to MongoDB

---

## Challenge 3 - Authentication and RBAC
```bash
# Step 1 - Go to folder
cd "Authentication"

# Step 2 - Install dependencies
npm install express body-parser express-session passport passport-local bcrypt

# Step 3 - Run
node app.js
```

**Open browser:** http://localhost:3000

**Expected Output:**
```
🚀 Server running on http://localhost:3000

📋 Test Credentials:
   Admin → username: admin | password: admin123
   User  → username: john  | password: john123
```

**Test Credentials:**

| Username | Password | Role  | Result             |
|----------|----------|-------|--------------------|
| admin    | admin123 | admin | ✅ Welcome, Admin! |
| john     | john123  | user  | ❌ Access Denied   |

---

## Best Practices
- Always hash passwords before saving (use bcrypt)
- Store secrets like DB credentials in .env files
- Use sessions or JWT for authentication
- Keep validation logic server-side