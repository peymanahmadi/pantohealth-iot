# PANTOhealth IoT Data Management System (Monorepo)

## Overview

This monorepo project implements an IoT data management system for processing x-ray data from IoT devices. Built with NestJS, RabbitMQ, and MongoDB, the system features:

- **Producer Service** (Port 3001): REST API for submitting x-ray data
- **Consumer Service** (Port 3000): Processes and stores x-ray data
- **RabbitMQ**: Message broker for reliable data processing
- **MongoDB**: Persistent storage for x-ray data
- **Swagger Documentation**: Interactive API docs at `/api` for both services

## Monorepo Architecture Benefits

1. **Unified Development**:
   - Single repository for both producer and consumer services
   - Shared configuration and DTOs between services
   - Consistent coding standards across all components

2. **Simplified Dependency Management**:
   - Centralized `package.json` for common dependencies
   - Workspace-aware dependency resolution
   - Atomic version updates across services

3. **Streamlined CI/CD**:
   - Single pipeline for building, testing, and deploying all services
   - Cross-service testing capabilities
   - Coordinated version releases

4. **Enhanced Collaboration**:
   - End-to-end visibility of system changes
   - Simplified onboarding for new developers
   - Atomic commits affecting multiple services

## System Setup

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 16+ (optional for development)

### Quick Start
```bash
# Clone repository
git clone https://github.com/peymanahmadi/pantohealth-iot.git
cd pantohealth-iot

# Copy environment file
cp .env.example .env

# Build and start all services
docker-compose up --build
```

## API Endpoints

### Producer Service (Port 3001)
| Endpoint | Method | Description | Example Request |
|----------|--------|-------------|-----------------|
| `/producer/send-xray` | POST | Submit x-ray data | See below |
| `/producer/send-sample-xray` | POST | Submit sample data | `curl -X POST http://localhost:3001/producer/send-sample-xray` |

**Submit X-Ray Data:**
```bash
curl -X POST http://localhost:3001/producer/send-xray \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device-123",
    "time": 1735683480000,
    "data": [
      {
        "time": 1735683480000,
        "coordinatesAndSpeed": [51.339764, 12.339223, 1.2038]
      },
      {
        "time": 1735683481000,
        "coordinatesAndSpeed": [51.339777, 12.339211, 1.5316]
      }
    ]
  }'
```

### Consumer Service (Port 3000)
| Endpoint | Method | Description | Example Request |
|----------|--------|-------------|-----------------|
| `/signals` | GET | Retrieve stored x-ray data | `curl http://localhost:3000/signals` |
| `/signals?deviceId={id}` | GET | Filter by device ID | `curl http://localhost:3000/signals?deviceId=test-device-123` |

## Development Guide

### Running Services Individually
```bash
# Start dependencies
docker-compose up rabbitmq mongodb

npm install
# Run producer service
npm run start:dev

# Run consumer service (in another terminal)
npm run start:dev
```

## API Documentation

Swagger documentation is automatically available at:
- Producer: http://localhost:3001/api
- Consumer: http://localhost:3000/api

### Testing
```bash
# Run all tests
npm run test

# Test specific service
npm run test:consumer
npm run test:producer

# Test with coverage
npm run test:cov
```

### Debugging
```bash
# View RabbitMQ queues
open http://localhost:15672

# Access MongoDB
docker exec -it pantohealth-iot-mongodb-1 mongosh pantohealth

# View logs
docker-compose logs -f producer
docker-compose logs -f consumer
```

## Production Deployment

### Docker Configuration
```yaml
services:
  producer:
    build: ./apps/producer
    ports:
      - "3001:3001"
    depends_on:
      rabbitmq:
        condition: service_healthy

  consumer:
    build: ./apps/consumer  
    ports:
      - "3000:3000"
    depends_on:
      rabbitmq:
        condition: service_healthy
      mongodb:
        condition: service_healthy
```

### Environment Variables
```env
# RabbitMQ
RABBITMQ_URL=amqp://rabbitmq:5672
RABBITMQ_QUEUE=x-ray

# MongoDB  
MONGO_URL=mongodb://mongodb:27017/pantohealth

# Services
CONSUMER_PORT=3000
PRODUCER_PORT=3001
```

## Monitoring and Maintenance

### Health Checks
- RabbitMQ: `http://localhost:15672/#/health`
- MongoDB: `docker exec mongodb mongosh --eval "db.adminCommand('ping')"`

### Performance Metrics
```bash
# View container resource usage
docker stats

# Check queue status
curl -u guest:guest http://localhost:15672/api/queues

# Database indexes
docker exec mongodb mongosh pantohealth --eval "db.getCollection('signals').getIndexes()"
```