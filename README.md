# Watermark API Service

A RESTful API service built with NestJS that applies watermarks to uploaded images. The service handles file uploads, applies text or image watermarks, and returns processed images with async processing support.

## Features

- **Text Watermarks**: Apply customizable text watermarks with font size, position, and opacity control
- **Image Watermarks**: Apply image watermarks with resizing, positioning, and opacity options
- **Async Processing**: Queue-based processing using BullMQ for handling large files
- **Multiple Formats**: Support for JPEG, PNG, and WebP image formats
- **Job Status Tracking**: Real-time status updates for watermarking jobs
- **Swagger Documentation**: Interactive API documentation

## API Endpoints

- `POST /api/watermark/text` - Apply text watermark to uploaded image
- `POST /api/watermark/image` - Apply image watermark to uploaded image
- `GET /api/watermark/status/:jobId` - Check processing status

## Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- Redis (for queue management)
- MongoDB (for job storage)

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start infrastructure services:
```bash
docker compose up -d
```

4. Copy environment variables:
```bash
cp example.env .env
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Usage Examples

### Text Watermark
```bash
curl -X POST http://localhost:3000/api/watermark/text \
  -F "file=@image.jpg" \
  -F "text=© My Brand" \
  -F "fontSize=48" \
  -F "gravity=southeast" \
  -F "opacity=0.7"
```

### Image Watermark
```bash
curl -X POST http://localhost:3000/api/watermark/image \
  -F "file=@image.jpg" \
  -F "watermark=@logo.png" \
  -F "gravity=southeast" \
  -F "opacity=0.5" \
  -F "width=150"
```

### Check Job Status
```bash
curl http://localhost:3000/api/watermark/status/{jobId}
```

## Configuration

Environment variables in `.env`:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode
- `MONGO_URI` - MongoDB connection URI
- `REDIS_URL` - Redis connection URL
- `UPLOAD_DIR` - Directory for file uploads
- `CONCURRENCY` - Queue processing concurrency
- `CLOUDFLARE_R2_ENDPOINT` - Endpoint
- `CLOUDFLARE_R2_ACCESS_KEY_ID` - Access Key ID
- `CLOUDFLARE_R2_SECRET_ACCESS_KEY` - Secret Access Key
- `CLOUDFLARE_R2_BUCKET` - Bucket

## Architecture

The service follows NestJS best practices with:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and job management
- **DTOs**: Data validation using class-validator
- **Processors**: Background job processing with BullMQ
- **Schemas**: MongoDB data models
- **Utils**: Image processing utilities with Sharp

## API Documentation

Swagger documentation is available at `http://localhost:3000/api` when the server is running.

## License

This project is licensed under the MIT License.

