# Deployment Guide - Grandson Project E-commerce

This guide covers local deployment and production setup for the Grandson Project e-commerce platform.

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- At least 500MB free disk space

## Quick Start (Development)

### 1. Initial Setup

Clone the repository and install dependencies:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

**Backend Configuration:**

Copy the example environment file:
```bash
cd backend
copy .env.example .env
```

Edit `backend/.env` and update if needed:
```env
DATABASE_URL="file:./dev.db"
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**Frontend Configuration:**

Copy the example environment file:
```bash
cd frontend
copy .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 3. Initialize Database

From the backend directory:

```bash
cd backend
npm run setup
```

This will:
- Generate Prisma client
- Run database migrations
- Seed initial admin user (username: `admin`, password: `admin123`)

### 4. Start Development Servers

**Option A: Start both servers from root:**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend (in a new terminal)
npm run dev:frontend
```

**Option B: Start individually:**
```bash
# Backend (from backend directory)
cd backend
npm run dev

# Frontend (from frontend directory)
cd frontend
npm run dev
```

### 5. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Admin Panel:** http://localhost:3000/admin/login
  - Username: `admin`
  - Password: `admin123` (⚠️ Change this immediately!)

## Production Deployment

### 1. Build for Production

From the root directory:

```bash
# Build both frontend and backend
npm run build
```

Or build individually:

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

### 2. Production Environment Variables

**Backend (.env):**
```env
DATABASE_URL="file:./prod.db"
PORT=3001
NODE_ENV=production
JWT_SECRET=<generate-strong-secret-key>
JWT_EXPIRES_IN=8h
FRONTEND_URL=http://your-domain.com
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://your-api-domain.com:3001
```

### 3. Initialize Production Database

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate:deploy
npm run prisma:seed
```

### 4. Start Production Servers

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm start
```

The frontend will run on port 3000 and backend on port 3001 by default.

## Local Network Access

To access the application from other devices on your local network:

### 1. Find Your Local IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig
```

### 2. Update Environment Variables

**Backend (.env):**
```env
FRONTEND_URL=http://192.168.1.100:3000
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://192.168.1.100:3001
```

### 3. Access from Other Devices

- Frontend: `http://192.168.1.100:3000`
- Admin Panel: `http://192.168.1.100:3000/admin/login`

## File Storage

Product images are stored locally in `backend/uploads/`. Ensure this directory:
- Has proper write permissions
- Is backed up regularly
- Has sufficient disk space

## Database Management

### View Database with Prisma Studio

```bash
cd backend
npm run prisma:studio
```

Access at: http://localhost:5555

### Backup Database

The SQLite database is a single file. To backup:

```bash
# Development database
copy backend\prisma\dev.db backend\prisma\dev.db.backup

# Production database
copy backend\prisma\prod.db backend\prisma\prod.db.backup
```

### Reset Database

⚠️ **Warning:** This will delete all data!

```bash
cd backend
del prisma\dev.db
npm run setup
```

## Troubleshooting

### Backend won't start

1. Check if port 3001 is available:
   ```bash
   netstat -ano | findstr :3001
   ```

2. Verify database file exists:
   ```bash
   dir backend\prisma\*.db
   ```

3. Check environment variables are set correctly

### Frontend can't connect to backend

1. Verify backend is running:
   ```bash
   curl http://localhost:3001/health
   ```

2. Check CORS configuration in `backend/src/index.ts`

3. Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`

### Images not displaying

1. Check uploads directory exists:
   ```bash
   dir backend\uploads
   ```

2. Verify backend is serving static files (check `backend/src/index.ts`)

3. Check image paths in database match actual files

### Admin login fails

1. Verify admin user exists:
   ```bash
   cd backend
   npm run prisma:studio
   ```

2. Reset admin password:
   ```bash
   npm run prisma:seed
   ```

## Performance Optimization

### Production Checklist

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET
- [ ] Enable HTTPS (if deploying to internet)
- [ ] Set up regular database backups
- [ ] Configure proper file upload limits
- [ ] Monitor disk space for uploads directory
- [ ] Set up error logging
- [ ] Configure rate limiting for API endpoints

### Recommended Server Specs

**Minimum:**
- 1 CPU core
- 1GB RAM
- 10GB storage

**Recommended:**
- 2 CPU cores
- 2GB RAM
- 50GB storage (for images)

## Monitoring

### Health Check Endpoint

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Grandson Project API is running"
}
```

### Log Files

Application logs are output to console. For production, redirect to files:

```bash
# Backend
cd backend
npm start > logs/backend.log 2>&1

# Frontend
cd frontend
npm start > logs/frontend.log 2>&1
```

## Security Notes

1. **Change Default Credentials:** The default admin password is `admin123` - change it immediately!

2. **JWT Secret:** Generate a strong secret for production:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **CORS:** Update `FRONTEND_URL` in backend `.env` to match your actual frontend domain

4. **File Uploads:** The system only accepts image files up to 5MB. Adjust `MAX_FILE_SIZE` if needed.

5. **HTTPS:** For internet deployment, use a reverse proxy (nginx, Apache) with SSL certificates.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review application logs
3. Verify all environment variables are set correctly
4. Ensure all dependencies are installed

## Next Steps

After deployment:
1. Log in to admin panel
2. Add your first products
3. Test the complete order flow
4. Configure any additional settings
5. Train staff on admin panel usage
