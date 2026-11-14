# PageTurn Library - Learning Group 02

**Theme:** Book lending
**Twist:** Soft delete and restore

## Team Members & Task Breakdown

| Name | Registration Number | Assigned Task | Role Size |
| :--- | :--- | :--- | :--- |
| Sadhu Jahnavi | 252U1R1222 | **Database & Server Setup:** Express init, SQLite tables (readers, books, loans) | Major |
| Sambu Bhavishya | 252U1R1224 | **Core REST Endpoints:** GET, POST, PUT, and the loans JOIN query | Major |
| Samala Ashwitha | 252U1R1223 | **Validation & Search:** Input validation (400 errors) and genre search query | Major |
| Sannikanti Venkata Datthathreya | 252U1R1226 | **Twist Logic:** Soft delete flag, hidden GET filter, and restore endpoint | Major |
| Sampath Uday Kumar | 252U1R1225 | **Testing & Docs:** Postman collection generation and README documentation | Major |

## Setup and Run
1. Install dependencies:
   ```bash
   npm install

## Postman API Testing Results

**1. Get All Books (GET)**
![Get All Books](screenshots/get-all-books.png)

**2. Get Book via ID (GET)**
![Get Book via ID](screenshots/get-book-by-id.png)

**3. Create a Book (POST)**
![Create Book](screenshots/create-book.png)

**4. Update a Book (PUT)**
![Update Book](screenshots/update-book.png)

**5. Get Loan Details (GET)**
![Get Loan Details](screenshots/get-loan-details.png)

**6. Delete a Book (DELETE - Twist)**
![Delete Book](screenshots/delete-book.png)

**7. Restoring a Book (POST - Twist)**
![Restore Book](screenshots/restore-book.png)