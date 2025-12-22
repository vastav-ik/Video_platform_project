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

## Running the Server

- **Development Mode**:

  ```bash
  npm run dev
  ```

- **Production Mode**:
  ```bash
  npm start
  ```

## API Endpoints

- **Health Check**: `GET /api/v1/healthcheck`
- **Users**: `/api/v1/users`
- **Videos**: `/api/v1/videos`
- **Dashboard**: `/api/v1/dashboard`
