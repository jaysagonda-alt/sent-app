# Backend Folder Structure

All backend files are created below. Copy them into your `backend/` folder following this structure:

```
backend/
├── src/
│   ├── index.ts                 (main server file)
│   └── routes/
│       ├── auth.ts              (authentication endpoints)
│       ├── users.ts             (user profile endpoints)
│       ├── posts.ts             (post CRUD endpoints)
│       ├── messages.ts          (messaging endpoints)
│       ├── connections.ts       (connection requests)
│       └── ai.ts                (AI conversation starters)
├── prisma/
│   └── schema.prisma            (database schema)
├── package.json                 (dependencies)
├── tsconfig.json                (TypeScript config)
├── Dockerfile                   (containerization)
├── docker-compose.yml           (local development)
├── .env                         (environment variables - create from template)
└── .env.example                 (template for .env)
```

## Quick Start

```bash
cd backend

# 1. Copy all files into their locations above

# 2. Create .env file
cp .env.example .env

# 3. Edit .env with your values:
#    - Generate JWT_SECRET: openssl rand -base64 32
#    - Database URL (will use docker postgres)
#    - SMTP settings for email

# 4. Start Docker PostgreSQL
docker-compose up -d

# 5. Wait 10 seconds for postgres to start

# 6. Install dependencies
npm install

# 7. Create database tables
npx prisma migrate dev --name init

# 8. Start backend
npm run dev

# You should see: ✅ Server running on http://localhost:3001
```

## File Descriptions

- **src/index.ts** - Express server setup, middleware, route mounting
- **src/routes/auth.ts** - Signup, login, email verification
- **src/routes/users.ts** - Profile CRUD, search, suggestions
- **src/routes/posts.ts** - Post creation, feed, comments, likes
- **src/routes/messages.ts** - Send/receive messages, conversations
- **src/routes/connections.ts** - Connection requests, accept/reject
- **src/routes/ai.ts** - Conversation starters, daily inspiration
- **prisma/schema.prisma** - Database schema and relationships
- **package.json** - Node dependencies
- **tsconfig.json** - TypeScript configuration
- **Dockerfile** - Production container
- **docker-compose.yml** - Local development (PostgreSQL + backend)
- **.env.example** - Template for environment variables

## Testing the Backend

```bash
# Health check
curl http://localhost:3001/health

# Sign up
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "Password123",
    "missionOrg": "Campus Crusade"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'

# Get posts
curl http://localhost:3001/api/posts
```

## Database Setup

```bash
# View database in UI
npx prisma studio

# Run migrations
npx prisma migrate dev

# Reset database (CAREFUL!)
npx prisma migrate reset
```

All files below ↓↓↓
