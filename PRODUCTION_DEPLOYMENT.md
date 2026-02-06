# Production Deployment Guide for VRDS_CVR

## Overview

This project is configured for production deployment at `moonlander.fit.edu/VRDS_CVR` with MongoDB as the database backend.

## Configuration Summary

### Path Configuration
- **Base Path**: `/VRDS_CVR`
- **Frontend Dev Port**: 3002
- **Backend Port**: 4002
- **Production URL**: `https://moonlander.fit.edu/VRDS_CVR`

### Key Files Configured
- `vite.config.ts`: Base path `/VRDS_CVR/`, dev port 3002, build output to `dist/client`
- `backend/src/server.ts`: BASE_PATH `/VRDS_CVR`, serves static files in production
- `src/lib/mongoService.ts`: API base path `/VRDS_CVR`
- `src/App.tsx`: Router basename `/VRDS_CVR`

### Backend ES Modules
The backend uses ES modules with TypeScript. All relative imports in backend files include `.js` extensions (e.g., `import { User } from "./models/User.js"`), which is required for Node.js ES module compatibility even though source files are `.ts`.

## Environment Setup

### Backend Environment Variables

Create `backend/.env` file with:

```bash
MONGODB_URI=your_production_mongodb_connection_string
PORT=4002
NODE_ENV=production
```

**Important**: Replace `your_production_mongodb_connection_string` with your actual MongoDB connection string.

For MongoDB Atlas, it looks like:
```
mongodb+srv://username:password@cluster.mongodb.net/wildfire_study?retryWrites=true&w=majority
```

### Frontend Environment Variables

Create `.env` file in the root directory:

```bash
VITE_API_URL=/VRDS_CVR
```

This ensures API calls use the correct base path in production.

## Development Setup

### Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Run Development Servers

```bash
# Run both frontend and backend in development mode
npm run dev:all
```

Or run them separately:

```bash
# Terminal 1: Frontend dev server (port 3002)
npm run dev

# Terminal 2: Backend dev server (port 4002)
npm run dev:backend
```

Access the development app at: `http://localhost:3002/VRDS_CVR/`

## Production Build

### Build the Application

```bash
# Build both frontend and backend
npm run build
```

This will:
1. Build the React frontend to `dist/client/`
2. Compile the TypeScript backend to `backend/dist/`

### Verify Build Output

After building, you should have:
```
dist/
  └── client/           # Frontend static files
      ├── index.html
      ├── assets/
      └── ...

backend/
  └── dist/            # Compiled backend
      ├── server.js
      ├── config/
      ├── models/
      └── routes/
```

## Running in Production

### Single Command Start

```bash
npm run start
```

This command:
- Sets `NODE_ENV=production`
- Runs `node backend/dist/server.js`
- Serves API at `/VRDS_CVR/api/*`
- Serves frontend static files at `/VRDS_CVR/*`

### Verify Production Server

Test the production server locally:

```bash
# Start production server
npm run start

# In another terminal, test the health endpoint
curl http://localhost:4002/VRDS_CVR/api/health
```

Expected response:
```json
{
  "message": "Wildfire Study API",
  "base": "/VRDS_CVR/api",
  "env": "production"
}
```

## Deployment to moonlander.fit.edu

### Prerequisites

1. SSH access to moonlander.fit.edu server
2. Node.js installed on the server
3. MongoDB connection string configured

### Deployment Steps

1. **Upload Project Files**
   ```bash
   # From your local machine
   rsync -avz --exclude 'node_modules' --exclude '.git' \
     ./ user@moonlander.fit.edu:/path/to/VRDS_CVR/
   ```

2. **SSH into Server**
   ```bash
   ssh user@moonlander.fit.edu
   cd /path/to/VRDS_CVR
   ```

3. **Install Dependencies**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

4. **Configure Environment Variables**
   ```bash
   # Create backend/.env with production MongoDB URI
   nano backend/.env
   ```

5. **Build the Application**
   ```bash
   npm run build
   ```

