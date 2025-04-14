## Prerequisites

- Docker and Docker Compose
- Node.js v18+ (for local development)
- MongoDB (handled by Docker)
- Redis (handled by Docker)

## Installation & Running

### Using Docker

1. Clone the repository:

   ```
   git clone https://github.com/mohit8285/pubsub-microservice.git
   cd pubsub-microservice
   ```

2. Create a `.env` file in the root directory (or use the provided one)

3. Start the services using Docker Compose:

   ```
   docker-compose up --build
   ```

4. The receiver service will be available at: `http://localhost:3000/api/receiver`

## Testing

Run tests using:

```
cd receiver-service && npm test
cd ../listener-service && npm test
```

## API Documentation

### POST /api/receiver

Endpoint to receive user data.

**Request Body:**

```json
{
  "user": "Harry",
  "class": "Comics",
  "age": 22,
  "email": "harry@potter.com"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "id": "b74bd9c2-8590-4149-9628-3f738099831a",
    "user": "Harry",
    "class": "Comics",
    "age": 22,
    "email": "harry@potter.com",
    "inserted_at": "2024-03-25T12:00:00+05:30"
  }
}
```
