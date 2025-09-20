
# Real-Time Polling Application API

[cite_start]This project is a backend service for a real-time polling application, built for the Move37 Ventures Backend Developer Challenge. [cite: 1] [cite_start]It features a RESTful API for managing users and polls, and uses WebSockets for live result updates. [cite: 9]

## Technologies Used

* [cite_start]**Backend**: Node.js, Express.js [cite: 11]
* [cite_start]**Database**: PostgreSQL [cite: 11]
* [cite_start]**ORM**: Prisma [cite: 12]
* [cite_start]**Real-time**: WebSockets [cite: 13]

## Setup and Installation

1.  **Clone the repository**:
    ```bash
    git clone <your-repo-url>
    cd <your-repo-name>
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up the database**:
    * Make sure you have PostgreSQL running.
    * Create a `.env` file in the root of the project.
    * Add your database connection string to the `.env` file:
        ```env
        DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/YOUR_DB_NAME?schema=public"
        ```

4.  **Run the database migration**:
    This command will create all the necessary tables in your database.
    ```bash
    npx prisma migrate dev
    ```

## How to Run the Application

1.  **Start the development server**:
    ```bash
    npm run dev
    ```
2.  The server will start on `http://localhost:8000`.

## How to Test the Endpoints

[cite_start]You can use an API client like Postman to test the endpoints. 

* `POST /api/users` - Create a new user.
* `POST /api/polls` - Create a new poll.
* `POST /api/polls/:id/vote` - Submit a vote for a poll.
* `GET /api/polls/:id` - Get a poll's details and current results.
