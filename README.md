## Prerequisites

- Docker and Docker Compose
- Node.js v18+ (for local development)
- MongoDB (handled by Docker)
- Redis (handled by Docker)

## Installation & Running

### Using Docker

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/pubsub-microservice.git
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