6. **Start the Server**
   ```bash
   # For testing
   npm run start

   # For production with PM2 (recommended)
   npm install -g pm2
   pm2 start backend/dist/server.js --name vrds-cvr
   pm2 save
   pm2 startup
   ```

### Configure Web Server (Nginx/Apache)

If using Nginx, add this location block to your server configuration:

```nginx
location /VRDS_CVR {
    proxy_pass http://localhost:4002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

Then reload Nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Path Verification Checklist

After deployment, verify these paths work correctly:

- [ ] Frontend loads: `https://moonlander.fit.edu/VRDS_CVR/`
- [ ] Health check works: `https://moonlander.fit.edu/VRDS_CVR/api/health`
- [ ] Begin Assessment button saves to MongoDB
- [ ] No 404 errors in browser console
- [ ] All routes navigate correctly within `/VRDS_CVR/`
- [ ] API calls reach backend at `/VRDS_CVR/api/*`

## Testing the Application

### Test API Endpoints

```bash
# Health check
curl https://moonlander.fit.edu/VRDS_CVR/api/health

# Create a test session
curl -X POST https://moonlander.fit.edu/VRDS_CVR/api/user-sessions \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "test-123",
    "ExperimentCondition": "test",
    "demographics": {
      "age": "25-34",
      "gender": "prefer-not-to-say",
      "aiExperience": "beginner",
      "moralReasoningExperience": "beginner"
    },
    "consent_agreed": true
  }'
```

### Test Frontend

1. Navigate to `https://moonlander.fit.edu/VRDS_CVR/`
2. Complete the demographic page
3. Click "Begin Assessment"
4. Verify data is saved to MongoDB
5. Check browser console for any errors

## Troubleshooting

### 404 Errors on API Calls

**Problem**: Frontend calls return 404

**Solution**: Verify path matching:
- Frontend API base: `/VRDS_CVR` (in `mongoService.ts`)
- Backend BASE_PATH: `/VRDS_CVR` (in `server.ts`)
- Vite base: `/VRDS_CVR/` (in `vite.config.ts`)

### MongoDB Connection Errors

**Problem**: Cannot connect to MongoDB

**Solution**:
1. Verify `MONGODB_URI` in `backend/.env`
2. Check MongoDB Atlas IP whitelist
3. Verify credentials are correct
4. Test connection with `mongosh`

### Static Files Not Loading

**Problem**: CSS/JS files return 404

**Solution**:
1. Verify build output exists in `dist/client/`
2. Check `NODE_ENV=production` is set
3. Verify static file middleware in `server.ts`
4. Check Nginx proxy configuration

### Port Already in Use

**Problem**: Port 4002 already in use

**Solution**:
```bash
# Find process using port 4002
lsof -i :4002

# Kill the process
kill -9 <PID>

# Or change port in backend/.env
PORT=4003
```

## Maintenance

### View Logs

```bash
# PM2 logs
pm2 logs vrds-cvr

# Follow logs
pm2 logs vrds-cvr --lines 100
```

### Restart Server

```bash
# PM2
pm2 restart vrds-cvr

# Or manual
pkill -f "node backend/dist/server.js"
npm run start
```

### Update Application

```bash
# Pull latest changes
git pull

# Rebuild
npm run build

# Restart
pm2 restart vrds-cvr
```

## MongoDB Backup

```bash
# Backup database
mongodump --uri="your_mongodb_uri" --out=/path/to/backup

# Restore database
mongorestore --uri="your_mongodb_uri" /path/to/backup
```

## Support

For issues or questions, verify:
1. All paths are configured consistently
2. Environment variables are set correctly
3. MongoDB connection is working
4. Build completed successfully
5. Server is running on correct port

## Quick Reference

### Development
- Frontend: `http://localhost:3002/VRDS_CVR/`
- Backend: `http://localhost:4002/VRDS_CVR/api/`

### Production
- Application: `https://moonlander.fit.edu/VRDS_CVR/`
- API: `https://moonlander.fit.edu/VRDS_CVR/api/`

### Commands
- Dev: `npm run dev:all`
- Build: `npm run build`
- Start: `npm run start`
- Logs: `pm2 logs vrds-cvr`
