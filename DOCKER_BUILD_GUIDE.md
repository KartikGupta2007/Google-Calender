# Docker Build & Deployment Guide

## 📋 Complete Docker Setup

This guide provides step-by-step instructions for building and running the Google Calendar Clone using Docker.

## 🎯 What's Included

### Docker Configuration Files
- **Dockerfile** - Multi-stage production build (optimized for size and security)
- **docker-compose.yml** - Complete stack with PostgreSQL database
- **.dockerignore** - Optimized build context
- **docker-build.sh** - Automated build script

### Architecture
```
┌─────────────────────────────────────────┐
│         Google Calendar App             │
│    (Next.js 14 + React + TypeScript)   │
│         Port: 3000                      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       PostgreSQL Database               │
│    (calendar_db + Drizzle ORM)         │
│         Port: 5432                      │
└─────────────────────────────────────────┘
```

## 🚀 Quick Start

### Option 1: Automated Build (Recommended)

```bash
# 1. Ensure .env.local is configured
./docker-build.sh

# 2. Start the application
docker-compose up -d

# 3. Open http://localhost:3000
```

### Option 2: Manual Build

```bash
# 1. Build images
docker-compose build

# 2. Start services
docker-compose up -d

# 3. View logs
docker-compose logs -f

# 4. Stop services
docker-compose down
```

## 📝 Prerequisites

### Required Software
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (latest version)
- 4GB RAM minimum, 8GB recommended
- 10GB free disk space

### Required Configuration
- `.env.local` file with all required variables (see below)

## ⚙️ Environment Configuration

### Create .env.local

```bash
# Copy from example
cp .env.example .env.local

# Edit with your values
nano .env.local  # or use any text editor
```

### Required Variables

```bash
# Database (automatically configured for docker-compose)
DATABASE_URL=postgresql://calendar_user:calendar_secure_password_123@postgres:5432/calendar_db?sslmode=disable

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-generated-secret-here

# Application URL
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Public URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

### Optional Variables

```bash
# Custom PostgreSQL password
POSTGRES_PASSWORD=your-custom-password

# Custom ports
APP_PORT=3000
POSTGRES_PORT=5432
```

## 🔨 Build Process

### What Happens During Build

1. **Dependencies Stage**
   - Installs all npm packages
   - Includes both production and dev dependencies

2. **Builder Stage**
   - Copies source code
   - Runs TypeScript compilation
   - Builds Next.js application
   - Creates standalone build

3. **Runner Stage**
   - Uses minimal Alpine base
   - Copies only production artifacts
   - Runs as non-root user (security)
   - Final image: ~400-500MB

### Build Commands

```bash
# Build with no cache (clean build)
docker-compose build --no-cache

# Build specific service
docker-compose build calendar-app

# Build with progress output
docker-compose build --progress=plain

# Build and start immediately
docker-compose up --build -d
```

## 🎮 Docker Commands

### Starting Services

```bash
# Start in background (detached)
docker-compose up -d

# Start with logs visible
docker-compose up

# Start specific service
docker-compose up -d postgres
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f calendar-app
docker-compose logs -f postgres

# Last 100 lines
docker-compose logs --tail=100

# Since specific time
docker-compose logs --since 2024-01-01T00:00:00
```

### Stopping Services

```bash
# Stop services (keep data)
docker-compose stop

# Stop and remove containers (keep data)
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v

# Stop specific service
docker-compose stop calendar-app
```

### Restarting Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart calendar-app

# Restart with rebuild
docker-compose up -d --build
```

### Inspecting Services

```bash
# List running containers
docker-compose ps

# View resource usage
docker stats

# Execute command in container
docker-compose exec calendar-app sh
docker-compose exec postgres psql -U calendar_user -d calendar_db

# View container details
docker inspect google-calendar-app
```

## 🔍 Health Checks

### Application Health

```bash
# Check if app is healthy
docker inspect --format='{{.State.Health.Status}}' google-calendar-app

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' google-calendar-app

# Manual health check
curl http://localhost:3000
```

### Database Health

```bash
# Check PostgreSQL
docker-compose exec postgres pg_isready -U calendar_user

# Connect to database
docker-compose exec postgres psql -U calendar_user -d calendar_db

# View database tables
docker-compose exec postgres psql -U calendar_user -d calendar_db -c "\dt"
```

## 🐛 Troubleshooting

### Build Failures

**Issue: Build fails with "out of memory"**
```bash
# Increase Docker memory in Docker Desktop settings
# Recommended: 4GB minimum, 8GB preferred

# Or build without cache
docker-compose build --no-cache --memory=4g
```

**Issue: TypeScript errors during build**
```bash
# The build is configured to ignore TS errors (next.config.mjs)
# Check logs:
docker-compose logs calendar-app
```

