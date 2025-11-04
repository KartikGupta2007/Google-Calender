# Google Calendar Clone

<div align="center">
  <img src="/public/calendar-screenshot-2025.png" alt="Google Calendar Clone Screenshot" width="100%" />
  
  A production-ready Google Calendar clone built with modern web technologies.
  
  [View Live Demo](https://google-calendar-clone-main-demo.vercel.app)
</div>

## 📖 Table of Contents
- [Overview](#overview)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [📄 License](#-license)

## Overview

This project is a feature-rich clone of Google Calendar, implementing modern web development practices and technologies. It supports offline functionality, multiple calendar views, and real-time event management while maintaining a responsive and user-friendly interface.

## ✨ Features

### Calendar Views
- **Month View**
  - Overview of entire month with event previews
  - Quick event creation through cell clicking
  - Event drag-and-drop support
  
- **Week View**
  - Detailed hourly view for the week
  - Multi-day event visualization
  - Real-time event duration updates
  
- **Day View**
  - Focused view of single day
  - Precise time slot selection
  - Concurrent event handling

### Event Management
- **Event Creation & Editing**
  - Quick event creation with smart defaults
  - Detailed event editor with rich text support
  - Location and attendee management
  
- **Recurring Events**
  - Daily, weekly, monthly, and yearly patterns
  - Custom recurrence rules
  - Exception handling for recurring events
  
- **Event Features**
  - Color coding for different calendars
  - Reminder settings
  - Attendee status tracking
  - Description with rich text support

### Advanced Features
- **Offline Support**
  - Full functionality without internet
  - Local data persistence
  - Background sync when online
  
- **Search & Filter**
  - Full-text search across events
  - Calendar-specific filtering
  - Date range filtering
  
- **Keyboard Shortcuts**
  - Quick navigation between views
  - Event creation shortcuts
  - View manipulation shortcuts

- 📅 Multiple Calendar Views (Month, Week, Day)
- 🔄 Real-time Event Management
- 📱 Responsive Design
- 🌐 Offline Support
- 🎨 Material Design 3 Theme
- 👥 Multi-user Support
- 🔄 Recurring Events
- 🔍 Event Search
- ⌨️ Keyboard Shortcuts
- 🌍 Timezone Support

## 🛠️ Tech Stack

### Frontend Architecture
- **Next.js 14**
  - Server components for improved performance
  - App Router for modern routing
  - API routes for backend functionality
  
- **React 18**
  - Hooks for state management
  - Server Components support
  - Concurrent rendering features
  
- **Tailwind CSS**
  - Utility-first CSS framework
  - Custom theme configuration
  - Responsive design utilities
  
- **Shadcn UI**
  - Reusable component library
  - Customizable components
  - Accessibility features
  
- **Day.js**
  - Lightweight date manipulation
  - Timezone support
  - Localization capabilities

### Backend Infrastructure
- **Neon PostgreSQL**
  - Serverless SQL database
  - Automatic scaling
  - Built-in connection pooling
  
- **Drizzle ORM**
  - Type-safe database queries
  - Schema migrations
  - Query builder
  
- **NextAuth.js**
  - OAuth authentication
  - Session management
  - JWT handling

### Development & Tooling
- **TypeScript**
  - Static type checking
  - Enhanced IDE support
  - Type inference
  
- **ESLint**
  - Code quality checks
  - Custom rule configuration
  - Automatic fixing capabilities
  
- **Prettier**
  - Consistent code formatting
  - IDE integration
  - Custom formatting rules

## Getting Started

You can access and use this Google Calendar Clone in three different ways:


### Option 1: 🐳 Docker (Production-Ready Deployment)

Run the complete application in production mode with automatic database setup:

#### What you need
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- A database connection (Neon PostgreSQL recommended - free tier available)
- Google OAuth credentials (5 minutes to setup)

#### Features
- ✅ Automatic database schema initialization
- ✅ Production-optimized Next.js build
- ✅ Health checks and auto-restart
- ✅ Works with cloud databases (Neon, Supabase) or local PostgreSQL
- ✅ Secure environment variable handling

#### Quick Setup (3 Steps)

**Step 1:** Create `.env` file
```bash
# Copy environment template
cp .env.local .env

# Or manually create .env with these required variables:
# DATABASE_URL=your-neon-or-postgres-connection-string
# NEXTAUTH_SECRET=your-secret (generate with: openssl rand -base64 32)
# NEXTAUTH_URL=http://localhost:3000
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
```

**Step 2:** Get Database Connection String
- **Option A - Neon (Recommended, Free):**
  1. Sign up at [Neon.tech](https://neon.tech)
  2. Create a project
  3. Copy the connection string
  
- **Option B - Local PostgreSQL:**
  ```bash
  # Uncomment the postgres service in docker-compose.yml
  docker-compose --profile local-db up --build
  DATABASE_URL=postgresql://calendar_user:password@postgres:5432/calendar_db
  ```

**Step 3:** Build and Run
```bash
docker-compose up --build
```

Then open **[http://localhost:3000](http://localhost:3000)** in your browser. Done! 🎉

#### What Happens Automatically
1. 🔨 Builds optimized Next.js production bundle
2. 🗄️ Connects to your database
3. 📊 Runs database schema migrations (`npm run db:push`)
4. 🚀 Starts Next.js server on port 3000
5. ✅ Health checks ensure everything is running

#### Manual Setup Steps

**Step 1:** Get Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable Google Calendar API
3. Create OAuth 2.0 credentials (Web application)
4. Add redirect URI: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret

**Step 2:** Setup Database
- Get connection string from [Neon.tech](https://neon.tech) (free tier)
- Or use local PostgreSQL: `postgresql://user:password@localhost:5432/calendar_db`

**Step 3:** Configure Environment
```bash
# Create .env file
cp .env.local .env

# Edit .env with your credentials
DATABASE_URL=your-database-connection-string
NEXTAUTH_SECRET=your-secret  # Generate: openssl rand -base64 32
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Step 4:** Build and Start
```bash
docker-compose up --build
```

**Step 5:** Open **[http://localhost:3000](http://localhost:3000)**

#### Stop the application
Press `Ctrl + C`, then run:
```bash
docker-compose down
```

#### Troubleshooting
- **Build fails with "No database connection"**: Make sure `.env` file exists with valid `DATABASE_URL`
- **Port 3000 already in use**: Stop other services or change port in `docker-compose.yml`
- **Database connection fails**: Verify your database URL and check firewall settings
- **Image optimization warning**: Automatically handled in production build

For detailed Docker documentation, see [DOCKER_README.md](DOCKER_README.md)

---

### Option 3: Using Pre-built Docker Image

Quick run without building:

```bash
docker pull kartikguptaji/google-calendar-clone:latest
docker run -d -p 3000:3000 kartikguptaji/google-calendar-clone:latest
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note:** This requires external database and environment variables configured.

---

### Option 4: 💻 Local Development

For developers running from source:

1. Navigate to the project folder:
```bash
cd Google-Calender
```

2. Install dependencies:
```bash
npm install
```

3. Setup `.env.local` (same as Docker Option 2, Step 2-4)

4. Run database migrations:
```bash
npm run db:push
```

5. Start the application:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

**Note:** Requires Node.js 18+ and PostgreSQL database.


## Key Features in Detail

### Event Management
- Create, edit, and delete events
- Set recurring events with custom patterns
- Add event descriptions and locations
- Manage event attendees
- Set reminders

### Calendar Views
- Month view with event preview
- Week view with detailed timeslots
- Day view for focused planning
- Year view for long-term planning

### Offline Support
- Full functionality without internet
- Local data persistence
- Automatic sync when online

### User Experience
- Drag and drop events
- Resize events to change duration
- Quick event creation with keyboard shortcuts
- Search through events
- Dark/Light theme support


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



