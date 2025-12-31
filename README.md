# Vidtube

A video sharing platform backend.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary Account

## Installation

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Configure environment variables:
    - Copy `.env.example` to `.env`
    - Update the values in `.env` with your credentials

## Running the Application

### Backend

1.  Navigate to root directory.
2.  Run development server:
    ```bash
    npm run dev
    ```
    Server runs on `http://localhost:3000`.

### Frontend

1.  Navigate to `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run development server:
    ```bash
    npm run dev
    ```
    Frontend runs on `http://localhost:5173`.

## API Endpoints

- **Health Check**: `GET /api/v1/healthcheck`
- **Users**: `/api/v1/users`
- **Videos**: `/api/v1/videos`
- **Dashboard**: `/api/v1/dashboard`
