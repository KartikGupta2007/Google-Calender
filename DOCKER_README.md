# 🐳 Docker Deployment Guide

This guide covers deploying the Google Calendar Clone using Docker with two database options:
1. **Cloud Database (Recommended)**: Use Neon PostgreSQL (already configured)
2. **Local Database**: Use local PostgreSQL container

## 📋 Prerequisites

- Docker Desktop installed
- Docker Compose installed
- `.env.local` file configured (see below)

## 🚀 Quick Start (Using Neon PostgreSQL - Default)

This is the **recommended** approach as your `.env.local` is already configured with Neon.

### 1. Build and Run

```bash
# Build the Docker image
docker-compose build

# Start the application
docker-compose up -d

# View logs
docker-compose logs -f calendar-app
```

The application will:
- ✅ Use your existing Neon PostgreSQL database
- ✅ Automatically push the database schema on startup
- ✅ Be available at http://localhost:3000

### 2. Stop the Application

```bash
docker-compose down
```

---

## 🏠 Alternative: Using Local PostgreSQL Container

If you want to use a local PostgreSQL database instead of Neon:

### 1. Update `.env.local`

Change the `DATABASE_URL` to:
```bash
DATABASE_URL=postgresql://calendar_user:calendar_secure_password_123@postgres:5432/calendar_db?sslmode=disable
```

### 2. Start with Local Database

```bash
# Start both PostgreSQL and the app
docker-compose --profile local-db up -d

# View logs
docker-compose logs -f
```

### 3. Stop Everything

```bash
docker-compose --profile local-db down

# To remove all data:
docker-compose --profile local-db down -v
```

---

## 📝 Environment Variables

Ensure your `.env.local` file contains:

```bash
# Database (Neon - Default)
DATABASE_URL=postgresql://neondb_owner:npg_2rwW6DyPSLHe@ep-curly-sound-ah3wi7z7-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# OR Local PostgreSQL (if using --profile local-db)
# DATABASE_URL=postgresql://calendar_user:calendar_secure_password_123@postgres:5432/calendar_db?sslmode=disable

# NextAuth
NEXTAUTH_SECRET=8NDC1jrOMhhOexU9V5e2TxCriCxwjlYZsKNA1fqn7vg=
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=966232536935-i37sueg879cfq1rftvp82bdsn1lqrk5v.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Public URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

---

## 🔧 Useful Docker Commands

### View Running Containers
```bash
docker ps
```

### View Application Logs
```bash
docker-compose logs -f calendar-app
```

### View Database Logs (if using local DB)
```bash
docker-compose logs -f postgres
```

### Restart the Application
```bash
docker-compose restart calendar-app
```

### Rebuild After Code Changes
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Execute Commands Inside Container
```bash
# Access app container
docker exec -it google-calendar-app sh

# Access postgres container (if using local DB)
docker exec -it google-calendar-postgres psql -U calendar_user -d calendar_db
```

### Clean Up Everything
```bash
# Stop and remove containers
docker-compose down

# Remove all data volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

---

## 🐛 Troubleshooting

### Application won't start
1. Check logs: `docker-compose logs -f calendar-app`
2. Verify `.env.local` exists and has correct values
3. Ensure port 3000 is not in use: `lsof -i :3000`

### Database connection errors
1. Verify DATABASE_URL is correct in `.env.local`
2. Check if Neon database is accessible
3. Try: `docker-compose restart calendar-app`

### Database schema issues
The application automatically runs `npm run db:push` on startup. If this fails:
```bash
# Access container and manually push schema
docker exec -it google-calendar-app sh
npm run db:push
```

### Port conflicts
Change the port in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Use 3001 instead
```

---

## 📊 Database Management

### View Database Schema (using local DB)
```bash
docker exec -it google-calendar-postgres psql -U calendar_user -d calendar_db -c "\dt"
```

### Backup Database (local DB)
```bash
docker exec google-calendar-postgres pg_dump -U calendar_user calendar_db > backup.sql
```

### Restore Database (local DB)
```bash
cat backup.sql | docker exec -i google-calendar-postgres psql -U calendar_user calendar_db
```

---

## 🚢 Production Deployment

For production deployment to platforms like:
- **DigitalOcean App Platform**
- **AWS ECS**
- **Google Cloud Run**
- **Azure Container Apps**

Use the pre-built image from Docker Hub:
```bash
docker pull kartikguptaji/google-calendar-clone:latest
```

Or use in docker-compose:
```yaml
services:
  calendar-app:
    image: kartikguptaji/google-calendar-clone:latest
    # ... rest of config
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Neon PostgreSQL Documentation](https://neon.tech/docs)
- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)

---

## 🤝 Support

If you encounter issues:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review Docker logs
3. Verify environment variables
4. Ensure all prerequisites are met
