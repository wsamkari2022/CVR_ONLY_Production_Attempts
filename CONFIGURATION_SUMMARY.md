# VRDS_CVR Configuration Summary

## Quick Reference

### Deployment URL
- Production: `https://moonlander.fit.edu/VRDS_CVR`
- Dev Frontend: `http://localhost:3002/VRDS_CVR/`
- Dev Backend: `http://localhost:4002/VRDS_CVR/api/`

### Port Configuration
- Frontend Dev Port: **3002** (to avoid conflict with existing project on 3001)
- Backend Port: **4002** (to avoid conflict with existing project on 4001)

### Base Path Configuration
All configurations use: `/VRDS_CVR`

## Critical Path Matching (Verified)

### Frontend Configuration
**File**: `src/lib/mongoService.ts:1`
```typescript
const API = import.meta.env.VITE_API_URL || "/VRDS_CVR";
```

**File**: `src/App.tsx:54`
```typescript
<Router basename="/VRDS_CVR">
```

**File**: `vite.config.ts`
```typescript
base: '/VRDS_CVR/',
server: {
  port: 3002,
  proxy: {
    '/api': {
      target: 'http://localhost:4002',
      changeOrigin: true,
    },
  },
}
```

### Backend Configuration
**File**: `backend/src/server.ts:19`
```typescript
const BASE_PATH = "/VRDS_CVR";
const PORT = Number(process.env.PORT || 4002);
```

**All API Routes** (mounted under BASE_PATH):
```typescript
app.use(`${BASE_PATH}/api/user-sessions`, userSessionsRouter);
app.use(`${BASE_PATH}/api/value-evolution`, valueEvolutionRouter);
app.use(`${BASE_PATH}/api/apa-reorderings`, apaReorderingsRouter);
app.use(`${BASE_PATH}/api/final-decisions`, finalDecisionsRouter);
app.use(`${BASE_PATH}/api/session-metrics`, sessionMetricsRouter);
app.use(`${BASE_PATH}/api/session-feedback`, sessionFeedbackRouter);
app.use(`${BASE_PATH}/api/value-stability`, valueStabilityRouter);
```

## Path Flow Verification

### Development Mode
1. User navigates to: `http://localhost:3002/VRDS_CVR/`
2. Frontend makes API call: `fetch('/VRDS_CVR/api/user-sessions')`
3. Vite proxy intercepts `/api` and forwards to: `http://localhost:4002/api/user-sessions`
4. Backend receives at: `http://localhost:4002/VRDS_CVR/api/user-sessions`

### Production Mode
1. User navigates to: `https://moonlander.fit.edu/VRDS_CVR/`
2. Nginx proxies to: `http://localhost:4002/VRDS_CVR/`
3. Express serves static files from: `dist/client/` (with BASE_PATH)
4. Frontend makes API call: `fetch('/VRDS_CVR/api/user-sessions')`
5. Backend receives at: `/VRDS_CVR/api/user-sessions`

## Environment Variables

### Backend (.env)
```bash
MONGODB_URI=your_production_mongodb_connection_string
PORT=4002
NODE_ENV=production
```

### Frontend (.env)
```bash
VITE_API_URL=/VRDS_CVR
```

## Build Commands

```bash
# Development (both servers)
npm run dev:all

# Build for production
npm run build

# Start production server
npm run start
```

## Production Build Output

```
dist/
  └── client/                      # Frontend static files
      ├── index.html              # HTML with /VRDS_CVR/ asset paths
      └── assets/
          ├── index-*.js          # Bundled JavaScript
          └── index-*.css         # Bundled CSS

backend/
  └── dist/                        # Compiled backend
      ├── server.js               # Main server (BASE_PATH="/VRDS_CVR")
      ├── config/
      ├── models/
      └── routes/
```

## API Endpoints

All endpoints are prefixed with `/VRDS_CVR/api/`:

- Health Check: `/VRDS_CVR/api/health`
- User Sessions: `/VRDS_CVR/api/user-sessions`
- Value Evolution: `/VRDS_CVR/api/value-evolution`
- APA Reorderings: `/VRDS_CVR/api/apa-reorderings`
- Final Decisions: `/VRDS_CVR/api/final-decisions`
- Session Metrics: `/VRDS_CVR/api/session-metrics`
- Session Feedback: `/VRDS_CVR/api/session-feedback`
- Value Stability: `/VRDS_CVR/api/value-stability`

## Pre-Deployment Checklist

- [ ] MongoDB connection string configured in `backend/.env`
- [ ] Backend PORT set to 4002 in `backend/.env`
- [ ] NODE_ENV set to production in `backend/.env`
- [ ] Run `npm run build` successfully
- [ ] Verify `dist/client/` contains built frontend
- [ ] Verify `backend/dist/` contains compiled backend
- [ ] Test health endpoint: `curl http://localhost:4002/VRDS_CVR/api/health`
- [ ] Verify "Begin Assessment" button saves to MongoDB
- [ ] Check browser console for 404 errors (should be none)

## Database Connection

The application uses MongoDB with Mongoose ODM. Collections:

- user_sessions
- value_evolutions
- apa_reorderings
- final_decisions
- session_metrics
- session_feedback
- value_stabilities

## CORS Configuration

Backend allows requests from:
- `http://localhost:3002` (dev frontend)
- `http://127.0.0.1:3002` (dev frontend)
- `https://moonlander.fit.edu` (production)
- `http://moonlander.fit.edu` (production)

## Static File Serving (Production Only)

When `NODE_ENV=production`:
1. Express serves static files from `dist/client/` at `/VRDS_CVR`
2. Fallback route serves `index.html` for all `/VRDS_CVR/*` routes (client-side routing)
3. API routes take precedence over static files

## Success Indicators

After deployment, you should see:

1. Server logs:
   ```
   ✅ MongoDB connected
   🚀 API on http://localhost:4002/VRDS_CVR
   📦 Environment: production
   🌐 Serving static files from dist/client at /VRDS_CVR
   ```

2. Health check response:
   ```json
   {
     "message": "Wildfire Study API",
     "base": "/VRDS_CVR/api",
     "env": "production"
   }
   ```

3. No 404 errors in browser console
4. Data successfully saves to MongoDB
5. All routes navigate correctly

## Troubleshooting Quick Fixes

### API calls return 404
- Check BASE_PATH in `backend/src/server.ts` is "/VRDS_CVR"
- Check API constant in `src/lib/mongoService.ts` is "/VRDS_CVR"

### Static files not loading
- Verify NODE_ENV=production is set
- Check `dist/client/` directory exists
- Verify static middleware is configured in server.ts

### Routes don't work
- Check Router basename in `src/App.tsx` is "/VRDS_CVR"
- Verify Vite base config is '/VRDS_CVR/'
- Check built index.html has correct asset paths

### MongoDB connection fails
- Verify MONGODB_URI in `backend/.env`
- Test connection string with mongosh
- Check IP whitelist in MongoDB Atlas
