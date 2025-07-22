# Full-Stack Product Management Application with AI Integration

A comprehensive product management system featuring a React frontend, Express.js backend, PostgreSQL database, and AI-powered tag suggestions using Ollama.

## 🌟 Features

### Core Functionality

- ✅ **Complete CRUD Operations**: Create, read, update, and delete products
- ✅ **Real-time Data**: React Query for efficient data fetching and caching
- ✅ **Form Validation**: Client and server-side validation with detailed error messages
- ✅ **Responsive Design**: Modern UI built with TailwindCSS
- ✅ **Authentication**: Token-based authentication system

### AI Integration

- 🤖 **AI-Powered Tag Suggestions**: Ollama integration for intelligent tag generation
- 🔄 **Fallback System**: Smart fallback when AI service is unavailable
- ⚡ **Real-time Suggestions**: Generate tags based on product name and description

### Technical Excellence

- 🐳 **Containerized**: Full Docker setup with Docker Compose
- 📚 **API Documentation**: Interactive Swagger/OpenAPI documentation
- 🧪 **Testing**: Comprehensive test suite with Jest and Supertest
- 🔒 **Security**: Helmet, CORS, and input validation
- 📊 **Database**: PostgreSQL with TypeORM and migrations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │ Express Backend │    │   PostgreSQL    │
│   (Port 3000)   │◄──►│   (Port 8080)   │◄──►│   (Port 5432)   │
│                 │    │                 │    │                 │
│ • TailwindCSS   │    │ • TypeScript    │    │ • Product Data  │
│ • React Query   │    │ • Express.js    │    │ • TypeORM       │
│ • React Router  │    │ • TypeORM       │    │ • Migrations    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │  Ollama AI      │
                       │  (Port 11434)   │
                       │                 │
                       │ • Mistral Model │
                       │ • Tag Generation│
                       └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

1. **Docker & Docker Compose** (recommended)
2. **Node.js 18+** (for development)
3. **Ollama** (for AI features)

### Option 1: Full Docker Setup (Recommended)

1. **Install Ollama** (on your host machine):

   ```bash
   # On macOS
   brew install ollama

   # On Linux
   curl -fsSL https://ollama.ai/install.sh | sh

   # Start Ollama service
   ollama serve

   # Pull the Mistral model
   ollama pull mistral
   ```

2. **Clone and start the application**:

   ```bash
   git clone <repository-url>
   cd egzon-task

   # Start all services
   docker-compose up -d
   ```

3. **Access the application**:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8080
   - **API Documentation**: http://localhost:8080/docs
   - **Health Check**: http://localhost:8080/health

### Option 2: Development Setup

1. **Setup Backend**:

   ```bash
   cd backend
   npm install

   # Setup environment variables
   cp .env.example .env
   # Edit .env with your database credentials

   # Start PostgreSQL (if not using Docker)
   docker run --name postgres-dev \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=product_db \
     -p 5432:5432 -d postgres:15-alpine

   # Start backend
   npm run dev
   ```

2. **Setup Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔐 Authentication

The application uses simple token-based authentication:

- **Token**: `SECRET_TOKEN` (configurable via environment variable)
- **Login**: Use the token on the login page
- **API**: Include `Authorization: Bearer SECRET_TOKEN` header

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
SECRET_TOKEN=SECRET_TOKEN

# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=product_db

# Ports
API_PORT=8080
FRONTEND_PORT=3000

# AI Integration
OLLAMA_URL=http://host.docker.internal:11434
OLLAMA_MODEL=mistral
```

## 📊 Database Schema

### Product Entity

```typescript
interface Product {
  id: string; // UUID primary key
  name: string; // Product name (max 255 chars)
  description: string; // Product description (max 1000 chars)
  tags: string[]; // Array of tags
  price: number; // Price in USD (2 decimal places)
  createdAt: Date; // Auto-generated creation timestamp
  updatedAt: Date; // Auto-generated update timestamp
}
```

## 🔌 API Endpoints

### Products

- `GET /products` - List all products
- `POST /products` - Create a new product
- `GET /products/:id` - Get product by ID
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### AI Integration

- `POST /suggest-tags` - Generate AI-powered tag suggestions

### System

- `GET /health` - Health check
- `GET /docs` - API documentation

### Example API Usage

```bash
# Create a product
curl -X POST http://localhost:8080/products \
  -H "Authorization: Bearer SECRET_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Headphones",
    "description": "High-quality wireless headphones with noise cancellation",
    "tags": ["electronics", "audio", "wireless"],
    "price": 199.99
  }'

