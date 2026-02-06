# VRDS_CVR - Wildfire Decision Simulation Interface

Production-ready React + Express application configured for deployment at `moonlander.fit.edu/VRDS_CVR`.

## Quick Start

### Development
```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Run both frontend and backend
npm run dev:all
```

Access at: `http://localhost:3002/VRDS_CVR/`

### Production Build
```bash
# Build everything
npm run build

# Start production server
npm run start
```

## Configuration

- **Base Path**: `/VRDS_CVR`
- **Frontend Dev Port**: 3002
- **Backend Port**: 4002
- **Database**: MongoDB

## Documentation

See [PRODUCTION_DEPLOYMENT.md](./PRODUCTION_DEPLOYMENT.md) for complete deployment instructions.

## Key Features

- Value-driven decision making simulation
- Comprehensive value ranking (CVR) system
- MongoDB backend for data persistence
- Production-ready static build served from Express
- Configured for subdirectory deployment
