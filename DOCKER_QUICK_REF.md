# 🚀 Quick Reference - Docker Commands

## Start Application (Default - Neon PostgreSQL)
```bash
docker-compose up -d
```

## View Logs
```bash
docker-compose logs -f calendar-app
```

## Stop Application
```bash
docker-compose down
```

## Rebuild After Changes
```bash
docker-compose build --no-cache
docker-compose up -d
```

## Access Application
```
http://localhost:3000
```

## Using Local PostgreSQL (Alternative)
```bash
# Update .env.local first:
# DATABASE_URL=postgresql://calendar_user:calendar_secure_password_123@postgres:5432/calendar_db?sslmode=disable

docker-compose --profile local-db up -d
```

## Troubleshooting
```bash
# Check container status
docker ps

# View logs
docker-compose logs -f

# Restart container
docker-compose restart calendar-app

# Access container shell
docker exec -it google-calendar-app sh

# Manually push schema
docker exec -it google-calendar-app npm run db:push
```

## 📚 Documentation
- Full guide: See `DOCKER_README.md`
- Changes summary: See `DOCKER_UPDATES_SUMMARY.md`