# Get AI tag suggestions
curl -X POST http://localhost:8080/suggest-tags \
  -H "Authorization: Bearer SECRET_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Smart Watch",
    "description": "Fitness tracking smartwatch with heart rate monitor"
  }'
```

## 🤖 AI Integration

### Ollama Setup

The application integrates with Ollama for AI-powered tag suggestions:

1. **Install Ollama**:

   ```bash
   # Install Ollama
   curl -fsSL https://ollama.ai/install.sh | sh

   # Start Ollama service
   ollama serve

   # Pull the Mistral model
   ollama pull mistral
   ```

2. **How it works**:

   - User enters product name and description
   - Clicks "🤖 Auto-Suggest Tags" button
   - Backend sends prompt to Ollama's Mistral model
   - AI generates relevant tags based on product information
   - Tags are automatically populated in the form

3. **Fallback System**:
   - If Ollama is unavailable, the system uses smart keyword extraction
   - Analyzes product name/description for relevant terms
   - Ensures the feature always works

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test                    # Run all tests
npm run test:watch         # Run tests in watch mode
npm test -- --coverage    # Run with coverage report
```

### Test Coverage

- ✅ Product CRUD operations
- ✅ Authentication middleware
- ✅ Validation error handling
- ✅ Database operations
- ✅ API endpoint testing

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs -f frontend

# Stop services
docker-compose down

# Rebuild services
docker-compose up -d --build

# Run backend tests in container
docker-compose exec api npm test

# Access database
docker-compose exec db psql -U postgres -d product_db
```

## 🎯 Production Deployment

### Environment Setup

1. Set production environment variables
2. Configure database credentials
3. Set up proper domain names
4. Configure SSL/TLS certificates

### Build and Deploy

```bash
# Build production images
docker build -t product-backend ./backend
docker build -t product-frontend ./frontend

# Deploy with your preferred orchestration platform
# (Kubernetes, Docker Swarm, AWS ECS, etc.)
```

## 🛠️ Development

### Project Structure

```
egzon-task/
├── backend/                 # Express.js API
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── entity/         # TypeORM entities
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── index.ts        # Application entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript types
│   │   └── App.tsx        # Application root
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml      # Services orchestration
└── README.md              # This file
```

### Adding New Features

1. **Backend**: Add routes in `backend/src/routes/`
2. **Frontend**: Add components in `frontend/src/components/`
3. **Database**: Create migrations with TypeORM
4. **Tests**: Add tests alongside feature files

### Code Quality

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code quality and consistency
- **Prettier**: Code formatting
- **Validation**: Input validation on both client and server

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**:

   ```bash
   # Check if PostgreSQL is running
   docker-compose ps

   # View database logs
   docker-compose logs db
   ```

2. **Ollama Not Working**:

   ```bash
   # Check if Ollama is running
   curl http://localhost:11434/api/version

   # Pull the model
   ollama pull mistral
   ```

3. **Frontend Can't Connect to API**:

   - Check API is running on port 8080
   - Verify CORS configuration
   - Check authentication token

4. **Docker Build Issues**:

   ```bash
   # Clean Docker cache
   docker system prune -a

   # Rebuild without cache
   docker-compose build --no-cache
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Development Workflow

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Run tests before committing
cd backend && npm test
cd frontend && npm run test

# Build production images
docker-compose build
```

## 📈 Performance

- **React Query**: Intelligent caching and background updates
- **Database Indexing**: Optimized queries with proper indexes
- **Docker Multi-stage**: Optimized production images
- **Nginx**: Static file serving and compression
- **Health Checks**: Built-in monitoring and auto-restart

## 🔒 Security

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Input Validation**: Comprehensive validation on all inputs
- **SQL Injection**: Protection via TypeORM
- **XSS Protection**: Content Security Policy headers

## 📝 License

MIT License - see LICENSE file for details

---

## 🎉 Get Started

Ready to explore the application? Follow these steps:

1. **Start the services**: `docker-compose up -d`
2. **Open the app**: http://localhost:3000
3. **Login**: Use token `SECRET_TOKEN`
4. **Create products**: Use the intuitive interface
5. **Try AI features**: Click "🤖 Auto-Suggest Tags"
6. **Explore API**: Visit http://localhost:8080/docs

**Happy coding! 🚀**
