const express = require('express');
const path = require('path');
const { open } = require('sqlite');
const sqlite3 = require('sqlite3');

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, 'pageturn.db');
let db = null;

const initializeDBAndServer = async () => {
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // Create the 3 related tables required for the assignment
        // Database tables and server setup verified by Sadhu Jahnavi
        await db.exec(`
            CREATE TABLE IF NOT EXISTS readers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                genre TEXT NOT NULL,
                is_deleted BOOLEAN DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS loans (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                reader_id INTEGER,
                book_id INTEGER,
                FOREIGN KEY (reader_id) REFERENCES readers(id),
                FOREIGN KEY (book_id) REFERENCES books(id)
            );
        `);

        // Insert seed data if the tables are empty to make testing easier
        const { count } = await db.get(`SELECT COUNT(*) AS count FROM books;`);
        if (count === 0) {
            await db.exec(`
                INSERT INTO readers (name) VALUES ('Alice'), ('Datta');
                INSERT INTO books (name, genre) VALUES ('The Hobbit', 'Fantasy'), ('Dune', 'Sci-Fi'), ('1984', 'Dystopian');
                INSERT INTO loans (reader_id, book_id) VALUES (1, 1), (2, 2);
            `);
            console.log("Seed data initialized.");
        }

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server Running at http://localhost:${PORT}/`);
        });
    } catch (error) {
        console.log(`DB Error: ${error.message}`);
        process.exit(1);
    }
};

initializeDBAndServer();


// 1. GET all books (with search query parameter and hiding soft-deleted ones)
app.get('/books', async (req, res) => {
    const { genre } = req.query;
    let query = `SELECT id, name, genre FROM books WHERE is_deleted = 0`;
    const params = [];

    if (genre) {
        query += ` AND genre LIKE ?`;
        params.push(`%${genre}%`);
    }

    const books = await db.all(query, params);
    res.status(200).send(books);
});

// 2. GET a single book
app.get('/books/:id', async (req, res) => {
    const { id } = req.params;
    const book = await db.get(`SELECT id, name, genre FROM books WHERE id = ? AND is_deleted = 0`, [id]);
    
    if (!book) {
        return res.status(404).send({ message: "Book not found" });
    }
    res.status(200).send(book);
});

// 3. POST /books (with Validation for name and genre)
app.post('/books', async (req, res) => {
    const { name, genre } = req.body;

    if (!name || !genre) {
        return res.status(400).send({ message: "Both name and genre are required." });
    }

    const result = await db.run(`INSERT INTO books (name, genre) VALUES (?, ?)`, [name, genre]);
    res.status(201).send({ message: "Book Added Successfully", bookId: result.lastID });
});

// 4. PUT /books/:id (with Validation)
app.put('/books/:id', async (req, res) => {
    const { id } = req.params;
    const { name, genre } = req.body;

    const existingBook = await db.get(`SELECT * FROM books WHERE id = ? AND is_deleted = 0`, [id]);
    if (!existingBook) {
        return res.status(404).send({ message: "Book not found" });
    }

    if (!name || !genre) {
        return res.status(400).send({ message: "Both name and genre are required for update." });
    }

    await db.run(`UPDATE books SET name = ?, genre = ? WHERE id = ?`, [name, genre, id]);
    res.status(200).send({ message: "Book Updated Successfully" });
});

// 5. GET /loans-details (The JOIN endpoint)
app.get('/loans-details', async (req, res) => {
    const joinQuery = `
        SELECT 
            loans.id AS loan_id, 
            readers.name AS reader_name, 
            books.name AS book_name 
        FROM loans
        INNER JOIN readers ON loans.reader_id = readers.id
        INNER JOIN books ON loans.book_id = books.id;
    `;
    const loansData = await db.all(joinQuery);
    res.status(200).send(loansData);
});

// 6. DELETE /books/:id (Soft Delete Twist)
app.delete('/books/:id', async (req, res) => {
    const { id } = req.params;
    
    // Check if it exists and is not already deleted
    const existingBook = await db.get(`SELECT * FROM books WHERE id = ? AND is_deleted = 0`, [id]);
    if (!existingBook) {
        return res.status(404).send({ message: "Book not found" });
    }

    // Update the flag instead of dropping the row
    await db.run(`UPDATE books SET is_deleted = 1 WHERE id = ?`, [id]);
    res.status(200).send({ message: "Book successfully soft-deleted" });
});

// 7. POST /books/:id/restore (Restore Twist)
app.post('/books/:id/restore', async (req, res) => {
    const { id } = req.params;

    // Check if the book exists but IS currently deleted
    const existingBook = await db.get(`SELECT * FROM books WHERE id = ? AND is_deleted = 1`, [id]);
    if (!existingBook) {
        return res.status(404).send({ message: "Deleted book not found" });
    }

    // Revert the flag to bring it back
    await db.run(`UPDATE books SET is_deleted = 0 WHERE id = ?`, [id]);
    res.status(200).send({ message: "Book restored successfully" });
});