**Issue: Module not found errors**
```bash
# Clean rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Runtime Issues

**Issue: Port 3000 already in use**
```bash
# Stop conflicting service or use custom port
APP_PORT=3001 docker-compose up -d

# Then access: http://localhost:3001
```

**Issue: Database connection failed**
```bash
# Check if postgres is healthy
docker-compose ps

# Restart services
docker-compose restart

# Check database logs
docker-compose logs postgres
```

**Issue: Application won't start**
```bash
# Check logs for errors
docker-compose logs -f calendar-app

# Common fixes:
# 1. Ensure .env.local has all variables
# 2. Restart services:
docker-compose restart calendar-app

# 3. Rebuild:
docker-compose up -d --build
```

### Environment Variable Issues

**Issue: Variables not loaded**
```bash
# Check .env.local exists and has correct values
cat .env.local

# Ensure no spaces around = signs
# Correct:   VAR=value
# Incorrect: VAR = value

# Restart after changes
docker-compose down
docker-compose up -d
```

### Data Persistence Issues

**Issue: Data lost after restart**
```bash
# Check volumes exist
docker volume ls | grep google_calendar

# Inspect volume
docker volume inspect google_calendar_postgres_data

# Backup data
docker-compose exec postgres pg_dump -U calendar_user calendar_db > backup.sql

# Restore data
cat backup.sql | docker-compose exec -T postgres psql -U calendar_user -d calendar_db
```

## 🔧 Advanced Configuration

### Custom Database Password

```bash
# In .env.local
POSTGRES_PASSWORD=my-super-secure-password

# Update DATABASE_URL accordingly
DATABASE_URL=postgresql://calendar_user:my-super-secure-password@postgres:5432/calendar_db?sslmode=disable
```

### Production Deployment

```bash
# Use external managed database (recommended)
DATABASE_URL=postgresql://user:pass@your-db-host.com:5432/dbname

# Remove postgres service from docker-compose.yml
# Keep only calendar-app service

# Use production URLs
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Resource Limits

Edit `docker-compose.yml`:

```yaml
services:
  calendar-app:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          memory: 512M
```

### Network Configuration

```yaml
# Custom network
networks:
  calendar-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.28.0.0/16
```

## 📊 Monitoring

### View Metrics

```bash
# Container stats
docker stats google-calendar-app google-calendar-postgres

# Disk usage
docker system df

# Detailed disk usage
docker system df -v
```

### Cleanup

```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a --volumes

# Clean specific images
docker rmi google-calendar-clone:latest
```

## 🎯 Best Practices

### Development
- Use `docker-compose up` (no -d) to see logs in real-time
- Rebuild after package.json changes: `docker-compose up --build`
- Use volumes for hot-reload if needed

### Production
- Use `docker-compose up -d` to run in background
- Set up proper logging (e.g., to external service)
- Use managed database service (not Docker PostgreSQL)
- Enable HTTPS with reverse proxy (nginx, Traefik)
- Regular backups of database
- Monitor resource usage
- Set up alerts for container health

### Security
- Never commit `.env.local` or `.env`
- Use Docker secrets for sensitive data in production
- Keep images updated
- Scan for vulnerabilities: `docker scan google-calendar-clone`
- Use non-root user (already configured)
- Limit container resources

## 📈 Performance Optimization

### Image Size
Current optimized size: ~400-500MB

Further optimization:
```dockerfile
# Use distroless or slim images
FROM gcr.io/distroless/nodejs:18

# Or use multi-stage with minimal runtime
FROM node:18-slim
```

### Build Cache
```bash
# Leverage BuildKit
DOCKER_BUILDKIT=1 docker-compose build

# Use cache from registry
docker-compose build --cache-from google-calendar-clone:latest
```

### Startup Time
- Standalone build is optimized (boots in ~2-3 seconds)
- Database health check delays app start (ensures DB is ready)

## 🆘 Getting Help

### Check Status
```bash
# All services
docker-compose ps

# Detailed info
docker-compose ps -a

# Service health
docker-compose exec calendar-app wget -q -O- http://localhost:3000/api/health || echo "Not healthy"
```

### Common Issues Table

| Issue | Solution |
|-------|----------|
| Port conflict | Change `APP_PORT` in .env.local |
| Out of memory | Increase Docker memory to 4GB+ |
| Build slow | Use `--build-arg BUILDKIT_INLINE_CACHE=1` |
| Volume not persisting | Check `docker volume ls` |
| Can't connect to DB | Ensure postgres service is healthy |

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)

## ✅ Success Checklist

After successful deployment, you should be able to:

- [ ] Access http://localhost:3000
- [ ] Sign in with Google OAuth
- [ ] Create, edit, and delete events
- [ ] View calendar in different modes (month, week, day)
- [ ] Data persists after container restart
- [ ] View logs: `docker-compose logs -f`
- [ ] Check health: `docker inspect google-calendar-app`

---

**Built with ❤️ using Docker, Next.js, and PostgreSQL**